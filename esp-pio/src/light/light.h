#pragma once
#include <cstdint>

class Light
{
private:
    const char *name;
    uint8_t *pins;

public:
    Light(const char *name, uint8_t *pins)
        : name(name), pins(pins){};
    void initialize();
    void setRgb(const uint32_t rgb);
};
