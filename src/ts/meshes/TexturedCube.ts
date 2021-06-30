import { IndexedTexturedMesh } from "./IndexedTexturedMesh";
import { Cube } from "./Cube";
import { fetchImage } from "../utility/Fetch";

export class TexturedCube extends Cube implements IndexedTexturedMesh {
    readonly texture: Promise<ImageBitmap>;

    constructor(texture_location: string) {
        super();
        this.texture = fetchImage(texture_location);
    }
}