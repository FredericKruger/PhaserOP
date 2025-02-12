#ifdef GL_ES
precision mediump float;
#endif

uniform sampler2D uMainSampler;
varying vec2 outTexCoord;

void main() {
    vec4 color = texture2D(uMainSampler, outTexCoord);

    // Define the purple color range
    vec3 purple = vec3(0.5, 0.0, 0.5);
    float threshold = 0.5;

    // Define the orange color
    vec3 orange = vec3(1.0, 0.5, 0.0);

    // Check if the color is within the purple range
    if (distance(color.rgb, purple) < threshold) {
        color.rgb = orange;
    }

    gl_FragColor = color;
}