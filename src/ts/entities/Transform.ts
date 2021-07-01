import { vec3 as Vector3, quat as Quaternion, mat4 as Matrix4 } from 'gl-matrix';

export class Transform {
    position: Vector3;
    rotation: Quaternion;
    scale: Vector3;
    private _matrix: Matrix4;

    constructor(position = Vector3.fromValues(0, 0, 0), rotation = Quaternion.fromValues(0, 0, 0, 1), scale = Vector3.fromValues(1.0, 1.0, 1.0)) {
        this.position = position;
        this.rotation = rotation;
        this.scale = scale;
        this._matrix = Matrix4.create();
    }

    public get matrix() {
        return Matrix4.fromRotationTranslationScale(this._matrix, this.rotation, this.position, this.scale);
    }

}