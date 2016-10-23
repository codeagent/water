import {Engine} from './Engine';

export class Texture implements Resource
{
    public object:WebGLTexture;

    public scaling:Vector2 = [1.0, 1.0];
    public offset:Vector2 = [0.0, 0.0];
    public rotation:number = 0.0;

    protected _matrix:Matrix3 = mat3.create();

    public constructor(public name:string, public image:string, public format:number, public engine:Engine)
    {
        this.engine.textures[name] = this;
        this.object = this.create();
    }

    protected create()
    {
        let gl = this.engine.gl;
        let texture = gl.createTexture();
        let image = this.engine.images[this.image];
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texImage2D(gl.TEXTURE_2D, 0, this.format, this.format, gl.UNSIGNED_BYTE, image);

        if(!this.isPowerOf2(image)) {
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
        }
        else {
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
            gl.generateMipmap(gl.TEXTURE_2D);
        }

        gl.bindTexture(gl.TEXTURE_2D, null);
        return texture;
    }

    protected isPowerOf2(image:HTMLImageElement)
    {
        let logW = Math.log2(image.width),
            logH = Math.log2(image.height);

        return !(logW - Math.trunc(logW)) && !(logH - Math.trunc(logH));
    }

    public get matrix()
    {
        mat3.identity(this._matrix);
        mat3.scale(this._matrix, this._matrix, this.scaling);
        mat3.rotate(this._matrix, this._matrix, this.rotation);
        mat3.translate(this._matrix, this._matrix, this.offset);
        return this._matrix;
    }

    public free()
    {
        // @todo:
    }
}