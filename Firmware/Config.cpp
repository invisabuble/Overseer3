#include "Config.h"

Config::Config () {
  prefs_read_write(true);

  // If the config is empty then write the default config to memory.
  if (!config.size()) {

    // Create the default config.
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
    write_config(default_config);
  }
}

bool Config::prefs_read_write (bool rw, const String& new_config) {
  // Read or write a config file from preferences.
  prefs.begin(OS_NAMESPACE, rw);

  bool no_error = true;

  if (rw) {
    // If rw is true then read the config from memory.
    String raw_config = prefs.getString(OS_PREF_KEY, "{}");
    deserializeJson(config, raw_config);
  } else {
    // If rw is false then validate the config and write it to memory.
    JsonDocument validator;
    if (deserializeJson(validator, new_config)){
      no_error = false;
    } else {
      // If the config is valid, write it to memory.
      prefs.putString(OS_PREF_KEY, new_config);
    }
  }

  prefs.end();

  return no_error;
}

void Config::write_config (const String& json_config) {
  // Write a new config and reboot.
  if(prefs_read_write(false, json_config)) {
    ESP.restart();
  }
}

const String& Config::get_value (const String& key) {
  // Get a value from the config.
  retrieved_value = config[key] | "";
  return retrieved_value;
}