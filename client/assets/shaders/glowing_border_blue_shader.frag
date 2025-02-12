#ifdef GL_ES
precision mediump float;
#endif

uniform float time;
uniform vec2 resolution;
uniform sampler2D uMainSampler;
varying vec2 outTexCoord;

void main(void)
{
    vec4 color = texture2D(uMainSampler, outTexCoord);
    vec2 uv = outTexCoord;

    // Define the glow color
    vec4 glowColor = vec4(234.0 / 255.0, 105.0 / 255.0, 41.0 / 255.0, 1.0);

    // Calculate the distance from the center
    float dist = distance(uv, vec2(0.5, 0.5));

    // Calculate the glow intensity
    float glowIntensity = 0.5 + 0.5 * sin(time * 1.0); // Slow pulsing effect

    // Apply the glow effect
    float glow = smoothstep(0.4, 0.5, dist) * glowIntensity;

    // Combine the original color with the glow
    gl_FragColor = mix(color, glowColor, glow);
}