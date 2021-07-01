import { WorldObject } from "../entities/WorldObject";
import { mat4 as Matrix4 } from "gl-matrix";
import { Transform } from "../entities/Transform";

export class Camera extends WorldObject {

    private _viewMatrix: Matrix4;

    constructor(transform: Transform) {
        super(transform);
    }
}