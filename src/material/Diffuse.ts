import {Material} from "../Material";
import {Mesh} from '../Mesh';

export class Diffuse extends Material
{
    public diffuseTexture:string;

    public applyTo(mesh:Mesh)
    {
        super.applyTo(mesh);
        this.engine.gl.cullFace(this.engine.gl.BACK);
        this.shader.attributes.uv("uv", mesh.uvBuffers[0]);

        this.shader.uniforms.vector3("sunDirection", mesh.scene.sun.direction);
        this.shader.uniforms.vector3("sunDiffuse", mesh.scene.sun.diffuse);
        this.shader.uniforms.vector3("sunSpecular", mesh.scene.sun.specular);
        this.shader.uniforms.float("intensity", mesh.scene.sun.intensity);
        this.shader.uniforms.sampler("texture", this.engine.textures[this.diffuseTexture].object, 0);
        this.shader.uniforms.matrix3("textureMatrix", this.engine.textures[this.diffuseTexture].matrix);
    }
}