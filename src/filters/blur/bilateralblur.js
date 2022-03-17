/**
 * @filter         Bilateral Blur
 * @description    Bilatering filtering is a powerful edge preserving denoising technique.
 *                 However, the Bilateral filter is frequently overlooked in practice,
 *                 particularly for real time applications, because it is not implemented
 *                 via separable convolution. However, the Bilateral filter can take advantage
 *                 of pixel parallelism. (This implementation is based on the work of
 *                 https://www.shadertoy.com/view/4dfGDH#)
 * @param sigma    Gaussian function standard deviation (pixel spatial proximity)
 * @param bsigma   Gaussian function standard deviation (pixel similarity)
 */
 function bilateralBlur(sigma, bsigma) {
    gl.bilateralBlur = gl.bilateralBlur || new Shader(null, '\
        float normpdf(in float x, in float sigma) {\
            return 0.39894 * exp(-0.5 * x * x / (sigma * sigma)) / sigma;\
        }\
        \
        float normpdf3(in vec3 v, in float sigma) {\
            return 0.39894 * exp(-0.5 * dot(v, v) / (sigma * sigma)) / sigma;\
        }\
        \
        uniform sampler2D texture;\
        uniform vec2 sourceTexelSize;\
        uniform float sigma;\
        uniform float bsigma;\
        \
        varying vec2 texCoord;\
        \
        void main(void) {\
            vec4 c = texture2D(texture, texCoord);\
            \
            /* declare stuff */\
            const int MSIZE = 15;\
            const int kSize = (MSIZE - 1) / 2;\
            float kernel[MSIZE];\
            vec3 bfinal_colour = vec3(0.0);\
            \
            float bZ = 0.0;\
            \
            /* create the 1-D kernel */\
            for (int j = 0; j <= kSize; ++j) {\
                kernel[kSize + j] = kernel[kSize - j] = normpdf(float(j), sigma);\
            }\
            \
            vec3 cc;\
            float gfactor;\
            float bfactor;\
            float bZnorm = 1.0 / normpdf(0.0, bsigma);\
            /* read out the texels */\
            for (int i = -kSize; i <= kSize; ++i) {\
                for (int j= -kSize; j <= kSize; ++j) {\
                    /* color at pixel in the neighborhood */\
                    vec2 coord = texCoord.xy + vec2(float(i), float(j)) * sourceTexelSize.xy;\
                    cc = texture2D(texture, coord).rgb;\
                    \
                    /* compute both the gaussian smoothed and bilateral */\
                    gfactor = kernel[kSize + j] * kernel[kSize + i];\
                    bfactor = normpdf3(cc - c.rgb, bsigma) * bZnorm * gfactor;\
                    bZ += bfactor;\
                    \
                    bfinal_colour += bfactor * cc;\
                }\
            }\
            \
            gl_FragColor = vec4(bfinal_colour / bZ, 1.0);\
        }\
    ');

    simpleShader.call(this, gl.bilateralBlur, {
        sourceTexelSize: [1.0 / this.width, 1.0 / this.height],
        sigma: sigma,
        bsigma: bsigma
    });

    return this;
}
