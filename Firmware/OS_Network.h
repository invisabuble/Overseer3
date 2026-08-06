#ifndef OS_NETWORK_H
#define OS_NETWORK_H

#include <WiFi.h>
#include <WiFiClientSecure.h>
#include <HTTPUpdate.h>
#include <WebSocketsClient.h>
#include <ArduinoJson.h>
#include <UrlEncode.h>

class OS_Network {
  // Encapsulate the network and websocket connections.
  private:
    OS_Network();
    static void websocket_event (WStype_t type, uint8_t* payload, size_t length);
    void connect_websocket();
    String host, port, cert, durl;
    WebSocketsClient websocket;
    bool network_sleep = false;
    bool ota_in_progress = false;

    // nullptr as default, overwrite this using provided method to extend terminal behaviour.
    String (*OS_Term_Ext)(String& command) = nullptr;

  public:
    static OS_Network& inst();
    void Init();
    void update();
    void OS_Terminal(String& command);
    void Set_OS_Term_Callback(String (*OS_Term_Ext_Callback)(String& command));
    void send(String& message);
    void close_wss();
    bool is_asleep();
    void perform_ota(String& url);

    /*
    // Extended commands can be created by the user by creating a function like the following:

    String OS_Terminal_Extended(String &command) {
      // The function should accept a string reference as an argument and return a string.
      
      String ret = "";

      // Process the custom command here.
      if (command == "extended") {
        ret = "Extended Commands Active!";
      }

      // Return the result here.
      return ret;

    }

    // This function can then be loaded into the OS_Network instance using the Set_OS_Term_Callback method like so:

    OS_Network::inst().Set_OS_Term_Callback(OS_Terminal_Extended);

    // This can be called anywhere that includes the OS_Network header.
    */
    
};

#endif