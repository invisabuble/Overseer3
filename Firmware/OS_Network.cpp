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