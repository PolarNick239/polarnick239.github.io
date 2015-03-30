///<reference path="gl.ts"/>

module matrix {

    export function start(htmlCanvas:HTMLCanvasElement, matrix_vshader:string, matrix_fshader:string, fontsUrl:string) {
        var drawer = new MatrixDrawer(htmlCanvas, matrix_vshader, matrix_fshader, fontsUrl);
        drawer.initialize();
        window.requestAnimationFrame(drawer.loop.bind(drawer));
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

        constructor(htmlCanvas:HTMLCanvasElement, matrix_vshader:string, matrix_fshader:string, fontsUrl:string) {
            this.canvas = htmlCanvas;
            this.vshader = matrix_vshader;
            this.fshader = matrix_fshader;
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

            fontsImage.onload = function() {
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
            this.shader.uniformF('uTime', (new Date().getTime() - this.startTime)/1000.0);
        }

        updateBuffers() {
            var columnX = 1.0;
            var startY = 0.0;
            var startTime = 1.0;
            var endY = 60.0;
            var traceLength = 15.0;
            var columnX2 = 6.0;
            var startY2 = 0.0;
            var startTime2 = 5.0;
            var endY2 = 50.0;
            var traceLength2 = 30.0;
            this.stripesPositionsBuf.uploadData(new Float32Array([
                columnX, startY,
                columnX + 1.0, startY,
                columnX, endY,
                columnX + 1.0, endY,
                columnX2, startY2,
                columnX2 + 1.0, startY2,
                columnX2, endY2,
                columnX2 + 1.0, endY2
            ]));
            this.stripesStartTimeBuf.uploadData(new Float32Array([
                startTime, startTime, startTime, startTime,
                startTime2, startTime2, startTime2, startTime2
            ]));
            this.stripesStartYBuf.uploadData(new Float32Array([
                startY, startY, startY, startY,
                startY2, startY2, startY2, startY2
            ]));
            this.stripesEndYBuf.uploadData(new Float32Array([
                endY, endY, endY, endY,
                endY2, endY2, endY2, endY2
            ]));
            this.stripesTraceLengthBuf.uploadData(new Float32Array([
                traceLength, traceLength, traceLength, traceLength,
                traceLength2, traceLength2, traceLength2, traceLength2
            ]));
            this.stripesIndicesBuf.uploadData(new Uint16Array([
                0, 1, 2,
                1, 2, 3,
                4, 5, 6,
                5, 6, 7
            ]));
        }

        draw() {
            var gl = webgl.gl;
            gl.enable(gl.DEPTH_TEST);
            gl.clearColor(0.0, 0.1, 0.0, 1.0);
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
                this.updateCanvasSize(this.canvas);
                this.updateUniforms();
                this.updateBuffers();
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
            }
        }
    }

}