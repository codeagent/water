import {Engine} from './Engine';
import {Mesh} from './Mesh';
import {Camera} from './Camera';
import IArray = GLM.IArray;

export class Scene
{
    public camera:Camera;

    public meshes:{[index:string]:Mesh} = {};

    public sun:DirectionLight = {
        direction: [0.0, -1.0, -0.5],
        diffuse: [1.0, 1.0, 1.0],
        specular: [0.7, 0.7, 0.7],
        intensity: 1.0
    };

    public constructor(public engine:Engine, public ambient:Color3)
    {
        this.engine.scene = this;
    }

    public render()
    {
        let gl = this.engine.gl;
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        for (let i in this.meshes)
            this.meshes[i].render();
    }

}
