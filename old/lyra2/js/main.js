var audio;
(function (audio) {
    audio.context = new window.AudioContext();
})(audio || (audio = {}));
var ui;
(function (ui) {
    function $(id) {
        if (typeof id === 'string')
            return document.getElementById(id);
        return id;
    }
    ui.$ = $;
    function $$(selector, root) {
        if (root === void 0) { root = document; }
        return root.querySelector(selector);
    }
    ui.$$ = $$;
    function $$$(selector, root) {
        if (root === void 0) { root = document; }
        return [].slice.call(root.querySelectorAll(selector));
    }
    ui.$$$ = $$$;
    function tmpl(template) {
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        var cnt = 0;
        return template.replace(/\{\}/g, function () { return args[cnt++]; });
    }
    ui.tmpl = tmpl;
})(ui || (ui = {}));
///<reference path="ui.ts"/>
var OVERLAY_VISIBLE = 'overlay-visible';
var DropOverlay = (function () {
    function DropOverlay(id) {
        this.root = ui.$(id);
        document.addEventListener('dragenter', this.onDragStart.bind(this));
        this.root.addEventListener('dragleave', this.onDragEnd.bind(this));
        this.root.addEventListener('dragover', this.onDragOver.bind(this));
        this.root.addEventListener('drop', this.onDrop.bind(this));
    }
    DropOverlay.prototype.setOnFileLoaded = function (onFileLoaded) {
        this.onFileLoaded = onFileLoaded;
    };
    DropOverlay.prototype.show = function () {
        this.root.classList.add(OVERLAY_VISIBLE);
    };
    DropOverlay.prototype.hide = function () {
        this.root.classList.remove(OVERLAY_VISIBLE);
    };
    DropOverlay.prototype.onDragStart = function (evt) {
        this.show();
    };
    DropOverlay.prototype.onDragOver = function (evt) {
        evt.preventDefault();
        this.show();
    };
    DropOverlay.prototype.onDragEnd = function (evt) {
        if (evt.target === this.root)
            this.hide();
    };
    DropOverlay.prototype.onLoad = function (evt) {
        if (this.onFileLoaded)
            this.onFileLoaded.call(this, evt.target.result);
    };
    DropOverlay.prototype.onDrop = function (evt) {
        evt.preventDefault();
        this.hide();
        ui.$('loadOverlay').classList.add('overlay-visible');
        var file = evt.dataTransfer.files[0], reader = new FileReader();
        reader.addEventListener("load", this.onLoad.bind(this));
        reader.readAsArrayBuffer(file);
    };
    return DropOverlay;
})();
///<reference path="../glMatrix.d.ts"/>
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
            return webgl.gl.getAttribLocation(this.handle, name);
        };
        Shader.prototype.vertexAttribute = function (name, buffer) {
            var loc = this.locateAttribute(name);
            webgl.gl.enableVertexAttribArray(loc);
            buffer.bind();
            webgl.gl.vertexAttribPointer(loc, buffer.itemCount, buffer.elementGlType, false, buffer.itemCount * buffer.elementSize, 0);
            buffer.unbind();
        };
        Shader.prototype.draw = function (width, height, mode, buffer, x, y) {
            if (x === void 0) { x = 0; }
            if (y === void 0) { y = 0; }
            this.bind();
            webgl.gl.viewport(x, y, width, height);
            buffer.bind();
            webgl.gl.drawElements(mode, buffer.getCount(), webgl.gl.UNSIGNED_SHORT, 0);
            buffer.unbind();
            this.unbind();
        };
        return Shader;
    })();
    webgl.Shader = Shader;
    var GLContext = (function () {
        function GLContext(canvas) {
            this.webGlContext = createContext(canvas);
        }
        GLContext.prototype.activate = function () {
            webgl.gl = this.webGlContext;
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
var map;
(function (map) {
    function generateSectionPoints(keyPoints, stripCount, radius, sectorAngle) {
        console.assert((keyPoints.length % 3) == 0);
        var n = keyPoints.length / 3, points = new Float32Array(n * 3 * (stripCount + 1));
        for (var i = 0; i < n; i++) {
            var prev = util.pickVec3(keyPoints, Math.max(i - 1, 0)), cur = util.pickVec3(keyPoints, i), next = util.pickVec3(keyPoints, Math.min(i + 1, n - 1)), normal = vec3.normalize(vec3.add(vec3.direction(prev, cur, prev), vec3.direction(cur, next, next))), axisZ = vec3.cross([normal[0], normal[1], 0], [1, 0, 0]), axisY = vec3.cross([normal[0], normal[1], 0], normal), transform = mat4.identity([]);
            mat4.translate(transform, cur);
            mat4.rotate(transform, Math.asin(vec3.length(axisY)), axisY);
            mat4.rotate(transform, Math.asin(vec3.length(axisZ)), axisZ);
            var minAngle = (Math.PI - sectorAngle) / 2, maxAngle = (Math.PI + sectorAngle) / 2;
            for (var j = 0; j <= stripCount; j++) {
                var angle = minAngle + (maxAngle - minAngle) / stripCount * j, vec = mat4.multiplyVec3(transform, [
                    0,
                    -Math.cos(angle) * radius,
                    Math.sin(angle) * radius
                ]);
                for (var k = 0; k < 3; ++k)
                    points[(i * (stripCount + 1) + j) * 3 + k] = vec[k];
            }
        }
        return points;
    }
    map.generateSectionPoints = generateSectionPoints;
    function av(a, b) {
        return vec3.scale(vec3.add(a, b, []), 0.5);
    }
    function generateBlocks(sectorsPoints, blocks, stripCount, blockSize) {
        var result = new Float32Array(blocks.length * 8 * 3);
        blocks.forEach(function (block, idx) {
            var kp = block[0], strip = block[1];
            var stripOffset = kp * (stripCount + 1) + strip, bottomLeft = util.pickVec3(sectorsPoints, stripOffset), bottomRight = util.pickVec3(sectorsPoints, stripOffset + 1), topLeft = util.pickVec3(sectorsPoints, stripOffset + stripCount + 1), topRight = util.pickVec3(sectorsPoints, stripOffset + stripCount + 2);
            var stripCenter = av(topRight, bottomLeft), dx = vec3.scale(vec3.direction(av(topLeft, topRight), av(bottomLeft, bottomRight)), blockSize[0] / 2), dy = vec3.scale(vec3.direction(av(topRight, bottomRight), av(topLeft, bottomLeft)), blockSize[1] / 2), dz = vec3.scale(vec3.normalize(vec3.cross(dx, dy, [])), blockSize[2]), dxdy = vec3.add(dx, dy, []), dxmdy = vec3.subtract(dx, dy, []);
            util.putVec3(result, idx * 8, vec3.add(stripCenter, dxdy, []));
            util.putVec3(result, idx * 8 + 1, vec3.add(stripCenter, dxmdy, []));
            util.putVec3(result, idx * 8 + 2, vec3.subtract(stripCenter, dxdy, []));
            util.putVec3(result, idx * 8 + 3, vec3.subtract(stripCenter, dxmdy, []));
            for (var i = 0; i < 4; ++i) {
                var v = util.pickVec3(result, idx * 8 + i);
                util.putVec3(result, idx * 8 + 4 + i, vec3.add(v, dz, []));
            }
        });
        return result;
    }
    map.generateBlocks = generateBlocks;
})(map || (map = {}));
///<reference path="ui.ts"/>
///<reference path="webgl/gl.ts"/>
///<reference path="glMatrix.d.ts"/>
///<reference path="webgl/map.ts"/>
var game;
(function (game) {
    var C_GAME_STARTED = "game-started", C_GAME_ENDED = "game-ended", C_GAME_CANVAS = "game--canvas", C_GAME_SCORE = "game--score", C_GAME_SCORE_CHANGED = "game--score-changed";
    var LIGHTS_COUNT = 2;
    var FREQS_BINS_COUNT = 6;
    var gl;
    var EYE_SHIFT = 0.2;
    var STRIP_COUNT = 5;
    var TUBE_RADIUS = 20;
    var SECTOR_ANGLE = Math.PI / 4;
    var CAM_HEIGHT = 5;
    var CAM_VIEW_DISTANCE = 20;
    var CAM_TARGET_HEIGHT = 3;
    var CAM_BACK_OFFSET = 10;
    var TILT_STEP = 0.03;
    var BLOCK_SCORE = 239;
    function complexNorm(real, imag) {
        return Math.sqrt(real * real + imag * imag);
    }
    function isMaximum(prev, current, thresh) {
        if (prev.length == 0)
            return false;
        var cnt = 0;
        for (var i = 0; i < prev.length; i++) {
            if (complexNorm(prev.real[i], prev.imag[i]) < complexNorm(current.real[i], current.imag[i]))
                cnt++;
        }
        //console.log(cnt + " " + current.length + " " + current.length * thresh);
        return cnt >= current.length * thresh;
    }
    var Game = (function () {
        function Game(rootId) {
            this.tiltAngle = 0;
            this.viewAngleVert = 45;
            this.nextBlockIndex = 0;
            this.blocksWereUpdated = false;
            this.lastBufsUpdatedT = 0;
            this.anaglyph = false;
            this.stereo = false;
            this.score = 0;
            this.trianglesChunkCount = 10239;
            this.root = ui.$(rootId);
            this.canvas = ui.$$("." + C_GAME_CANVAS, this.root);
            this.scoreEl = ui.$$("." + C_GAME_SCORE, this.root);
            this.initWebGL();
            this.initInputEvents();
        }
        Game.prototype.initWebGL = function () {
            this.glContext = new webgl.GLContext(this.canvas);
            this.glContext.activate();
            gl = webgl.gl;
            var vert = ui.$('map_vshader').text.split('FREQ_BINS_COUNT').join(FREQS_BINS_COUNT.toString());
            var frag = ui.$('map_fshader').text.split('FREQ_BINS_COUNT').join(FREQS_BINS_COUNT.toString());
            this.mapShader = new webgl.Shader(vert, frag);
            vert = document.getElementById('lights_vshader').text.split('LIGHTS_COUNT').join(LIGHTS_COUNT.toString()).split('FREQ_BINS_COUNT').join(FREQS_BINS_COUNT.toString());
            frag = document.getElementById('lights_fshader').text.split('LIGHTS_COUNT').join(LIGHTS_COUNT.toString()).split('FREQ_BINS_COUNT').join(FREQS_BINS_COUNT.toString());
            this.lightShader = new webgl.Shader(vert, frag);
            vert = document.getElementById('background_vshader').text.split('FREQ_BINS_COUNT').join(FREQS_BINS_COUNT.toString());
            frag = document.getElementById('background_fshader').text.split('FREQ_BINS_COUNT').join(FREQS_BINS_COUNT.toString());
            this.backgroundShader = new webgl.Shader(vert, frag);
            vert = ui.$('plane_vshader').text;
            frag = ui.$('plane_fshader').text;
            this.planeShader = new webgl.Shader(vert, frag);
            vert = ui.$('blocks_vshader').text;
            frag = ui.$('blocks_fshader').text;
            this.blocksShader = new webgl.Shader(vert, frag);
            this.posBuf = new webgl.ArrayBuffer(3, gl.FLOAT);
            this.normBuf = new webgl.ArrayBuffer(3, gl.FLOAT);
            this.colBuf = new webgl.ArrayBuffer(3, gl.FLOAT);
            this.hackBuf = new webgl.ArrayBuffer(1, gl.FLOAT);
            this.indBuf = new webgl.ElementArrayBuffer();
            this.blockPosBuf = new webgl.ArrayBuffer(3, gl.FLOAT);
            this.blockNormBuf = new webgl.ArrayBuffer(3, gl.FLOAT);
            this.blockColBuf = new webgl.ArrayBuffer(3, gl.FLOAT);
            this.blockIndBuf = new webgl.ElementArrayBuffer();
            this.posRectBuf = new webgl.ArrayBuffer(3, gl.FLOAT);
            this.indRectBuf = new webgl.ElementArrayBuffer();
            this.planePosBuf = new webgl.ArrayBuffer(3, gl.FLOAT);
            this.planeColorBuf = new webgl.ArrayBuffer(3, gl.FLOAT);
            this.planeNormBuf = new webgl.ArrayBuffer(3, gl.FLOAT);
            this.planeIndBuf = new webgl.ElementArrayBuffer();
        };
        Game.prototype.initInputEvents = function () {
            var _this = this;
            var handler = new input.InputHandler();
            handler.attach(document);
            handler.onDown(input.Key.SPACE, function () {
                _this.togglePause();
                return true;
            });
            handler.onDown(input.Key.A, function () {
                _this.anaglyph = !_this.anaglyph;
                if (_this.anaglyph) {
                    _this.stereo = false;
                }
                return true;
            });
            handler.onDown(input.Key.S, function () {
                _this.stereo = !_this.stereo;
                if (_this.stereo) {
                    _this.anaglyph = false;
                }
                return true;
            });
            handler.onDown(input.Key.Z, function () {
                EYE_SHIFT /= 1.1;
                console.info(EYE_SHIFT);
                return true;
            });
            handler.onDown(input.Key.X, function () {
                EYE_SHIFT *= 1.1;
                console.info(EYE_SHIFT);
                return true;
            });
            handler.whileDown(39 /* RIGHT_ARROW */, function () {
                _this.tiltAngle = Math.max(-SECTOR_ANGLE / 2, _this.tiltAngle - TILT_STEP);
                return true;
            });
            handler.whileDown(37 /* LEFT_ARROW */, function () {
                _this.tiltAngle = Math.min(SECTOR_ANGLE / 2, _this.tiltAngle + TILT_STEP);
                return true;
            });
        };
        Game.prototype.makeFullscreen = function () {
            if (this.canvas.width !== this.canvas.clientWidth) {
                this.canvas.width = this.canvas.clientWidth;
            }
            if (this.canvas.height !== this.canvas.clientHeight) {
                this.canvas.height = this.canvas.clientHeight;
            }
        };
        Game.prototype.generateHacks = function (n) {
            var uvs = new Float32Array(n);
            for (var i = 0; 6 * i < n; i++) {
                uvs[i * 6] = 1;
                uvs[i * 6 + 1] = -1;
                uvs[i * 6 + 2] = 1;
                uvs[i * 6 + 3] = -1;
                uvs[i * 6 + 4] = 1;
                uvs[i * 6 + 5] = -1;
            }
            return uvs;
        };
        Game.prototype.createBlockPoints = function (points) {
            var boxes = points.length / (8 * 3);
            var res = new Float32Array(boxes * 6 * 2 * 3 * 3);
            var ids = [
                0,
                1,
                3,
                2,
                3,
                1,
                0,
                3,
                7,
                0,
                7,
                4,
                1,
                5,
                6,
                1,
                6,
                2,
                0,
                5,
                1,
                0,
                4,
                5,
                3,
                2,
                6,
                3,
                6,
                7,
                4,
                7,
                5,
                5,
                7,
                6
            ];
            for (var i = 0; i < boxes; i++) {
                for (var j = 0; j < 6 * 6; j++) {
                    for (var k = 0; k < 3; k++) {
                        res[i * 6 * 6 * 3 + j * 3 + k] = points[i * 8 * 3 + ids[j] * 3 + k];
                    }
                }
            }
            return res;
        };
        Game.prototype.createPoints = function (points, n, splinesN) {
            var res = new Float32Array((n - 1) * splinesN * 2 * 3 * 3);
            var next = 0;
            for (var i = 0; i < n - 1; i++) {
                for (var j = 0; j < splinesN; j++) {
                    var ax = points[i * (splinesN + 1) * 3 + j * 3 + 0], ay = points[i * (splinesN + 1) * 3 + j * 3 + 1], az = points[i * (splinesN + 1) * 3 + j * 3 + 2];
                    var bx = points[i * (splinesN + 1) * 3 + (j + 1) * 3 + 0], by = points[i * (splinesN + 1) * 3 + (j + 1) * 3 + 1], bz = points[i * (splinesN + 1) * 3 + (j + 1) * 3 + 2];
                    var cx = points[(i + 1) * (splinesN + 1) * 3 + j * 3 + 0], cy = points[(i + 1) * (splinesN + 1) * 3 + j * 3 + 1], cz = points[(i + 1) * (splinesN + 1) * 3 + j * 3 + 2];
                    var dx = points[(i + 1) * (splinesN + 1) * 3 + (j + 1) * 3 + 0], dy = points[(i + 1) * (splinesN + 1) * 3 + (j + 1) * 3 + 1], dz = points[(i + 1) * (splinesN + 1) * 3 + (j + 1) * 3 + 2];
                    res[next * 3] = ax, res[next * 3 + 1] = ay, res[next * 3 + 2] = az;
                    next += 1;
                    res[next * 3] = bx, res[next * 3 + 1] = by, res[next * 3 + 2] = bz;
                    next += 1;
                    res[next * 3] = cx, res[next * 3 + 1] = cy, res[next * 3 + 2] = cz;
                    next += 1;
                    res[next * 3] = bx, res[next * 3 + 1] = by, res[next * 3 + 2] = bz;
                    next += 1;
                    res[next * 3] = cx, res[next * 3 + 1] = cy, res[next * 3 + 2] = cz;
                    next += 1;
                    res[next * 3] = dx, res[next * 3 + 1] = dy, res[next * 3 + 2] = dz;
                    next += 1;
                }
            }
            return res;
        };
        Game.prototype.createColors = function (n, r, g, b) {
            var colors = new Float32Array(n * 3);
            for (var i = 0; i < n; i++) {
                colors[i * 3] = r;
                colors[i * 3 + 1] = g;
                colors[i * 3 + 2] = b;
            }
            return colors;
        };
        Game.prototype.createIndicies = function (n, splinesN) {
            var indicies = new Uint32Array((n - 1) * splinesN * 2 * 3);
            var next = 0;
            for (var i = 0; i < n - 1; i++) {
                for (var j = 0; j < splinesN; j++) {
                    indicies[next] = next;
                    next += 1;
                    indicies[next] = next;
                    next += 1;
                    indicies[next] = next;
                    next += 1;
                    indicies[next] = next;
                    next += 1;
                    indicies[next] = next;
                    next += 1;
                    indicies[next] = next;
                    next += 1;
                }
            }
            return indicies;
        };
        Game.prototype.createBlockIndicies = function (n) {
            var indicies = new Uint32Array(n);
            for (var i = 0; i < n; i++) {
                indicies[i] = i;
            }
            return indicies;
        };
        Game.prototype.createIndiciesLines = function (n, splinesN) {
            var indicies = new Uint16Array((n - 1) * splinesN * 2 * 3 * 2);
            console.assert(indicies.length <= 65535);
            var next = 0;
            var nextId = 0;
            for (var i = 0; i < n - 1; i++) {
                for (var j = 0; j < splinesN; j++) {
                    indicies[next] = nextId;
                    indicies[next + 1] = nextId + 1;
                    indicies[next + 2] = nextId + 1;
                    indicies[next + 3] = nextId + 2;
                    indicies[next + 4] = nextId + 2;
                    indicies[next + 5] = nextId;
                    next += 6;
                    nextId += 3;
                    indicies[next] = nextId;
                    indicies[next + 1] = nextId + 1;
                    indicies[next + 2] = nextId + 1;
                    indicies[next + 3] = nextId + 2;
                    indicies[next + 4] = nextId + 2;
                    indicies[next + 5] = nextId;
                    next += 6;
                    nextId += 3;
                }
            }
            return indicies;
        };
        Game.prototype.generateNormals = function (points, indicies) {
            var normals = new Float32Array(points.length);
            for (var i = 0; i < indicies.length / 3; i++) {
                var a = util.pickVec3(points, i * 3);
                var b = util.pickVec3(points, i * 3 + 1);
                var c = util.pickVec3(points, i * 3 + 2);
                var ab = vec3.subtract(b, a, []);
                var ac = vec3.subtract(c, a, []);
                var normal = vec3.normalize(vec3.cross(ab, ac, []));
                util.putVec3(normals, 3 * i, normal);
                util.putVec3(normals, 3 * i + 1, normal);
                util.putVec3(normals, 3 * i + 2, normal);
            }
            return normals;
        };
        Game.prototype.createCameraMtx = function (ratio_wh, eye, angleOfView, lookAt, eyeShift) {
            var pMatrix = mat4.perspective(angleOfView, ratio_wh, 0.1, 300.0), vMatrix = mat4.lookAt(eye, lookAt, [0, 0, 1]);
            var shift = mat4.create();
            mat4.identity(shift);
            shift = mat4.translate(shift, [eyeShift, 0, 0]);
            vMatrix = mat4.multiply(shift, vMatrix);
            return mat4.multiply(pMatrix, vMatrix);
        };
        Game.prototype.setUniformCameraLight = function (shader, name, x, y, z, intensity, attenuation, ambient) {
            shader.uniformF(name + '.position', x, y, z);
            shader.uniformF(name + '.intensities', intensity, intensity, intensity);
            shader.uniformF(name + '.attenuation', attenuation);
            shader.uniformF(name + '.ambientCoefficient', ambient);
        };
        Game.prototype.preprocessSong = function (buffer) {
            var W_SIZE = 1024 * 4;
            var STEP = 0.05;
            var STEP_CORRECTION = 20 * STEP;
            var MAX_THRESH = 0.7;
            var STANDART_V = 0.1;
            var STANDARD_LOW = 5;
            var STANDARD_HIGH = 4;
            var T = 0.5;
            var Z = 0.5;
            var Y = 1;
            var ALPHA = 0.3;
            var THRESH = 0.6;
            var channelData = buffer.getChannelData(0);
            var frames_step = STEP * buffer.sampleRate | 0;
            var fft_buffer = new Float32Array(W_SIZE * 2);
            this.keyPoints = [0, 0, 0];
            var last_point = [0, 0, 0];
            var all_low = [], all_high = [];
            var magnitudes = [];
            var prev_complex = new complex_array.ComplexArray(0);
            for (var i = Math.max(frames_step, W_SIZE), time = 0; i + W_SIZE < channelData.length; i += frames_step, time += STEP) {
                for (var j = -W_SIZE; j < W_SIZE; j++)
                    fft_buffer[W_SIZE + j] = channelData[j + i];
                var complex = new complex_array.ComplexArray(fft_buffer);
                complex.FFT();
                magnitudes.push(false);
                if (isMaximum(prev_complex, complex, THRESH)) {
                    magnitudes[magnitudes.length - 2] = false;
                    magnitudes[magnitudes.length - 1] = true;
                }
                var low = 0, high = 0;
                complex.map(function (value, i, n) {
                    if (i * 5 < n || i * 5 > 4 * n) {
                        low += complexNorm(value.real, value.imag);
                    }
                    else {
                        high += complexNorm(value.real, value.imag);
                    }
                });
                all_low.push(low);
                all_high.push(high);
                prev_complex = complex;
            }
            this.blockPositions = [];
            magnitudes.map(function (value, i, n) {
                if (value == true) {
                    this.blockPositions.push([i, Math.floor(Math.random() * STRIP_COUNT)]);
                }
            }, this);
            console.log('magnitudes', magnitudes);
            // console.log(this.blockPositions.length);
            var max_low = Math.max.apply(Math, all_low);
            var max_high = Math.max.apply(Math, all_high);
            console.log(max_low, max_high);
            var current_low = 0;
            var current_high = 0;
            for (var i = 0; i < all_low.length; i++) {
                var low = all_low[i] / max_low * STANDARD_LOW;
                var high = all_high[i] / max_high * STANDARD_HIGH;
                var time = i * STEP;
                current_low = ALPHA * current_low + (1 - ALPHA) * low;
                current_high = ALPHA * current_high + (1 - ALPHA) * low;
                var delta = [1, Y * Math.cos(T * (time)), Z * (-2 - 0.2 * low + high)];
                delta = vec3.scale(delta, (STANDART_V + low) * STEP_CORRECTION);
                last_point = vec3.add(last_point, delta);
                this.keyPoints.push(last_point[0]);
                this.keyPoints.push(last_point[1]);
                this.keyPoints.push(last_point[2]);
            }
            console.log('keyPoints', this.keyPoints.length);
        };
        Game.prototype.start = function (songBuffer) {
            var _this = this;
            this.songBuffer = songBuffer;
            this.song = audio.context.createBufferSource();
            setTimeout(function () {
                _this.preprocessSong(songBuffer);
                ui.$('loadOverlay').classList.remove('overlay-visible');
                _this.root.classList.add(C_GAME_STARTED);
                _this.eye = [0, 0, 0];
                _this.lookAt = [0, 0, 0];
                _this.song.buffer = songBuffer;
                _this.analyser = audio.context.createAnalyser();
                _this.analyser.fftSize = 64;
                _this.analyser.smoothingTimeConstant = 0.85;
                _this.song.connect(_this.analyser);
                _this.analyser.connect(audio.context.destination);
                _this.freqData = new Uint8Array(_this.analyser.frequencyBinCount);
                _this.freqBins = new Uint8Array(FREQS_BINS_COUNT);
                _this.song.start();
                _this.songLastOffset = 0;
                _this.timeLastOffset = audio.context.currentTime;
                _this.createDataForBufs();
                _this.loop();
            }, 100);
        };
        Game.prototype.isPaused = function () {
            return audio.context.state !== 'running';
        };
        Game.prototype.togglePause = function () {
            if (this.isPaused())
                this.resume();
            else
                this.pause();
        };
        Game.prototype.pause = function () {
            this.songLastOffset = this.getAbsoluteTime();
            this.timeLastOffset = audio.context.currentTime;
            audio.context.suspend();
        };
        Game.prototype.resume = function () {
            audio.context.resume();
        };
        Game.prototype.getAbsoluteTime = function () {
            return Math.min(audio.context.currentTime - this.timeLastOffset + this.songLastOffset, this.songBuffer.duration);
        };
        Game.prototype.getRelativeTime = function () {
            return this.getAbsoluteTime() / this.songBuffer.duration;
        };
        Game.prototype.getShipStripNumber = function () {
            var relativeAngle = this.getShipTilt() - (-SECTOR_ANGLE / 2);
            return this.clamp(Math.floor((relativeAngle / SECTOR_ANGLE) * STRIP_COUNT), 0, STRIP_COUNT - 1);
        };
        Game.prototype.getShipTilt = function () {
            return this.tiltAngle;
        };
        Game.prototype.createDataForBufs = function () {
            // For map:
            this.keyPointCountB = this.keyPoints.length / 3;
            this.sectorsPoints = map.generateSectionPoints(this.keyPoints, STRIP_COUNT, TUBE_RADIUS, SECTOR_ANGLE);
            this.pointsB = this.createPoints(this.sectorsPoints, this.keyPointCountB, STRIP_COUNT);
            this.colorsB = this.createColors(this.pointsB.length / 3, 0.8, 0, 0.7);
            this.indiciesB = this.createIndicies(this.keyPointCountB, STRIP_COUNT);
            this.hacksB = this.generateHacks(this.pointsB.length / 3);
            // For blocks:
            this.keyPointCountBB = this.keyPoints.length / 3;
            this.blockPointsBB = map.generateBlocks(this.sectorsPoints, this.blockPositions, STRIP_COUNT, [1.0, 1.0, 1.0]);
            this.pointsBB = this.createBlockPoints(this.blockPointsBB);
            this.colorsBB = this.createColors(this.pointsBB.length / 3, 0.2, 0.2, 1.0);
            this.indiciesBB = this.createBlockIndicies(this.pointsBB.length / 3);
            this.normalsBB = this.generateNormals(this.pointsBB, this.indiciesBB);
        };
        Game.prototype.isBlockNotCatched = function (i) {
            return Math.round(this.colorsBB[3 * i * 36] * 10) == 2 && Math.round(this.colorsBB[3 * i * 36 + 1] * 10) == 2 && Math.round(this.colorsBB[3 * i * 36 + 2] * 10) == 10;
        };
        Game.prototype.uploadMapBufs = function (from, to) {
            var points = this.pointsB, colors = this.colorsB, indicies = this.indiciesB, hacks = this.hacksB;
            var mini = indicies[from * 3];
            var maxi = indicies[from * 3];
            for (var i = from; i < to; i++) {
                mini = Math.min(mini, indicies[i * 3], indicies[i * 3 + 1], indicies[i * 3 + 2]);
                maxi = Math.max(maxi, indicies[i * 3], indicies[i * 3 + 1], indicies[i * 3 + 2]);
            }
            var n = maxi - mini + 1;
            var points_part = new Float32Array(3 * n), colors_part = new Float32Array(3 * n), hacks_part = new Float32Array(n), indicies_part = new Uint16Array(3 * (to - from));
            for (i = mini; i <= maxi; i++) {
                var i_part = i - mini;
                for (var j = 0; j < 3; j++) {
                    points_part[i_part * 3 + j] = points[i * 3 + j];
                    colors_part[i_part * 3 + j] = colors[i * 3 + j];
                }
                hacks_part[i_part] = hacks[i];
            }
            for (i = 0; i < 3 * (to - from); i++) {
                indicies_part[i] = indicies[3 * from + i] - mini;
            }
            points = points_part;
            colors = colors_part;
            hacks = hacks_part;
            indicies = indicies_part;
            console.assert(indicies.length <= 65535);
            this.posBuf.uploadData(points); //3
            this.colBuf.uploadData(colors); //3
            this.hackBuf.uploadData(hacks); //1
            this.indBuf.uploadData(indicies); //indicies
            var planePos = new Float32Array([
                -1,
                1,
                0,
                1,
                0,
                0,
                -0.8,
                0,
                1,
                -1,
                -1,
                0
            ]);
            this.planePosBuf.uploadData(planePos);
            this.planeColorBuf.uploadData(new Float32Array([
                1,
                1,
                1,
                1,
                1,
                1,
                1,
                1,
                1,
                1,
                1,
                1
            ]));
            var planeInd = new Uint16Array([
                0,
                1,
                2,
                3,
                2,
                1
            ]);
            this.planeIndBuf.uploadData(planeInd);
            this.planeNormBuf.uploadData(this.generateNormals(planePos, planeInd));
        };
        Game.prototype.uploadBlockBufs = function (from, to) {
            var points = this.pointsBB, colors = this.colorsBB, indicies = this.indiciesBB, normals = this.normalsBB;
            var mini = indicies[from * 3];
            var maxi = indicies[from * 3];
            for (var i = from; i < to; i++) {
                mini = Math.min(mini, indicies[i * 3], indicies[i * 3 + 1], indicies[i * 3 + 2]);
                maxi = Math.max(maxi, indicies[i * 3], indicies[i * 3 + 1], indicies[i * 3 + 2]);
            }
            var n = maxi - mini + 1;
            var points_part = new Float32Array(3 * n), colors_part = new Float32Array(3 * n), normals_part = new Float32Array(3 * n), indicies_part = new Uint16Array(3 * (to - from));
            for (i = mini; i <= maxi; i++) {
                var i_part = i - mini;
                for (var j = 0; j < 3; j++) {
                    points_part[i_part * 3 + j] = points[i * 3 + j];
                    colors_part[i_part * 3 + j] = colors[i * 3 + j];
                    normals_part[i_part * 3 + j] = normals[i * 3 + j];
                }
            }
            for (i = 0; i < 3 * (to - from); i++) {
                indicies_part[i] = indicies[3 * from + i] - mini;
            }
            points = points_part;
            colors = colors_part;
            normals = normals_part;
            indicies = indicies_part;
            console.assert(indicies.length <= 65535);
            this.blockPosBuf.uploadData(points); //3
            this.blockColBuf.uploadData(colors); //3
            this.blockNormBuf.uploadData(normals); //3
            this.blockIndBuf.uploadData(indicies); //indicies
        };
        Game.prototype.initCamera = function () {
            var _this = this;
            var keyPointsCount = this.keyPoints.length / 3;
            var getAbsPosition = function (relPosition) {
                relPosition = Math.max(0, Math.min(relPosition, keyPointsCount - 1));
                var prevPointIdx = Math.min(Math.floor(relPosition), keyPointsCount - 2), nextPointIdx = prevPointIdx + 1, prevPoint = util.pickVec3(_this.keyPoints, prevPointIdx), nextPoint = util.pickVec3(_this.keyPoints, nextPointIdx);
                return vec3.add(prevPoint, vec3.scale(vec3.subtract(nextPoint, prevPoint), relPosition - prevPointIdx));
            };
            var getAbsPositionAndUp = function (relPosition) {
                var past = getAbsPosition(relPosition - 0.5), present = getAbsPosition(relPosition), future = getAbsPosition(relPosition + 0.5), guide = vec3.direction(past, future, []), up = vec3.normalize(vec3.cross(guide, vec3.cross([0, 0, 1], guide), []));
                return {
                    pos: present,
                    up: up,
                    guide: guide
                };
            };
            var relTime = this.getRelativeTime(), relPosition = relTime * (keyPointsCount - 1), absPosition = getAbsPositionAndUp(relPosition);
            var l = relPosition, r = keyPointsCount;
            while (r - l > 1e-6) {
                var m = (r + l) / 2;
                var dist = vec3.length(vec3.subtract(getAbsPosition(m), absPosition.pos));
                if (dist > CAM_VIEW_DISTANCE)
                    r = m;
                else
                    l = m;
            }
            var absTarget = getAbsPositionAndUp((l + r) / 2);
            var look = vec3.direction(absTarget.pos, absPosition.pos, []), tilt = mat4.rotate(mat4.identity([]), this.getShipTilt(), absPosition.guide), offPosition = vec3.subtract(absPosition.pos, vec3.scale(look, CAM_BACK_OFFSET, []), []);
            var eye_ALPHA = 0.2;
            var lookAt_ALPHA = 0.3;
            var eye = vec3.add(mat4.multiplyVec3(tilt, vec3.scale(absPosition.up, TUBE_RADIUS + CAM_HEIGHT, [])), offPosition);
            var lookAt = vec3.add(vec3.scale(absTarget.up, TUBE_RADIUS + CAM_TARGET_HEIGHT, []), absTarget.pos);
            // this.eye = vec3.add(mat4.multiplyVec3(tilt, vec3.scale(absPosition.up, TUBE_RADIUS + CAM_HEIGHT, [])), absPosition.pos);
            // this.lookAt = vec3.add(vec3.scale(absTarget.up, TUBE_RADIUS + CAM_TARGET_HEIGHT, []), absTarget.pos);
            this.eye = vec3.add(vec3.scale(eye, eye_ALPHA), vec3.scale(this.eye, 1 - eye_ALPHA), []);
            this.lookAt = vec3.add(vec3.scale(lookAt, lookAt_ALPHA), vec3.scale(this.lookAt, 1 - lookAt_ALPHA), []);
            var planePos = vec3.add(mat4.multiplyVec3(tilt, vec3.scale(absPosition.up, TUBE_RADIUS + 1, [])), absPosition.pos);
            var axis = vec3.cross(vec3.direction(this.lookAt, this.eye, []), [1, 0, 0]);
            this.planeModel = mat4.identity(mat4.create());
            mat4.translate(this.planeModel, planePos);
            mat4.rotate(this.planeModel, -Math.asin(vec3.length(axis)), axis);
        };
        Game.prototype.renderBackground = function () {
            this.backgroundShader.vertexAttribute('aPosition', this.posRectBuf);
            var screenCorners = new Float32Array([
                -1,
                -1,
                0,
                -1,
                1,
                0,
                1,
                1,
                0,
                1,
                -1,
                0
            ]);
            this.posRectBuf.uploadData(screenCorners);
            this.indRectBuf.uploadData(new Uint16Array([0, 1, 2, 0, 2, 3]));
            this.backgroundShader.vertexAttribute('aPosition', this.posRectBuf);
            for (var i = 0; i < FREQS_BINS_COUNT; i++) {
                this.backgroundShader.uniformF('uFreqBins[' + i.toString() + ']', this.freqBins[i] / 255.0);
            }
            this.backgroundShader.uniformF('uRatio', this.canvas.height / this.canvas.width);
            this.backgroundShader.uniformF('uTime', this.getAbsoluteTime());
            var cameraMtx = this.createCameraMtx(this.canvas.width / this.canvas.height, this.eye, this.viewAngleVert, this.lookAt, 0);
            var center = mat4.multiplyVec3(cameraMtx, [1000000000.0, 0.0, 0.0]);
            var x = center[0] / center[2];
            var y = center[1] / center[2];
            this.backgroundShader.uniformF('uCenter', x, y);
            gl.disable(gl.DEPTH_TEST);
            if (this.stereo) {
                this.backgroundShader.draw(this.canvas.width / 2, this.canvas.height, gl.TRIANGLES, this.indRectBuf, 0);
                this.backgroundShader.draw(this.canvas.width / 2, this.canvas.height, gl.TRIANGLES, this.indRectBuf, this.canvas.width / 2);
            }
            else {
                this.backgroundShader.draw(this.canvas.width, this.canvas.height, gl.TRIANGLES, this.indRectBuf);
            }
        };
        Game.prototype.renderMap = function () {
            this.mapShader.vertexAttribute('aPosition', this.posBuf);
            this.mapShader.vertexAttribute('aColor', this.colBuf);
            this.mapShader.vertexAttribute('aHack', this.hackBuf);
            this.mapShader.uniformF('uCameraPosition', this.eye[0], this.eye[1], this.eye[2]);
            this.setUniformCameraLight(this.mapShader, 'uLight', this.eye[0], this.eye[1], this.eye[2], 2.0, 0.1, 0.5);
            for (var i = 0; i < FREQS_BINS_COUNT; i++) {
                this.mapShader.uniformF('uFreqBins[' + i.toString() + ']', this.freqBins[i] / 255.0);
            }
            this.mapShader.uniformF('uTime', this.getAbsoluteTime());
            if (this.anaglyph) {
                var leftCameraMtx = this.createCameraMtx(this.canvas.width / this.canvas.height, this.eye, this.viewAngleVert, this.lookAt, -EYE_SHIFT), rightCameraMtx = this.createCameraMtx(this.canvas.width / this.canvas.height, this.eye, this.viewAngleVert, this.lookAt, EYE_SHIFT);
                gl.enable(gl.DEPTH_TEST);
                gl.clear(gl.DEPTH | gl.COLOR);
                this.mapShader.uniformMatrixF('uCameraMtx', leftCameraMtx);
                gl.colorMask(1, 0, 0, 0);
                this.mapShader.draw(this.canvas.width, this.canvas.height, gl.TRIANGLES, this.indBuf);
                this.mapShader.uniformMatrixF('uCameraMtx', rightCameraMtx);
                gl.colorMask(0, 1, 1, 1);
                gl.clear(gl.DEPTH_BUFFER_BIT);
                this.mapShader.draw(this.canvas.width, this.canvas.height, gl.TRIANGLES, this.indBuf);
                gl.colorMask(1, 1, 1, 1);
            }
            else if (this.stereo) {
                var leftCameraMtx = this.createCameraMtx(0.5 * this.canvas.width / this.canvas.height, this.eye, this.viewAngleVert, this.lookAt, -EYE_SHIFT), rightCameraMtx = this.createCameraMtx(0.5 * this.canvas.width / this.canvas.height, this.eye, this.viewAngleVert, this.lookAt, EYE_SHIFT);
                gl.enable(gl.DEPTH_TEST);
                gl.clear(gl.DEPTH | gl.COLOR);
                this.mapShader.uniformMatrixF('uCameraMtx', leftCameraMtx);
                this.mapShader.draw(this.canvas.width / 2, this.canvas.height, gl.TRIANGLES, this.indBuf, 0);
                this.mapShader.uniformMatrixF('uCameraMtx', rightCameraMtx);
                this.mapShader.draw(this.canvas.width / 2, this.canvas.height, gl.TRIANGLES, this.indBuf, this.canvas.width / 2);
            }
            else {
                var centerMatrix = this.createCameraMtx(this.canvas.width / this.canvas.height, this.eye, this.viewAngleVert, this.lookAt, 0);
                this.mapShader.uniformMatrixF('uCameraMtx', centerMatrix);
                gl.enable(gl.DEPTH_TEST);
                gl.clear(gl.DEPTH | gl.COLOR);
                this.mapShader.draw(this.canvas.width, this.canvas.height, gl.TRIANGLES, this.indBuf);
            }
        };
        Game.prototype.renderBlocks = function () {
            this.blocksShader.vertexAttribute('aPosition', this.blockPosBuf);
            this.blocksShader.vertexAttribute('aColor', this.blockColBuf);
            this.blocksShader.vertexAttribute('aNormal', this.blockNormBuf);
            this.blocksShader.uniformF('uCameraPosition', this.eye[0], this.eye[1], this.eye[2]);
            this.setUniformCameraLight(this.blocksShader, 'uLight', this.eye[0], this.eye[1], this.eye[2], 2.0, 0.01, 0.2);
            if (this.anaglyph) {
                var leftCameraMtx = this.createCameraMtx(this.canvas.width / this.canvas.height, this.eye, this.viewAngleVert, this.lookAt, -EYE_SHIFT), rightCameraMtx = this.createCameraMtx(this.canvas.width / this.canvas.height, this.eye, this.viewAngleVert, this.lookAt, EYE_SHIFT);
                gl.clear(gl.DEPTH);
                this.blocksShader.uniformMatrixF("uCameraMtx", leftCameraMtx);
                gl.colorMask(1, 0, 0, 0);
                this.blocksShader.draw(this.canvas.width, this.canvas.height, gl.TRIANGLES, this.blockIndBuf);
                this.blocksShader.uniformMatrixF("uCameraMtx", rightCameraMtx);
                gl.colorMask(0, 1, 1, 1);
                gl.clear(gl.DEPTH_BUFFER_BIT);
                this.blocksShader.draw(this.canvas.width, this.canvas.height, gl.TRIANGLES, this.blockIndBuf);
                gl.colorMask(1, 1, 1, 1);
            }
            else if (this.stereo) {
                var leftCameraMtx = this.createCameraMtx(0.5 * this.canvas.width / this.canvas.height, this.eye, this.viewAngleVert, this.lookAt, -EYE_SHIFT), rightCameraMtx = this.createCameraMtx(0.5 * this.canvas.width / this.canvas.height, this.eye, this.viewAngleVert, this.lookAt, EYE_SHIFT);
                this.blocksShader.uniformMatrixF("uCameraMtx", leftCameraMtx);
                this.blocksShader.draw(this.canvas.width / 2, this.canvas.height, gl.TRIANGLES, this.blockIndBuf, 0);
                this.blocksShader.uniformMatrixF("uCameraMtx", rightCameraMtx);
                this.blocksShader.draw(this.canvas.width / 2, this.canvas.height, gl.TRIANGLES, this.blockIndBuf, this.canvas.width / 2);
            }
            else {
                var centerMatrix = this.createCameraMtx(this.canvas.width / this.canvas.height, this.eye, this.viewAngleVert, this.lookAt, 0);
                this.blocksShader.uniformMatrixF('uCameraMtx', centerMatrix);
                this.blocksShader.draw(this.canvas.width, this.canvas.height, gl.TRIANGLES, this.blockIndBuf);
            }
        };
        Game.prototype.renderPlane = function () {
            this.planeShader.vertexAttribute('aPosition', this.planePosBuf);
            this.planeShader.vertexAttribute('aColor', this.planeColorBuf);
            //this.planeShader.vertexAttribute('aNormal', this.planeNormBuf);
            this.planeShader.uniformF("uCameraPosition", this.eye[0], this.eye[1], this.eye[2]);
            this.planeShader.uniformMatrixF("uModelMtx", this.planeModel);
            if (this.anaglyph) {
                var leftCameraMtx = this.createCameraMtx(this.canvas.width / this.canvas.height, this.eye, this.viewAngleVert, this.lookAt, -EYE_SHIFT), rightCameraMtx = this.createCameraMtx(this.canvas.width / this.canvas.height, this.eye, this.viewAngleVert, this.lookAt, EYE_SHIFT);
                gl.clear(gl.DEPTH);
                this.planeShader.uniformMatrixF("uCameraMtx", leftCameraMtx);
                gl.colorMask(1, 0, 0, 0);
                this.planeShader.draw(this.canvas.width, this.canvas.height, gl.TRIANGLES, this.planeIndBuf);
                this.planeShader.uniformMatrixF("uCameraMtx", rightCameraMtx);
                gl.colorMask(0, 1, 1, 1);
                gl.clear(gl.DEPTH_BUFFER_BIT);
                this.planeShader.draw(this.canvas.width, this.canvas.height, gl.TRIANGLES, this.planeIndBuf);
                gl.colorMask(1, 1, 1, 1);
            }
            else if (this.stereo) {
                var leftCameraMtx = this.createCameraMtx(0.5 * this.canvas.width / this.canvas.height, this.eye, this.viewAngleVert, this.lookAt, -EYE_SHIFT), rightCameraMtx = this.createCameraMtx(0.5 * this.canvas.width / this.canvas.height, this.eye, this.viewAngleVert, this.lookAt, EYE_SHIFT);
                this.planeShader.uniformMatrixF("uCameraMtx", leftCameraMtx);
                this.planeShader.draw(this.canvas.width / 2, this.canvas.height, gl.TRIANGLES, this.planeIndBuf, 0);
                this.planeShader.uniformMatrixF("uCameraMtx", rightCameraMtx);
                this.planeShader.draw(this.canvas.width / 2, this.canvas.height, gl.TRIANGLES, this.planeIndBuf, this.canvas.width / 2);
            }
            else {
                var centerMatrix = this.createCameraMtx(this.canvas.width / this.canvas.height, this.eye, this.viewAngleVert, this.lookAt, 0);
                this.planeShader.uniformMatrixF('uCameraMtx', centerMatrix);
                this.planeShader.draw(this.canvas.width, this.canvas.height, gl.TRIANGLES, this.planeIndBuf);
            }
        };
        Game.prototype.renderLights = function () {
            this.lightShader.vertexAttribute('aPosition', this.posRectBuf);
            var screenCorners = new Float32Array([
                -1,
                -1,
                0,
                -1,
                1,
                0,
                1,
                1,
                0,
                1,
                -1,
                0
            ]);
            this.posRectBuf.uploadData(screenCorners);
            this.indRectBuf.uploadData(new Uint16Array([0, 1, 2, 0, 2, 3]));
            this.lightShader.vertexAttribute('aPosition', this.posRectBuf);
            var lightColors = [
                [1, 1, 0],
                [1, 0, 1]
            ];
            for (var i = 0; i < FREQS_BINS_COUNT; i++) {
                this.lightShader.uniformF('uFreqBins[' + i.toString() + ']', this.freqBins[i] / 255.0);
            }
            this.lightShader.uniformF('uTime', this.getAbsoluteTime());
            var that = this;
            var draw = function (width, x) {
                that.lightShader.uniformF('uRatio', that.canvas.height / width);
                gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
                gl.enable(gl.BLEND);
                gl.disable(gl.DEPTH_TEST);
                that.lightShader.draw(width, that.canvas.height, gl.TRIANGLES, that.indRectBuf, x);
                gl.disable(gl.BLEND);
            };
            var setLightPoses = function (cameraMtx) {
                var lightPositions = [
                    [-1.0, 1.0, 0.0],
                    [-1.0, -1.0, 0.0]
                ];
                for (var i = 0; i < LIGHTS_COUNT; i++) {
                    var wldPos = mat4.multiplyVec3(that.planeModel, lightPositions[i]);
                    var pos = mat4.multiplyVec3(cameraMtx, wldPos);
                    pos[0] = pos[0] / pos[2];
                    pos[1] = pos[1] / pos[2];
                    var lightPositionX = pos[0];
                    var lightPositionY = pos[1];
                    that.lightShader.uniformF('uLightPosition[' + i.toString() + ']', lightPositionX, lightPositionY);
                    that.lightShader.uniformF('uLightColor[' + i.toString() + ']', lightColors[i][0], lightColors[i][1], lightColors[i][2]);
                }
            };
            if (this.anaglyph) {
                var leftCameraMtx = this.createCameraMtx(this.canvas.width / this.canvas.height, this.eye, this.viewAngleVert, this.lookAt, -EYE_SHIFT), rightCameraMtx = this.createCameraMtx(this.canvas.width / this.canvas.height, this.eye, this.viewAngleVert, this.lookAt, EYE_SHIFT);
                gl.clear(gl.DEPTH);
                gl.colorMask(1, 0, 0, 0);
                setLightPoses(leftCameraMtx);
                draw(this.canvas.width, 0);
                gl.colorMask(0, 1, 1, 1);
                gl.clear(gl.DEPTH_BUFFER_BIT);
                setLightPoses(rightCameraMtx);
                draw(this.canvas.width, 0);
                gl.colorMask(1, 1, 1, 1);
            }
            else if (this.stereo) {
                var leftCameraMtx = this.createCameraMtx(0.5 * this.canvas.width / this.canvas.height, this.eye, this.viewAngleVert, this.lookAt, -EYE_SHIFT), rightCameraMtx = this.createCameraMtx(0.5 * this.canvas.width / this.canvas.height, this.eye, this.viewAngleVert, this.lookAt, EYE_SHIFT);
                setLightPoses(leftCameraMtx);
                draw(this.canvas.width / 2, 0);
                setLightPoses(rightCameraMtx);
                draw(this.canvas.width / 2, this.canvas.width / 2);
            }
            else {
                var centerMatrix = this.createCameraMtx(this.canvas.width / this.canvas.height, this.eye, this.viewAngleVert, this.lookAt, 0);
                setLightPoses(centerMatrix);
                draw(this.canvas.width, 0);
            }
        };
        Game.prototype.getFreqs = function () {
            this.analyser.getByteFrequencyData(this.freqData);
            for (var i = 0; i < FREQS_BINS_COUNT; i++) {
                var from = Math.floor(this.freqData.length * i / FREQS_BINS_COUNT);
                var to = Math.floor(this.freqData.length * (i + 1) / FREQS_BINS_COUNT);
                var freq = 0;
                for (var j = from; j < to; j++) {
                    freq += this.freqData[j];
                }
                this.freqBins[i] = freq / (to - from);
            }
        };
        Game.prototype.clamp = function (value, min, max) {
            if (value < min) {
                return min;
            }
            else if (value > max) {
                return max;
            }
            else {
                return value;
            }
        };
        Game.prototype.calcTrianglesOffset = function (trianglesCount) {
            var t = this.getRelativeTime();
            var trianglesToShow = Math.min(this.trianglesChunkCount, trianglesCount);
            var offset = Math.round(trianglesCount * t - trianglesToShow * 0.5);
            return this.clamp(offset, 0, trianglesCount - 1);
        };
        Game.prototype.calcTrianglesTill = function (trianglesCount) {
            var t = this.getRelativeTime();
            var trianglesToShow = Math.min(this.trianglesChunkCount, trianglesCount);
            var till = Math.round(trianglesCount * t + trianglesToShow * 0.5);
            return this.clamp(till, 1, trianglesCount);
        };
        Game.prototype.isTimeToUpdateBufs = function (trianglesCount) {
            var t = this.getRelativeTime();
            var oldT = this.lastBufsUpdatedT;
            if (oldT == 0) {
                return true;
            }
            else if (trianglesCount * (t - oldT) > 0.25 * this.trianglesChunkCount) {
                return true;
            }
            else {
                return false;
            }
        };
        Game.prototype.checkBlocksCollision = function () {
            var _this = this;
            var keyPointsCount = this.keyPoints.length / 3;
            var sectorPositionIndex = Math.round(this.getRelativeTime() * keyPointsCount);
            var planeStripPosition = this.getShipStripNumber();
            while (this.nextBlockIndex < this.blockPositions.length && this.blockPositions[this.nextBlockIndex][0] < sectorPositionIndex) {
                this.nextBlockIndex += 1;
            }
            if (this.nextBlockIndex >= this.blockPositions.length || this.blockPositions[this.nextBlockIndex][0] > sectorPositionIndex + 1.5) {
                return;
            }
            var scoreChanged = false;
            for (var i = this.nextBlockIndex; i < this.blockPositions.length && this.blockPositions[i][0] < sectorPositionIndex + 1.5; i++) {
                if (this.blockPositions[i][1] == planeStripPosition && this.isBlockNotCatched(i)) {
                    this.score += BLOCK_SCORE;
                    for (var j = 0; j < 36; j++) {
                        this.colorsBB[3 * i * 36 + 3 * j] = 0.2;
                        this.colorsBB[3 * i * 36 + 3 * j + 1] = 1.0;
                        this.colorsBB[3 * i * 36 + 3 * j + 2] = 0.2;
                    }
                    this.blocksWereUpdated = true;
                    scoreChanged = true;
                }
            }
            if (scoreChanged) {
                this.scoreEl.innerHTML = "Score: " + this.score;
                this.scoreEl.classList.add(C_GAME_SCORE_CHANGED);
                setTimeout(function () {
                    _this.scoreEl.classList.remove(C_GAME_SCORE_CHANGED);
                }, 0);
            }
        };
        Game.prototype.updateBufs = function () {
            var mapTri = this.indiciesB.length / 3;
            var blocksTri = this.indiciesBB.length / 3;
            if (this.isTimeToUpdateBufs(mapTri) || this.isTimeToUpdateBufs(blocksTri)) {
                this.uploadMapBufs(this.calcTrianglesOffset(mapTri), this.calcTrianglesTill(mapTri));
                this.uploadBlockBufs(this.calcTrianglesOffset(blocksTri), this.calcTrianglesTill(blocksTri));
                this.lastBufsUpdatedT = this.getRelativeTime();
                console.debug('Bufs were updated!');
            }
            else if (this.blocksWereUpdated) {
                this.uploadBlockBufs(this.calcTrianglesOffset(blocksTri), this.calcTrianglesTill(blocksTri));
                console.debug('Blocks bufs were updated!');
                this.blocksWereUpdated = false;
            }
        };
        Game.prototype.loop = function () {
            this.makeFullscreen();
            this.getFreqs();
            this.checkBlocksCollision();
            this.updateBufs();
            this.initCamera();
            this.renderBackground();
            this.renderMap();
            this.renderBlocks();
            this.renderPlane();
            this.renderLights();
            window.requestAnimationFrame(this.loop.bind(this));
            if ((1.0 - this.getRelativeTime()) * this.keyPoints.length / 3 < 100 && !this.root.classList.contains(C_GAME_ENDED))
                this.root.classList.add(C_GAME_ENDED);
        };
        return Game;
    })();
    game.Game = Game;
})(game || (game = {}));
var input;
(function (input) {
    var InputHandler = (function () {
        function InputHandler() {
            var _this = this;
            this.keyboard = {};
            this.downHandlers = {};
            this.upHandlers = {};
            this.whileDownHandlers = {};
            this.eventListeners = {
                "keydown": this.onKeyDown.bind(this),
                "keyup": this.onKeyUp.bind(this)
            };
            setInterval(function () {
                Object.getOwnPropertyNames(_this.keyboard).forEach(function (key) {
                    InputHandler.fire(_this.whileDownHandlers, +key);
                });
            }, 20);
        }
        InputHandler.on = function (map, key, handler) {
            if (!map[key])
                map[key] = [];
            map[key].push(handler);
        };
        InputHandler.fire = function (map, key) {
            if (!map[key])
                return;
            return map[key].reduce(function (captured, handler) { return handler() || captured; }, false);
        };
        InputHandler.prototype.onKeyDown = function (evt) {
            var key = evt.keyCode;
            if (!this.keyboard[key]) {
                this.keyboard[key] = true;
                if (InputHandler.fire(this.downHandlers, key)) {
                    evt.preventDefault();
                }
            }
        };
        InputHandler.prototype.onKeyUp = function (evt) {
            var key = evt.keyCode;
            if (this.keyboard[key]) {
                delete this.keyboard[key];
                if (InputHandler.fire(this.upHandlers, key)) {
                    evt.preventDefault();
                }
            }
        };
        InputHandler.prototype.onDown = function (key, handler) {
            InputHandler.on(this.downHandlers, key, handler);
        };
        InputHandler.prototype.whileDown = function (key, handler) {
            InputHandler.on(this.whileDownHandlers, key, handler);
        };
        InputHandler.prototype.onUp = function (key, handler) {
            InputHandler.on(this.upHandlers, key, handler);
        };
        InputHandler.prototype.attach = function (id) {
            var _this = this;
            if (this.attachedTo)
                throw new Error("Already attached");
            this.attachedTo = ui.$(id);
            if (!this.attachedTo)
                throw new Error("Element not found");
            Object.getOwnPropertyNames(this.eventListeners).forEach(function (type) {
                _this.attachedTo.addEventListener(type, _this.eventListeners[type]);
            }, this);
        };
        InputHandler.prototype.detach = function () {
            var _this = this;
            if (!this.attachedTo)
                throw new Error("Not attached");
            Object.getOwnPropertyNames(this.eventListeners).forEach(function (type) {
                _this.attachedTo.removeEventListener(type, _this.eventListeners[type]);
            }, this);
            this.attachedTo = null;
        };
        return InputHandler;
    })();
    input.InputHandler = InputHandler;
    function code(char) {
        return char.toUpperCase().charCodeAt(0);
    }
    (function (Key) {
        Key[Key["W"] = code('w')] = "W";
        Key[Key["A"] = code('a')] = "A";
        Key[Key["S"] = code('s')] = "S";
        Key[Key["D"] = code('d')] = "D";
        Key[Key["SPACE"] = code(' ')] = "SPACE";
        Key[Key["Z"] = code('z')] = "Z";
        Key[Key["X"] = code('x')] = "X";
        Key[Key["LEFT_ARROW"] = 37] = "LEFT_ARROW";
        Key[Key["RIGHT_ARROW"] = 39] = "RIGHT_ARROW";
    })(input.Key || (input.Key = {}));
    var Key = input.Key;
})(input || (input = {}));
///<reference path='ui.ts'/>
var C_MAIN_MENU_TITLE = 'mainMenu--title', C_MAIN_MENU_ITEMS = 'mainMenu--items', C_MAIN_MENU_VISIBLE = 'mainMenu-visible', C_MAIN_MENU_BUTTON = 'mainMenu--button', C_MAIN_MENU_ITEM = "mainMenu--item", C_MAIN_MENU_SELECT = "mainMenu--select", C_MAIN_MENU_LABEL = 'mainMenu--label';
var MainMenu = (function () {
    function MainMenu(root) {
        this.root = root;
        this.title = ui.$$('.' + C_MAIN_MENU_TITLE, root);
        this.items = ui.$$('.' + C_MAIN_MENU_ITEMS, root);
    }
    MainMenu.prototype.hide = function () {
        this.root.classList.remove(C_MAIN_MENU_VISIBLE);
    };
    MainMenu.prototype.show = function () {
        this.root.classList.add(C_MAIN_MENU_VISIBLE);
    };
    MainMenu.prototype.setItems = function (items) {
        var _this = this;
        this.items.innerHTML = "";
        items.forEach(function (item) {
            var li = document.createElement("li");
            li.className = C_MAIN_MENU_ITEM;
            li.appendChild(item.getElement());
            _this.items.appendChild(li);
        }, this);
    };
    return MainMenu;
})();
var MainMenuButton = (function () {
    function MainMenuButton(caption) {
        this.root = document.createElement("button");
        this.root.innerHTML = caption;
        this.root.className = C_MAIN_MENU_BUTTON;
    }
    MainMenuButton.prototype.addOnClick = function (onClick) {
        this.root.addEventListener("click", onClick);
        return this;
    };
    MainMenuButton.prototype.getElement = function () {
        return this.root;
    };
    return MainMenuButton;
})();
var MainMenuSelect = (function () {
    function MainMenuSelect(caption) {
        this.caption = caption;
        this.root = document.createElement("select");
        this.root.className = C_MAIN_MENU_SELECT;
        this.setItems([]);
    }
    MainMenuSelect.prototype.setItems = function (items) {
        this.root.innerHTML = ui.tmpl("<option value='' disabled selected>{}</option>", this.caption) + items.reduce(function (html, item, idx) {
            return html + ui.tmpl("<option value='{}'>{}</option>", idx, item);
        }, "");
    };
    MainMenuSelect.prototype.addOnChange = function (onChange) {
        this.root.addEventListener("change", onChange);
        return this;
    };
    MainMenuSelect.prototype.getElement = function () {
        return this.root;
    };
    return MainMenuSelect;
})();
var MainMenuLabel = (function () {
    function MainMenuLabel(caption) {
        this.root = document.createElement("div");
        this.root.className = C_MAIN_MENU_LABEL;
        this.root.innerHTML = caption;
    }
    MainMenuLabel.prototype.getElement = function () {
        return this.root;
    };
    return MainMenuLabel;
})();
///<reference path='ui.ts'/>
///<reference path='menu.ts'/>
///<reference path="drop.ts"/>
///<reference path="audio.ts"/>
var App = (function () {
    function App(apiId) {
        var _this = this;
        this.PERMANENT_MENU_ITEMS = [
            new MainMenuButton("Play 'Diorama - Child of Entertainment'").addOnClick(function (evt) {
                _this.loadAudioAndStart("demos/webgl/8_diorama_child_of_entertainment.mp3");
            }),
            new MainMenuButton("Play 'Diary of Dreams - The Luxury of Insanity'").addOnClick(function (evt) {
                _this.loadAudioAndStart("demos/webgl/7_diary_of_dreams_the_luxury_ofinsanity.mp3");
            }),
            new MainMenuLabel("Or drag and drop <b>your MP3</b> file here"),
            new MainMenuLabel("Press Left/Right arrows for control"),
            new MainMenuLabel("Press A key for anaglyph"),
            new MainMenuLabel("Press S key for stereo (OculusRift or so)"),
            new MainMenuLabel("Links: <a href=\"https://github.com/lyra-team\">GitHub</a>, <a href=\"http://hackday.ru/hackday-36/projects#project-1121\">HackDay project</a>"),
            new MainMenuLabel("With head-control (by webcam): <a href=\"http://polarnick239.github.io/lyra/\">Lyra (old)</a>"),
            new MainMenuLabel("Winner of Autodesc nomination 'Original 3D web application.' - <a href=\"http://hackday.ru/hackday-36/report\">report</a>"),
        ];
        this.mainMenu = new MainMenu(ui.$('mainMenu'));
        this.dropOverlay = new DropOverlay("dropOverlay");
        this.dropOverlay.setOnFileLoaded(this.onFileDropped.bind(this));
        this.game = new game.Game(ui.$$('div.game'));
    }
    App.prototype.start = function () {
        this.mainMenu.setItems(this.PERMANENT_MENU_ITEMS);
        this.mainMenu.show();
    };
    App.prototype.startGame = function (songBuffer) {
        this.game.start(songBuffer);
        this.mainMenu.hide();
    };
    App.prototype.decodeAndStart = function (buffer) {
        var _this = this;
        audio.context.decodeAudioData(buffer, function (songBuffer) {
            _this.startGame(songBuffer);
        });
    };
    App.prototype.onFileDropped = function (buffer) {
        this.decodeAndStart(buffer);
    };
    App.prototype.loadAudioAndStart = function (url) {
        var _this = this;
        ui.$('loadOverlay').classList.add('overlay-visible');
        var xhr = new XMLHttpRequest();
        xhr.open('GET', url, true);
        xhr.responseType = 'arraybuffer';
        xhr.onload = function (response) {
            _this.decodeAndStart(xhr.response);
        };
        xhr.send();
    };
    return App;
})();
var util;
(function (util) {
    function pickVec3(coords, idx) {
        return [].slice.call(coords, idx * 3, idx * 3 + 3);
    }
    util.pickVec3 = pickVec3;
    function putVec3(coords, idx, vec) {
        coords[idx * 3] = vec[0];
        coords[idx * 3 + 1] = vec[1];
        coords[idx * 3 + 2] = vec[2];
    }
    util.putVec3 = putVec3;
})(util || (util = {}));
///<reference path='../glMatrix.d.ts'/>
var matrix;
(function (matrix) {
    function createCameraMtx(x, y, z, course, pitch, roll, angleView, ratioYX) {
        var right = Math.sin(angleView / 2);
        var left = -right;
        var bottom = left * ratioYX;
        var top = right * ratioYX;
        var near = 0.01;
        var far = 100.0;
        var modelView = mat4.create();
        mat4.identity(modelView);
        mat4.translate(modelView, [0, 0, -10]);
        mat4.rotate(modelView, Math.PI / 2, [0, 1, 0]);
        var frustum = mat4.frustum(left, right, bottom, top, near, far);
        return frustum;
    }
    matrix.createCameraMtx = createCameraMtx;
})(matrix || (matrix = {}));
///<reference path='gl.ts'/>
///<reference path='matrix.ts'/>
///<reference path='../glMatrix.d.ts'/>
var camera;
(function (camera) {
    var gl;
    var glContext;
    var shader;
    var canvas;
    var posBuf;
    var indBuf;
    function makeFullPage() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    function start(vshader, fshader) {
        var canvas = document.getElementById('gl_canvas');
        init(canvas, vshader, fshader);
        loop();
    }
    camera.start = start;
    function init(glCanvas, vshader, fshader) {
        canvas = glCanvas;
        makeFullPage();
        glContext = new webgl.GLContext(canvas);
        glContext.activate();
        gl = webgl.gl;
        shader = new webgl.Shader(vshader, fshader);
        posBuf = new webgl.ArrayBuffer(3, gl.FLOAT);
        ;
        indBuf = new webgl.ElementArrayBuffer();
    }
    function loop() {
        makeFullPage();
        var positions = new Float32Array([
            0.0,
            1.0,
            0.0,
            -1.0,
            -1.0,
            0.0,
            1.0,
            -1.0,
            0.0
        ]);
        var pMatrix = mat4.create();
        var mvMatrix = mat4.create();
        mat4.perspective(45, canvas.width / canvas.height, 0.1, 100.0, pMatrix);
        mat4.identity(mvMatrix);
        mat4.translate(mvMatrix, [-1.5, 0.0, -7.0]);
        posBuf.uploadData(positions);
        indBuf.uploadData(new Uint16Array([0, 1, 2]));
        shader.vertexAttribute('aVertexPosition', posBuf);
        shader.uniformMatrixF('uPMatrix', pMatrix);
        shader.uniformMatrixF('uMVMatrix', mvMatrix);
        shader.draw(canvas.width, canvas.height, gl.TRIANGLES, indBuf);
        window.requestAnimationFrame(loop);
    }
})(camera || (camera = {}));
///<reference path='gl.ts'/>
var rectangle;
(function (rectangle) {
    var gl;
    var glContext;
    var shader;
    var canvas;
    var posBuf;
    var colBuf;
    var indBuf;
    var W_SIZE = 1024 * 4;
    var STEP = 0.025;
    var MAX_THRESH = 0.7;
    var num = 0;
    var global_ret, global_start;
    var audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    function makeFullPage() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    function start(vshader, fshader) {
        var canvas = document.getElementById('gl_canvas');
        init(canvas, vshader, fshader);
        precalculate();
        //loop();
    }
    rectangle.start = start;
    function init(glCanvas, vshader, fshader) {
        canvas = glCanvas;
        makeFullPage();
        glContext = new webgl.GLContext(canvas);
        glContext.activate();
        gl = webgl.gl;
        shader = new webgl.Shader(vshader, fshader);
        posBuf = new webgl.ArrayBuffer(2, gl.FLOAT);
        colBuf = new webgl.ArrayBuffer(4, gl.FLOAT);
        indBuf = new webgl.ElementArrayBuffer();
    }
    function toPowerOfTwo(n) {
        n--;
        n |= n >> 1;
        n |= n >> 2;
        n |= n >> 4;
        n |= n >> 8;
        n |= n >> 16;
        n++;
        return n;
    }
    function complexLength(real, imag) {
        return Math.sqrt(real * real + imag * imag);
    }
    function calculateMetrics(prev, current) {
        if (prev.length == 0)
            return 0;
        var sum = 0;
        for (var i = 0; i < prev.length; i++)
            sum += complexLength(prev.real[i] - current.real[i], prev.imag[i] - current.imag[i]);
        return sum;
    }
    function isMaximum(prev, current) {
        if (prev.length == 0)
            return false;
        var cnt = 0;
        for (var i = 0; i < prev.length; i++)
            if (complexLength(prev.real[i], prev.imag[i]) < complexLength(current.real[i], current.imag[i]))
                cnt++;
        console.log(cnt + " " + current.length + " " + current.length * MAX_THRESH);
        return cnt >= current.length * MAX_THRESH;
    }
    function precalculate() {
        console.log("123");
        var request = new XMLHttpRequest();
        request.open('GET', 'metallica.mp3', true);
        request.responseType = 'arraybuffer';
        request.onload = function () {
            var audioData = request.response;
            audioCtx.decodeAudioData(audioData, function (buffer) {
                var offlineCtx = new OfflineAudioContext(1, buffer.length, buffer.sampleRate);
                var source = offlineCtx.createBufferSource();
                source.buffer = buffer;
                source.connect(offlineCtx.destination);
                source.start();
                offlineCtx.startRendering();
                var cnt = 0;
                offlineCtx.oncomplete = function (e) {
                    console.log("cnt " + cnt++);
                    var buffer = e.renderedBuffer;
                    var song = audioCtx.createBufferSource();
                    song.buffer = e.renderedBuffer;
                    song.connect(audioCtx.destination);
                    var channelData = song.buffer.getChannelData(0);
                    var frames_step = STEP * song.buffer.sampleRate | 0;
                    console.log(song.buffer.sampleRate);
                    var prev_array = new complex_array.ComplexArray(0);
                    var current_array = new complex_array.ComplexArray(0);
                    var fft_buffer = new Float32Array(W_SIZE * 2);
                    global_ret = new Array();
                    console.log("! " + STEP + " " + frames_step + " " + channelData.length);
                    for (var i = frames_step; i + W_SIZE < channelData.length; i += frames_step) {
                        prev_array = current_array;
                        for (var j = -W_SIZE; j < W_SIZE; j++)
                            fft_buffer[W_SIZE + j] = channelData[j + i];
                        var complex = new complex_array.ComplexArray(fft_buffer);
                        complex.FFT();
                        current_array = complex;
                        //global_ret.push(calculateMetrics(prev_array, current_array))
                        if (isMaximum(prev_array, current_array)) {
                            global_ret[global_ret.length - 1] = 0;
                            global_ret.push(1);
                        }
                        else {
                            global_ret.push(0);
                        }
                    }
                    /*global_ret.map(function(value, i, n) {
                        global_ret[i] = [-value, i]
                    });
                    global_ret.sort();
                    var tmp = global_ret.slice();
                    tmp.map(function(value, i, n) {
                        if (i < 500)
                            global_ret[value[1]] = 1;//value[0];
                        else
                            global_ret[value[1]] = 0;
                    });*/
                    song.start();
                    global_start = audioCtx.currentTime;
                    loop();
                };
            }, function (e) {
                "Error with decoding audio data" + e.err;
            });
        };
        request.send();
    }
    function loop() {
        makeFullPage();
        var time = audioCtx.currentTime - global_start;
        while (time - num * STEP >= 0) {
            num++;
            console.log(num);
        }
        var value = global_ret[num];
        console.log(time + " " + value + " " + num);
        var r = value, g = value, b = value;
        posBuf.uploadData(new Float32Array([
            -1,
            -1,
            -1,
            1,
            1,
            1,
            1,
            -1
        ]));
        colBuf.uploadData(new Float32Array([
            r,
            g,
            b,
            1,
            r,
            g,
            b,
            1,
            r,
            g,
            b,
            1,
            r,
            g,
            b,
            1
        ]));
        indBuf.uploadData(new Uint16Array([
            0,
            1,
            2,
            0,
            2,
            3
        ]));
        shader.vertexAttribute('position', posBuf);
        shader.vertexAttribute('color', colBuf);
        shader.draw(canvas.width, canvas.height, gl.TRIANGLES, indBuf);
        window.requestAnimationFrame(loop);
    }
})(rectangle || (rectangle = {}));
