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
    if (obj["TYPE"].is<const char*>() && (obj["IO"].is<int>() || obj["IO"].is<JsonArray>())) {
        String type = obj["TYPE"].as<String>();
        type.toLowerCase();

        int lastSlash = path.lastIndexOf('/');
        String key = (lastSlash == -1) ? path : path.substring(lastSlash + 1);

        std::vector<int> io_list;
        if (obj["IO"].is<JsonArray>()) {
            for (JsonVariant v : obj["IO"].as<JsonArray>()) io_list.push_back(v.as<int>());
        } else {
            io_list.push_back(obj["IO"].as<int>());
        }

        Serial.printf("KEY: %s, TYPE: %s, IO count: %d\n", key.c_str(), type.c_str(), io_list.size());

        // Process analog first as we can then overwrite the pin mode as input for logging digital on the charts.
        if (type == "line_chart") {
            GPIO_Array.push_back(new OS_IO_Analog(key, io_list));
        }

        if (type == "switch" || type == "button") {
            GPIO_Array.push_back(new OS_IO_Digital(key, io_list));
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
        for (int io : gpio->get_io()) {
          digitalWrite(io, !digitalRead(io));
        }
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

OS_IO::OS_IO (String NAME, std::vector<int> IO) : Name(NAME), IO(IO) {}

String OS_IO::get_name() {
  return Name;
}

std::vector<int> OS_IO::get_io() {
  return IO;
}

String OS_IO::read_state(bool force) {
  std::vector<String> readings;
  for (int io : IO) {
    String io_state = read(io);
    if (io_state != "") {
      readings.push_back(io_state);
    }
  }

  String state = "[";
  for (size_t i = 0; i < readings.size(); i++) {
    state += readings[i];
    if (i < readings.size() - 1) state += ",";
  }
  state += "]";

  if ((state == State || state == "[]") && !force) {
    return "";
  }

  State = state;
  return "\"" + Name + "\":\"" + state + "\",";
}

/*
Digital IO Class Implementation.
*/

OS_IO_Digital::OS_IO_Digital (String NAME, std::vector<int> IO) : OS_IO(NAME, IO) {
  for (int io : IO) {
    pinMode(io, OUTPUT);
    digitalWrite(io, LOW);
  }
}

String OS_IO_Digital::read (int IO_Num) {
  return String(digitalRead(IO_Num));
}

void OS_IO_Digital::set_state(int state) {
  for (int io : IO) {
    digitalWrite(io, state);
  }
}

/*
Analog IO Class Implementation.
*/

OS_IO_Analog::OS_IO_Analog (String NAME, std::vector<int> IO) : OS_IO(NAME, IO) {
  for (int io : IO) {
    pinMode(io, INPUT);
  }
}

String OS_IO_Analog::read (int IO_Num) {
  // Rate limit analog read messages to 5 per second.
  String result = "";
  if (millis() - last_read > 500) {
    result = String(analogRead(IO_Num));
    last_read = millis();
  } 
  return result;
}

