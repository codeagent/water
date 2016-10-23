precision mediump float;

// attributes
attribute vec3 position;
attribute vec2 uv;

uniform mat4 modelMatrix;
uniform mat4 viewMatrix;
uniform mat4 projectionMatrix;
uniform vec3 viewPosition;
uniform mat3 textureMatrix;

varying vec2 vUV;
varying vec3 vPositionW;

void main(void)
{
    vUV = vec2(textureMatrix * vec3(uv, 1.0));
    vPositionW = vec3(modelMatrix * vec4(position, 1.0));
    gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(position, 1.0);
}