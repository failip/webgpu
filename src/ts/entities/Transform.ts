import { vec3 as Vector3, quat as Quaternion } from 'gl-matrix';

export class Transform {
    position: Vector3;
    rotation: Quaternion;
    scale: Vector3;

    constructor(position = Vector3.fromValues(0, 0, 0), rotation = Quaternion.fromValues(0, 0, 0, 1), scale = Vector3.fromValues(1.0, 1.0, 1.0)) {
        this.position = position;
        this.rotation = rotation;
        this.scale = scale;
    }

}