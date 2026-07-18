from OSN.Connections.OSS_Connection import *

class Device_Connection (OSS_Connection) :
    def __init__ (self, websocket, path, OSS_All_Connections) :
        super().__init__(websocket, path, OSS_All_Connections)
        print(f"\033[01;95mNew Device Connection : {self.uuid}\033[0;0m")

        # Store the state of the various GPIOs in the device to send to a front when it connects.
        self.device_state = {}

    async def initialise (self) :
        # Initialise the Device connection.
        
        # Send this connections config to all connected fronts.
        for front in self.OSS_All_Connections["front"].values() :
            data = {
                "Device_Config" : self.config
            }
            await front.send(self.OSS_Message(data))

    async def route (self, message) :
        # Route for the frontend connections
        pass