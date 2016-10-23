import {Shader} from '../Shader';
import {Engine} from '../Engine';

export class Attributes
{
    protected positionBuffer:WebGLBuffer;
    protected normalBuffer:WebGLBuffer;
    protected uvBuffers:{[index:string]:WebGLBuffer} = {};

    protected positionAttributeLocation;
    protected normalAttributeLocation;
    protected uvAttributeLocations:{[index:string]:number} = {};

    public constructor(protected shader:Shader, protected engine:Engine)
    {
        this.initialize();
    }

    public initialize()
    {
        let gl = this.engine.gl;
        this.positionAttributeLocation = gl.getAttribLocation(this.shader.program, "position");
        if(this.positionAttributeLocation != -1) {
            gl.enableVertexAttribArray(this.positionAttributeLocation);
        }

        this.normalAttributeLocation = gl.getAttribLocation(this.shader.program, "normal");
        if(this.normalAttributeLocation != -1) {
            gl.enableVertexAttribArray(this.normalAttributeLocation);
        }
        
    }

    public set position(buffer:WebGLBuffer)
    {
        this.positionBuffer = buffer;
        let gl = this.engine.gl;
        gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer);
        gl.vertexAttribPointer(this.positionAttributeLocation, 3, gl.FLOAT, false, 0, 0);
    }

    public set normal(buffer:WebGLBuffer)
    {
        this.normalBuffer = buffer;
        let gl = this.engine.gl;
        gl.bindBuffer(gl.ARRAY_BUFFER, this.normalBuffer);
        gl.vertexAttribPointer(this.normalAttributeLocation, 3, gl.FLOAT, false, 0, 0);
    }

    public uv(name:string, buffer:WebGLBuffer)
    {
        let gl = this.engine.gl;

        if (!(name in this.uvAttributeLocations))
            this.uvAttributeLocations[name] = gl.getAttribLocation(this.shader.program, name);

        if (this.uvAttributeLocations[name] != -1) {
            this.uvBuffers[name] = buffer;
            gl.enableVertexAttribArray(this.uvAttributeLocations[name]);
            gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
            gl.vertexAttribPointer(this.uvAttributeLocations[name], 2, gl.FLOAT, false, 0, 0);
        }
        else {
            this.engine.logger.warn(`Attribute variable '${name}' not found in this shader program.`);
        }
    }

}
