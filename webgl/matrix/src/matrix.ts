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

        cornerPositionsBuf:webgl.ArrayBuffer;

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
            this.cornerPositionsBuf = new webgl.ArrayBuffer(2, gl.FLOAT);
            this.cornerPositionsBuf.uploadData(new Float32Array([
                -1, -1,
                -1, 1,
                1, 1,
                1, -1
            ]));
            this.shader.vertexAttribute('aPosition', this.cornerPositionsBuf);
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

        loop() {
            if (this.fontsAreLoaded) {
                if (!this.startTime) {
                    this.startTime = new Date().getTime();
                }
                this.updateCanvasSize(this.canvas);

                var gl = this.glContext.activate();

                gl.clearColor(0.0, 0.0, 0.1, 1.0);
                this.shader.uniformF('uTime', (new Date().getTime() - this.startTime)/1000.0);
                this.shader.drawArrays(this.canvas.width, this.canvas.height, gl.TRIANGLE_FAN, 4);

                this.glContext.deactivate();
            }
            window.requestAnimationFrame(this.loop.bind(this));
        }

        updateCanvasSize(canvas:HTMLCanvasElement) {
            if (canvas.width != canvas.clientWidth ||
                canvas.height != canvas.clientHeight) {
                canvas.width = canvas.clientWidth;
                canvas.height = canvas.clientHeight;
                this.glContext.activate();
                this.shader.uniformF('uScreenSize', canvas.width, canvas.height);
                this.glContext.deactivate();
            }
        }
    }

}