import {Mesh} from './Mesh';
import {Engine} from './Engine';
import {Shader} from './Shader';

export class Material
{
    public static clipPlane = [0.0, 1.0, 0.0, 0];
    public static useClipPlane = 0;

    public ambient:Color3 = [0.0, 0.0, 0.0];
    public diffuse:Color3 = [1.0, 1.0, 1.0];
    public specular:Color3 = [0.5, 0.5, 0.5];
    public emissive:Color3 = [0.0, 0.0, 0.0];
    public roughness:number = 40;
    
    constructor(public name:string, public shader:Shader, public engine:Engine)
    {
        this.engine.materials[name] = this;
    }

    public applyTo(mesh:Mesh)
    {
        this.shader.use();
        
        // set attributes
        this.shader.attributes.position = mesh.positionBuffer;
        this.shader.attributes.normal = mesh.normalBuffer;
       
        // set uniforms
        // 1. material settings
        this.shader.uniforms.vector3("materialAmbient", this.ambient);
        this.shader.uniforms.vector3("materialDiffuse", this.diffuse);
        this.shader.uniforms.vector3("materialSpecular", this.specular);
        this.shader.uniforms.vector3("materialEmissive", this.emissive);
        this.shader.uniforms.float("materialRoughness", this.roughness);
        this.shader.uniforms.vector3("worldAmbient", mesh.scene.ambient);
        this.shader.uniforms.vector4("clipPlane", Material.clipPlane);
        this.shader.uniforms.integer("useClipPlane", Material.useClipPlane);

        // 2. scene matrices
        this.shader.uniforms.matrix4("modelMatrix", mesh.matrix);
        this.shader.uniforms.matrix4("viewMatrix", mesh.scene.camera.viewMatrix);
        this.shader.uniforms.matrix4("viewPosition", mesh.scene.camera.position);
        this.shader.uniforms.matrix4("projectionMatrix", mesh.scene.camera.projectionMatrix);
    }

}