export interface Mesh {
    readonly vertexSize : number;
    readonly positionOffset : number;
    readonly colorOffset : number;
    readonly UVOffset : number;
    readonly vertexCount : number;
    readonly vertexArray : Float32Array;
    readonly indexArray : Uint16Array;
}