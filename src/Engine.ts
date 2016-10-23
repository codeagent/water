import IArray = GLM.IArray;
import {Material} from './Material';
import {Texture} from './Texture';
import {Scene} from './Scene';
import {Logger} from './Logger';
import {AssetsManager} from './AssetsManager';

export class Engine
{
    public clearColor:Color3;

    public images:{[index:string]:HTMLImageElement} = {};

    public textures:{[index:string]:Texture} = {};

    public materials:{[index:string]:Material} = {};

    public scene:Scene;

    public gl:WebGLRenderingContext;

    public canvas:HTMLCanvasElement;

    public animationId;

    public logger = new Logger();

    public assets:AssetsManager;

    public constructor(canvas:HTMLCanvasElement, clearColor:IArray = [0.0, 0.0, 0.0])
    {
        this.canvas = canvas;
        this.canvas.width = canvas.clientWidth;
        this.canvas.height = canvas.clientHeight;
        this.clearColor = clearColor;
        this.gl = <WebGLRenderingContext>(canvas.getContext("webgl") || canvas.getContext("experimental-webgl"));
        this.assets = new AssetsManager(this);

        this.initialize();
    }

    public initialize()
    {
        this.gl.enable(this.gl.DEPTH_TEST);
        this.gl.enable(this.gl.CULL_FACE);
        this.gl.cullFace(this.gl.BACK);
        this.gl.clearColor(this.clearColor[0], this.clearColor[1], this.clearColor[2], 1.0);
    }

    public loop(after?:(scene: Scene) => void)
    {
        after = after || (() => {});

        let callable = () =>
        {
            this.scene.render();
            after(this.scene);
            this.animationId = requestAnimationFrame(callable);
        };
        this.animationId = requestAnimationFrame(callable);
    }

    public stop()
    {
        cancelAnimationFrame(this.animationId);
    }
}