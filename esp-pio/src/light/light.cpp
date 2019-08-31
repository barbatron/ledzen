#include <Arduino.h>
#include "light.h"

#define P_RED 0
#define P_GREEN 1
#define P_BLUE 2

void Light::initialize()
{
    Serial.printf("[Light %s] Configuring pins...\n", name);
    pinMode(pins[P_RED], OUTPUT);
    pinMode(pins[P_GREEN], OUTPUT);
    pinMode(pins[P_BLUE], OUTPUT);
    Serial.println("[Light] Pin modes set");
    digitalWrite(pins[P_RED], 1);
    digitalWrite(pins[P_GREEN], 1);
    digitalWrite(pins[P_BLUE], 1);
    Serial.printf("[Light %s] Pins configured\n", name);
}

void Light::setRgb(const uint32_t rgb)
{
    analogWrite(pins[P_RED], ((rgb >> 16) & 0xFF));
    analogWrite(pins[P_GREEN], ((rgb >> 8) & 0xFF));
    analogWrite(pins[P_BLUE], ((rgb >> 0) & 0xFF));
}