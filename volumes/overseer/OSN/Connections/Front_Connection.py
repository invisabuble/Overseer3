from OSN.Connections.OSS_Connection import *
import logging

logger = logging.getLogger("OSS")

class Front_Connection (OSS_Connection) :
    def __init__ (self, websocket, path, type, OSS_All_Connections) :
        super().__init__(websocket, path, type, OSS_All_Connections)
        logger.warning(f"\033[01;95mNew Front Connection : {self.uuid}\033[0;0m")


    async def initialise (self) :
        # Initialise the Front connection.
        await self.update_control()

        # Send every connected device's config/state to this front concurrently.
        devices = self.visible_connections("device")

        # Define helper function for asyncio gather.
        async def send_device(device):
            data = {
                "Device_Config" : device.config
            }
            await self.send(self.OSS_Message(device, data))
            await self.send(self.OSS_Message(
                device,
                json.dumps(device.device_state)  # Double stringify device state so it matches esp data.
            ))

        if devices:
            await asyncio.gather(*(send_device(d) for d in devices))


    async def route (self, message) :
        # Route for the frontend connections

        # Parse the incoming message.
        message = json.loads(message)
        logger.debug(f"[ROUTE] > [{self.uuid}] : {message}")

        # Get the UUID of the target device and the data to send to it.
        UUID = message['UUID']
        DATA = message['DATA']

        if (UUID == "__CONTROL__") :
            # If the control uuid is passed then intercept the message and return
            await self.command_parser(DATA["CONTROL"])
            return

        # Send that data to the device, if it's still connected.
        device = self.OSS_All_Connections["device"].get(UUID)
        if device is None:
            # If no device is returned, send a notification to the fronts to close it.
            logger.warning(f"Front {self.uuid} targeted unknown/disconnected device {UUID}")
            data = {
                "CLOSED" : UUID
            }
            await self.broadcast("front", self.OSS_Message(self, json.dumps(data)))
            return

        await device.send(DATA)

    
    async def command_parser (self, command) :
        # Parse a command from the fronts admin user.
        if (self.user != OSS_Connection.ADMIN_USER) :
            return
        
        ret = ""

        match command:
            case "hello" :
                ret = "Hello there!"
            case _ :
                ret = "Unknown Command"

        # Create the OSS Control message and send it to the front.
        data = {
            "Server Terminal" : f"[{ret}]"
        }

        await self.broadcast("front", self.OSS_Control_Message(json.dumps(data)))

    
    async def derived_close(self):
        logger.warning(f"\033[01;95mClosed Front Connection : {self.uuid}\033[0;0m")