import IArray = GLM.IArray;
import {Shader} from '../Shader';
import {Engine} from '../Engine';

export class Uniforms
{
    protected uniforms: {[index:string]:WebGLUniformLocation} = {};

    public constructor(public shader: Shader, protected engine:Engine)
    {
    }

    public sampler(name:string, texture:WebGLTexture, textureUnit:number = 0)
    {
        let gl = this.engine.gl;

        if(this.locationOf(name) != -1)
        {
            gl.activeTexture(gl.TEXTURE0 + textureUnit);
            gl.bindTexture(gl.TEXTURE_2D, texture);
            gl.uniform1i(this.locationOf(name), textureUnit);
        }
    }

    public matrix4(name:string, matrix4: IArray)
    {
        if(this.locationOf(name) != -1)
        {
            this.engine.gl.uniformMatrix4fv(this.locationOf(name), false, <Float32Array>matrix4);
        }
    }

    public matrix3(name: string, matrix3: IArray)
    {
        if(this.locationOf(name) != -1)
        {
            this.engine.gl.uniformMatrix3fv(this.locationOf(name), false, <Float32Array>matrix3);
        }
    }

    public vector4(name: string, vector4: IArray)
    {
        if(this.locationOf(name) != -1)
        {
            this.engine.gl.uniform4fv(this.locationOf(name), new Float32Array(<number[]>vector4));
        }
    }

    public vector3(name: string, vector3: IArray)
    {
        if(this.locationOf(name) != -1)
        {
            this.engine.gl.uniform3fv(this.locationOf(name), new Float32Array(<number[]>vector3));
        }
    }

    public vector2(name: string, vector2: IArray)
    {
        if(this.locationOf(name) != -1)
        {
            this.engine.gl.uniform2fv(this.locationOf(name), new Float32Array(<number[]>vector2));
        }
    }

    public float(name: string, float: number)
    {
        if(this.locationOf(name) != -1)
        {
            this.engine.gl.uniform1f(this.locationOf(name), float);
        }
    }

    public integer(name: string, integer: number)
    {
        if(this.locationOf(name) != -1)
        {
            this.engine.gl.uniform1i(this.locationOf(name), integer);
        }
    }

    protected locationOf(name)
    {
        let gl = this.engine.gl;

        if(!(name in this.uniforms))
            this.uniforms[name] = gl.getUniformLocation(this.shader.program, name);

        if(this.uniforms[name] == -1)
            this.engine.logger.warn(`Uniform variable with name '${name}' not found in this shader program.`);

        return this.uniforms[name];
    }
}