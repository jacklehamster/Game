//version 100

uniform sampler2D texture[ 16 ];
varying vec2 vUv;
varying vec4 vCut;
varying float vTex;

void main() {
    vec2 uv = vUv;
    uv.x = vCut.x + uv.x * vCut.z;
    uv.y = vCut.y + uv.y * vCut.w;
    for(int i=0; i<16; i++) {
        if(i == int(vTex)) {
            gl_FragColor = texture2D( texture[i],  vec2(uv.x, uv.y));
            break;
        }
    }
}
