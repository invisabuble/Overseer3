#include "OS_Config.h"
#include "OS_Network.h"
#include "Overseer.h"

void setup() {
  Serial.begin(115200);
  Serial.setDebugOutput(true);
  delay(3000);
  pinMode(STATUS_LED, OUTPUT);
  Serial.println("Initiating network connection.");
  OS_Network::inst().Init();
  Serial.println("Connected to network!");
  Overseer::inst().initialise();
}

void loop() {
  OS_Network::inst().update();
}