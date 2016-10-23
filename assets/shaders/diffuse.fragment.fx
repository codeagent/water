precision mediump float;

uniform sampler2D texture;

uniform int useClipPlane;
uniform vec4 clipPlane;

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
        gl_FragColor = vec4(vColor * texture2D(texture, vUV).rgb, 1.0);
    }
    else {
        discard;
    }

}