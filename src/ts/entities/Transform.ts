import { vec3 as Vector3, vec4 as Quaternion } from 'gl-matrix';

export class Transform {
    position: Vector3;
    rotation: Quaternion;
    scale: number;

    constructor(position = Vector3.fromValues(0, 0, 0), rotation = Quaternion.fromValues(0, 0, 0, 0), scale = 1.0) {
        this.position = position;
        this.rotation = rotation;
        this.scale = scale;
    }

}