 precision mediump float;
uniform sampler2D uMainSampler;
uniform vec2 resolution;
uniform float blurAmount;
varying vec2 outTexCoord;

void main(void) {
    vec2 uv = outTexCoord;
    vec4 color = vec4(0.0);
    float total = 0.0;

    for (float x = -4.0; x <= 4.0; x++) {
        for (float y = -4.0; y <= 4.0; y++) {
            vec2 offset = vec2(x, y) * blurAmount / resolution;
            color += texture2D(uMainSampler, uv + offset);
            total += 1.0;
        }
    }

    gl_FragColor = color / total;
}