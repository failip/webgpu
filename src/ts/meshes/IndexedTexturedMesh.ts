import { IndexedMesh } from "./IndexedMesh";

export interface IndexedTexturedMesh extends IndexedMesh {
    readonly texture: string;
}