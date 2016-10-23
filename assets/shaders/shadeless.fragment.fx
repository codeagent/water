precision mediump float;

uniform sampler2D texture;

uniform vec4 clipPlane;
uniform int useClipPlane;

// vatyings
varying vec3 vColor;
varying vec2 vUV;
varying vec3 vPositionW;

bool isAboweOfClipSpace(vec3 position)
{
    return  clipPlane.x * position.x +
            clipPlane.y * position.y +
            clipPlane.z * position.z +
            clipPlane.w > 0.0;
}

void main(void) {
    if(useClipPlane != 1 || isAboweOfClipSpace(vPositionW)) {
        gl_FragColor = texture2D(texture, vUV);
    }
    else {
        discard;
    }
}