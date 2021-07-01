import { IndexedTexturedMesh } from "./IndexedTexturedMesh";
import { Cube } from "./Cube";
import { fetchImage } from "../utility/Fetch";

export class TexturedCube extends Cube implements IndexedTexturedMesh {
    readonly texture: Promise<ImageBitmap>;
    readonly normalmap: Promise<ImageBitmap>;

    constructor(texture_location: string, normal_location: string) {
        super();
        this.texture = fetchImage(texture_location);
        this.normalmap = fetchImage(normal_location);
    }
}