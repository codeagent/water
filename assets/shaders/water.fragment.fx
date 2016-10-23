precision mediump float;


uniform vec3 viewPosition;
uniform mat3 windMatrix;
uniform vec2 wave;
uniform vec3 color;

uniform sampler2D normalTexture;
uniform sampler2D reflectionTexture;
uniform sampler2D refractionTexture;

uniform vec3 sunDirection;
uniform vec3 sunSpecular;

varying vec3 vUV;
varying vec4 vClip;
varying vec3 vPositionW;
varying vec3 vNormalW;

vec3 materialSpecular = vec3(1.0, 1.0, 1.0);
float materialRoughness = 40.0;

void main(void) {

    vec2 texCoords;
    texCoords.x = vClip.x / vClip.w / 2.0 + 0.5;
    texCoords.y = vClip.y / vClip.w / 2.0 + 0.5;

    vec3 waveNormal = texture2D(normalTexture, vUV.xy).xyz;
    waveNormal.x = waveNormal.x * 2.0 - 1.0;
    waveNormal.y = waveNormal.y * 2.0 - 1.0;
    waveNormal.z = waveNormal.z * 2.0 - 1.0;

    vec2 distortion = waveNormal.xy * wave.y;

    vec3 reflectionColor = texture2D(reflectionTexture, vec2(1.0 - texCoords.x, texCoords.y) + distortion).rgb;
    vec3 refractionColor = texture2D(refractionTexture, texCoords.xy + distortion).rgb;

    vec3 viewDir = normalize(viewPosition - vPositionW);
    float fresnel = clamp(dot(normalize(vNormalW), viewDir), 0.0, 1.0);
    vec3 reflectDir = normalize(reflect(sunDirection, vNormalW));
    vec3 specularColor = materialSpecular * sunSpecular * pow(max(0.0, dot(reflectDir, viewDir)), materialRoughness);

    vec3 result = (1.0 - fresnel) * reflectionColor + fresnel * refractionColor;
    result = result * color + specularColor;

    gl_FragColor = vec4(result, 1.0);
}