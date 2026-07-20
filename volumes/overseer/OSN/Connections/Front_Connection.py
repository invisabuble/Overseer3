from OSN.Connections.OSS_Connection import *

class Front_Connection (OSS_Connection) :
    def __init__ (self, websocket, path, OSS_All_Connections) :
        super().__init__(websocket, path, OSS_All_Connections)
        print(f"\033[01;95mNew Front Connection : {self.uuid}\033[0;0m")

    async def initialise (self) :
        # Initialise the Front connection.
        
        # Get every device object and send it to this front.
        for device in self.OSS_All_Connections["device"].values():
            # Get the config from the device and send it to the front.
            data = {
                "Device_Config" : device.config
            }
            await self.send(self.OSS_Message(device, data))
            await self.send(self.OSS_Message(
                device, 
                json.dumps(device.device_state) # Double stringify device state so it matches esp data.
                ))

    async def route (self, message) :
        # Route for the frontend connections
        
        # Parse the incoming message.
        message = json.loads(message)
        print(f"[ROUTE] > [{self.uuid}] : {message}")

        # Get the UUID of the target device and the data to send to it.
        UUID = message['UUID']
        DATA = message['DATA']

        # Send that data to the device.
        await self.OSS_All_Connections["device"][UUID].send(DATA)