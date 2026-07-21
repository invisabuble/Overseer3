from OSN.Connections.OSS_Connection import *
import json

class Device_Connection (OSS_Connection) :
    def __init__ (self, websocket, path, OSS_All_Connections) :
        super().__init__(websocket, path, OSS_All_Connections)
        print(f"\033[01;95mNew Device Connection : {self.uuid}\033[0;0m")

        # Store the state of the various GPIOs in the device to send to a front when it connects.
        self.device_state = self.extract_keys(json.loads(self.config))

        print(self.device_state)

    async def initialise (self) :
        # Initialise the Device connection.
        await super().update_front()

        # Extract all gpio keys from the config and store them in the device state.
        
        # Send this connections config to all connected fronts.
        for front in self.OSS_All_Connections["front"].values() :
            data = {
                "Device_Config" : self.config
            }
            await front.send(self.OSS_Message(self, data))
            await front.send(self.OSS_Message(
                self, 
                json.dumps(self.device_state) # Double stringify device state so it matches esp data.
                ))

    def extract_keys(self, data, results=None, skip_keys=None):
        # Walk though the config and extract all the keys that have a type property.
        if results is None:
            results = {}
        if skip_keys is None:
            skip_keys = {"__CONFIG__"}

        if isinstance(data, dict):
            for key, value in data.items():
                if key in skip_keys:
                    continue

                if isinstance(value, dict):
                    if "TYPE" in value:
                        results[key] = "0"

                    # Recurse regardless of whether this dict had TYPE,
                    # to catch nested TYPEd children.
                    self.extract_keys(value, results, skip_keys)

        return results

    async def route (self, message) :
        # Route for the device connections

        # Process the message from the device to update the device state.
        print(f"message from device : {message}")
        for gpio, state in json.loads(message).items():
            self.device_state[gpio] = state

        # Construct the message to send to the front.
        message = self.OSS_Message(self,message)

        # Send the message to the connected fronts.
        for front in self.OSS_All_Connections["front"].values() :
            await front.send(message)