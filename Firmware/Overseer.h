#ifndef OVERSEER_H
#define OVERSEER_H

#include <ArduinoJson.h>

class Overseer {
  private:
    Overseer();
    void search_config(JsonObject obj, const String& path = "");
  public:
    static Overseer& inst();
    void initialise();
};

#endif