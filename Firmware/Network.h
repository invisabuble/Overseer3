#ifndef OS_NETWORK_H
#define OS_NETWORK_H

#include <WiFi.h>

// Forward definition of Config.
class Config;

class Network {
  // Encapsulate the network and websocket connections.
  private:
    Network();
  public:
    static Network& inst();
    void Init();
};

#endif