from OSN.Connections.OSS_Connection import *

class Front_Connection (OSS_Connection) :
    def __init__ (self, websocket, path, OSS_All_Connections) :
        super().__init__(websocket, path, OSS_All_Connections)
        print(f"New Front Connection : {self.uuid}")

    async def initialise (self) :
        # Initialise the Front connection.
        
        # Get every device object and send it to this front.
        for device in self.OSS_All_Connections["device"].values():
            # Get the config from the device and send it to the front.
            print(f"{self.uuid} sending : {device.config}")
            await self.send(device.config)

    async def route (self, message) :
        # Route for the frontend connections
        pass