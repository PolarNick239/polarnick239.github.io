var webgl_commons_gl;

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



var none_buffer = null;

function VertexBufferObject(target) {
    this.target = target || webgl_commons_gl.ARRAY_BUFFER;
    if (!none_buffer) {
        none_buffer = webgl_commons_gl.createBuffer();
    }
    this.handle = webgl_commons_gl.createBuffer();
}

VertexBufferObject.prototype.bind = function() {
    webgl_commons_gl.bindBuffer(this.target, this.handle);
};

VertexBufferObject.prototype.unbind = function() {
    //webgl_commons_gl.bindBuffer(this.target, none_buffer);
};