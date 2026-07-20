#ifndef OVERSEER_H
#define OVERSEER_H

#include <vector>
#include <ArduinoJson.h>

class OS_IO {
  protected:
    int IO;
    String State = "-1";
    String Name;
  public:
    OS_IO(String NAME, int IO);
    String get_name();
    int get_io();
    virtual void set_state(int state) = 0;
    virtual String read() = 0;
    String read_state(bool force = false);
    virtual ~OS_IO() = default;
};


class OS_IO_Digital : public OS_IO {
  public:
    OS_IO_Digital(String NAME, int IO);
    void set_state(int state) override;
    String read() override;
};


class Overseer {
  private:
    Overseer();
    std::vector<OS_IO*> GPIO_Array;
    void search_config(JsonObject obj, const String& path = "");
  public:
    bool force_read = false;
    static Overseer& inst();
    void handle_instruction(const String& target, const String& state = "");
    void initialise();
    void loop();
};

#endif