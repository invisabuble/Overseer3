#ifndef OS_CONFIG_H
#define OS_CONFIG_H

#include <Preferences.h>
#include <ArduinoJson.h>
#include "User_Config.h"

#define OS_NAMESPACE "Overseer"
#define OS_PREF_KEY  "OSCNF"

class Config {
  // Singleton to hold overseer config data and connection certs.
  private:
    Preferences prefs;
    JsonDocument config;

    // Strings to hold any data pulled out of preferences.
    String raw_config;
    String raw_cert = ROOT_CA_CRT;
    String retrieved_value;

    Config();
    void generic_prefs_rw(bool rw, const char* key, String& data);

  public:
    static Config& inst ();
    const String& operator[](const String& key);
    bool write_new_config(String& cnf);
    bool read_config ();
};

#endif