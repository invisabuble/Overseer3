import asyncio
import signal
import ssl
import websockets
import os
import secrets
import string
import json
from urllib.parse import urlparse, parse_qs

from OSN.ODB import *

# Define the pool of characters (a-z, A-Z, 0-9)
alphabet = string.ascii_letters + string.digits

class OSS:

    def __init__ (self) :
        # Initialise the Overseer Secure Websockets server.
        self.host = os.getenv("OSN_HOST")
        self.port = int(os.getenv("OSN_PORT"))
        self.ping_int = int(os.getenv("PING_INT"))
        self.ping_tmt = int(os.getenv("PING_TMT"))

        # Setup the connection to the DB.
        self.ODB = ODB()

        # Properties for each websocket to use.
        self.urlkeys = ["CONF"]

        # Storage for connection types.
        self.connection_types = {
            "front" : set(),
            "device" : set()
            }

        # Stop event for the run method
        self.stop_event = None

    async def handler (self, websocket, path) :
        try:
            # Get the connection parameters. Clients connect like:
            # wss://192.168.0.1:8765/connection_type?parameter=parameter_value&parameter2=parameter2_value...

            connection_type = urlparse(path).path.lstrip("/")
            query_params = parse_qs(urlparse(path).query)

            # Store the key properties from the parsed url in the websocket object.
            websocket.params = {k: query_params.get(k, [None])[0] for k in self.urlkeys}

            # Get the connections __CONFIG__ structure.
            config_data = json.loads(websocket.params["CONF"])
            config_data = next(iter(config_data.values()))

            # Generate the structure 
            websocket.params["USER"] = config_data["__CONFIG__"]["USER"]                    # Extract the user and store it alongside the config for ease of use later.
            websocket.params["IP"]   = websocket.remote_address[0]                          # Store the incoming connections IP.
            websocket.params["UUID"] = ''.join(secrets.choice(alphabet) for _ in range(15)) # Create a random UUID for the connection.

            # Try to add the websocket connection to the class' storage.
            try :
                self.connection_types[connection_type].add(websocket)
            except KeyError: 
                raise TypeError(f"Unrecognised connection type : {connection_type}")
            
            # If the new connection is a frontend send all the connections in the device set to it.
            if (connection_type == "front") :
                for device in self.connection_types["device"] :
                    # Get the params object from the device and stringify it.
                    device_cnf = json.dumps(device.params)
                    # Send that connection to the front.
                    await websocket.send(device_cnf)

            # Endlessly await messages from the websocket until an error occurs.
            async for message in websocket:
                try:
                    match connection_type :
                        case "front" :
                            # If a message is received from a frontend, send the message to the target.
                            pass
                        case "device" :
                            # If a message is received from a device, send to all frontends with the correct user type.
                            pass
                        
                except Exception as e:
                    print(e)

        except websockets.exceptions.ConnectionClosed as e:
            print(f"Connection closed by '{websocket.params['UUID']}': {e}")

        except Exception as e:
            print(f"Error with connection '{websocket.params['UUID']}': {e}")

        finally:
            # Remove closed connection from the appropriate set.
            if connection_type in self.connection_types:
                self.connection_types[connection_type].discard(websocket)
            # Notify all fronts to close the appropriate UUID
            for front in self.connection_types["front"] :
                await front.send(json.dumps(
                    {
                        "DATA" : {
                            "UUID" : websocket.params['UUID'],
                            "UPDATE" : "CLOSE"
                        }
                    }
                ))
            print(f"Connection from {connection_type} : {websocket.params['UUID']} closed")

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