#include "Config.h"
#include "Network.h"

void setup() {
  pinMode(STATUS_LED, OUTPUT);
  Network::inst().Init();
}

void loop() {

}