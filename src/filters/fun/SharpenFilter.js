/**
 * @filter          Sharpen Filter
 * @description     Sharpen Filter
 * @param sharpness Sharpness ranges from -4.0 to 4.0, with 0.0 as the normal level
 */
function sharpenFilter(sharpness) {
    var fragmentSource = '\
    uniform float imageWidthFactor;\
    uniform float imageHeightFactor;\
    uniform float sharpness;\
    \
    uniform sampler2D texture;\
    \
    varying vec2 texCoord;\
    \
    void main() {\
        vec2 widthStep = vec2(imageWidthFactor, 0.0);\
        vec2 heightStep = vec2(0.0, imageHeightFactor);\
        \
        vec2 leftTextureCoordinate = texCoord - widthStep;\
        vec2 rightTextureCoordinate = texCoord + widthStep;\
        vec2 topTextureCoordinate = texCoord + heightStep;\
        vec2 bottomTextureCoordinate = texCoord - heightStep;\
        \
        float centerMultiplier = 1.0 + 4.0 * sharpness;\
        float edgeMultiplier = sharpness;\
        \
        mediump vec3 textureColor = texture2D(texture, texCoord).rgb;\
        mediump vec3 leftTextureColor = texture2D(texture, leftTextureCoordinate).rgb;\
        mediump vec3 rightTextureColor = texture2D(texture, rightTextureCoordinate).rgb;\
        mediump vec3 topTextureColor = texture2D(texture, topTextureCoordinate).rgb;\
        mediump vec3 bottomTextureColor = texture2D(texture, bottomTextureCoordinate).rgb;\
        \
        gl_FragColor = vec4((textureColor * centerMultiplier - (leftTextureColor * edgeMultiplier + rightTextureColor * edgeMultiplier + topTextureColor * edgeMultiplier + bottomTextureColor * edgeMultiplier)), texture2D(texture, bottomTextureCoordinate).w);\
    }';

    gl.sharpenFilter = gl.sharpenFilter || new Shader(null, fragmentSource);

    var imageWidthFactor = 1.0 / this.width;
    var imageHeightFactor = 1.0 / this.height;
    if (this.width < this.height) {
        var temp = imageWidthFactor;
        imageWidthFactor = imageHeightFactor;
        imageHeightFactor = temp;
    }

    simpleShader.call(this, gl.sharpenFilter, {
        sharpness: sharpness,
        imageWidthFactor: imageWidthFactor,
        imageHeightFactor: imageHeightFactor
    });

    return this;
}
