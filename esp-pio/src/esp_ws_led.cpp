#include <Arduino.h>
#include <exception>

#include "serial.h"
#include "http.h"
#include "mdns.h"
#include "wifi.h"
#include "ota.h"
#include "light/light.h"
#include "webSockets/webSockets.h"

const uint16_t WebSocketPort = 81;

#define LED_RED D1   // 5
#define LED_GREEN D2 // 4
#define LED_BLUE D3  // 0

uint8_t pins[3] = {LED_RED, LED_GREEN, LED_BLUE};

Light rgbLed("RGB1", pins);

void setup()
{
    serial::setupSerial(115200, false);
    wifi::setupWifi(SSID_NAME, SSID_PASWORD);
    ota::setupOta(HOSTNAME, OTA_PASSWORD);
    http::setupHttp();
    mdns::setupMdns(HOSTNAME);
    webSockets::setupWebSockets(WebSocketPort, &rgbLed);

    analogWriteFreq(10000); //should give 5Khz
    rgbLed.initialize();
    rgbLed.setRgb(0);
    Serial.println("[SETUP] Setup complete");
}

void loop()
{
    webSockets::loopWebSockets();
    http::loopHttp();
}
