#include "OS_Config.h"
#include "OS_Network.h"
#include "Overseer.h"

void setup() {
  Serial.begin(115200);
  
  Serial.println("Initiating network connection.");
  OS_Network::inst().Init();
  Serial.println("Connected to network!");
  Overseer::inst().initialise();
}

void loop() {
  OS_Network::inst().update();
  Overseer::inst().loop();
}