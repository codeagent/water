import {Shader} from './Shader';
import {Texture} from './Texture';
import {Mesh} from './Mesh';
import {Scene} from './Scene';

export class AssetsManager
{
    public constructor(public engine)
    {
    }

    public loadShader(vertexUrl:string, fragmentUrl:string):Promise<Shader>
    {
        return Promise
            .all<string>([fetch(vertexUrl).then(r => r.text()), fetch(fragmentUrl).then(r => r.text())])
            .then<Shader>((programs:string[]) =>
            {
                let shader = new Shader(programs[0], programs[1], this.engine);
                shader.compile();
                shader.link();
                return shader;
            });
    }

    public loadImage(name:string, url:string):Promise<HTMLImageElement>
    {
        return new Promise((resolve, reject) =>
        {
            let img = new Image();
            img.onload = () =>
            {
                resolve(img);
            };
            img.onerror = reject;
            img.src = url;
        })
            .then((img:HTMLImageElement) =>
            {
                this.engine.images[name] = img;
                return img;
            });
    }

    public loadTexture(name:string, url:string, format:"rgb"|"rgba" = "rgb"):Promise<Texture>
    {
        return this
            .loadImage(name, url)
            .then(() => {
                return new Texture(name, name, format == "rgb" ? this.engine.gl.RGB : this.engine.gl.RGBA, this.engine);
            });
    }

    public loadMesh(url:string, scene:Scene):Promise<Mesh>
    {
        return fetch(url)
            .then(r => r.json())
            .then(json => {
                let mesh = Mesh.create(json.name, scene, {
                    positions: json.positions,
                    indices: json.indices,
                    normals: json.normals,
                    uvs: [json.uvs as number[]]
                });
                mesh.position = json.position;
                mesh.rotationX = json.rotation[0];
                mesh.rotationY = json.rotation[1];
                mesh.rotationZ = json.rotation[2];
                mesh.scale = json.scaling;
                return mesh;
            });
    }
}