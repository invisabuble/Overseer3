import secrets
import string
from urllib.parse import urlparse, parse_qs
import json

# Define the pool of characters (a-z, A-Z, 0-9)
alphabet = string.ascii_letters + string.digits

class OSS_Connection:
    def __init__ (self, websocket, path, type, OSS_All_Connections) :
        # Connection object to facilitate storage of websocket connections and comminucation between them and the OSS.
        self.OSS_All_Connections = OSS_All_Connections
        self.websocket = websocket
        self.type = type
        self.uuid = ''.join(secrets.choice(alphabet) for _ in range(15))
        self.IP = websocket.remote_address[0] 

        # Process the path to determine the connection type and get the config.
        self.config = parse_qs(urlparse(path).query).get("CONF", [None])[0]

    async def update_control (self) :
        # Update the frontend line graph with the number of connections.
        data = {
            "Connections" : [len(self.OSS_All_Connections["device"]),len(self.OSS_All_Connections["front"])]
            }
        for front in self.OSS_All_Connections["front"].values() :
            await front.send(self.OSS_Control_Message(
                json.dumps(data)
            ))

    async def send (self, message) :
        # Send a message to this connections websocket.
        print(f"\033[0;92m>[{self.uuid}] : {message}\033[0;0m")
        await self.websocket.send(
            json.dumps(message)
        )

    async def _receive (self) :
        # Receives messages from this connections websocket.
        async for message in self.websocket :
            print(f"\033[0;94m<[{self.uuid}] : {message}\033[0;0m")
            await self.route(message)

    async def close (self) :
        # Close a websocket connection.
        await self.websocket.close()

        del self.OSS_All_Connections[self.type][self.uuid]

        await self.update_control()


    # OSS Messages

    def OSS_Control_Message (self, DATA) :
        message = {
            "UUID" : "__CONTROL__",
            "IP" : "",
            "DATA" : DATA
        }

        return message

    def OSS_Message (self, connection, DATA) :
        # Construct an OSS message
        message = {
            "UUID" : connection.uuid,
            "IP"   : connection.IP,
            "DATA" : DATA
        }

        return message
    
    