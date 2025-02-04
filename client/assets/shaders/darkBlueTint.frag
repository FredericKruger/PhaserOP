#ifdef GL_ES
precision mediump float;
#endif

uniform sampler2D uMainSampler;
varying vec2 outTexCoord;

void main() {
    vec4 color = texture2D(uMainSampler, outTexCoord);
    vec4 tint = vec4(23.0/255.0, 53.0/255.0, 67.0/255.0, 1.0);
    gl_FragColor = color * tint;    
}