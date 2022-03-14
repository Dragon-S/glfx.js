/**
 * @filter        Simple Beauty Filter
 * @description   Simple Beauty Filter
 * @param strength 
 */
 function simpleBeautyFilter(strength) {
    gl.simpleBeautyFilter = gl.simpleBeautyFilter || new Shader(null, '\
        varying vec2 texCoord;\
        uniform sampler2D texture;\
        uniform vec2 singleStepOffset;\
        vec2 blurCoordinates[20];\
        void main(){\
            blurCoordinates[0] = texCoord.xy + singleStepOffset * vec2(0.0, -10.0);\
            blurCoordinates[1] = texCoord.xy + singleStepOffset * vec2(0.0, 10.0);\
            blurCoordinates[2] = texCoord.xy + singleStepOffset * vec2(-10.0, 0.0);\
            blurCoordinates[3] = texCoord.xy + singleStepOffset * vec2(10.0, 0.0);\
            blurCoordinates[4] = texCoord.xy + singleStepOffset * vec2(5.0, -8.0);\
            blurCoordinates[5] = texCoord.xy + singleStepOffset * vec2(5.0, 8.0);\
            blurCoordinates[6] = texCoord.xy + singleStepOffset * vec2(-5.0, 8.0);\
            blurCoordinates[7] = texCoord.xy + singleStepOffset * vec2(-5.0, -8.0);\
            blurCoordinates[8] = texCoord.xy + singleStepOffset * vec2(8.0, -5.0);\
            blurCoordinates[9] = texCoord.xy + singleStepOffset * vec2(8.0, 5.0);\
            blurCoordinates[10] = texCoord.xy + singleStepOffset * vec2(-8.0, 5.0);\
            blurCoordinates[11] = texCoord.xy + singleStepOffset * vec2(-8.0, -5.0);\
            blurCoordinates[12] = texCoord.xy + singleStepOffset * vec2(0.0, -6.0);\
            blurCoordinates[13] = texCoord.xy + singleStepOffset * vec2(0.0, 6.0);\
            blurCoordinates[14] = texCoord.xy + singleStepOffset * vec2(6.0, 0.0);\
            blurCoordinates[15] = texCoord.xy + singleStepOffset * vec2(-6.0, 0.0);\
            blurCoordinates[16] = texCoord.xy + singleStepOffset * vec2(-4.0, -4.0);\
            blurCoordinates[17] = texCoord.xy + singleStepOffset * vec2(-4.0, 4.0);\
            blurCoordinates[18] = texCoord.xy + singleStepOffset * vec2(4.0, -4.0);\
            blurCoordinates[19] = texCoord.xy + singleStepOffset * vec2(4.0, 4.0);\
            vec4 currentColor = texture2D(texture, texCoord);\
            vec3 rgb = currentColor.rgb;\
            for (int i=0;i<20; i++){\
                rgb += texture2D(texture, blurCoordinates[i].xy).rgb;\
            }\
            vec4 blur = vec4(rgb * 1.0/21.0, currentColor.a);\
            vec4 highPassColor = currentColor - blur;\
            highPassColor.r = clamp(2.0 * highPassColor.r * highPassColor.r * 24.0, 0.0, 1.0);\
            highPassColor.g = clamp(2.0 * highPassColor.g * highPassColor.g * 24.0, 0.0, 1.0);\
            highPassColor.b = clamp(2.0 * highPassColor.b * highPassColor.b * 24.0, 0.0, 1.0);\
            vec4 highPassBlur = vec4(highPassColor.rgb, 1.0);\
            float b = min(currentColor.b, blur.b);\
            float value = clamp((b - 0.2) * 5.0, 0.0, 1.0);\
            float maxChannelColor = max(max(highPassBlur.r, highPassBlur.g), highPassBlur.b);\
            float intensity = 0.8;\
            float currentIntensity = (1.0 - maxChannelColor / (maxChannelColor + 0.2)) * value * intensity;\
            vec3 r = mix(currentColor.rgb, blur.rgb, currentIntensity);\
            gl_FragColor = vec4(r, 1.0);\
        }\
    ');

    simpleShader.call(this, gl.simpleBeautyFilter, {
        singleStepOffset: [strength / this.width, strength / this.height],
    });

    return this;
}