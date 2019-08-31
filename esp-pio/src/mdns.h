#pragma once
#include <ESP8266mDNS.h>

namespace mdns
{

void setupMdns(const char *mdnsName)
{
    IPAddress ip = WiFi.localIP();
    Serial.print("[SETUP] Starting mDNS responder for IP: ");
    Serial.println(ip);
    MDNS.begin(mdnsName, ip);
    MDNS.addService("http", "tcp", 80);
    MDNS.addService("ws", "tcp", 81);
}

} // namespace mdns