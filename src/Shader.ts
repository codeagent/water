import {Engine} from './Engine';
import {Attributes} from './shader/Attributes';
import {Uniforms} from './shader/Uniforms';

export class Shader implements Resource
{
    public vertexShader:WebGLShader;
    public fragmentShader:WebGLShader;
    public program:WebGLProgram;

    protected _attributes:Attributes;
    protected _uniforms:Uniforms;

    public constructor(protected vertexShaderSrc:string, protected fragmentShaderSrc:string, protected engine:Engine)
    {
    }

    public compile():boolean
    {
        let gl = this.engine.gl;

        this.vertexShader = gl.createShader(gl.VERTEX_SHADER);
        gl.shaderSource(this.vertexShader, this.vertexShaderSrc);
        gl.compileShader(this.vertexShader);

        if (!gl.getShaderParameter(this.vertexShader, gl.COMPILE_STATUS)) {
            this.engine.logger.error(gl.getShaderInfoLog(this.vertexShader));
            return false;
        }

        this.fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
        gl.shaderSource(this.fragmentShader, this.fragmentShaderSrc);
        gl.compileShader(this.fragmentShader);

        if (!gl.getShaderParameter(this.fragmentShader, gl.COMPILE_STATUS)) {
            this.engine.logger.error(gl.getShaderInfoLog(this.fragmentShader));
            return false;
        }

        return true;
    }

    public link():boolean
    {
        let gl = this.engine.gl;
        this.program = gl.createProgram();
        gl.attachShader(this.program, this.vertexShader);
        gl.attachShader(this.program, this.fragmentShader);
        gl.linkProgram(this.program);

        if (!gl.getProgramParameter(this.program, gl.LINK_STATUS)) {
            this.engine.logger.error(gl.getProgramInfoLog(this.program));
            return false;
        }

        this._attributes = new Attributes(this, this.engine);
        this._uniforms = new Uniforms(this, this.engine);

        return true;
    }

    public get attributes():Attributes
    {
        if (this._attributes)
            return this._attributes;

        this.engine.logger.warn("Shader must be compiled and linked before an accessing to attributes.");
        return null;
    }

    public get uniforms():Uniforms
    {
        if (this._uniforms)
            return this._uniforms;

        this.engine.logger.warn("Shader must be compiled and linked before an accessing to uniforms.");
        return null;
    }

    public use()
    {
        this.engine.gl.useProgram(this.program);
    }
    
    public free()
    {
        // @todo:
    }
}