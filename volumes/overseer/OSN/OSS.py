import asyncio
import signal
import ssl
import websockets
from urllib.parse import urlparse
import os

from OSN.ODB import *
from OSN.Connections.Device_Connection import *
from OSN.Connections.Front_Connection import *

class OSS:

    def __init__ (self) :
        # Initialise the Overseer Secure Websockets server.
        self.host = os.getenv("OSN_HOST")
        self.port = int(os.getenv("OSN_PORT"))
        self.ping_int = int(os.getenv("PING_INT"))
        self.ping_tmt = int(os.getenv("PING_TMT"))

        # Setup the connection to the DB.
        self.ODB = ODB()

        # Connections.
        self.Connections = {
            "front"  : {},
            "device" :{} 
        }

        # Stop event for the run method
        self.stop_event = None

    async def handler (self, websocket, path) :
        CON_type = urlparse(path).path.lstrip("/")
        NC = None

        if (CON_type == "front") :
            NC = Front_Connection(websocket, path, CON_type, self.Connections)
        elif (CON_type == "device") : 
            NC = Device_Connection(websocket, path, CON_type, self.Connections)
        else :
            await websocket.close(code=4000, reason=f"Unknown connection type : {CON_type}")
            return

        try:
            # Add the connection to the right place and endlessly await messages from the connection.
            self.Connections[CON_type][NC.uuid] = NC
            await NC.initialise()
            await NC._receive()

        except websockets.exceptions.ConnectionClosed as e:
            print(f"Connection closed by {NC.uuid} : {e}")

        except Exception as e:
            print(f"Error with connection {NC.uuid} : {e}")

        finally:
            print(f"Connection closed from {NC.uuid}")
            await NC.close()

    async def _main (self) :
        # Start the server up.
        
        # Load SSL certificate and key
        self.ssl_context = ssl.SSLContext(ssl.PROTOCOL_TLS_SERVER)
        self.ssl_context.load_cert_chain(
            certfile="/certs/overseer/overseer-server.crt",
            keyfile="/certs/overseer/overseer-server.key"
        )

        # Start the websocket server.
        async with websockets.serve(

            self.handler,
            self.host,
            self.port,
            ssl=self.ssl_context,
            ping_interval=self.ping_int,
            ping_timeout=self.ping_tmt

        ) as server:
            
            print(f"Server started at {self.host}:{self.port}, ping-int: {self.ping_int}, ping_tmt: {self.ping_tmt}")
            await self.stop_event.wait()
            print("Shutting down server...")
            server.close()
            await server.wait_closed()
            await self.ODB.close()
            print("Server shut down successfully.")

    def run(self):
        # Run the server and handle terminations for a quick shutdown.

        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)

        self.stop_event = asyncio.Event()
        for sig in (signal.SIGINT, signal.SIGTERM):
            loop.add_signal_handler(sig, self.stop_event.set)

        try:
            loop.run_until_complete(self._main())
        finally:
            loop.close()