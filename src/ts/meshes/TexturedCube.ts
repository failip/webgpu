import { IndexedTexturedMesh } from "./IndexedTexturedMesh";
import { Cube } from "./Cube";

export class TexturedCube extends Cube implements IndexedTexturedMesh {
    readonly texture = "/textures/Cobble.png";
}