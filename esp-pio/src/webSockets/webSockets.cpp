#include <WebSocketsServer.h>
#include "../light/light.h"
#include "webSockets.h"

namespace webSockets
{

WebSocketsServer *webSocketsServer = nullptr;
Light *rgbLight;

void handleWebSocketEvent(uint8_t num, WStype_t type, uint8_t *payload, size_t length)
{
    switch (type)
    {
    case WStype_DISCONNECTED:
        Serial.printf("[WS %u] Disconnected!\n", num);
        break;

    case WStype_CONNECTED:
    {
        IPAddress ip = webSocketsServer->remoteIP(num);
        Serial.printf("[WS %u] Connected from %d.%d.%d.%d url: %s\n", num, ip[0], ip[1], ip[2], ip[3], payload);

        // send message to client
        webSocketsServer->sendTXT(num, "Connected");
    }
    break;

    case WStype_TEXT:
        Serial.printf("[WS %u] get Text: %s\n", num, payload);

        if (payload[0] == '#')
        {
            // we get RGB data

            // decode rgb data
            const uint32_t rgb = (uint32_t)strtol((const char *)&payload[1], NULL, 16);
            rgbLight->setRgb(rgb);
        }

        break;

    case WStype_ERROR:
        Serial.printf("[WS %u] error\n", num);
        break;

    case WStype_PING:
    case WStype_PONG:
        Serial.printf("[WS %u] %s", num, type);
        break;

    case WStype_BIN:
    case WStype_FRAGMENT_TEXT_START:
    case WStype_FRAGMENT_BIN_START:
    case WStype_FRAGMENT:
    case WStype_FRAGMENT_FIN:
        break;
    }
}

void setupWebSockets(uint16_t port, Light *light)
{
    Serial.println("[SETUP] Setting up webSockets...");
    rgbLight = light;
    webSocketsServer = new WebSocketsServer(port);
    webSocketsServer->begin();
    webSocketsServer->onEvent(handleWebSocketEvent);
    Serial.println("[SETUP] webSockets set up");
}

void loopWebSockets()
{
    webSocketsServer->loop();
}

} // namespace webSockets