/**
 * @filter              Sobel Edge Detection Filter
 * @description         The Sobel Feldman operator is based on convolving the image
 *                      with a small, separable, and integer-valued filter in the 
 *                      horizontal and vertical directions and is therefore relatively
 *                      inexpensive in terms of computations. On the other hand,
 *                      the gradient approximation that it produces is relatively crude,
 *                      in particular for high-frequency variations in the image. (This
 *                      implementation is based on the work of
 *                      https://www.shadertoy.com/view/Xdf3Rf)
 * @param edgeStrength  The filter strength property affects the dynamic 
 *                      range of the filter. High values can make edges more visible,
 *                      but can lead to saturation. Default of 1.0.
 */
 function sobelEdgeDetectionFilter(edgeStrength) {
    gl.sobelEdgeDetectionFilter = gl.sobelEdgeDetectionFilter || new Shader(null, '\
        uniform sampler2D texture;\
        uniform vec2 sourceTexelSize;\
        \
        uniform float edgeStrength;\
        \
        varying vec2 texCoord;\
        \
        float intensity(in vec4 color) {\
	        return sqrt((color.x * color.x) + (color.y * color.y) + (color.z * color.z));\
        }\
        \
        vec3 sobel(float stepx, float stepy, vec2 center) {\
            /* get samples around pixel */\
            float tleft = intensity(texture2D(texture, center + vec2(-stepx, stepy)));\
            float left = intensity(texture2D(texture, center + vec2(-stepx, 0)));\
            float bleft = intensity(texture2D(texture, center + vec2(-stepx, -stepy)));\
            float top = intensity(texture2D(texture, center + vec2(0, stepy)));\
            float bottom = intensity(texture2D(texture, center + vec2(0, -stepy)));\
            float tright = intensity(texture2D(texture, center + vec2(stepx, stepy)));\
            float right = intensity(texture2D(texture, center + vec2(stepx, 0)));\
            float bright = intensity(texture2D(texture, center + vec2(stepx, -stepy)));\
            \
            /* Sobel masks (see http://en.wikipedia.org/wiki/Sobel_operator)\
                    1 0 -1     -1 -2 -1\
                X = 2 0 -2  Y = 0  0  0\
                    1 0 -1      1  2  1 */\
            \
            /* You could also use Scharr operator:\
                    3 0 -3        3 10   3\
                X = 10 0 -10  Y = 0  0   0\
                    3 0 -3        -3 -10 -3 */\
            \
            float x = tleft + 2.0 * left + bleft - tright - 2.0 * right - bright;\
            float y = -tleft - 2.0 * top - tright + bleft + 2.0 * bottom + bright;\
            float color = sqrt((x * x) + (y * y)) * edgeStrength;\
            return vec3(color, color, color);\
        }\
        \
        void main(void) {\
            vec4 color = texture2D(texture, texCoord);\
            gl_FragColor = vec4(sobel(sourceTexelSize.x, sourceTexelSize.y, texCoord), 1.0);\
        }\
    ');

    simpleShader.call(this, gl.sobelEdgeDetectionFilter, {
        sourceTexelSize: [1.0 / this.width, 1.0 / this.height],
        edgeStrength: edgeStrength
    });

    return this;
}
