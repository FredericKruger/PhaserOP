#ifdef GL_ES
precision mediump float;
#endif

uniform sampler2D uMainSampler;
varying vec2 outTexCoord;
uniform float burnAmount; // Uniform to control the burn effect

float random(vec2 st) {
    return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
}

float noise(vec2 st) {
    vec2 i = floor(st);
    vec2 f = fract(st);

    float a = random(i);
    float b = random(i + vec2(1.0, 0.0));
    float c = random(i + vec2(0.0, 1.0));
    float d = random(i + vec2(1.0, 1.0));

    vec2 u = f * f * (3.0 - 2.0 * f);

    return mix(a, b, u.x) +
           (c - a) * u.y * (1.0 - u.x) +
           (d - b) * u.x * u.y;
}

void main() {
    vec2 uv = outTexCoord;
    float n = noise(uv * 10.0);
    float burn = smoothstep(burnAmount - 0.1, burnAmount + 0.1, n);
    vec4 color = texture2D(uMainSampler, uv);
    gl_FragColor = mix(color, vec4(0.0, 0.0, 0.0, 0.0), 1.0 - burn);
}