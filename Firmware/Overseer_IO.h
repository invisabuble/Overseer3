#ifndef OVERSEER_IO_H
#define OVERSEER_IO_H

#include <Arduino.h>

class Overseer_IO {
  protected:
    int IO;
    String last_state;
  public:
    Overseer_IO(int IO) : IO(IO) {};
    String measure(bool force = false);
    virtual String read() {return "";}
    virtual void toggle() {}
};

class OS_IO_Digital : public Overseer_IO {
  public:
    OS_IO_Digital(int IO) : Overseer_IO(IO) {pinMode(IO, OUTPUT);}
    String read();
    void toggle();
};

class OS_IO_Analog : public Overseer_IO {
  public:
    OS_IO_Analog(int IO) : Overseer_IO(IO) {pinMode(IO, INPUT);}
    String read();
};

#endif