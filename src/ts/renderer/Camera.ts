import { WorldObject } from "../entities/WorldObject";
import { mat4 as Matrix4 } from "gl-matrix";
import { Transform } from "../entities/Transform";

export class Camera extends WorldObject {

    private _viewMatrix: Matrix4;

    constructor(transform: Transform) {
        super(transform);
        this._viewMatrix = Matrix4.create();
    }

    public get viewMatrix() {
        return Matrix4.fromRotationTranslationScale(this._viewMatrix, this.transform.rotation, this.transform.position, this.transform.scale);
    }
}