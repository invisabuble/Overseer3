from OSN.Connections.OSS_Connection import *
import json
import logging

logger = logging.getLogger("OSS")

class Device_Connection (OSS_Connection) :
    def __init__ (self, websocket, path, type, OSS_All_Connections) :
        super().__init__(websocket, path, type, OSS_All_Connections)
        logger.warning(f"\033[01;95mNew Device Connection : {self.uuid}\033[0;0m")

        # Store the state of the various GPIOs in the device to send to a front when it connects.
        self.device_state = self.extract_keys(json.loads(self.config))


    async def initialise (self) :
        # Initialise the Device connection.
        await self.update_control()

        # Send this connections config to all connected fronts, concurrently.
        data = {
            "Device_Config" : self.config
        }
        await self.broadcast("front", self.OSS_Message(self, data))
        await self.broadcast("front", self.OSS_Message(
            self,
            json.dumps(self.device_state)  # Double stringify device state so it matches esp data.
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
                    if "TYPE" in value and value["TYPE"].lower() != "container":
                        results[key] = "0"

                    self.extract_keys(value, results, skip_keys)

        return results


    async def route (self, message) :
        # Route for the device connections

        # Process the message from the device to update the device state.
        logger.debug(f"message from device : {message}")
        for gpio, state in json.loads(message).items():
            self.device_state[gpio] = state

        # Construct the message to send to the front and broadcast concurrently.
        message = self.OSS_Message(self, message)
        await self.broadcast("front", message)


    async def derived_close(self):
        # Close a device connection.
        logger.warning(f"\033[01;95mClosed Device Connection : {self.uuid}\033[0;0m")
        data = {
            "CLOSED" : self.uuid
        }
        await self.broadcast("front", self.OSS_Message(self, json.dumps(data)))