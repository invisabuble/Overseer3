#include "OS_Network.h"
#include "Overseer.h"
#include "OS_Config.h"
#include "User_Config.h"

OS_Network& OS_Network::inst() {
    static OS_Network instance;
    return instance;
}

OS_Network::OS_Network() {pinMode(STATUS_LED, OUTPUT);}

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
    WiFi.setAutoReconnect(true);

    // Pasue here until  WiFi connects. Blink the status light to show connection attempt in progress.
    while (WiFi.status() != WL_CONNECTED) {
        delay(500);
        digitalWrite(STATUS_LED, !digitalRead(STATUS_LED));
    }

    //Drive the LED low again when the connection attempt has succeeded.
    digitalWrite(STATUS_LED, LOW);

    // Setup strings to hold the websocket information.
    host = cnf["HOST"];
    port = cnf["PORT"];
    cert = cnf["__CERT__"];
    durl = "/device?CONF=" + urlEncode(cnf["__CONFIG__"]);

    // Initialise the websocket connection.
    websocket.beginSslWithCA(
        host.c_str(),
        port.toInt(),
        durl.c_str(),
        cert.c_str()
    );
    websocket.onEvent(websocket_event);
    websocket.setReconnectInterval(5000);
}

void OS_Network::websocket_event(WStype_t type, uint8_t* payload, size_t length) {
    Serial.printf("WS event type: %d\n", type); // print the raw type every time, no exceptions
    switch (type) {
        case WStype_DISCONNECTED:
            Serial.println("WSS disconnected");
            break;
        case WStype_CONNECTED:
            Serial.printf("WSS connected to: %s\n", payload);
            // Once connected force a read of all gpios in the config to keep the server up to date.
            Overseer::inst().force_read = true;
            break;
        case WStype_TEXT:
        {
            Serial.printf("WS text received, len %d: %s\n", length, payload);

            // Deserialise the JSON.
            JsonDocument doc;
            DeserializationError error = deserializeJson(doc, payload, length);

            // Catch any errors when deserialising.
            if (error) {
                Serial.printf("JSON parse failed: %s\n", error.c_str());
                break;
            }

            JsonObject obj = doc.as<JsonObject>();

            // Iterate through the sent command.
            for (JsonPair kv : obj) {
                String key = kv.key().c_str();
                String value = kv.value().as<String>();

                if (key == "CONFIG") {
                    // Get a pointer to the config object.
                    OS_Config& cnf = OS_Config::inst();
                    cnf.write_new_config(value);
                    continue;
                }

                if (key == "TERM") {
                    OS_Network::inst().OS_Terminal(value);
                    continue;
                }

                // Any other commands get sent to the Overseer instruction handler.
                Overseer::inst().handle_instruction(key, value);

            }
            break;
        }
            
        case WStype_ERROR:
            Serial.printf("WSS error, payload len %d: %s\n", length, payload);
            break;
        case WStype_PING:
            Serial.println("WS ping");
            break;
        case WStype_PONG:
            Serial.println("WS pong");
            break;
        default:
            Serial.printf("WS other event: %d\n", type);
            break;
    }
}

void OS_Network::OS_Terminal(String &command) {
    // Handle terminal commands.
    Serial.printf("Handling terminal command : %s\n", command);
}

void OS_Network::send(String& message) {
    websocket.sendTXT(message);
}

void OS_Network::update () {
    websocket.loop();
}

void OS_Network::close_wss() {
    // Close the WSS connection.
    websocket.disconnect();
}