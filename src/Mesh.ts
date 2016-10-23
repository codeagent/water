import {Scene} from './Scene';
import {Material} from "./Material";
import IArray = GLM.IArray;

export class Mesh implements Resource
{
    public positionBuffer:WebGLBuffer;
    public normalBuffer:WebGLBuffer;
    public uvBuffers:WebGLBuffer[] = [];
    public indexBuffer:WebGLBuffer;
    public indexCount = 0;

    public material:string;

    protected _matrix:IArray = mat4.create();

    public position:IArray = vec3.create();
    public scale:IArray = [1.0, 1.0, 1.0];
    public rotationX:number = 0.0;
    public rotationY:number = 0.0;
    public rotationZ:number = 0.0;

    public constructor(public name:string, public scene:Scene)
    {
        this.scene.meshes[name] = this;
    }

    public get matrix()
    {
        mat4.identity(this._matrix);
        mat4.translate(this._matrix, this._matrix, this.position);
        mat4.rotateX(this._matrix, this._matrix, this.rotationX);
        mat4.rotateY(this._matrix, this._matrix, this.rotationY);
        mat4.rotateZ(this._matrix, this._matrix, this.rotationZ);
        mat4.scale(this._matrix, this._matrix, this.scale);

        return this._matrix;
    }

    public render()
    {
        let gl = this.scene.engine.gl;
        this.scene.engine.materials[this.material].applyTo(this);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
        gl.drawElements(gl.TRIANGLES, this.indexCount, gl.UNSIGNED_SHORT, 0);
    }

    public free()
    {
        // @todo:
    }

    public static create(name:string, scene:Scene, data:MeshData):Mesh
    {
        let gl = scene.engine.gl;

        let positionsBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, positionsBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data.positions), gl.STATIC_DRAW);

        let normalsBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, normalsBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data.normals), gl.STATIC_DRAW);

        let indicesBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indicesBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(data.indices), gl.STATIC_DRAW);

        let uvBuffers = [];
        for(let uv of data.uvs) {
            let uvBuffer = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, uvBuffer);
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(uv), gl.STATIC_DRAW);
            uvBuffers.push(uvBuffer);
        }

        let mesh = new Mesh(name, scene);
        mesh.positionBuffer = positionsBuffer;
        mesh.normalBuffer = normalsBuffer;
        mesh.indexBuffer = indicesBuffer;
        mesh.uvBuffers = uvBuffers;
        mesh.indexCount = data.indices.length;

        return mesh;
    }
}