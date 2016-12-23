//version 100

varying vec2 vUv;
attribute vec4 cut;
varying vec4 vCut;
void main()
{
    vCut = cut;
    vUv = uv;
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0 );
    gl_Position = projectionMatrix * mvPosition;
}