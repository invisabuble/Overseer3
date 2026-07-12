#include "OS_Config.h"
#include "OS_Network.h"

void setup() {
  pinMode(STATUS_LED, OUTPUT);
  OS_Network::inst().Init();
}

void loop() {

}