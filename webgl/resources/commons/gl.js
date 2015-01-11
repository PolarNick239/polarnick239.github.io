var gl;

var setupWebGL = function (canvas) {
    var names = ["webgl", "experimental-webgl", "webkit-3d", "moz-webgl"];
    var context = null;
    for (var ii = 0; ii < names.length; ++ii) {
        try {
            context = canvas.getContext(names[ii], {antialias: true});
        } catch (e) {
        }
        if (context) {
            gl = context;
            return true;
        }
    }
    return false;
};

function build_shader(shader_code, shader_type) {
    var shader = gl.createShader(shader_type);
    gl.shaderSource(shader, shader_code);
    gl.compileShader(shader);

    var success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
    if (success) {
        return shader;
    } else {
        console.log('Shader compilation failed!');
        var compilationLog = gl.getShaderInfoLog(shader);
        console.log('Shader compiler log: ' + compilationLog);
        return null;
    }
}


function build_program(vertex_code, fragment_code) {
    var gl_program = gl.createProgram();

    var vertex = build_shader(vertex_code, gl.VERTEX_SHADER);
    if (!vertex) {
        return null;
    }
    gl.attachShader(gl_program, vertex);

    if (fragment_code != null) {
        var fragment = build_shader(fragment_code, gl.FRAGMENT_SHADER);
        if (!fragment) {
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


function VertexBufferObject(target) {
    this.target = target || gl.ARRAY_BUFFER;
    this.handle = gl.createBuffer();
}

VertexBufferObject.prototype.bind = function () {
    gl.bindBuffer(this.target, this.handle);
};

VertexBufferObject.prototype.unbind = function () {
    gl.bindBuffer(this.target, null);
};