///<reference path="glMatrix.d.ts"/>

module webgl {

    export var gl;

    interface Bindable {
        bind();
        unbind();
    }

    class BufferObject implements Bindable {

        handle;
        data;

        constructor() {
            this.handle = gl.createBuffer();
        }

        uploadData(data) {
            this.bind();
            this.data = data;
            gl.bufferData(this.getTarget(), data, gl.STATIC_DRAW);
            this.unbind();
        }

        bind() {
            gl.bindBuffer(this.getTarget(), this.handle);
        }

        unbind() {
            gl.bindBuffer(this.getTarget(), null);
        }

        getTarget() {
            console.error("Unimplemented BufferObject.getTarget call!");
            return -1;
        }
    }

    export class ArrayBuffer extends BufferObject {

        itemCount;
        elementSize;
        elementGlType;

        constructor(itemCount, elementGlType) {
            super();
            this.itemCount = itemCount;
            this.elementGlType = elementGlType;
            if (this.elementGlType == gl.FLOAT) {
                this.elementSize = 4;
            } else {
                throw Error('Unsupported!');
            }
        }

        getTarget() {
            return gl.ARRAY_BUFFER;
        }
    }

    export class ElementArrayBuffer extends BufferObject {
        getTarget() {
            return gl.ELEMENT_ARRAY_BUFFER;
        }

        getCount() {
            return this.data.length;
        }
    }

    class Texture implements Bindable {

        handle;
        usedTextureSlot:number;

        constructor(params) {
            this.handle = gl.createTexture();
            this.usedTextureSlot = -1;
            if (params) {
                this.setParams(params);
            }
        }

        setParams(params) {
            this.bind();
            for (var i = 0; i < params.length; i++) {
                var key = params[i][0];
                var value = params[i][1];
                if (value === parseInt(value, 10)) {
                    gl.texParameteri(this.getTarget(), key, value);
                } else if (value === parseFloat(value)) {
                    gl.texParameterf(this.getTarget(), key, value);
                } else {
                    console.error("No texParameteri for key = " + key + " value = " + value);
                }
            }
            this.unbind();
        }

        uploadImage(image:HTMLImageElement) {
            console.error("Unimplemented Texture.upload call!");
        }

        activate() {
            console.assert(this.usedTextureSlot == -1, 'Texture already activated!');
            this.usedTextureSlot = this.allocateTextureSlot();
            gl.activeTexture(gl.TEXTURE0 + this.usedTextureSlot);
            this.bind();
            return this.usedTextureSlot;
        }

        deactivate() {
            console.assert(this.usedTextureSlot != -1, 'Texture was not activated!');
            gl.activeTexture(gl.TEXTURE0 + this.usedTextureSlot);
            this.unbind();
            this.freeTextureSlot(this.usedTextureSlot);
        }

        bind() {
            gl.bindTexture(this.getTarget(), this.handle);
        }

        unbind() {
            gl.bindTexture(this.getTarget(), null);
        }

        allocateTextureSlot() {
            console.error("Unimplemented Texture.allocateTextureSlot call!");
            return -1;
        }

        freeTextureSlot(slot:number) {
            console.error("Unimplemented Texture.freeTextureSlot call!");
        }

        getTarget() {
            console.error("Unimplemented Texture.getTarget call!");
            return -1;
        }

    }

    var texture2DUsedSlots = {};

    export class Texture2D extends Texture {

        allocateTextureSlot() {
            for (var i = 0;;i++) {
                if (!(i.toString() in texture2DUsedSlots)) {
                    return i;
                }
            }
        }

        freeTextureSlot(slot) {
            delete texture2DUsedSlots[slot.toString()];
        }

        uploadImage(image:HTMLImageElement) {
            this.bind();
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
            this.unbind();
        }

        getTarget() {
            return gl.TEXTURE_2D;
        }
    }

    export class Shader {

        handle;

        bound:boolean;
        nextTexSlot;

        linked:boolean;
        log:string;

        constructor(vert = '', frag = '') {
            this.handle = gl.createProgram();
            this.linked = false;
            this.bound = false;
            this.log = '';

            if (!this.compileShader(vert, gl.VERTEX_SHADER)) {
                console.error('Source code of vertex shader:\n' + vert);
                throw Error('Compilation of vertex shader failed!');
            }
            if (!this.compileShader(frag, gl.FRAGMENT_SHADER)) {
                console.error('Source code of fragment shader:\n' + frag);
                throw Error('Compilation of fragment shader failed!');
            }
            if (!this.link()) {
                console.error('Linking failed. Source code of vertex shader:\n' + vert);
                console.error('Linking failed. Source code of fragment shader:\n' + frag);
                throw Error('Linking failed!');
            }
        }

        compileShader(code, shaderType) {
            var shader = gl.createShader(shaderType);
            gl.shaderSource(shader, code);
            gl.compileShader(shader);
            var status = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
            var log = gl.getShaderInfoLog(shader);
            this.log += log;
            if (status == 0) {
                console.error(log);
                return false;
            } else {
                gl.attachShader(this.handle, shader);
                return true;
            }
        }

        link() {
            gl.linkProgram(this.handle);
            var status = gl.getProgramParameter(this.handle, gl.LINK_STATUS);
            var log = gl.getProgramInfoLog(this.handle);
            this.log += log;
            if (status == 0) {
                console.error(log);
                return false;
            } else {
                this.linked = true;
                return true;
            }
        }

