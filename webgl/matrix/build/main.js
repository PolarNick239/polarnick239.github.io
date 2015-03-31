///<reference path="glMatrix.d.ts"/>
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var webgl;
(function (webgl) {
    webgl.gl;
    var BufferObject = (function () {
        function BufferObject() {
            this.handle = webgl.gl.createBuffer();
        }
        BufferObject.prototype.uploadData = function (data) {
            this.bind();
            this.data = data;
            webgl.gl.bufferData(this.getTarget(), data, webgl.gl.STATIC_DRAW);
            this.unbind();
        };
        BufferObject.prototype.bind = function () {
            webgl.gl.bindBuffer(this.getTarget(), this.handle);
        };
        BufferObject.prototype.unbind = function () {
            webgl.gl.bindBuffer(this.getTarget(), null);
        };
        BufferObject.prototype.getTarget = function () {
            console.error("Unimplemented BufferObject.getTarget call!");
            return -1;
        };
        return BufferObject;
    })();
    var ArrayBuffer = (function (_super) {
        __extends(ArrayBuffer, _super);
        function ArrayBuffer(itemCount, elementGlType) {
            _super.call(this);
            this.itemCount = itemCount;
            this.elementGlType = elementGlType;
            if (this.elementGlType == webgl.gl.FLOAT) {
                this.elementSize = 4;
            }
            else {
                throw Error('Unsupported!');
            }
        }
        ArrayBuffer.prototype.getTarget = function () {
            return webgl.gl.ARRAY_BUFFER;
        };
        return ArrayBuffer;
    })(BufferObject);
    webgl.ArrayBuffer = ArrayBuffer;
    var ElementArrayBuffer = (function (_super) {
        __extends(ElementArrayBuffer, _super);
        function ElementArrayBuffer() {
            _super.apply(this, arguments);
        }
        ElementArrayBuffer.prototype.getTarget = function () {
            return webgl.gl.ELEMENT_ARRAY_BUFFER;
        };
        ElementArrayBuffer.prototype.getCount = function () {
            return this.data.length;
        };
        return ElementArrayBuffer;
    })(BufferObject);
    webgl.ElementArrayBuffer = ElementArrayBuffer;
    var Texture = (function () {
        function Texture(params) {
            this.handle = webgl.gl.createTexture();
            this.usedTextureSlot = -1;
            if (params) {
                this.setParams(params);
            }
        }
        Texture.prototype.setParams = function (params) {
            this.bind();
            for (var i = 0; i < params.length; i++) {
                var key = params[i][0];
                var value = params[i][1];
                if (value === parseInt(value, 10)) {
                    webgl.gl.texParameteri(this.getTarget(), key, value);
                }
                else if (value === parseFloat(value)) {
                    webgl.gl.texParameterf(this.getTarget(), key, value);
                }
                else {
                    console.error("No texParameteri for key = " + key + " value = " + value);
                }
            }
            this.unbind();
        };
        Texture.prototype.uploadImage = function (image) {
            console.error("Unimplemented Texture.upload call!");
        };
        Texture.prototype.activate = function () {
            console.assert(this.usedTextureSlot == -1, 'Texture already activated!');
            this.usedTextureSlot = this.allocateTextureSlot();
            webgl.gl.activeTexture(webgl.gl.TEXTURE0 + this.usedTextureSlot);
            this.bind();
            return this.usedTextureSlot;
        };
        Texture.prototype.deactivate = function () {
            console.assert(this.usedTextureSlot != -1, 'Texture was not activated!');
            webgl.gl.activeTexture(webgl.gl.TEXTURE0 + this.usedTextureSlot);
            this.unbind();
            this.freeTextureSlot(this.usedTextureSlot);
        };
        Texture.prototype.bind = function () {
            webgl.gl.bindTexture(this.getTarget(), this.handle);
        };
        Texture.prototype.unbind = function () {
            webgl.gl.bindTexture(this.getTarget(), null);
        };
        Texture.prototype.allocateTextureSlot = function () {
            console.error("Unimplemented Texture.allocateTextureSlot call!");
            return -1;
        };
        Texture.prototype.freeTextureSlot = function (slot) {
            console.error("Unimplemented Texture.freeTextureSlot call!");
        };
        Texture.prototype.getTarget = function () {
            console.error("Unimplemented Texture.getTarget call!");
            return -1;
        };
        return Texture;
    })();
    var texture2DUsedSlots = {};
    var Texture2D = (function (_super) {
        __extends(Texture2D, _super);
        function Texture2D() {
            _super.apply(this, arguments);
        }
        Texture2D.prototype.allocateTextureSlot = function () {
            for (var i = 0;; i++) {
                if (!(i.toString() in texture2DUsedSlots)) {
                    return i;
                }
            }
        };
        Texture2D.prototype.freeTextureSlot = function (slot) {
            delete texture2DUsedSlots[slot.toString()];
        };
        Texture2D.prototype.uploadImage = function (image) {
            this.bind();
            webgl.gl.texImage2D(webgl.gl.TEXTURE_2D, 0, webgl.gl.RGBA, webgl.gl.RGBA, webgl.gl.UNSIGNED_BYTE, image);
            this.unbind();
        };
        Texture2D.prototype.getTarget = function () {
            return webgl.gl.TEXTURE_2D;
        };
        return Texture2D;
    })(Texture);
    webgl.Texture2D = Texture2D;
    var Shader = (function () {
        function Shader(vert, frag) {
            if (vert === void 0) { vert = ''; }
            if (frag === void 0) { frag = ''; }
            this.handle = webgl.gl.createProgram();
            this.linked = false;
            this.bound = false;
            this.log = '';
            if (!this.compileShader(vert, webgl.gl.VERTEX_SHADER)) {
                console.error('Source code of vertex shader:\n' + vert);
                throw Error('Compilation of vertex shader failed!');
            }
            if (!this.compileShader(frag, webgl.gl.FRAGMENT_SHADER)) {
                console.error('Source code of fragment shader:\n' + frag);
                throw Error('Compilation of fragment shader failed!');
            }
            if (!this.link()) {
                console.error('Linking failed. Source code of vertex shader:\n' + vert);
                console.error('Linking failed. Source code of fragment shader:\n' + frag);
                throw Error('Linking failed!');
            }
        }
        Shader.prototype.compileShader = function (code, shaderType) {
            var shader = webgl.gl.createShader(shaderType);
            webgl.gl.shaderSource(shader, code);
            webgl.gl.compileShader(shader);
            var status = webgl.gl.getShaderParameter(shader, webgl.gl.COMPILE_STATUS);
            var log = webgl.gl.getShaderInfoLog(shader);
            this.log += log;
            if (status == 0) {
                console.error(log);
                return false;
            }
            else {
                webgl.gl.attachShader(this.handle, shader);
                return true;
            }
        };
        Shader.prototype.link = function () {
            webgl.gl.linkProgram(this.handle);
            var status = webgl.gl.getProgramParameter(this.handle, webgl.gl.LINK_STATUS);
            var log = webgl.gl.getProgramInfoLog(this.handle);
            this.log += log;
            if (status == 0) {
                console.error(log);
                return false;
            }
            else {
                this.linked = true;
                return true;
            }
        };
        Shader.prototype.bind = function () {
            this.nextTexSlot = 0;
            webgl.gl.useProgram(this.handle);
            this.bound = true;
        };
        Shader.prototype.unbind = function () {
            webgl.gl.useProgram(null);
            this.bound = false;
        };
        Shader.prototype.uniformI = function (name) {
            var values = [];
            for (var _i = 1; _i < arguments.length; _i++) {
                values[_i - 1] = arguments[_i];
            }
            var loc = webgl.gl.getUniformLocation(this.handle, name);
            var n = values.length;
            this.bind();
            if (n == 1) {
                webgl.gl.uniform1i(loc, values[0]);
            }
            else if (n == 2) {
                webgl.gl.uniform2i(loc, values[0], values[1]);
            }
            else if (n == 3) {
                webgl.gl.uniform3i(loc, values[0], values[1], values[2]);
            }
            else if (n == 4) {
                webgl.gl.uniform4i(loc, values[0], values[1], values[2], values[3]);
            }
            else {
                console.error('Unsupported values: ' + values);
            }
            this.unbind();
        };
        Shader.prototype.uniformF = function (name) {
            var values = [];
            for (var _i = 1; _i < arguments.length; _i++) {
                values[_i - 1] = arguments[_i];
            }
            var loc = webgl.gl.getUniformLocation(this.handle, name);
            var n = values.length;
            this.bind();
            if (n == 1) {
                webgl.gl.uniform1f(loc, values[0]);
            }
            else if (n == 2) {
                webgl.gl.uniform2f(loc, values[0], values[1]);
            }
            else if (n == 3) {
                webgl.gl.uniform3f(loc, values[0], values[1], values[2]);
            }
            else if (n == 4) {
                webgl.gl.uniform4f(loc, values[0], values[1], values[2], values[3]);
            }
            else {
                console.error('Unsupported values: ' + values);
            }
            this.unbind();
        };
        Shader.prototype.uniformMatrixF = function (name, matrix) {
            var loc = webgl.gl.getUniformLocation(this.handle, name);
            this.bind();
            if (matrix.length == 2 * 2) {
                webgl.gl.uniformMatrix2fv(loc, false, matrix);
            }
            else if (matrix.length == 3 * 3) {
                webgl.gl.uniformMatrix3fv(loc, false, matrix);
            }
            else if (matrix.length == 4 * 4) {
                webgl.gl.uniformMatrix4fv(loc, false, matrix);
            }
            else {
                console.error('Unsupported matrix: ' + matrix);
            }
            this.unbind();
        };
        Shader.prototype.locateAttribute = function (name) {
            var location = webgl.gl.getAttribLocation(this.handle, name);
            console.assert(location >= 0, 'Attribute with name ' + name + ' was not found!');
            return location;
        };
        Shader.prototype.vertexAttribute = function (name, buffer) {
            var loc = this.locateAttribute(name);
            webgl.gl.enableVertexAttribArray(loc);
            buffer.bind();
            webgl.gl.vertexAttribPointer(loc, buffer.itemCount, buffer.elementGlType, false, buffer.itemCount * buffer.elementSize, 0);
            buffer.unbind();
        };
        /**
         * @param mode should be in  [POINTS, LINE_STRIP, LINE_LOOP, LINES, TRIANGLE_STRIP, TRIANGLE_FAN, TRIANGLES]
         */
        Shader.prototype.drawElements = function (width, height, mode, buffer, x, y) {
            if (x === void 0) { x = 0; }
            if (y === void 0) { y = 0; }
            this.bind();
            webgl.gl.viewport(x, y, width, height);
            buffer.bind();
            console.assert(buffer.getCount() < 65536);
            webgl.gl.drawElements(mode, buffer.getCount(), webgl.gl.UNSIGNED_SHORT, 0);
            buffer.unbind();
            this.unbind();
        };
        /**
         * @param mode should be in  [POINTS, LINE_STRIP, LINE_LOOP, LINES, TRIANGLE_STRIP, TRIANGLE_FAN, TRIANGLES]
         */
        Shader.prototype.drawArrays = function (width, height, mode, count, x, y) {
            if (x === void 0) { x = 0; }
            if (y === void 0) { y = 0; }
            this.bind();
            webgl.gl.viewport(x, y, width, height);
            webgl.gl.drawArrays(mode, 0, count);
            this.unbind();
        };
        return Shader;
    })();
    webgl.Shader = Shader;
    var GLContext = (function () {
        function GLContext(canvas) {
            this.webGlContext = createContext(canvas);
            this.init();
        }
        GLContext.prototype.init = function () {
            webgl.gl = this.webGlContext;
            this.REPEAT_TEXTURE = [
                [webgl.gl.TEXTURE_WRAP_S, webgl.gl.REPEAT],
                [webgl.gl.TEXTURE_WRAP_T, webgl.gl.REPEAT]
            ];
            this.CLAMP_TO_EDGE_TEXTURE = [
                [webgl.gl.TEXTURE_WRAP_S, webgl.gl.CLAMP_TO_EDGE],
                [webgl.gl.TEXTURE_WRAP_T, webgl.gl.CLAMP_TO_EDGE]
            ];
            this.LINEAR_TEXTURE = [
                [webgl.gl.TEXTURE_MIN_FILTER, webgl.gl.LINEAR],
                [webgl.gl.TEXTURE_MAG_FILTER, webgl.gl.LINEAR]
            ];
            this.NEAREST_TEXTURE = [
                [webgl.gl.TEXTURE_MIN_FILTER, webgl.gl.NEAREST],
                [webgl.gl.TEXTURE_MAG_FILTER, webgl.gl.NEAREST]
            ];
        };
        GLContext.prototype.activate = function () {
            webgl.gl = this.webGlContext;
            return webgl.gl;
        };
        GLContext.prototype.deactivate = function () {
            webgl.gl = null;
        };
        return GLContext;
    })();
    webgl.GLContext = GLContext;
    function createContext(canvas) {
        var names = ["webgl", "experimental-webgl", "webkit-3d", "moz-webgl"];
        var glContext = null;
        for (var i = 0; i < names.length; ++i) {
            try {
                glContext = canvas.getContext(names[i]);
                if (glContext != null) {
                    break;
                }
            }
            catch (e) {
            }
        }
        if (glContext != null) {
            return glContext;
        }
        else {
            return null;
        }
    }
})(webgl || (webgl = {}));
///<reference path="gl.ts"/>
var matrix;
(function (matrix) {
    function start(htmlCanvas, matrix_vshader, matrix_fshader, fontsUrl) {
        var drawer = new MatrixDrawer(htmlCanvas, matrix_vshader, matrix_fshader, fontsUrl);
        drawer.initialize();
        window.requestAnimationFrame(drawer.loop.bind(drawer));
    }
    matrix.start = start;
    var Strip = (function () {
        function Strip(columnX, startTime, startY, endY, traceLength) {
            this.columnX = columnX;
            this.startTime = startTime;
            this.startY = startY;
            this.endY = endY;
            this.traceLength = traceLength;
        }
        return Strip;
    })();
    function getRandomInRange(min, max) {
        return Math.random() * (max - min) + min;
    }
    var MatrixDrawer = (function () {
        function MatrixDrawer(htmlCanvas, matrix_vshader, matrix_fshader, fontsUrl) {
            this.symbolSizeX = 5.0 * 2.0;
            this.symbolSizeY = 8.0 * 2.0;
            this.canvas = htmlCanvas;
            this.vshader = matrix_vshader.split('SYMBOL_SIZE_X').join(this.symbolSizeX.toString()).split('SYMBOL_SIZE_Y').join(this.symbolSizeY.toString());
            this.fshader = matrix_fshader.split('SYMBOL_SIZE_X').join(this.symbolSizeX.toString()).split('SYMBOL_SIZE_Y').join(this.symbolSizeY.toString());
            this.fontsUrl = fontsUrl;
            this.fontsAreLoaded = false;
            this.startTime = null;
        }
        MatrixDrawer.prototype.initialize = function () {
            this.glContext = new webgl.GLContext(this.canvas);
            this.glContext.activate();
            this.shader = new webgl.Shader(this.vshader, this.fshader);
            this.glContext.deactivate();
            this.initializeBuffers();
            this.initializeFonts();
        };
        MatrixDrawer.prototype.initializeBuffers = function () {
            var gl = this.glContext.activate();
            this.stripesPositionsBuf = new webgl.ArrayBuffer(2, gl.FLOAT);
            this.stripesStartYBuf = new webgl.ArrayBuffer(1, gl.FLOAT);
            this.stripesStartTimeBuf = new webgl.ArrayBuffer(1, gl.FLOAT);
            this.stripesEndYBuf = new webgl.ArrayBuffer(1, gl.FLOAT);
            this.stripesTraceLengthBuf = new webgl.ArrayBuffer(1, gl.FLOAT);
            this.stripesIndicesBuf = new webgl.ElementArrayBuffer();
            this.shader.vertexAttribute('aPosition', this.stripesPositionsBuf);
            this.shader.vertexAttribute('aStartTime', this.stripesStartTimeBuf);
            this.shader.vertexAttribute('aStartY', this.stripesStartYBuf);
            this.shader.vertexAttribute('aEndY', this.stripesEndYBuf);
            this.shader.vertexAttribute('aTraceLength', this.stripesTraceLengthBuf);
            this.glContext.deactivate();
        };
        MatrixDrawer.prototype.initializeFonts = function () {
            this.glContext.activate();
            this.fontsTex = new webgl.Texture2D(this.glContext.LINEAR_TEXTURE.concat(this.glContext.CLAMP_TO_EDGE_TEXTURE));
            var fontsImage = new Image();
            this.glContext.deactivate();
            fontsImage.onload = function () {
                this.glContext.activate();
                this.fontsTex.uploadImage(fontsImage);
                this.fontsTex.bind();
                this.shader.uniformI('uFonts', this.fontsTex.activate());
                this.fontsAreLoaded = true;
                console.info('PNG image with fonts loaded!');
                this.glContext.deactivate();
            }.bind(this);
            fontsImage.src = this.fontsUrl;
        };
        MatrixDrawer.prototype.updateUniforms = function () {
            this.shader.uniformF('uTime', (new Date().getTime() - this.startTime) / 1000.0);
        };
        MatrixDrawer.prototype.updateBuffers = function (strips) {
            var n = strips.length;
            var positions = new Float32Array(n * 4 * 2);
            var startTimes = new Float32Array(n * 4);
            var startYs = new Float32Array(n * 4);
            var endYs = new Float32Array(n * 4);
            var traceLengths = new Float32Array(n * 4);
            var indices = new Uint16Array(n * 2 * 3);
            var deltaIndices = [
                0,
                1,
                2,
                1,
                2,
                3
            ];
            for (var i = 0; i < n; i++) {
                var stripe = strips[i];
                var xys = [
                    stripe.columnX,
                    stripe.startY,
                    stripe.columnX + 1.0,
                    stripe.startY,
                    stripe.columnX,
                    stripe.endY,
                    stripe.columnX + 1.0,
                    stripe.endY
                ];
                for (var j = 0; j < 8; j++) {
                    positions[i * 4 * 2 + j] = xys[j];
                }
                for (var j = 0; j < 4; j++) {
                    startTimes[i * 4 + j] = stripe.startTime;
                    startYs[i * 4 + j] = stripe.startY;
                    endYs[i * 4 + j] = stripe.endY;
                    traceLengths[i * 4 + j] = stripe.traceLength;
                }
                for (var j = 0; j < 6; j++) {
                    indices[i * 6 + j] = i * 4 + deltaIndices[j];
                }
            }
            this.stripesPositionsBuf.uploadData(positions);
            this.stripesStartTimeBuf.uploadData(startTimes);
            this.stripesStartYBuf.uploadData(startYs);
            this.stripesEndYBuf.uploadData(endYs);
            this.stripesTraceLengthBuf.uploadData(traceLengths);
            this.stripesIndicesBuf.uploadData(indices);
        };
        MatrixDrawer.prototype.generateStrips = function () {
            var strips = [];
            var rows = this.canvas.width / this.symbolSizeX;
            var cols = this.canvas.height / this.symbolSizeY;
            for (var x = 0; x < rows; x++) {
                var count = getRandomInRange(15.0, 20.0);
                for (var i = 0; i < count; i++) {
                    var startTime = getRandomInRange(0.0, 239.0);
                    var startY = 0.0;
                    var endY = Math.round(cols * getRandomInRange(0.0, cols * 1.2));
                    var traceLength = Math.round(getRandomInRange(10.0, 30.0));
                    var strip = new Strip(x, startTime, startY, endY, traceLength);
                    strips.push(strip);
                }
            }
            return strips;
        };
        MatrixDrawer.prototype.draw = function () {
            var gl = webgl.gl;
            gl.enable(gl.DEPTH_TEST);
            gl.clearColor(0.0, 0.05, 0.0, 1.0);
            gl.clearDepth(1.0);
            gl.clear(gl.COLOR_BUFFER_BIT || gl.DEPTH_BUFFER_BIT);
            this.shader.drawElements(this.canvas.width, this.canvas.height, gl.TRIANGLES, this.stripesIndicesBuf);
        };
        MatrixDrawer.prototype.loop = function () {
            if (this.fontsAreLoaded) {
                if (!this.startTime) {
                    this.startTime = new Date().getTime();
                }
                this.glContext.activate();
                if (this.updateCanvasSize(this.canvas)) {
                    this.updateBuffers(this.generateStrips());
                }
                this.updateUniforms();
                this.draw();
                this.glContext.deactivate();
            }
            window.requestAnimationFrame(this.loop.bind(this));
        };
        MatrixDrawer.prototype.updateCanvasSize = function (canvas) {
            if (canvas.width != canvas.clientWidth || canvas.height != canvas.clientHeight) {
                canvas.width = canvas.clientWidth;
                canvas.height = canvas.clientHeight;
                this.shader.uniformF('uScreenSize', canvas.width, canvas.height);
                return true;
            }
            else {
                return false;
            }
        };
        return MatrixDrawer;
    })();
})(matrix || (matrix = {}));
