/**
 * @filter           HSB Pro Filter
 * @description      Provides Hue and Saturation and Brightness contrast control.
 * @param hue        Add a hue rotation to the filter.
                     The hue rotation is in the range [-360, 360] with 0 being no-change.
                     Note that this adjustment is additive, so use the reset method if you need to.
 * @param saturation Add a saturation adjustment to the filter.
                     The saturation adjustment is in the range [0.0, 2.0] with 1.0 being no-change.
                     Note that this adjustment is additive, so use the reset method if you need to.
 * @param brightness Add a brightness adjustment to the filter.
                     The brightness adjustment is in the range [0.0, 2.0] with 1.0 being no-change.
                     Note that this adjustment is additive, so use the reset method if you need to.
 */
 function hsbProFilter(hue, saturation, brightness) {
    gl.hsbProFilter = gl.hsbProFilter || new Shader(null, '\
        const float RLUM = 0.3;\
        const float GLUM = 0.59;\
        const float BLUM = 0.11;\
        const float M_PI = 3.1415926;\
        \
        /* matrixmult - multiply two matricies */\
        void matrixmult(inout mat4 c, in mat4 a, in mat4 b) {\
            mat4 mmat = mat4(0.0);\
            \
            for(int y = 0; y < 4 ; y++) {\
                for(int x = 0; x < 4; x++) {\
                    mmat[y][x] = b[y][0] * a[0][x] + b[y][1] * a[1][x] + b[y][2] * a[2][x] + b[y][3] * a[3][x];\
                }\
            }\
            c = mmat;\
        }\
        /* xrotatemat - rotate about the x (red) axis */\
        void xrotatemat(inout mat4 matrix, in float rs, in float rc) {\
            /* identity matrix */\
            mat4 mmat = mat4(1.0);\
            \
            mmat[1][1] = rc;\
            mmat[1][2] = rs;\
            mmat[2][1] = -rs;\
            mmat[2][2] = rc;\
            \
            matrix = mmat * matrix;\
        }\
        \
        /* yrotatemat - rotate about the y (green) axis */\
        void yrotatemat(inout mat4 matrix, in float rs, float rc) {\
            /* identity matrix */\
            mat4 mmat = mat4(1.0);\
            \
            mmat[0][0] = rc;\
            mmat[0][2] = -rs;\
            mmat[2][0] = rs;\
            mmat[2][2] = rc;\
            \
            matrix = mmat * matrix;\
        }\
        \
        /* zrotatemat - rotate about the z (blue) axis */\
        void zrotatemat(inout mat4 matrix, in float rs, in float rc) {\
            /* identity matrix */\
            mat4 mmat = mat4(1.0);\
            \
            mmat[0][0] = rc;\
            mmat[0][1] = rs;\
            mmat[1][0] = -rs;\
            mmat[1][1] = rc;\
            \
            matrix = mmat * matrix;\
        }\
        /* xformpnt - transform a 3D point using a matrix */\
        void xformpnt(inout float tx, inout float ty, inout float tz, in mat4 matrix, in float x, in float y, in float z) {\
            tx = x * matrix[0][0] + y * matrix[1][0] + z * matrix[2][0] + matrix[3][0];\
            ty = x * matrix[0][1] + y * matrix[1][1] + z * matrix[2][1] + matrix[3][1];\
            tz = x * matrix[0][2] + y * matrix[1][2] + z * matrix[2][2] + matrix[3][2];\
        }\
        \
        /* zshearmat - shear z using x and y. */\
        void zshearmat(inout mat4 matrix, in float dx, in float dy) {\
            /* identity matrix */\
            mat4 mmat = mat4(1.0);\
            \
            mmat[0][2] = dx;\
            mmat[1][2] = dy;\
            \
            matrix = mmat * matrix;\
        }\
        \
        /* huerotatemat - rotate the hue, while maintaining luminance. */\
        void huerotatemat(inout mat4 matrix, in float rot ) {\
            /* identity matrix */\
            mat4 mmat = mat4(1.0);\
            \
            /* rotate the grey vector into positive Z */\
            float mag = sqrt(2.0);\
            float xrs = 1.0 / mag;\
            float xrc = 1.0 / mag;\
            xrotatemat(mmat, xrs, xrc);\
            \
            mag = sqrt(3.0);\
            float yrs = -1.0 / mag;\
            float yrc = sqrt(2.0) / mag;\
            yrotatemat(mmat, yrs, yrc);\
            \
            /* shear the space to make the luminance plane horizontal */\
            float lx = 0.0, ly = 0.0, lz = 0.0;\
            xformpnt(lx, ly, lz, mmat, RLUM, GLUM, BLUM);\
            float zsx = lx / lz;\
            float zsy = ly / lz;\
            zshearmat(mmat, zsx, zsy);\
            \
            /*rotate the hue */\
            float zrs = sin(rot * M_PI / 180.0);\
            float zrc = cos(rot * M_PI / 180.0);\
            zrotatemat(mmat, zrs, zrc);\
            \
            /* unshear the space to put the luminance plane back */\
            zshearmat(mmat, -zsx, -zsy);\
            \
            /* rotate the grey vector back into place */\
            yrotatemat(mmat, -yrs, yrc);\
            xrotatemat(mmat, -xrs, xrc);\
            \
            matrix = mmat * matrix;\
        }\
        \
        /* saturatemat - make a saturation marix */\
        void saturatemat(inout mat4 matrix, in float sat) {\
            /* identity matrix */\
            mat4 mmat = mat4(1.0);\
            \
            float a = (1.0 - sat) * RLUM + sat;\
            float b = (1.0 - sat) * RLUM;\
            float c = (1.0 - sat) * RLUM;\
            float d = (1.0 - sat) * GLUM;\
            float e = (1.0 - sat) * GLUM + sat;\
            float f = (1.0 - sat) * GLUM;\
            float g = (1.0 - sat) * BLUM;\
            float h = (1.0 - sat) * BLUM;\
            float i = (1.0 - sat) * BLUM + sat;\
            \
            mmat[0][0] = a;\
            mmat[0][1] = b;\
            mmat[0][2] = c;\
            mmat[0][3] = 0.0;\
            \
            mmat[1][0] = d;\
            mmat[1][1] = e;\
            mmat[1][2] = f;\
            mmat[1][3] = 0.0;\
            \
            mmat[2][0] = g;\
            mmat[2][1] = h;\
            mmat[2][2] = i;\
            mmat[2][3] = 0.0;\
            \
            mmat[3][0] = 0.0;\
            mmat[3][1] = 0.0;\
            mmat[3][2] = 0.0;\
            mmat[3][3] = 1.0;\
            \
            matrixmult(matrix, matrix, mmat);\
        }\
        \
        /* cscalemat - make a color scale marix */\
        void cscalemat(inout mat4 matrix, in float rscale, in float gscale, in float bscale) {\
            /* identity matrix */\
            mat4 mmat = mat4(1.0);\
            \
            mmat[0][0] = rscale;\
            mmat[1][1] = gscale;\
            mmat[2][2] = bscale;\
            \
            matrixmult(matrix, matrix, mmat);\
        }\
        \
        uniform sampler2D texture;\
        \
        varying vec2 texCoord;\
        \
        uniform float hue;\
        uniform float saturation;\
        uniform float brightness;\
        uniform float intensity;\
        \
        void main() {\
            vec4 textureColor = texture2D(texture, texCoord);\
            \
            mat4 colorMatrix = mat4(1.0);\
            /* adjust hue */\
            huerotatemat(colorMatrix, hue);\
            /* adjust saturation */\
            saturatemat(colorMatrix, saturation);\
            /* adjust brightness */\
            cscalemat(colorMatrix, brightness, brightness, brightness);\
            vec4 outputColor = textureColor * colorMatrix;\
            \
            gl_FragColor = (intensity * outputColor) + ((1.0 - intensity) * textureColor);\
        }\
    ');

    simpleShader.call(this, gl.hsbProFilter, {
        hue: clamp(-180.0, hue, 180.0),
        saturation: clamp(0.0, saturation, 2.0),
        brightness: clamp(0.0, brightness, 2.0),
        intensity: 1.0
    });

    return this;
}
