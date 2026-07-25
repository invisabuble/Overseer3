#ifndef OVERSEER_H
#define OVERSEER_H

#include "Overseer_IO.h"
#include "OS_IO_Conf.h"
#include <vector>
#include <ArduinoJson.h>

class Overseer_IO_Manager {
  private:
    String Name;
    String FE_Type;
    int Type;
    bool force_IO_read = false;
    unsigned long last_measure_time;
    int time_threshold;
    std::vector<Overseer_IO*> IO_Array;

  public:
    Overseer_IO_Manager(
      int Type,
      String FE_Type,
      String Name,
      std::vector<int> IO_List
      );
    String measure(bool force = false);
    void write(const String& str = "");
    String get_name();
    int get_type();
    String get_fe_type();
};

class Overseer {
  private:
    Overseer();
    void search_config (JsonObject obj, const String& path = "");

    std::vector<Overseer_IO_Manager*> IO_Managers;

  public:
    bool force_read = false;
    static Overseer& inst();
    void initialise();
    void handle_instruction(const String& target, const String& str = "", int target_type = NAME);
    void loop();
};

#endif