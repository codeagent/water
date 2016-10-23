declare type Color = number[]|GLM.IArray;
declare type Color4 = [number, number, number, number]|GLM.IArray;
declare type Color3 = [number, number, number]|GLM.IArray;

declare type Vector = number[]|GLM.IArray;
declare type Vector4 = [number, number, number, number]|GLM.IArray;
declare type Vector3 = [number, number, number]|GLM.IArray;
declare type Vector2 = [number, number]|GLM.IArray;

declare type Matrix = number[]|GLM.IArray;
declare type Matrix4 = Matrix;
declare type Matrix3 = Matrix;

declare type MeshData = {positions:number[], indices:number[], normals:number[], uvs:number[][]};

declare type Viewport = {width:number, height:number};

declare interface Light {
    diffuse:Color3;
    specular:Color3;
    intensity:number
}
declare interface DirectionLight extends Light {
    direction: Vector3
}

declare interface Resource
{
    free();
}