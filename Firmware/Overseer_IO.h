#ifndef OVERSEER_IO_H
#define OVERSEER_IO_H

#include <Arduino.h>

// Base OS IO Class.
class Overseer_IO {
  protected:
    int IO;
    String last_state;
  public:
    Overseer_IO(int IO) : IO(IO) {};
    String measure(bool force = false);
    virtual String read() {return "";}
    virtual void write(const String& str = "") {}
};

// OS Digital IO Definition.
class OS_IO_Digital : public Overseer_IO {
  public:
    OS_IO_Digital(int IO) : Overseer_IO(IO) {pinMode(IO, OUTPUT);}
    String read();
    void write(const String& str = "");
};

// OS Analog IO Definition.
class OS_IO_Analog : public Overseer_IO {
  public:
    OS_IO_Analog(int IO) : Overseer_IO(IO) {pinMode(IO, INPUT);}
    String read();
};

// OS Text IO Definition.
class OS_IO_Text : public Overseer_IO {
  protected:
    String State;
  public:
    OS_IO_Text() : Overseer_IO(-1) {}
    String read();
    void write(const String& str = "");
};

#endif