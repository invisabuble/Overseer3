#include "Network.h"
#include "Config.h"

Network& Network::inst() {
    static Network instance;
    return instance;
}

Network::Network() {}

void Network::Init () {
    // Drive the status LED low before configuring WiFi.
    digitalWrite(STATUS_LED, LOW);

    // Get a pointer to the config object.
    Config& cnf = Config::inst();

    // Initiate the WiFi connection.
    WiFi.mode(WIFI_STA);
    WiFi.begin(cnf["SSID"].c_str(), cnf["PSWD"].c_str());

    // Pasue here until  WiFi connects. Blink the status light to show connection attempt in progress.
    while (WiFi.status() != WL_CONNECTED) {
        delay(500);
        digitalWrite(STATUS_LED, !digitalRead(STATUS_LED));
    }

    //Drive the LED low again when the connection attempt has succeeded.
    digitalWrite(STATUS_LED, LOW);
}