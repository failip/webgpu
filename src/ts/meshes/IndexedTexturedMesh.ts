import { IndexedMesh } from "./IndexedMesh";

export interface IndexedTexturedMesh extends IndexedMesh {
    readonly texture: Promise<ImageBitmap>;
    readonly normalmap: Promise<ImageBitmap>;
}