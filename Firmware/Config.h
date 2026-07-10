#ifndef OS_CONFIG_H
#define OS_CONFIG_H

#include <Preferences.h>
#include <ArduinoJson.h>
#include "User_Config.h"

#define OS_NAMESPACE "Overseer"
#define OS_PREF_KEY  "OSCNF"

class Config {
  private:
    Preferences prefs;
    JsonDocument config;

    String retrieved_value;

    // rw = true (prefs = read only), rw = false (prefs = read, write)
    bool prefs_read_write (bool rw, const String& new_config = "");

  public:
    Config();
    void write_config (const String& json_config);    // Write a new config to memory.
    const String& get_value(const String& key);       // Get a value from the config.
};

#endif