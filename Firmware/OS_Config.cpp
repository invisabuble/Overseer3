#include "OS_Config.h"

OS_Config& OS_Config::inst () {
  // Return the instance of the first created config object.
  // Function-local static variable to get the object back.
  static OS_Config instance; 
  return instance;
}

const String& OS_Config::operator[](const String& key) {
  // Get a value from the config.
  if (key == "__CERT__") {
    return raw_cert;
  }
  retrieved_value = config[DEFAULT_NAME]["__CONFIG__"][key] | "";
  return retrieved_value;
}

OS_Config::OS_Config () {
  // If the config is empty then write the default config to memory.
  if (!read_config()) {
    // Create the default config from the User_Config template.
    JsonDocument default_doc;
    JsonObject cnf = default_doc[DEFAULT_NAME]["__CONFIG__"].to<JsonObject>();

    cnf["SSID"] = DEFAULT_SSID;
    cnf["PSWD"] = DEFAULT_PSWD;
    cnf["PORT"] = DEFAULT_PORT;
    cnf["HOST"] = DEFAULT_HOST;
    cnf["USER"] = DEFAULT_USER;

    // Serialise the config and write it to memory.
    String default_config;
    serializeJson(default_doc, default_config);
    write_new_config(default_config);
  }
}

void OS_Config::generic_prefs_rw(bool rw, const char* key, String& data) {
  // Read or write to preferences.
  prefs.begin(OS_NAMESPACE, rw);

  if (rw) {
    // If rw is true then read the config from memory.
    data = prefs.getString(key, "");
  } else {
      // If the config is valid, write it to memory.
      prefs.putString(key, data);
  }

  prefs.end();
}

bool OS_Config::write_new_config (String &cnf) {
  // Check that the new config is valid and then write it to memory.
  JsonDocument validator;
  if (!deserializeJson(validator, cnf)){
    // If the config is valid, write it to memory.
    generic_prefs_rw(false, OS_PREF_KEY, cnf);
    ESP.restart();
    return true;
  }
  // Return false if the config is not valid JSON.
  return false;
}

bool OS_Config::read_config () {
  // Read the config from the memory.
  generic_prefs_rw(true, OS_PREF_KEY, raw_config);
  if (raw_config.length() > 0) {
    return !deserializeJson(config, raw_config);
  }
  return false;
}


