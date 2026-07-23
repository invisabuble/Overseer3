#ifndef OVERSEER_H
#define OVERSEER_H

#include <vector>
#include <ArduinoJson.h>

class OS_IO {
  protected:
    std::vector<int> IO;
    String State = "-1";
    String Name;
  public:
    OS_IO(String NAME, std::vector<int> IO);
    String get_name();
    std::vector<int> get_io();
    virtual void set_state(int state) {};
    virtual String read(int IO_Num) = 0;
    String read_state(bool force = false);
    virtual ~OS_IO() = default;
};


class OS_IO_Digital : public OS_IO {
  public:
    OS_IO_Digital(String NAME, std::vector<int> IO);
    void set_state(int state) override;
    String read(int IO_Num) override;
};


class OS_IO_Analog : public OS_IO {
  private:
    int last_read = 0;
  public:
    OS_IO_Analog(String NAME, std::vector<int> IO);
    String read(int IO_Num) override;
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