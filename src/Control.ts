import {Camera} from './Camera';

export class Control
{
    private spyCursor = false;
    private cursorPos = {x: 0, y: 0};
    protected camera:Camera;
    public moveSpeed:number = 0.1;
    public rotateSpeed = 0.005;
    public radius = 10.0;
    public alpha = 0.0;
    public betta = 0.0;

    public constructor(public canvas:HTMLCanvasElement)
    {
        this.canvas.addEventListener("mousedown", (e) =>
        {
            this.mouseDown(e);
        });
        this.canvas.addEventListener("mouseup", () =>
        {
            this.mouseUp();
        });
        this.canvas.addEventListener("mousemove", (e) =>
        {
            this.mouseMove(e);
        });
    }

    public attachTo(camera:Camera)
    {
        this.camera = camera;
        this.calcAngles();
    }

    public destroy()
    {
        this.canvas.removeEventListener("mousedown", this.mouseDown);
        this.canvas.removeEventListener("mouseup", this.mouseUp);
        this.canvas.removeEventListener("mousemove", this.mouseMove);
    }

    protected mouseDown(event)
    {
        this.spyCursor = true;
        this.cursorPos.x = event.clientX;
        this.cursorPos.y = event.clientY;
    }

    protected mouseUp()
    {
        this.spyCursor = false;
        this.calcAngles();
    }

    protected mouseMove(event:MouseEvent)
    {
        if (this.spyCursor) {

            let position = [this.radius, 0.0, 0.0];
            let alpha = Math.PI * (event.clientX - this.cursorPos.x) * this.rotateSpeed + this.alpha;
            let betta = Math.PI * (event.clientY - this.cursorPos.y) * this.rotateSpeed + this.betta;
            vec3.rotateZ(position, position, [0, 0, 0], betta);
            vec3.rotateY(position, position, [0, 0, 0], alpha);

            this.camera.position = position;
        }
    }

    private calcAngles()
    {
        let line = vec3.create();
        vec3.sub(line, this.camera.target, this.camera.position);
        this.radius = vec3.len(line);

        this.alpha = -Math.atan(line[2] / line[0]);
        this.betta = Math.acos(line[1] / this.radius);
    }
}