        bind() {
            this.nextTexSlot = 0;
            gl.useProgram(this.handle);
            this.bound = true;
        }

        unbind() {
            gl.useProgram(null);
            this.bound = false;
        }

        uniformI(name, ...values:number[]) {
            var loc = gl.getUniformLocation(this.handle, name);
            var n = values.length;
            this.bind();
            if (n == 1) {
                gl.uniform1i(loc, values[0]);
            } else if (n == 2) {
                gl.uniform2i(loc, values[0], values[1]);
            } else if (n == 3) {
                gl.uniform3i(loc, values[0], values[1], values[2]);
            } else if (n == 4) {
                gl.uniform4i(loc, values[0], values[1], values[2], values[3]);
            } else {
                console.error('Unsupported values: ' + values);
            }
            this.unbind();
        }

        uniformF(name, ...values:number[]) {
            var loc = gl.getUniformLocation(this.handle, name);
            var n = values.length;
            this.bind();
            if (n == 1) {
                gl.uniform1f(loc, values[0]);
            } else if (n == 2) {
                gl.uniform2f(loc, values[0], values[1]);
            } else if (n == 3) {
                gl.uniform3f(loc, values[0], values[1], values[2]);
            } else if (n == 4) {
                gl.uniform4f(loc, values[0], values[1], values[2], values[3]);
            } else {
                console.error('Unsupported values: ' + values);
            }
            this.unbind();
        }

        uniformMatrixF(name, matrix:Float32Array);

        uniformMatrixF(name, matrix:mat4);

        uniformMatrixF(name, matrix) {
            var loc = gl.getUniformLocation(this.handle, name);
            this.bind();
            if (matrix.length == 2 * 2) {
                gl.uniformMatrix2fv(loc, false, matrix);
            } else if (matrix.length == 3 * 3) {
                gl.uniformMatrix3fv(loc, false, matrix);
            } else if (matrix.length == 4 * 4) {
                gl.uniformMatrix4fv(loc, false, matrix);
            } else {
                console.error('Unsupported matrix: ' + matrix);
            }
            this.unbind();
        }

        locateAttribute(name) {
            return gl.getAttribLocation(this.handle, name);
        }

        vertexAttribute(name, buffer:ArrayBuffer) {
            var loc = this.locateAttribute(name);
            gl.enableVertexAttribArray(loc);
            buffer.bind();
            gl.vertexAttribPointer(loc, buffer.itemCount, buffer.elementGlType, false,
                buffer.itemCount * buffer.elementSize, 0);
            buffer.unbind();
        }

        /**
         * @param mode should be in  [POINTS, LINE_STRIP, LINE_LOOP, LINES, TRIANGLE_STRIP, TRIANGLE_FAN, TRIANGLES]
         */
        drawElements(width, height, mode, buffer:ElementArrayBuffer, x=0, y=0) {
            this.bind();
            gl.viewport(x, y, width, height);
            buffer.bind();
            gl.drawElements(mode, buffer.getCount(), gl.UNSIGNED_SHORT, 0);
            buffer.unbind();
            this.unbind();
        }

        /**
         * @param mode should be in  [POINTS, LINE_STRIP, LINE_LOOP, LINES, TRIANGLE_STRIP, TRIANGLE_FAN, TRIANGLES]
         */
        drawArrays(width, height, mode, count, x=0, y=0) {
            this.bind();
            gl.viewport(x, y, width, height);
            gl.drawArrays(mode, 0, count);
            this.unbind();
        }
    }

    export class GLContext {
        webGlContext;

        REPEAT_TEXTURE;
        CLAMP_TO_EDGE_TEXTURE;
        LINEAR_TEXTURE;
        NEAREST_TEXTURE;

        constructor(canvas:HTMLCanvasElement) {
            this.webGlContext = createContext(canvas);
            this.init();
        }

        init() {
            gl = this.webGlContext;
            this.REPEAT_TEXTURE = [
                [gl.TEXTURE_WRAP_S, gl.REPEAT],
                [gl.TEXTURE_WRAP_T, gl.REPEAT]];
            this.CLAMP_TO_EDGE_TEXTURE = [
                [gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE],
                [gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE]];
            this.LINEAR_TEXTURE = [
                [gl.TEXTURE_MIN_FILTER, gl.LINEAR],
                [gl.TEXTURE_MAG_FILTER, gl.LINEAR]];
            this.NEAREST_TEXTURE = [
                [gl.TEXTURE_MIN_FILTER, gl.NEAREST],
                [gl.TEXTURE_MAG_FILTER, gl.NEAREST]];
        }

        activate() {
            gl = this.webGlContext;
            return gl;
        }

        deactivate() {
            gl = null;
        }
    }

    function createContext(canvas:HTMLCanvasElement) {
        var names = ["webgl", "experimental-webgl", "webkit-3d", "moz-webgl"];
        var glContext = null;
        for (var i = 0; i < names.length; ++i) {
            try {
                glContext = canvas.getContext(names[i]);
                if (glContext != null) {
                    break;
                }
            } catch (e) {
            }
        }
        if (glContext != null) {
            return glContext;
        } else {
            return null;
        }
    }

}