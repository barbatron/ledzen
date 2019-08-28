#include <Arduino.h>

#include <ESP8266WiFi.h>
#include <ESP8266WiFiMulti.h>
#include <WebSocketsServer.h>
#include <ESP8266mDNS.h>

#define LED_RED     D1 // 5 // D1
#define LED_GREEN   D2 // 4 // D2
#define LED_BLUE    D3 // 0 // D3

#define WIFI_SSID "kratom"
// WIFI_PASSWORD defined in platformio.ini

#define NODE_NAME "lab"

ESP8266WiFiMulti WiFiMulti;

WebSocketsServer webSocket = WebSocketsServer(81);

void webSocketEvent(uint8_t num, WStype_t type, uint8_t * payload, size_t length) {

    switch(type) {
        case WStype_DISCONNECTED:
            Serial.printf("[%u] Disconnected!\n", num);
            break;

        case WStype_CONNECTED: {
            IPAddress ip = webSocket.remoteIP(num);
            Serial.printf("[%u] Connected from %d.%d.%d.%d url: %s\n", num, ip[0], ip[1], ip[2], ip[3], payload);

            // send message to client
            webSocket.sendTXT(num, "Connected");
        }
            break;

        case WStype_TEXT:
            Serial.printf("[%u] get Text: %s\n", num, payload);

            if(payload[0] == '#') {
                // we get RGB data

                // decode rgb data
                uint32_t rgb = (uint32_t) strtol((const char *) &payload[1], NULL, 16);

                analogWrite(LED_RED,    ((rgb >> 16) & 0xFF));
                analogWrite(LED_GREEN,  ((rgb >> 8) & 0xFF));
                analogWrite(LED_BLUE,   ((rgb >> 0) & 0xFF));
            }

            break;
        
        case WStype_ERROR:
            Serial.printf("[%u] error", num);
            break;
            
        case WStype_BIN:
        case WStype_FRAGMENT_TEXT_START:
        case WStype_FRAGMENT_BIN_START:
        case WStype_FRAGMENT:
        case WStype_FRAGMENT_FIN:
        case WStype_PING:
        case WStype_PONG:
            break;
    }

}

void setup() {
    Serial.begin(115200);

    //Serial.setDebugOutput(true);

    Serial.println();
    Serial.println();
    Serial.println();

    for(uint8_t t = 4; t > 0; t--) {
        Serial.printf("[SETUP] BOOT WAIT %d...\n", t);
        Serial.flush();
        delay(1000);
    }

    pinMode(LED_RED, OUTPUT);
    pinMode(LED_GREEN, OUTPUT);
    pinMode(LED_BLUE, OUTPUT);

    digitalWrite(LED_RED, 1);
    digitalWrite(LED_GREEN, 1);
    digitalWrite(LED_BLUE, 1);

    WiFiMulti.addAP(WIFI_SSID, WIFI_PASS);

    Serial.print("[SETUP] Awaiting WiFi connection...");
    while(WiFiMulti.run() != WL_CONNECTED) {
        delay(1000);
        Serial.print(".");
    }
    Serial.println("[SETUP] WiFi connected");

    // start webSocket server
    webSocket.begin();
    webSocket.onEvent(webSocketEvent);

    if(MDNS.begin(NODE_NAME)) {
        Serial.println("[SETUP] MDNS responder started");
    }

    // Add service to MDNS
    MDNS.addService("ws", "tcp", 81);

    digitalWrite(LED_RED, 0);
    digitalWrite(LED_GREEN, 0);
    digitalWrite(LED_BLUE, 0);
}

void loop() {
    webSocket.loop();
}
