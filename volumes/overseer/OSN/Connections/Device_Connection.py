from OSN.Connections.OSS_Connection import *

class Device_Connection (OSS_Connection) :
    def __init__ (self, websocket, path, OSS_All_Connections) :
        super().__init__(websocket, path, OSS_All_Connections)
        print(f"New Device Connection : {self.uuid}")

    async def initialise (self) :
        # Initialise the Device connection.
        
        # Send this connections config to all connected fronts.
        for front in self.OSS_All_Connections["front"].values() :
            print(f"{self.uuid} sending : {self.config}")
            await front.send(self.config)

    async def route (self, message) :
        # Route for the frontend connections
        pass