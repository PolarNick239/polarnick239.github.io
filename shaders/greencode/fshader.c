#line 1
precision mediump float;

const vec2 fontsTextureSize = vec2(2048.0, 1024.0);
const vec2 fontsCount = vec2(16.0, 5.0);
const vec2 fontsSize = vec2(55.0, 88.0);
const vec2 fontsStep = vec2(10.0, 24.0);
const bool override = true;

const float stepsPerSecond = 10.0;

const vec2 symbolSize = vec2(SYMBOL_SIZE_X, SYMBOL_SIZE_Y);

uniform sampler2D uFonts;
uniform vec2 uScreenSize;
uniform float uTime;

varying vec2 vPosition;
varying float vStartTime;
varying float vStartY;
varying float vEndY;
varying float vTraceLength;

vec2 scale(vec2 xy) {
    xy += vec2(0.1, 0.25);
    float xScale = 1.25;
    xy /= xScale;
    return xy;
}

float sampleFont(float id, vec2 xy) {
    vec2 ij = vec2(floor(mod(id, fontsCount.x)), floor(mod(id/fontsCount.x, fontsCount.y)));
    xy = scale(xy);
    xy.x = 1.0 - xy.x;
    vec2 fontCorner = (fontsSize + fontsStep) * ij / fontsTextureSize;
    vec2 uv = fontCorner + xy * fontsSize / fontsTextureSize;
    vec4 fontColor = texture2D(uFonts, uv);
    return 1.0 - dot(fontColor.rgb, vec3(1.0)) / 3.0;
}

void main() {
    float curY = floor(vPosition.y);
    float stepsPassed = floor((uTime - vStartTime) * stepsPerSecond);
    float fractOfLastStep = fract((uTime - vStartTime) * stepsPerSecond);
    float leadY = vStartY + mod(stepsPassed, vEndY + vTraceLength - vStartY);
    if (curY > leadY || curY > vEndY || leadY - curY + 0.5 > vTraceLength) {
        discard;
    }

    float id = floor((curY + 1.0) * (vStartTime + stepsPerSecond + floor(uTime * (curY + 1.0) * (vStartTime  + 1.0) / 23900.0)) * 239.0);
    float symbolIntensity = sampleFont(id, fract(vPosition));
    if (!override && symbolIntensity <= 0.1) {
        discard;
    }

    vec3 color;
    float attenuationTime = vTraceLength / stepsPerSecond;
    float curTimePassed = (leadY + fractOfLastStep - curY) / stepsPerSecond;
    float attenuation = 1.0 - curTimePassed / attenuationTime;
    if (curY == leadY) {
        color = vec3(0.0, 0.05, 0.0) + symbolIntensity * vec3(attenuation * attenuation, attenuation, attenuation * attenuation);
    } else {
        color = vec3(0.0, 0.05, 0.0) + symbolIntensity * vec3(0.0, 0.5 * attenuation, 0.0);
    }

    gl_FragColor = vec4(color, 1.0);
}
