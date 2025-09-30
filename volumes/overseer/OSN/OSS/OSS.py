import asyncio
import signal
import ssl
import websockets
import os
from urllib.parse import urlparse, parse_qs

class OSS:

    def __init__ (self) :
        # Initialise the Overseer Secure Websockets server.
        self.host = os.getenv("OSS_HOST")
        self.port = int(os.getenv("OSS_PORT"))
        self.ping_int = int(os.getenv("PING_INT"))
        self.ping_tmt = int(os.getenv("PING_TMT"))

        # Stop event for the run method
        self.stop_event = None

    async def handler (self, websocket, path) :
        try:
            # Get the connection parameters. Clients connect like:
            # wss://192.168.0.1:8765?parameter=parameter_value&parameter2=parameter2_value...
            query_params = parse_qs(urlparse(path).query)

            # From the query parameters get specific values, default to None if the values cant be found.
            UUID  = query_params.get("UUID", [None])[0]
            USER  = query_params.get("USER", [None])[0]
            TOKEN = query_params.get("TOKEN", [None])[0]

            keys = ["UUID", "USER", "TOKEN"]
            params = {k: query_params.get(k, [None])[0] for k in keys}


            # Endlessly await messages from the websocket until an error occurs.
            async for message in websocket:
                try:
                    pass
                except Exception as e:
                    print(e)

        except websockets.exceptions.ConnectionClosed as e:
            self.clr.cprint(f"Connection closed by '{UUID}': {e}", "red", True)

        except Exception as e:
            self.clr.cprint(f"Error with connection '{UUID}': {e}", "red", True)

        finally:
            print(f"Connection closed")

    async def main (self) :
        # Start the server up.
        
        # Load SSL certificate and key
        self.ssl_context = ssl.SSLContext(ssl.PROTOCOL_TLS_SERVER)
        self.ssl_context.load_cert_chain(
            certfile="/certs/SSL-cert.crt",
            keyfile="/certs/SSL-cert.key"
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
            print("Server shut down successfully.")

    def run(self):
        # Run the server and handle terminations for a quick shutdown.

        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)

        self.stop_event = asyncio.Event()
        for sig in (signal.SIGINT, signal.SIGTERM):
            loop.add_signal_handler(sig, self.stop_event.set)

        try:
            loop.run_until_complete(self.main())
        finally:
            loop.close()