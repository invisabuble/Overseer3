#ifndef OS_NETWORK_H
#define OS_NETWORK_H

#include <WiFi.h>

class OS_Network {
  // Encapsulate the network and websocket connections.
  private:
    OS_Network();
  public:
    static OS_Network& inst();
    void Init();
};

#endif