#include "Overseer.h"
#include "OS_Config.h"
#include "OS_Network.h"
#include "Overseer_IO.h"
#include "OS_IO_Conf.h"

/*
Overseer IO Manager Implementation.
*/

Overseer_IO_Manager::Overseer_IO_Manager (
  int Type,
  String FE_Type,
  String Name,
  std::vector<int> IO_List
  ) : Type(Type), FE_Type(FE_Type), Name(Name) {
    // Setup the IO's and store them within the IO Manager.
    Serial.printf("Creating new IO Manager : %s, TYPE: %i\n", Name, Type);
    for (int IO : IO_List) {
      switch (Type) {
        case DIGITAL : {
          IO_Array.push_back(new OS_IO_Digital(IO));
          time_threshold = DIGITAL_THRESH;
          break;
        }
        case ANALOG : {
          IO_Array.push_back(new OS_IO_Analog(IO));
          time_threshold = ANALOG_THRESH;
          break;
        }
        case TEXT : {
          IO_Array.push_back(new OS_IO_Text());
          time_threshold = TEXT_THRESH;
          break;
        }
      }
    }

  }

String Overseer_IO_Manager::measure(bool force) {
  // Measure the state of the IO's attached to this IO Manager.
  unsigned long current_time = millis();
  if (current_time - last_measure_time < time_threshold) {
    return "";
  }

  last_measure_time = current_time;

  // setup string with reserve to help with heap fragmentation.
  String update;
  update.reserve(IO_READ_SIZE * IO_Array.size());

  for (Overseer_IO* IO_Obj : IO_Array) {
    String gpio_update = IO_Obj->measure(force || force_IO_read);
    if (gpio_update == "") return "";
    update += gpio_update;
  }

  // If the measure was forced. by the force_IO_read flag reset it here.
  force_IO_read = false;

  // If the update string is empty then return the empty string.
  if (update == "") return "";

  // Remove the trailing comma
  update.remove(update.length() - 1);

  return "\"" + Name + "\":\"[" + update + "]\",";
}

void Overseer_IO_Manager::write(const String& str) {
  // Pipe any toggle instructions through to the digital IO's
  for (Overseer_IO* GPIO : IO_Array) {
    // Handle special cases here, if none of them apply then write the GPIO of the digital IO.
    if (Type == ANALOG) return;
    if (Type == TEXT) {
      force_IO_read = true;
      GPIO->write(str);
      continue;
    }

    GPIO->write();
  }
}

String Overseer_IO_Manager::get_name() {return Name;}

int Overseer_IO_Manager::get_type() {return Type;}

String Overseer_IO_Manager::get_fe_type() {return FE_Type;}

/*
Overseer Implementation.
*/

Overseer::Overseer() {}

Overseer& Overseer::inst() {
  // Return the instance of the first created overseer object.
  // Function-local static variable to get the object back.
  static Overseer instance;
  return instance;
}

void Overseer::search_config(JsonObject obj, const String& path) {
    if (obj["TYPE"].is<const char*>()) {
        String type = obj["TYPE"].as<String>();
        type.toLowerCase();

        int lastSlash = path.lastIndexOf('/');
        String key = (lastSlash == -1) ? path : path.substring(lastSlash + 1);

        std::vector<int> io_list;
        if (obj["IO"].is<JsonArray>()) {
            for (JsonVariant v : obj["IO"].as<JsonArray>()) io_list.push_back(v.as<int>());
        } else if (obj["IO"].is<int>()) {
            io_list.push_back(obj["IO"].as<int>());
        } else {
            io_list.push_back(-1);
        }

        int IO_Type = -1;

        if (type == "switch"     || 
            type == "button")       IO_Type = DIGITAL;
        if (type == "line_chart" ||
            type == "bar"        ||
            type == "pie_chart"  ||
            type == "bar_chart")    IO_Type = ANALOG;
        if (type == "reading"    ||
            type == "terminal")     IO_Type = TEXT;

        if (IO_Type != -1) {
            IO_Managers.push_back(new Overseer_IO_Manager(IO_Type, type, key, io_list));
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

void Overseer::handle_instruction(const String& target, const String& str, int target_type) {
  // Handle an incoming instruction from the OSS server.
  for (Overseer_IO_Manager* IO_Manager : IO_Managers) {
    // If a target matches the name saved within the IO Manager then send the update to that target.
    if (target_type == NAME && IO_Manager->get_name() == target) {
      IO_Manager->write(str);
      return;
    }
    // If the target type is TYPE then use the frontends type to match the target.
    if (target_type == TYPE && IO_Manager->get_fe_type() == target) {
      IO_Manager->write(str);
    }
  }
}

void Overseer::initialise() {
  // Iterate through every item in the serialised config and parse the GPIO's accordingly.

  Serial.println("Searching config...");

  // Get a pointer to the config class
  OS_Config& cnf = OS_Config::inst();
  search_config(cnf.get_json_config().as<JsonObject>());

}

void Overseer::loop() {
  // Loop through every IO Manager within the object and collect the update information.

  // If the network sleep flag has been set then dont measure anything and return.
  if (OS_Network::inst().is_asleep()) {
    return;
  }

  String update_string = "";

  bool force = force_read;

  for (Overseer_IO_Manager* IO_Manager : IO_Managers) {
    update_string += IO_Manager->measure(force);
  }

  if (update_string == "") return;

  // Remove the trailing comma and send the message to the server.
  update_string.remove(update_string.length() - 1);
  OS_Network::inst().send("{" + update_string + "}");

  if (force) force_read = false;

}