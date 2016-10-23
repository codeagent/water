import {Material} from "../Material";
import {Mesh} from '../Mesh';

export class Shadeless extends Material
{
    public diffuseTexture:string;

    public applyTo(mesh:Mesh)
    {
        this.engine.gl.cullFace(this.engine.gl.FRONT);
        this.shader.use();
        this.shader.attributes.uv("uv", mesh.uvBuffers[0]);
        this.shader.attributes.position = mesh.positionBuffer;

        
        this.shader.uniforms.sampler("texture", this.engine.textures[this.diffuseTexture].object, 0);
        this.shader.uniforms.matrix3("textureMatrix", this.engine.textures[this.diffuseTexture].matrix);
        this.shader.uniforms.matrix4("modelMatrix", mesh.matrix);
        this.shader.uniforms.matrix4("viewMatrix", mesh.scene.camera.viewMatrix);
        this.shader.uniforms.matrix4("projectionMatrix", mesh.scene.camera.projectionMatrix);
        this.shader.uniforms.vector4("clipPlane", Material.clipPlane);
        this.shader.uniforms.integer("useClipPlane", Material.useClipPlane);
    }
}