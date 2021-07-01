import { Transform } from "./Transform";

export class WorldObject {
    transform: Transform;
    constructor(transform: Transform) {
        this.transform = transform;
    }
}