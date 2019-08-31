#pragma once

#include <ESP8266WiFi.h>
#include <ESP8266WiFiMulti.h>
#include <ArduinoOTA.h>
#include <ESP8266WebServer.h>
#include <ESP8266mDNS.h>
#include <FS.h>
#include <Ethernet.h>

namespace ota
{

void setupOta(const char *name, const char *password)
{
    Serial.println("[SETUP] Setting up OTA...");
    ArduinoOTA.begin(Ethernet.localIP(), name, password, InternalStorage);
}

void loopOta()
{
    ArduinoOTA.handle();
}

} // namespace ota