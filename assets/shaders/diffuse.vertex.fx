precision mediump float;

// attributes
attribute vec3 position;
attribute vec3 normal;
attribute vec2 uv;

// uniforms
uniform vec3 worldAmbient;
uniform vec3 materialAmbient;
uniform vec3 materialDiffuse;
uniform vec3 materialSpecular;
uniform vec3 materialEmissive;
uniform float materialRoughness;

uniform mat4 modelMatrix;
uniform mat4 viewMatrix;
uniform mat4 projectionMatrix;
uniform vec3 viewPosition;

uniform vec3 sunDirection;
uniform vec3 sunDiffuse;
uniform vec3 sunSpecular;
uniform float intensity;
uniform mat3 textureMatrix;

// vatyings
varying vec3 vColor;
varying vec2 vUV;
varying vec3 vPositionW;

void main(void)
{
    vec3 normalW = normalize(modelMatrix * vec4(normal, 0.0)).xyz;
    vec3 ambient = clamp(worldAmbient * materialAmbient, 0.0, 1.0);
    vec3 diffuse = materialDiffuse * sunDiffuse * dot(normalW, normalize(sunDirection)) * intensity;

    vColor = ambient + diffuse;
    vUV = vec2(textureMatrix * vec3(uv, 1.0));
    vPositionW = vec3(modelMatrix * vec4(position, 1.0));

    gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(position, 1.0);
}