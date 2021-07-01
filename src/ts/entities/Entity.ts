import { WorldObject } from "./WorldObject";
import { IndexedTexturedMesh } from "../meshes/IndexedTexturedMesh";
import { Transform } from "./Transform";

export class Entity extends WorldObject {
    mesh: IndexedTexturedMesh;

    constructor(transform: Transform, mesh: IndexedTexturedMesh) {
        super(transform);
        this.mesh = mesh;
    }
}