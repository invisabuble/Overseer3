#include "Overseer.h"
#include "OS_Config.h"

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
  // Iterate through the JSON config and find TYPE, IO pairs.
  if (obj["TYPE"].is<const char*>()) {
    String type = obj["TYPE"].as<String>();

    if (obj["IO"].is<int>()) {
      int io = obj["IO"].as<int>();
      Serial.printf("%s -> TYPE: %s, IO: %d\n", path.c_str(), type.c_str(), io);


      
      // Add creation of GPIO objects here!!!



    }
  }

  // If TYPE is not at this level, go to the next level.
  for (JsonPair kv : obj) {
    String key = kv.key().c_str();

    // If the found keys are in this statement then ignore them and carry onto the next iterable.
    if (key == "__CONFIG__" || key == "TYPE") continue;

    JsonVariant value = kv.value();
    if (value.is<JsonObject>()) {
      String childPath = path.isEmpty() ? key : path + "/" + key;
      search_config(value.as<JsonObject>(), childPath);
    }
  }
}
