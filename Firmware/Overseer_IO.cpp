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

void OS_IO_Digital::write (const String& str) {
  // If writing a Digital GPIO just toggle the IO.
  digitalWrite(IO, !digitalRead(IO));
}



/*
Analog IO Implementation.
*/
String OS_IO_Analog::read() {
  return String(analogRead(IO));
}



/*
Text IO Implementation.
*/
String OS_IO_Text::read() {
  return State;
}

void OS_IO_Text::write(const String& text) {
  State = text;
}