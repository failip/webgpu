import { IndexedMesh } from "./IndexedMesh";

export class Icosahedron implements IndexedMesh {
    readonly vertexSize = 4 * 10; // Byte size of one cube vertex.
    readonly positionOffset = 0;
    readonly colorOffset = 4 * 4; // Byte offset of cube vertex color attribute.
    readonly UVOffset = 4 * 8;
    readonly vertexCount = 12;
    readonly vertexArray: Float32Array;
    readonly indexArray: Uint16Array;
    constructor() {
        const X: number = 0.525731112119133606;
        const Z: number = 0.850650808352039932;
        const N: number = 0.0;
        this.vertexArray = new Float32Array([
            -X, N, Z, 1, 1, 0, 1, 1, 1, 1,
            X, N, Z, 1, 0, 0, 1, 1, 0, 1,
            -X, N, -Z, 1, 0, 0, 0, 1, 0, 0,
            X, N, -Z, 1, 0, 0, 0, 1, 0, 0,

            N, Z, X, 1, 1, 0, 0, 1, 1, 0,
            N, Z, -X, 1, 1, 0, 1, 1, 1, 1,
            N, -Z, X, 1, 0, 0, 0, 1, 0, 0,
            N, -Z, -X, 1, 1, 1, 1, 1, 1, 1,

            Z, X, N, 1, 1, 0, 1, 1, 0, 1,
            -Z, X, N, 1, 1, 0, 0, 1, 0, 0,
            Z, -X, N, 1, 1, 1, 0, 1, 1, 0,
            -Z, -X, N, 1, 1, 1, 1, 1, 1, 1,
        ]);
        this.indexArray = new Uint16Array([
            0, 4, 1, 0, 9, 4, 9, 5, 4, 4, 5, 8,
            4, 8, 1, 8, 10, 1, 8, 3, 10, 5, 3, 8,
            5, 2, 3, 2, 7, 3, 7, 10, 3, 7, 6, 10,
            7, 11, 6, 11, 0, 6, 0, 1, 6, 6, 1, 10,
            9, 0, 11, 9, 11, 2, 9, 2, 5, 7, 2, 11])
    }

}

