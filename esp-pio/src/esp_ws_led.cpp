#include <Arduino.h>
#include <ESP8266WiFi.h>
#include <ESP8266WiFiMulti.h>
#include <WebSocketsServer.h>
#include <TinyUPnP.h>

#define LED_RED     D1 // 5 // D1
#define LED_GREEN   D2 // 4 // D2
#define LED_BLUE    D3 // 0 // D3

#define NODE_NAME "lab"

#define WIFI_SSID "kratom"
//#define WIFI_PASSWORD - see platformio.ini

/* WebSocket server */
#define WS_PORT 81

/* CONFIG */

void configurePins(uint8_t redPin, uint8_t greenPin, uint8_t bluePin) {
    Serial.print("[SETUP] Configuring pins...");
    pinMode(redPin, OUTPUT);
    pinMode(greenPin, OUTPUT);
    pinMode(bluePin, OUTPUT);

    digitalWrite(redPin, 1);
    digitalWrite(greenPin, 1);
    digitalWrite(bluePin, 1);
}

void configureSerial(unsigned long baudrate, boolean enableDebug) {
    Serial.begin(baudrate);
    Serial.setDebugOutput(enableDebug);
    Serial.println();
    Serial.println();
    Serial.println();
}

void bootWait() {
    for(uint8_t t = 4; t > 0; t--) {
        Serial.printf("[SETUP] BOOT WAIT %d...\n", t);
        Serial.flush();
        delay(1000);
    }
}

ESP8266WiFiMulti connectWifi(const char* ssid, const char* password) {
    ESP8266WiFiMulti WiFiMulti;
    Serial.print("[SETUP] Awaiting WiFi connection...");
    WiFiMulti.addAP(ssid, password);
    while(WiFiMulti.run() != WL_CONNECTED) {
        delay(1000);
        Serial.print(".");
    }
    Serial.println("[SETUP] WiFi connected");
    return WiFiMulti;
}

WebSocketsServer* webSocketsServer = nullptr;

void setupWebSocketsServer(uint16_t port, WebSocketsServer::WebSocketServerEvent eventHandler) {
    webSocketsServer = new WebSocketsServer(port);
    webSocketsServer->begin();
    webSocketsServer->onEvent(eventHandler);
}

typedef struct UPnPConfigResult {
    TinyUPnP *tinyUPnP;
    int result;
    boolean success;
};

UPnPConfigResult configureUPnP(const char* nodeName, int port) {  
    Serial.print("[SETUP] Configuring UPnP...");    
    TinyUPnP *tinyUPnP = new TinyUPnP(20000);
    tinyUPnP->addPortMappingConfig(WiFi.localIP(), port, RULE_PROTOCOL_TCP, 60000, nodeName);
    auto pmResult = tinyUPnP->commitPortMappings();
    switch (pmResult) {
        case portMappingResult::SUCCESS:
            Serial.print("[SETUP] UPNP SUCCESS");
            break;
        case portMappingResult::ALREADY_MAPPED:
            Serial.print("[SETUP] UPNP ALREADY_MAPPED");
            break;
        case portMappingResult::NETWORK_ERROR:
            Serial.print("[SETUP] UPNP ALREADY_MAPPED");
            break;
        case portMappingResult::TIMEOUT:
            Serial.print("[SETUP] UPNP TIMEOUT");
            break;
        case portMappingResult::EMPTY_PORT_MAPPING_CONFIG:
            Serial.print("[SETUP] UPNP NOP");
            break;
        case portMappingResult::NOP:
            Serial.print("[SETUP] UPNP NOP");
            break;
    }
    UPnPConfigResult result;
    result.tinyUPnP = tinyUPnP;
    result.result = pmResult;
    result.success = pmResult == portMappingResult::SUCCESS || pmResult == portMappingResult::ALREADY_MAPPED;
    return result;
}

/* END CONFIG */ 

/* LOOP HANDLERS */

void handleWebSocketEvent(uint8_t num, WStype_t type, uint8_t * payload, size_t length) {
    switch(type) {
        case WStype_DISCONNECTED:
            Serial.printf("[%u] Disconnected!\n", num);
            break;

        case WStype_CONNECTED: {
            IPAddress ip = webSocketsServer->remoteIP(num);
            Serial.printf("[%u] Connected from %d.%d.%d.%d url: %s\n", num, ip[0], ip[1], ip[2], ip[3], payload);

            // send message to client
            webSocketsServer->sendTXT(num, "Connected");
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
    configurePins(LED_RED, LED_GREEN, LED_BLUE);
    configureSerial(115200, false);
    bootWait();

    connectWifi(WIFI_SSID, WIFI_PASS);
    setupWebSocketsServer(WS_PORT, handleWebSocketEvent);
    UPnPConfigResult upnpResult = configureUPnP(NODE_NAME, WS_PORT);

    digitalWrite(LED_RED, 0);
    digitalWrite(LED_GREEN, 0);
    digitalWrite(LED_BLUE, 0);
}

void loop() {
    webSocketsServer->loop();
}
