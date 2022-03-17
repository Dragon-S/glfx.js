/**
 * @filter         Gaussian Blur
 * @description    Gaussian filtering is a standard step in many image processing and
 *                 image analysis pipelines due to its execution speed and well behaved
 *                 numerical properties (differentiation). Historically, fast implementations
 *                 of Gaussian filtering applied to images has utilized separability, 
 *                 decomposing the 2D convolution into two 1D convolution problems - one along
 *                 the rows of the image and one along the columns of the image. Here,
 *                 we illustrate the speed of the GPU even when convolution is not implemented
 *                 using separability.  Rather, we leverage the pixel parallelism of the GPU 
 *                 to accelerate a brute force implementation of 2D convolution.
 *                 (This implementation is based on the work of https://www.shadertoy.com/view/XdfGDH)
 * @param sigma    Gaussian function standard deviation
 */
 function gaussianBlur(sigma) {
    gl.gaussianBlur = gl.gaussianBlur || new Shader(null, '\
        float normpdf(in float x, in float sigma) {\
            return 0.39894 * exp(-0.5 * x * x / (sigma * sigma)) / sigma;\
        }\
        \
        uniform sampler2D texture;\
        uniform vec2 sourceTexelSize;\
        uniform float sigma;\
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
            vec3 gfinal_colour = vec3(0.0);\
            \
            float gZ = 0.0;\
            \
            /* create the 1-D kernel */\
            for (int j = 0; j <= kSize; ++j) {\
                kernel[kSize + j] = kernel[kSize - j] = normpdf(float(j), sigma);\
            }\
            \
            vec3 cc;\
            float gfactor;\
            /* read out the texels */\
            for (int i = -kSize; i <= kSize; ++i) {\
                for (int j= -kSize; j <= kSize; ++j) {\
                    /* color at pixel in the neighborhood */\
                    vec2 coord = texCoord.xy + vec2(float(i), float(j)) * sourceTexelSize.xy;\
                    cc = texture2D(texture, coord).rgb;\
                    \
                    /* compute the gaussian smoothed */\
                    gfactor = kernel[kSize + j] * kernel[kSize + i];\
                    gZ += gfactor;\
                    \
                    gfinal_colour += gfactor * cc;\
                }\
            }\
            \
            gl_FragColor = vec4(gfinal_colour / gZ, 1.0);\
        }\
    ');

    simpleShader.call(this, gl.gaussianBlur, {
        sourceTexelSize: [1.0 / this.width, 1.0 / this.height],
        sigma: sigma
    });

    return this;
}
