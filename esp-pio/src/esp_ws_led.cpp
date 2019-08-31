#include <Arduino.h>
#include <exception>

#include "serial.h"
#include "mdns.h"
#include "wifi.h"
#include "light/light.h"
#include "webSockets/webSockets.h"

#define LED_RED D1   // 5
#define LED_GREEN D2 // 4
#define LED_BLUE D3  // 0

uint8_t pins[3] = {LED_RED, LED_GREEN, LED_BLUE};

const char *NodeName = "lab";

const uint16_t WebSocketPort = 81;

Light rgbLed("RGB1", pins);

void setup()
{
    serial::setupSerial(115200, false);
    wifi::setupWifi(SSID_NAME, SSID_PASWORD);
    mdns::setupMdns(NodeName);
    webSockets::setupWebSockets(WebSocketPort, &rgbLed);

    rgbLed.initialize();
    rgbLed.setRgb(0);
    Serial.println("[SETUP] Setup complete");
}

void loop()
{
    webSockets::loopWebSockets();
}
