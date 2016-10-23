precision mediump float;

attribute vec3 position;
attribute vec3 normal;
attribute vec2 uv;

uniform mat4 modelMatrix;
uniform mat4 viewMatrix;
uniform mat4 projectionMatrix;
uniform mat3 windMatrix;
uniform vec2 wave;

varying vec4 vClip;
varying vec3 vUV;
varying vec3 vPositionW;
varying vec3 vNormalW;

void main(void)
{
    vClip = projectionMatrix * viewMatrix * modelMatrix * vec4(position, 1.0);
    vPositionW = vec3(modelMatrix * vec4(position, 1.0));
    vNormalW = vec3(modelMatrix * vec4(normal, 0.0));
    gl_Position = vClip;
    vUV = windMatrix * vec3(uv, 1.0);
    vUV.x /= wave.x;
    vUV.y /= wave.x;
}