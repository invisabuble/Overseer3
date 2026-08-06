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

    connect_websocket();
}

void OS_Network::connect_websocket() {
    // Initialise (or re-initialise) the websocket connection.
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

                if (key == "CONTROL") {
                    OS_Network::inst().OS_Terminal(value);
                    continue;
                }

                if (key == "OTA") {
                    // Value is expected to be the HTTPS URL of the firmware .bin
                    OS_Network::inst().perform_ota(value);
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

    String cmd = command;
    cmd.toLowerCase();

    Overseer& OS_Inst = Overseer::inst();

    String ret = "";
    bool CMD_MATCH = false;

    if (cmd == "help" || cmd == "?") {
        // Send the help message to the front.
        CMD_MATCH = true;
        ret = "Here to help!";
    }

    if (cmd == "reboot") {
        // Reboot the device.
        CMD_MATCH = true;
        OS_Network::inst().close_wss();
        ESP.restart();
    }

    if (cmd == "net_sleep") {
        // Put the network to sleep and stop any messages leaving the device.
        CMD_MATCH = true;
        network_sleep = true;
    }

    if (cmd == "net_wake") {
        // Wake up the network and begin transmitting messages.
        CMD_MATCH = true;
        ret = "Network awake";
        network_sleep = false;
    }

    if (cmd == "extended_commands") {
        CMD_MATCH = true;
        if (OS_Term_Ext != nullptr) {
            ret = "Extended Commands Active";
        } else {
            ret = "Extended Commands Not Active";
        }
    }

    // If none of the default commands register then send to the extended command method if it exists.
    if (OS_Term_Ext != nullptr && !CMD_MATCH) {
        ret = OS_Term_Ext(command);
    }

    // If the return message is not empty then send it to the terminal types.
    if (ret != "") {
        OS_Inst.handle_instruction("terminal", ret, TYPE);
        return;
    }

    // Handle unrecognised commands.
    OS_Inst.handle_instruction("terminal", "Unrecognised command.", TYPE);
}

void OS_Network::Set_OS_Term_Callback(String (*OS_Term_Ext_Callback)(String &)) {
    OS_Term_Ext = OS_Term_Ext_Callback;
}

void OS_Network::send(String& message) {
    // If the network isnt sleeping then send a message.
    if (network_sleep) return;
    websocket.sendTXT(message);
}

void OS_Network::update () {
    websocket.loop();
}

void OS_Network::close_wss() {
    // Close the WSS connection.
    websocket.disconnect();
}

bool OS_Network::is_asleep() {
    return network_sleep;
}

void OS_Network::perform_ota(String& url) {
    // Guard against a second OTA command arriving mid-flash.
    if (ota_in_progress) {
        Serial.println("OTA already in progress, ignoring request");
        return;
    }
    ota_in_progress = true;

    Serial.printf("Starting OTA update from: %s\n", url.c_str());

    // Stop the websocket so it isn't holding the connection/heap during the flash.
    close_wss();

    WiFiClientSecure client;
    // Reuse the same CA cert already loaded for the websocket connection,
    // assuming the OTA server sits behind the same cert chain.
    client.setCACert(cert.c_str());

    httpUpdate.rebootOnUpdate(true);

    httpUpdate.onStart([]() {
        Serial.println("OTA: update starting");
    });
    httpUpdate.onProgress([](int cur, int total) {
        Serial.printf("OTA progress: %d%%\r", (cur * 100) / total);
    });
    httpUpdate.onEnd([]() {
        Serial.println("OTA: update finished");
    });
    httpUpdate.onError([](int error) {
        Serial.printf("OTA error[%d]: %s\n", error, httpUpdate.getLastErrorString().c_str());
    });

    t_httpUpdate_return ret = httpUpdate.update(client, url);

    // If we reach this point, HTTP_UPDATE_OK did NOT happen (that path
    // reboots the device via rebootOnUpdate(true) and never returns here).
    switch (ret) {
        case HTTP_UPDATE_FAILED:
            Serial.printf("OTA failed: %s\n", httpUpdate.getLastErrorString().c_str());
            break;
        case HTTP_UPDATE_NO_UPDATES:
            Serial.println("OTA: server reported no update available");
            break;
        default:
            break;
    }

    // Reconnect the websocket since the device is staying on this firmware.
    ota_in_progress = false;
    connect_websocket();
}