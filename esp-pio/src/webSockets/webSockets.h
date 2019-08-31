#pragma once

#include <WebSocketsServer.h>
#include "light/light.h"

namespace webSockets
{

void setupWebSockets(uint16_t port, Light *light);
void loopWebSockets();

} // namespace webSockets