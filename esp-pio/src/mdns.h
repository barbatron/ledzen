#pragma once
#include <ESP8266mDNS.h>

namespace mdns
{

void setupMdns(const char *mdnsName)
{
    MDNS.begin(mdnsName);
    Serial.print("mDNS responder started: http://");
    Serial.print(mdnsName);
    Serial.println(".local");
}

} // namespace mdns