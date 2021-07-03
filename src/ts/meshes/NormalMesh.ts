import { Mesh } from "./Mesh";

export interface NormalMesh extends Mesh {
    readonly normalOffset: number;
}