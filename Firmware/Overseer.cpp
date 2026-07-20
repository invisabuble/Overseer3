#include "Overseer.h"
#include "OS_Config.h"
#include "OS_Network.h"

Overseer& Overseer::inst() {
  // Return the instance of the first created overseer object.
  // Function-local static variable to get the object back.
  static Overseer instance;
  return instance;
}

Overseer::Overseer () {}

void Overseer::initialise() {
  // Iterate through every item in the serialised config and parse the GPIO's accordingly.

  Serial.println("Searching config...");

  // Get a pointer to the config class
  OS_Config& cnf = OS_Config::inst();
  search_config(cnf.get_json_config().as<JsonObject>());

}

void Overseer::search_config(JsonObject obj, const String& path) {
    if (obj["TYPE"].is<const char*>() && obj["IO"].is<int>()) {
        String type = obj["TYPE"].as<String>();
        type.toLowerCase();
        int io = obj["IO"].as<int>();

        // Extract this object's own key from the end of the accumulated path.
        int lastSlash = path.lastIndexOf('/');
        String key = (lastSlash == -1) ? path : path.substring(lastSlash + 1);

        Serial.printf("KEY: %s, TYPE: %s, IO: %d\n", key.c_str(), type.c_str(), io);

        if (type == "switch") {
          Serial.printf("Creating new switch : %s", key);
          GPIO_Array.push_back(new OS_IO_Digital(key, io));
        }

    }

    for (JsonPair kv : obj) {
        String key = kv.key().c_str();
        if (key == "__CONFIG__" || key == "TYPE") continue;

        JsonVariant value = kv.value();
        if (value.is<JsonObject>()) {
            String childPath = path.isEmpty() ? key : path + "/" + key;
            search_config(value.as<JsonObject>(), childPath);
        }
    }
}

void Overseer::handle_instruction (const String& target, const String& state) {
  // Handle an instruction for the GPIO.

  Serial.printf("Handling instruction for : %s, %s\n", target, state);

  // Iterate through the gpio array until we find the correct target.
  for (OS_IO* gpio : GPIO_Array) {
    if (gpio->get_name() == target) {
      if (state.isEmpty()) {
        // If the state is empty then just toggle the targeted GPIO.
        int io = gpio->get_io();
        digitalWrite(io, !digitalRead(io));
      }
    }
  }

}

void Overseer::loop () {
  // Loop through the measurement vector and get all of the measurements.
  String update_string = "";

  // Copy the value of force read to a temporary variable to avoid changing the state half way through the loop.
  bool force_read_gpio = force_read;

  for (OS_IO* gpio : GPIO_Array) {
    update_string += gpio->read_state(force_read_gpio);
  }

  if (!update_string.isEmpty()) {
    update_string.remove(update_string.length() - 1);
    OS_Network::inst().send("{" + update_string + "}");
  }

  // Reset the force read to false after the loop has completed only if the force_read_gpio has been set.
  if (force_read_gpio) {
    force_read = false;
  }

}





/*
IO Class Implementation.
*/

OS_IO::OS_IO (String NAME, int IO) : Name(NAME), IO(IO) {}

String OS_IO::get_name() {
  return Name;
}

int OS_IO::get_io() {
  return IO;
}

String OS_IO::read_state(bool force) {
  // Read the state of the monitored input/output from the overriden read method.
  String state = read();

  // If the new state is the same as the stored state and the read isnt being forced, then do nothing.
  if (state == State && !force) {
    return "";
  }

  // If the new state is different, then store it and return the new state.
  State = state;

  // Assemble the return string.
  return "\"" + Name + "\":\"" + state + "\","; 
}

/*
Digital IO Class Implementation.
*/

OS_IO_Digital::OS_IO_Digital (String NAME, int IO) : OS_IO(NAME, IO) {
  pinMode(IO, OUTPUT);
  digitalWrite(IO, LOW);
}

String OS_IO_Digital::read () {
  return String(digitalRead(IO));
}

void OS_IO_Digital::set_state(int state) {
  digitalWrite(IO, state);
}

