import secrets
import string
from urllib.parse import urlparse, parse_qs
import json

# Define the pool of characters (a-z, A-Z, 0-9)
alphabet = string.ascii_letters + string.digits

class OSS_Connection:
    def __init__ (self, websocket, path, OSS_All_Connections) :
        # Connection object to facilitate storage of websocket connections and comminucation between them and the OSS.
        self.OSS_All_Connections = OSS_All_Connections
        self.websocket = websocket
        self.uuid = ''.join(secrets.choice(alphabet) for _ in range(15))
        self.IP = websocket.remote_address[0] 

        # Process the path to determine the connection type and get the config.
        self.config = parse_qs(urlparse(path).query).get("CONF", [None])[0]

    async def send (self, message) :
        # Send a message to this connections websocket.
        await self.websocket.send(
            json.dumps(message)
        )

    async def _receive (self) :
        # Receives messages from this connections websocket.
        async for message in self.websocket :
            await self.route(message)




