/**
 * @filter           HSB Filter
 * @description      Provides Hue and Saturation and Brightness contrast control.
 * @param hue        -360.0 to 360.0
 * @param saturation 0.0 to 2.0
 * @param brightness 0.0 to 2.0
 */
 function hsbFilter(hue, saturation, brightness) {
    gl.hsbFilter = gl.hsbFilter || new Shader(null, '\
        uniform sampler2D texture;\
        \
        uniform float hue;\
        uniform float saturation;\
        uniform float brightness;\
        \
        varying vec2 texCoord;\
        \
        /* Smooth HSB to RGB conversion */\
        vec3 hsb2rgb_smooth( in vec3 c ) {\
            vec3 rgb = clamp(abs(mod(c.x * 6.0 + vec3(0.0,4.0,2.0), 6.0) - 3.0) -1.0, 0.0, 1.0 );\
            \
	        rgb = rgb * rgb * (3.0 - 2.0 * rgb); /* cubic smoothing	*/\
            \
	        return c.z * mix(vec3(1.0), rgb, c.y);\
        }\
        \
        vec3 rgb2hsb( in vec3 c ) {\
            vec4 k = vec4(0.0, -1.0 / 3.0, 2.0 / 3.0, -1.0);\
            vec4 p = mix(vec4(c.bg, k.wz), vec4(c.gb, k.xy), step(c.b, c.g));\
            vec4 q = mix(vec4(p.xyw, c.r), vec4(c.r, p.yzx), step(p.x, c.r));\
            float d = q.x - min(q.w, q.y);\
            float e = 1.0e-10;\
            return vec3(abs(q.z + (q.w - q.y) / (6.0 * d + e)), d / (q.x + e), q.x);\
        }\
        \
        void main() {\
            vec3 hsb = rgb2hsb(texture2D(texture, texCoord).rgb);\
            \
            /* Hue */\
            hsb.x = clamp(hsb.x * hue, 0.0, 1.0);\
            /* Saturation */\
            hsb.y = clamp(hsb.y * saturation, 0.0, 1.0);\
            /* Brightness */\
            hsb.z = clamp(hsb.z * brightness, 0.0, 1.0);\
            \
            gl_FragColor = vec4(hsb2rgb_smooth(hsb), 1.0);\
        }\
    ');

    simpleShader.call(this, gl.hsbFilter, {
        hue: clamp(-360.0, hue, 360.0),
        saturation: clamp(0.0, saturation, 2.0),
        brightness: clamp(0.0, brightness, 2.0)
    });

    return this;
}
