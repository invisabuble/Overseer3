#include "OS_Config.h"
#include "OS_Network.h"
#include "Overseer.h"

String OS_Terminal_Extended(String &command) {
  String ret = "";
  if (command == "extended") {
    ret = "Extended Commands Active!";
  }
  return ret;
}

void setup() {
  Serial.begin(115200);  
  Serial.println("Initiating network connection.");
  OS_Network::inst().Init();
  Serial.println("Connected to network!");
  Overseer::inst().initialise();

  // Set the callback within OS_Network to provide extended commands.
  OS_Network::inst().Set_OS_Term_Callback(OS_Terminal_Extended);
}

void loop() {
  OS_Network::inst().update();
  Overseer::inst().loop();
}