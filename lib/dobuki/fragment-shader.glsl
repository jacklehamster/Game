//version 100

uniform sampler2D texture[ 16 ];
varying vec2 vUv;
varying vec4 vCut;

void main() {
    vec2 uv = vUv;
    uv.x = vCut.x + uv.x * vCut.z;
    uv.y = vCut.y + uv.y * vCut.w;
    gl_FragColor = texture2D( texture[0],  vec2(uv.x, uv.y));
}
