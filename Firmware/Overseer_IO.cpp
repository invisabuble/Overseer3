#include "Overseer_IO.h"
#include "OS_IO_Conf.h"

String Overseer_IO::measure(bool force) {

  // Setup state string with a reserve to prevent heap fragmentation.
  String state = read();

  if (state == last_state && !force) {
    return "";
  }

  last_state = state;
  return state + ",";

}

/*
Digital IO Implementation.
*/
String OS_IO_Digital::read() {
  return String(digitalRead(IO));
}

void OS_IO_Digital::toggle () {
  digitalWrite(IO, !digitalRead(IO));
}

/*
Analog IO Implementation.
*/
String OS_IO_Analog::read() {
  return String(analogRead(IO));
}