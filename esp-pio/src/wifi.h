#include <Arduino.h>
#include <ESP8266WiFi.h>
#include <ESP8266WiFiMulti.h>

#include <DNSServer.h>        //Local DNS Server used for redirecting all requests to the configuration portal
#include <ESP8266WebServer.h> //Local WebServer used to serve the configuration portal
#include <WiFiManager.h>      //https://github.com/tzapu/WiFiManager WiFi Configuration Magic

namespace wifi
{
ESP8266WiFiMulti WiFiMulti;

void setupWifi(const char *ssid, const char *password)
{
    Serial.print("[SETUP] Setting up WiFiManager...");
    WiFi.hostname("barbalab");

    WiFiManager wifiManager;
    if (!wifiManager.autoConnect(WFM_SSID, WFM_PASSWORD))
    {
        Serial.println("[SETUP] WiFi failed to auto-connect");
    }
    else
    {
        Serial.println("[SETUP] WiFi connected");
    }
}

} // namespace wifi