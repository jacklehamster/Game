//version 100

uniform sampler2D texture[ 16 ];
varying vec2 vUv;
varying vec4 vCut;
varying float vTex;

void main() {
    vec2 uv = vUv;
    uv.x = vCut.x + uv.x * vCut.z;
    uv.y = vCut.y + uv.y * vCut.w;
    int iTex = int(vTex);
    if(iTex==0) {
        gl_FragColor = texture2D( texture[0],  vec2(uv.x, uv.y));
    } else if(iTex==1) {
        gl_FragColor = texture2D( texture[1],  vec2(uv.x, uv.y));
    } else if(iTex==2) {
        gl_FragColor = texture2D( texture[2],  vec2(uv.x, uv.y));            
    } else if(iTex==3) {
        gl_FragColor = texture2D( texture[3],  vec2(uv.x, uv.y));            
    } else if(iTex==4) {
        gl_FragColor = texture2D( texture[4],  vec2(uv.x, uv.y));            
    } else if(iTex==5) {
        gl_FragColor = texture2D( texture[5],  vec2(uv.x, uv.y));            
    } else if(iTex==6) {
        gl_FragColor = texture2D( texture[6],  vec2(uv.x, uv.y));            
    } else if(iTex==7) {
        gl_FragColor = texture2D( texture[7],  vec2(uv.x, uv.y));            
    } else if(iTex==8) {
        gl_FragColor = texture2D( texture[8],  vec2(uv.x, uv.y));            
    } else if(iTex==9) {
        gl_FragColor = texture2D( texture[9],  vec2(uv.x, uv.y));            
    } else if(iTex==10) {
        gl_FragColor = texture2D( texture[10],  vec2(uv.x, uv.y));            
    } else if(iTex==11) {
        gl_FragColor = texture2D( texture[11],  vec2(uv.x, uv.y));            
    } else if(iTex==12) {
        gl_FragColor = texture2D( texture[12],  vec2(uv.x, uv.y));            
    } else if(iTex==13) {
        gl_FragColor = texture2D( texture[13],  vec2(uv.x, uv.y));            
    } else if(iTex==14) {
        gl_FragColor = texture2D( texture[14],  vec2(uv.x, uv.y));            
    } else if(iTex==15) {
        gl_FragColor = texture2D( texture[15],  vec2(uv.x, uv.y));            
    }
}
