#ifdef GL_ES
precision mediump float;
#endif

uniform sampler2D uMainSampler;
varying vec2 outTexCoord;

void main() {
    vec4 color = texture2D(uMainSampler, outTexCoord);
    float grey = dot(color.rgb, vec3(0.299, 0.587, 0.114));
    gl_FragColor = vec4(vec3(grey), color.a);
}