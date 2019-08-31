#include <Arduino.h>
#include <ESP8266WiFi.h>
#include <ESP8266WiFiMulti.h>

namespace wifi
{
ESP8266WiFiMulti WiFiMulti;

void setupWifi(const char *ssid, const char *password)
{
    Serial.print("[SETUP] Awaiting WiFi connection...");
    WiFiMulti.addAP(ssid, password);
    while (WiFiMulti.run() != WL_CONNECTED)
    {
        delay(1000);
        Serial.print(".");
    }
    Serial.println("[SETUP] WiFi connected");
}
} // namespace wifi