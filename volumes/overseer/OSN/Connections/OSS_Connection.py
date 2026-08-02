import asyncio
import secrets
import string
import logging
from urllib.parse import urlparse, parse_qs
import json

logger = logging.getLogger("OSS")

alphabet = string.ascii_letters + string.digits

class OSS_Connection:

    network_asleep = False

    def __init__ (self, websocket, path, type, OSS_All_Connections, queue_maxsize=200) :
        # Connection object to facilitate storage of websocket connections and comminucation between them and the OSS.
        self.OSS_All_Connections = OSS_All_Connections
        self.websocket = websocket
        self.type = type
        self.uuid = ''.join(secrets.choice(alphabet) for _ in range(15))
        self.IP = websocket.remote_address[0]
        
        # Process the path to determine the connection type and get the config.
        self.config = parse_qs(urlparse(path).query).get("CONF", [None])[0]

        self.user = self.extract_user()

        # Setup the message queue and writer task.
        self._send_queue = asyncio.Queue(maxsize=queue_maxsize)
        self._writer_task = asyncio.create_task(self._writer())


    def extract_user(self):
        # Extract the username from the config.
        for value in json.loads(self.config).values():
            if isinstance(value, dict) and "__CONFIG__" in value:
                user = value["__CONFIG__"].get("USER")
                if not user:
                    raise ValueError("Config found but no USER field present.")
                return user
        raise ValueError("No __CONFIG__ block found in config.")


    async def _writer (self) :
        # Drains the send queue and performs the actual websocket writes.
        try:
            while True:
                payload = await self._send_queue.get()
                try:
                    await self.websocket.send(payload)
                    logger.debug(f">[{self.uuid}] : {payload}")
                except Exception as e:
                    logger.warning(f"Send failed for {self.uuid} : {e}")
                finally:
                    self._send_queue.task_done()
        except asyncio.CancelledError:
            pass


    async def network_sleep (self, state) :
        # Sleep or wake the entire network.

        if (bool(state) == OSS_Connection.network_asleep) :
            # If the passed state is the same as the current state do nothing and return.
            return

        OSS_Connection.network_asleep = bool(state)
        logger.warning(f"Network asleep : {OSS_Connection.network_asleep}")

        net_message = "net_wake"
        if (state) :
            net_message = "net_sleep"

        await self.broadcast("device", {"CONTROL" : net_message})


    async def update_control (self) :
        # Update the frontend line graph with the number of connections.
        device_count = len(self.OSS_All_Connections['device'])
        front_count = len(self.OSS_All_Connections['front'])

        # If the front count is equal to zero then broadcast the shutdown command
        # to all connected devices to alleviate network traffic.
        await self.network_sleep(front_count == 0)

        data = {
            "Connections" : f"[{device_count},{front_count}]"
            }

        await self.broadcast("front", self.OSS_Control_Message(json.dumps(data)))


    async def broadcast (self, connection_type, message) :
        # Send a message to every connection of a given type concurrently.
        targets = [c for c in self.OSS_All_Connections[connection_type].values() if (c.user == self.user or self.user == "Overseer_admin")]
        if not targets:
            return
        await asyncio.gather(*(c.send(message) for c in targets))


    async def send (self, message) :
        # Write a message to the queue and return immediately.
        payload = json.dumps(message)
        try:
            self._send_queue.put_nowait(payload)
        except asyncio.QueueFull:
            # If this client cant keep up, drop the oldest message rather than blocking the caller.
            try:
                self._send_queue.get_nowait()
                self._send_queue.task_done()
            except asyncio.QueueEmpty:
                pass
            self._send_queue.put_nowait(payload)


    async def _receive (self) :
        # Receives messages from this connections websocket.
        async for message in self.websocket :
            logger.debug(f"<[{self.uuid}] : {message}")
            await self.route(message)


    async def close (self) :
        # Stop the writer task first so it doesn't try to use a closing socket.
        self._writer_task.cancel()
        try:
            await self._writer_task
        except asyncio.CancelledError:
            pass

        await self.websocket.close()

        del self.OSS_All_Connections[self.type][self.uuid]

        # Update the control panel after the connection has been deleted.
        await self.update_control()
        await self.derived_close()

    async def derived_close(self):
        # Overwritten derived close for connection specific close proceedures.
        pass


    # OSS Messages

    def OSS_Control_Message (self, DATA) :
        return {
            "UUID" : "__CONTROL__",
            "IP" : "",
            "DATA" : DATA
        }

    def OSS_Message (self, connection, DATA) :
        return {
            "UUID" : connection.uuid,
            "IP"   : connection.IP,
            "DATA" : DATA
        }