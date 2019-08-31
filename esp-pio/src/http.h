#pragma once

#include <ESP8266WebServer.h>

namespace http
{
ESP8266WebServer httpServer(80);

static const char PROGMEM INDEX_HTML[] = R"rawliteral(
<!DOCTYPE html>
<html>
<head>
<meta name = "viewport" content = "width = device-width, initial-scale = 1.0, maximum-scale = 1.0, user-scalable=0">
<title>BarbaLab</title>
<style>
"body { background-color: #808080; font-family: Arial, Helvetica, Sans-Serif; Color: #000000; }"
</style>
<script>
var websock;
function start() {
  websock = new WebSocket('ws://' + window.location.hostname + ':81/');
  websock.onopen = function(evt) { console.log('websock open'); };
  websock.onclose = function(evt) { console.log('websock close'); };
  websock.onerror = function(evt) { console.log(evt); };
  websock.onmessage = function(evt) {
    console.log(evt);
    var e = document.getElementById('ledstatus');
    if (evt.data === 'ledon') {
      e.style.color = 'red';
    }
    else if (evt.data === 'ledoff') {
      e.style.color = 'black';
    }
    else {
      console.log('unknown event');
    }
  };
}
function buttonclick(e) {
  websock.send(e.value || e.id);
}
</script>
</head>
<body onload="javascript:start();">
<h1>ESP8266 WebSocket Demo</h1>
<div id="ledstatus"><b>LED</b></div>
<input type="text" id="ledcolor"><button onclick="buttonclick(this);">Send</button>
</body>
</html>
)rawliteral";

void httpHandleRoot()
{
    Serial.println("[HTTP] Root requested");
    httpServer.send_P(200, "text/html", INDEX_HTML);
}

void httpHandleReset()
{
    Serial.println("[HTTP] Reset triggered - delaying 3s...");
    httpServer.send_P(200, "text/html", "Resetting in 3s...");
    delay(3000);
    ESP.reset();
}

void httpHandleNotFound()
{
    String message = "File Not Found\n\n";
    message += "URI: ";
    message += httpServer.uri();
    message += "\nMethod: ";
    message += (httpServer.method() == HTTP_GET) ? "GET" : "POST";
    message += "\nArguments: ";
    message += httpServer.args();
    message += "\n";
    for (uint8_t i = 0; i < httpServer.args(); i++)
    {
        message += " " + httpServer.argName(i) + ": " + httpServer.arg(i) + "\n";
    }
    httpServer.send(404, "text/plain", message);
}

void setupHttp()
{
    Serial.println("[SETUP] Setting up HTTP server...");
    httpServer.on("/", httpHandleRoot);
    httpServer.on("/reset", httpHandleReset);
    httpServer.onNotFound(httpHandleNotFound);
    httpServer.begin();
}

void loopHttp()
{
    httpServer.handleClient();
}
} // namespace http