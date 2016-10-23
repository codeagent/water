import {Engine} from './Engine';
import {Scene} from './Scene';
import {Diffuse} from './material/Diffuse';
import {Shadeless} from './material/Shadeless';
import {Water} from './material/Water';
import {Camera} from './Camera';
import {Control} from './Control';

let canvas = <HTMLCanvasElement>document.getElementById("viewport");
let engine = new Engine(canvas);
let scene = new Scene(engine, [0.0, 0.0, 0.0]);

Promise
    .all([
        engine.assets.loadMesh("assets/water.json", scene),
        engine.assets.loadMesh("assets/ground.json", scene),
        engine.assets.loadMesh("assets/skybox.json", scene),

        engine.assets.loadShader("assets/shaders/diffuse.vertex.fx", "assets/shaders/diffuse.fragment.fx"),
        engine.assets.loadShader("assets/shaders/shadeless.vertex.fx", "assets/shaders/shadeless.fragment.fx"),
        engine.assets.loadShader("assets/shaders/water.vertex.fx", "assets/shaders/water.fragment.fx"),

        engine.assets.loadTexture("skybox", "assets/skybox.jpg"),
        engine.assets.loadTexture("ground", "assets/ground.jpg"),
        engine.assets.loadTexture("wave", "assets/wave.png")
    ])
    .then((assets:any) =>
    {
        let time = 0;
        let water = assets[0], ground = assets[1], skybox = assets[2];

        let skyboxMaterial = new Shadeless("skybox", assets[4], engine);
        skyboxMaterial.diffuseTexture = "skybox";
        skybox.material = "skybox";

        let groundMaterial = new Diffuse("ground", assets[3], engine);
        groundMaterial.diffuseTexture = "ground";
        ground.material = "ground";

        let waterMaterial = new Water("water", assets[5], engine);
        waterMaterial.normalTexture = "wave";
        water.material = "water";
        
        let camera = new Camera([0.0, 5.0, -5.0], [0, 0.0, 0], scene);
        camera.fov = 45;

        let control = new Control(canvas);
        control.attachTo(camera);

        // delete scene.meshes.Water;
        engine.loop(() => {
            // assets[7].offset[0] = Math.PI * time;
            time += 0.001;

            // scene.meshes['Skybox'].rotationZ = Math.PI * time;
        });

    });

