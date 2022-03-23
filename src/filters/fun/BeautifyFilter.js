/**
 * @filter        Beautify Filter
 * @description   Beautify Filter
 * @param intensity 
 */
 function beautifyFilter(intensity) {
    gl.beautifyFilter = gl.beautifyFilter || new Shader(null, '\
        uniform sampler2D bilateralTexture;\
        uniform sampler2D sobelTexture;\
        uniform sampler2D originalTexture;\
        \
        uniform float intensity;\
        \
        varying vec2 texCoord;\
        void main() {\
            vec4 bilateral = texture2D(bilateralTexture, texCoord);\
            vec4 soble = texture2D(sobelTexture, texCoord);\
            vec4 original = texture2D(originalTexture, texCoord);\
            \
            vec4 smooth;\
            float r = original.r;\
            float g = original.g;\
            float b = original.b;\
            \
            /* 判断是不是边缘,是不是皮肤.通过肤色检测和边缘检测，只对皮肤和非边缘部分进行处理。*/\
            if (soble.r < 0.2 && r > 0.3725 && g > 0.1568 && b > 0.0784 \
                && r > b && (max(max(r, g), b) - min(min(r, g), b)) > 0.0588 && abs(r - g) > 0.0588) {\
                smooth = (1.0 - intensity) * (original - bilateral) + bilateral;\
            } else {\
                smooth = original;\
            }\
            \
            smooth.r = log(1.0 + 0.2 * smooth.r) / log(1.2);\
            smooth.g = log(1.0 + 0.2 * smooth.g) / log(1.2);\
            smooth.b = log(1.0 + 0.2 * smooth.b) / log(1.2);\
            \
            gl_FragColor = smooth;\
        }\
    ');

    // Store a copy of the current texture in the second texture unit
    this._.extraTexture.ensureFormat(this._.texture);
    this._.texture.use();
    this._.extraTexture.drawTo(function() {
        Shader.getDefaultShader().drawRect();
    });
    // Blur the second texture
    this._.extraTexture.use(1);
    this.bilateralBlur(20.0, 0.15);

    // Store a copy of the current texture in the third texture unit
    this._.thirdTexture.ensureFormat(this._.texture);
    this._.texture.use();
    this._.thirdTexture.drawTo(function() {
        Shader.getDefaultShader().drawRect();
    });
    // Detect edges the third texture
    this._.thirdTexture.use(2);
    this.sobelEdgeDetectionFilter(0.8);

    // Blur the current texture, then use the stored texture to detect edges
    gl.beautifyFilter.textures({
        bilateralTexture: 2,
        originalTexture: 1,
        sobelTexture: 0
    });
    simpleShader.call(this, gl.beautifyFilter, {
        intensity: intensity
    });
    this._.extraTexture.unuse(1);
    this._.thirdTexture.unuse(2);

    return this;
}