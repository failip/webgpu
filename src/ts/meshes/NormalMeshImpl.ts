import { IndexedMesh } from "./IndexedMesh";
import { NormalMesh } from "./NormalMesh";

export class NormalMeshImpl implements NormalMesh, IndexedMesh {
    readonly normalOffset: number;
    readonly vertexSize: number;
    readonly positionOffset: number;
    readonly vertexCount: number;
    readonly vertexArray: Float32Array;
    readonly indexArray: Uint16Array;

    constructor(position_offset: number, normal_offset: number, vertex_size: number, vertex_count: number, vertex_array: Float32Array, index_array: Uint16Array) {
        this.normalOffset = normal_offset;
        this.positionOffset = position_offset;
        this.vertexSize = vertex_size;
        this.vertexCount = vertex_count;
        this.vertexArray = vertex_array;
        this.indexArray = index_array;
    }

}