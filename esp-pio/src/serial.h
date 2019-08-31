#include <Arduino.h>

namespace serial
{

void setupSerial(unsigned long baudrate, boolean enableDebug)
{
    Serial.begin(baudrate);
    Serial.setDebugOutput(enableDebug);
    Serial.println();
    Serial.println();
    Serial.println();
}

} // namespace serial