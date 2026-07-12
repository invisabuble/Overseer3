#include "OS_Network.h"
#include "OS_Config.h"

OS_Network& OS_Network::inst() {
    static OS_Network instance;
    return instance;
}

OS_Network::OS_Network() {}

void OS_Network::Init () {
    // Drive the status LED low before configuring WiFi.
    digitalWrite(STATUS_LED, LOW);

    // Get a pointer to the config object.
    OS_Config& cnf = OS_Config::inst();

    // Setup strings to copy the variables into.
    String ssid = cnf["SSID"];
    String pswd = cnf["PSWD"];

    // Initiate the WiFi connection.
    WiFi.mode(WIFI_STA);
    WiFi.begin(ssid.c_str(), pswd.c_str());

    // Pasue here until  WiFi connects. Blink the status light to show connection attempt in progress.
    while (WiFi.status() != WL_CONNECTED) {
        delay(500);
        digitalWrite(STATUS_LED, !digitalRead(STATUS_LED));
    }

    //Drive the LED low again when the connection attempt has succeeded.
    digitalWrite(STATUS_LED, LOW);

    // Setup strings to hold the websocket information.
    String host = cnf["HOST"];
    String port = cnf["PORT"];
    String cert = cnf["__CERT__"];

    // Initialise the websocket connection.
    websocket.beginSslWithCA(
        host.c_str(),
        port.toInt(),
        "/",
        cert.c_str()
    );
    websocket.onEvent(websocket_event);
    websocket.setReconnectInterval(5000);
}

void OS_Network::websocket_event(WStype_t type, uint8_t* payload, size_t length) {
    switch (type) {
        case WStype_CONNECTED:
            Serial.println("WSS connected");
            break;
        case WStype_DISCONNECTED:
            Serial.println("WSS disconnected");
            break;
        case WStype_TEXT:
            Serial.printf("WSS received: %s\n", payload);
            // This is where an incoming config push would get routed to
            // OS_Config::inst().write_new_config(...), once you build that handler.
            break;
        case WStype_ERROR:
            Serial.println("WSS error");
            break;
        default:
            break;
    }
}

void OS_Network::update () {
    websocket.loop();
}