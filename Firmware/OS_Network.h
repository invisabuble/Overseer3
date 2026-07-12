#ifndef OS_NETWORK_H
#define OS_NETWORK_H

#include <WiFi.h>
#include <WebSocketsClient.h>

class OS_Network {
  // Encapsulate the network and websocket connections.
  private:
    OS_Network();
    static void websocket_event (WStype_t type, uint8_t* payload, size_t length);

    WebSocketsClient websocket;

  public:
    static OS_Network& inst();
    void Init();
    void update();
};

#endif