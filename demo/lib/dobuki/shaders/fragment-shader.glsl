//version 100

uniform sampler2D texture[ 16 ];
uniform int effect;
varying vec2 vUv;
varying vec4 vCut;
varying float vTex;

float rand(vec2 co){
    return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);
}

void main() {
    vec2 uv = vUv;
    uv.x = vCut.x + uv.x * vCut.z;
    uv.y = vCut.y + uv.y * vCut.w;
    int iTex = int(vTex);

    vec2 coord = uv;
    if(effect==1) {
        float dx = 4.0*(1.0/2048.0);
        float dy = 4.0*(1.0/2048.0);
        uv.x = dx*floor(coord.x/dx);
        uv.y = dy*floor(coord.y/dy);
    }
     
    if(iTex==0) {
        gl_FragColor = texture2D( texture[0],  uv);
    } else if(iTex==1) {
        gl_FragColor = texture2D( texture[1],  uv);
    } else if(iTex==2) {
        gl_FragColor = texture2D( texture[2],  uv);            
    } else if(iTex==3) {
        gl_FragColor = texture2D( texture[3],  uv);            
    } else if(iTex==4) {
        gl_FragColor = texture2D( texture[4],  uv);            
    } else if(iTex==5) {
        gl_FragColor = texture2D( texture[5],  uv);            
    } else if(iTex==6) {
        gl_FragColor = texture2D( texture[6],  uv);            
    } else if(iTex==7) {
        gl_FragColor = texture2D( texture[7],  uv);            
    } else if(iTex==8) {
        gl_FragColor = texture2D( texture[8],  uv);            
    } else if(iTex==9) {
        gl_FragColor = texture2D( texture[9],  uv);            
    } else if(iTex==10) {
        gl_FragColor = texture2D( texture[10],  uv);            
    } else if(iTex==11) {
        gl_FragColor = texture2D( texture[11],  uv);            
    } else if(iTex==12) {
        gl_FragColor = texture2D( texture[12],  uv);            
    } else if(iTex==13) {
        gl_FragColor = texture2D( texture[13],  uv);            
    } else if(iTex==14) {
        gl_FragColor = texture2D( texture[14],  uv);            
    } else if(iTex==15) {
        gl_FragColor = texture2D( texture[15],  uv);            
    }
    
    float div = .25;
//    gl_FragColor.x = div*floor(gl_FragColor.x/div + .5);
//    gl_FragColor.y = div*floor(gl_FragColor.y/div + .5);
//    gl_FragColor.z = div*floor(gl_FragColor.z/div + .5);
    
//    gl_FragColor.w = gl_FragColor.z;
/*    float div = 1.0;
    gl_FragColor.x = div*floor(gl_FragColor.x/div + .5);
    gl_FragColor.y = div*floor(gl_FragColor.y/div + .5);
    gl_FragColor.z = div*floor(gl_FragColor.z/div + .5);
    float f = rand(coord);//.x = ( gl_FragColor.x + gl_FragColor.z )/2.0;
    gl_FragColor.x = (f + gl_FragColor.x) / 2.0;
    gl_FragColor.y = (f + gl_FragColor.y) / 2.0;
    gl_FragColor.z = (f + gl_FragColor.z) / 2.0;*/
}

