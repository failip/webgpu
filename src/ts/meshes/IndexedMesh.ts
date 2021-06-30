import { Mesh } from "./Mesh";

export interface IndexedMesh extends Mesh {
    readonly indexArray: Uint16Array;
}