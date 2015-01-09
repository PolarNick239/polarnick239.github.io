var webgl_commons_gl;

var REPEAT_TEXTURE;

var CLAMP_TO_EDGE_TEXTURE;

var LINEAR_TEXTURE;

var NEAREST_TEXTURE;


function init_webgl_commons(gl) {
    webgl_commons_gl = gl;
    REPEAT_TEXTURE = [[gl.TEXTURE_WRAP_S, gl.REPEAT],
        [gl.TEXTURE_WRAP_T, gl.REPEAT]];
    CLAMP_TO_EDGE_TEXTURE = [[gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE],
        [gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE]];
    LINEAR_TEXTURE = [[gl.TEXTURE_MIN_FILTER, gl.LINEAR],
        [gl.TEXTURE_MAG_FILTER, gl.LINEAR]];
    NEAREST_TEXTURE = [[gl.TEXTURE_MIN_FILTER, gl.NEAREST],
        [gl.TEXTURE_MAG_FILTER, gl.NEAREST]];
}


function check_shader_errors(shader) {
    gl = webgl_commons_gl;

    var success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
    if (!success) {
        console.log('Shader compilation failed!');
        var compilationLog = gl.getShaderInfoLog(shader);
        console.log('Shader compiler log: ' + compilationLog);
    }
    return !success;
}


function build_program(vertex_code, fragment_code) {
    gl = webgl_commons_gl;

    gl_program = gl.createProgram();

    vertex = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vertex, vertex_code);
    gl.compileShader(vertex);
    if (check_shader_errors(vertex)) {
        return null;
    }
    gl.attachShader(gl_program, vertex);

    if (fragment_code != null) {
        fragment = gl.createShader(gl.FRAGMENT_SHADER);
        gl.shaderSource(fragment, fragment_code);
        gl.compileShader(fragment);
        if (check_shader_errors(fragment)) {
            return null;
        }
        gl.attachShader(gl_program, fragment);
    }

    gl.linkProgram(gl_program);

    var success = gl.getProgramParameter(gl_program, gl.LINK_STATUS);
    if (!success) {
        var error_log = gl.getProgramInfoLog(gl_program);
        log("Error in program linking: " + error_log);
        return null;
    }

    gl.detachShader(gl_program, vertex);
    if (fragment_code != null) {
        gl.detachShader(gl_program, fragment);
    }
    return gl_program;
}


//function VertexArrayObject() {
//    this.handle = -1;
//    webgl_commons_gl.genVertexArrays(1, this.handle);
//}
//
//VertexArrayObject.prototype.bind = function() {
//    webgl_commons_gl.bindVertexArray(this.handle);
//};
//
//VertexArrayObject.prototype.unbind = function() {
//    webgl_commons_gl.bindVertexArray(0);
//};



function VertexBufferObject(target) {
    this.target = target || webgl_commons_gl.ARRAY_BUFFER;
    this.handle = webgl_commons_gl.createBuffer();
}

VertexBufferObject.prototype.bind = function () {
    webgl_commons_gl.bindBuffer(this.target, this.handle);
};

VertexBufferObject.prototype.unbind = function () {
    webgl_commons_gl.bindBuffer(this.target, null);
};


function Framebuffer() {
    this.handle = gl.createFramebuffer();
}

Framebuffer.prototype.bind = function() {
    webgl_commons_gl.bindFramebuffer(gl.FRAMEBUFFER, this.handle);
};

Framebuffer.prototype.unbind = function () {
    webgl_commons_gl.bindFramebuffer(gl.FRAMEBUFFER, null);
};



var next_texture_slot = 1;
function Texture(target) {
    this.target = target;
    this.slot = next_texture_slot;
    next_texture_slot += 1;
    this.handle = webgl_commons_gl.createTexture();
    this.bind();
    gl.bindTexture(this.target, this.handle);
}

Texture.prototype.bind = function() {
    gl.activeTexture(gl.TEXTURE0 + this.slot);
};

Texture.prototype.bind = function() {
    //gl.activeTexture(gl.TEXTURE0);
};

Texture.prototype.set_params = function(params) {
    for (var i = 0; i < params.length; i++) {
        var key = params[i][0];
        var value = params[i][1];
        if (value === parseInt(value, 10)) {
            gl.texParameteri(this.target, key, value);
        } else if (value === parseFloat(value)) {
            gl.texParameterf(this.target, key, value);
        } else {
            log("No glTexParameter for key = " + key + " value = " + value);
        }
    }
};


function DirectionalLight(position_x, position_y, course, angle_of_view, near, far) {
    var radian_angle_of_view = angle_of_view * Math.PI / 180;
    var right = Math.tan(radian_angle_of_view / 2) * far;
    var left = -right;
    this.position_x = position_x;
    this.position_y = position_y;
    this.course = course;  // course is in degrees. If course = 0, than light is oriented as y-axis
    this.left = left;
    this.right = right;
    this.near = near;
    this.far = far;
}

DirectionalLight.prototype.create_frustum_matrix = function () {
    var rotation = rotation_matrix_2d(-this.course * Math.PI / 180);
    var translation = translation_matrix_2d(-this.position_x, -this.position_y);
    var res = new Float32Array(9);
    mat3.multiply(res, frustum_matrix_2d(this.left, this.right, this.near, this.far), rotation);
    mat3.multiply(res, res, translation);
    return res;
}


function rect_to_rect_matrix(rect0, rect1) {
    var scale_x = (rect1[1][0] - rect1[0][0]) / (rect0[1][0] - rect0[0][0]);
    var scale_y = (rect1[1][1] - rect1[0][1]) / (rect0[1][1] - rect0[0][1]);
    return new Float32Array([
        scale_x, 0, rect1[0][0] - rect0[0][0] * scale_x,
        0, scale_y, rect1[0][1] - rect0[0][1] * scale_y,
        0, 0, 1]);
}


function invert_y_in_range(from_y, to_y) {
    var matrix = new Float32Array(9);
    matrix[0] = 1;
    matrix[4] = -1;
    matrix[5] = from_y + to_y;
    matrix[8] = 1;
    return matrix;
}

function rotation_matrix_2d(alpha) {
    return new Float32Array([
        Math.cos(alpha), -Math.sin(alpha), 0,
        Math.sin(alpha), Math.cos(alpha), 0,
        0, 0, 1]);
}

function translation_matrix_2d(x0, y0) {
    return new Float32Array([
        1, 0, x0,
        0, 1, y0,
        0, 0, 1]);
}

function frustum_matrix_2d(left, right, near, far) {
    return new Float32Array([
        2 * far / (right - left), (right + left) / (left - right), 0,
        0, (near + far) / (far - near), 2 * far * near / (near - far),
        0, 1, 0]);
}