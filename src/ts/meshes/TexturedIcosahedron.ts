import { fetchImage } from "../utility/Fetch";
import { Icosahedron } from "./Icosahedron";
import { IndexedTexturedMesh } from "./IndexedTexturedMesh"

export class TexturedIcosahedron extends Icosahedron implements IndexedTexturedMesh {
    readonly texture: Promise<ImageBitmap>;
    readonly normalmap: Promise<ImageBitmap>;

    constructor(texture_location: string) {
        super();
        this.texture = fetchImage(texture_location);
    }
}