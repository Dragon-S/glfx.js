/**
 * @filter              Color Matrix Filter
 * @description         Transforms the colors of an image by applying a matrix to them
 * @param colorMatrix   A 4x4 matrix used to transform each color in an image
 * @param intensity     The degree to which the new transformed color replaces the original color for each pixel
 */
 function colorMatrixFilter(colorMatrix, intensity) {
    gl.colorMatrixFilter = gl.colorMatrixFilter || new Shader(null, '\
        uniform sampler2D texture;\
        \
        varying vec2 texCoord;\
        \
        uniform mat4 colorMatrix;\
        uniform float intensity;\
        \
        void main() {\
            vec4 textureColor = texture2D(texture, texCoord);\
            vec4 outputColor = textureColor * colorMatrix;\
            \
            gl_FragColor = (intensity * outputColor) + ((1.0 - intensity) * textureColor);\
        }\
    ');

    simpleShader.call(this, gl.colorMatrixFilter, {
        colorMatrix: colorMatrix,
        intensity: intensity
    });

    return this;
}
