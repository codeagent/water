import {Scene} from './Scene';

export class Camera
{
    protected _viewMatrix:Matrix4;
    protected _projectionMatrix:Matrix4;
    protected _viewport:Viewport;

    public fov = 45;
    public up:Vector3 = [0.0, 1.0, 0.0];
    public near = 1.0;
    public far = 1000.0;
    
    public constructor(public position:Vector3, public target:Vector3, public scene:Scene)
    {
        this.scene.camera = this;
        this._viewMatrix = mat4.create();
        this._projectionMatrix = mat4.create();
        this._viewport = this.scene.engine.canvas;
    }

    public get viewMatrix()
    {
        mat4.lookAt(this._viewMatrix, this.position, this.target, this.up);
        return this._viewMatrix;
    }

    public get projectionMatrix()
    {
        mat4.perspective(this._projectionMatrix, this.fov, this._viewport.width / this._viewport.height, this.near, this.far);
        return this._projectionMatrix;
    }

}