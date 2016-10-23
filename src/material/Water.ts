import {Material} from "../Material";
import {Mesh} from '../Mesh';
import {FrameBuffer} from '../FrameBuffer';
import {Shader} from '../Shader';
import {Engine} from '../Engine';

export class Water extends Material
{
    public normalTexture:string;
    public reflectionBuffer:FrameBuffer;
    public refractionBuffer:FrameBuffer;

    public wind:Vector2 = [0.01, 0.01];
    public wave:Vector2 = [0.4, 0.02];
    public color:Vector3 = [0.9, 1.0, 1.0];

    protected time = 0;
    protected windMatrix = mat3.create();
    protected offsetDate = Date.now();

    public constructor(public name:string, public shader:Shader, public engine:Engine)
    {
        super(name, shader, engine);
        this.reflectionBuffer = new FrameBuffer(this.engine.canvas.width, this.engine.canvas.height, this.engine);
        this.refractionBuffer = new FrameBuffer(this.engine.canvas.width, this.engine.canvas.height, this.engine);
    }

    public applyTo(mesh:Mesh)
    {
        delete this.engine.scene.meshes[mesh.name];
        this.renderReflection();
        this.renderRefraction();

        this.engine.scene.meshes[mesh.name] = mesh;

        this.engine.gl.cullFace(this.engine.gl.FRONT);
        this.shader.use();
        this.shader.attributes.position = mesh.positionBuffer;
        this.shader.attributes.normal = mesh.normalBuffer;
        this.shader.attributes.uv("uv", mesh.uvBuffers[0]);

        this.shader.uniforms.matrix4("modelMatrix", mesh.matrix);
        this.shader.uniforms.matrix4("viewMatrix", mesh.scene.camera.viewMatrix);
        this.shader.uniforms.matrix4("projectionMatrix", mesh.scene.camera.projectionMatrix);
        this.shader.uniforms.vector3("viewPosition", mesh.scene.camera.position);
        this.shader.uniforms.vector4("clipPlane", Material.clipPlane);
        this.shader.uniforms.integer("useClipPlane", 0);
        this.shader.uniforms.matrix3('windMatrix', this.windMatrix);
        this.shader.uniforms.vector2('wave', this.wave);
        this.shader.uniforms.sampler('normalTexture', this.engine.textures[this.normalTexture].object, 0);
        this.shader.uniforms.sampler('reflectionTexture', this.reflectionBuffer.texture, 1);
        this.shader.uniforms.sampler('refractionTexture', this.refractionBuffer.texture, 2);
        this.shader.uniforms.vector3('color', this.color);
        this.shader.uniforms.vector3("sunDirection", mesh.scene.sun.direction);
        this.shader.uniforms.vector3("sunSpecular", mesh.scene.sun.specular);

        this.time = (Date.now() - this.offsetDate) / 1000;
        mat3.identity(this.windMatrix);
        mat3.translate(this.windMatrix, this.windMatrix, [this.wind[0] * this.time, this.wind[1] * this.time]);
    }


    private renderRefraction()
    {
        Material.clipPlane = [0.0, -1.0, 0.0, 0.05];
        Material.useClipPlane = 1;
        this.refractionBuffer.activate();
        this.engine.scene.render();
        this.refractionBuffer.deactivate();
        Material.useClipPlane = 0;
    }

    private renderReflection()
    {
        Material.clipPlane = [0.0, 1.0, 0.0, 0.01];
        Material.useClipPlane = 1;
        this.reflectionBuffer.activate();
        this.engine.scene.camera.position[1] = -this.engine.scene.camera.position[1];
        this.engine.scene.camera.up[1] = -this.engine.scene.camera.up[1];
        this.engine.scene.render();
        this.engine.scene.camera.up[1] = -this.engine.scene.camera.up[1];
        this.engine.scene.camera.position[1] = -this.engine.scene.camera.position[1];
        this.reflectionBuffer.deactivate();
        Material.useClipPlane = 0;
    }
}