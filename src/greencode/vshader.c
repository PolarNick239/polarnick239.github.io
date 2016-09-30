#line 2
precision mediump float;

const vec2 fontsSize = vec2(55.0, 88.0);
const vec2 symbolSize = vec2(SYMBOL_SIZE_X, SYMBOL_SIZE_Y);

uniform vec2 uScreenSize;

attribute vec2 aPosition;
attribute float aStartTime;
attribute float aStartY;
attribute float aEndY;
attribute float aTraceLength;

varying vec2 vPosition;
varying float vStartTime;
varying float vStartY;
varying float vEndY;
varying float vTraceLength;

void main() {
    vPosition = aPosition;
    vStartTime = aStartTime;
    vStartY = aStartY;
    vEndY = aEndY;
    vTraceLength = aTraceLength;

    vec2 position = aPosition * symbolSize / uScreenSize;
    position = (position * 2.0) - 1.0;
    position.y *= -1.0;
    gl_Position = vec4(position, 0.0, 1.0);
}
