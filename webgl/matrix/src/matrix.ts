///<reference path="gl.ts"/>

module matrix {

    export function start(htmlCanvas:HTMLCanvasElement, matrix_vshader:string, matrix_fshader:string, fontsUrl:string) {
        var drawer = new MatrixDrawer(htmlCanvas, matrix_vshader, matrix_fshader, fontsUrl);
        drawer.initialize();
        window.requestAnimationFrame(drawer.loop.bind(drawer));
    }

    class Strip {
        columnX;
        startTime;
        startY;
        endY;
        traceLength;

        constructor(columnX, startTime, startY, endY, traceLength) {
            this.columnX = columnX;
            this.startTime = startTime;
            this.startY = startY;
            this.endY = endY;
            this.traceLength = traceLength;
        }

    }

    function getRandomInRange(min, max) {
        return Math.random() * (max - min) + min;
    }

    class MatrixDrawer {

        canvas:HTMLCanvasElement;
        vshader:string;
        fshader:string;
        fontsUrl:string;

        glContext:webgl.GLContext;
        shader:webgl.Shader;

        startTime:number;

        stripesPositionsBuf:webgl.ArrayBuffer;
        stripesStartYBuf:webgl.ArrayBuffer;
        stripesStartTimeBuf:webgl.ArrayBuffer;
        stripesEndYBuf:webgl.ArrayBuffer;
        stripesTraceLengthBuf:webgl.ArrayBuffer;

        stripesIndicesBuf:webgl.ElementArrayBuffer;

        fontsTex:webgl.Texture2D;
        fontsAreLoaded:boolean;

        symbolSizeX=5.0*2.0;
        symbolSizeY=8.0*2.0;

        constructor(htmlCanvas:HTMLCanvasElement, matrix_vshader:string, matrix_fshader:string, fontsUrl:string) {
            this.canvas = htmlCanvas;
            this.vshader = matrix_vshader
                .split('SYMBOL_SIZE_X').join(this.symbolSizeX.toString())
                .split('SYMBOL_SIZE_Y').join(this.symbolSizeY.toString());
            this.fshader = matrix_fshader
                .split('SYMBOL_SIZE_X').join(this.symbolSizeX.toString())
                .split('SYMBOL_SIZE_Y').join(this.symbolSizeY.toString());
            this.fontsUrl = fontsUrl;
            this.fontsAreLoaded = false;
            this.startTime = null;
        }

        initialize() {
            this.glContext = new webgl.GLContext(this.canvas);

            this.glContext.activate();
            this.shader = new webgl.Shader(this.vshader, this.fshader);
            this.glContext.deactivate();

            this.initializeBuffers();
            this.initializeFonts();
        }

        initializeBuffers() {
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
        }

        initializeFonts() {
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
        }

        updateUniforms() {
            this.shader.uniformF('uTime', (new Date().getTime() - this.startTime) / 1000.0);
        }

        updateBuffers(strips) {
            var n = strips.length;

            var positions = new Float32Array(n * 4 * 2);
            var startTimes = new Float32Array(n * 4);
            var startYs = new Float32Array(n * 4);
            var endYs = new Float32Array(n * 4);
            var traceLengths = new Float32Array(n * 4);
            var indices = new Uint16Array(n * 2 * 3);

            var deltaIndices = [
                0, 1, 2,
                1, 2, 3
            ];
            for (var i = 0; i < n; i++) {
                var stripe = strips[i];
                var xys = [
                    stripe.columnX, stripe.startY,
                    stripe.columnX + 1.0, stripe.startY,
                    stripe.columnX, stripe.endY,
                    stripe.columnX + 1.0, stripe.endY
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
        }

        generateStrips() {
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
        }

        draw() {
            var gl = webgl.gl;
            gl.enable(gl.DEPTH_TEST);
            gl.clearColor(0.0, 0.05, 0.0, 1.0);
            gl.clearDepth(1.0);
            gl.clear(gl.COLOR_BUFFER_BIT || gl.DEPTH_BUFFER_BIT);

            this.shader.drawElements(this.canvas.width, this.canvas.height, gl.TRIANGLES, this.stripesIndicesBuf);
        }

        loop() {
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
        }

        updateCanvasSize(canvas:HTMLCanvasElement) {
            if (canvas.width != canvas.clientWidth ||
                canvas.height != canvas.clientHeight) {
                canvas.width = canvas.clientWidth;
                canvas.height = canvas.clientHeight;
                this.shader.uniformF('uScreenSize', canvas.width, canvas.height);
                return true;
            } else {
                return false;
            }
        }
    }

}