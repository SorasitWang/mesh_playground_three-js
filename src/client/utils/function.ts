import * as THREE from 'three'
import { MAX } from "./const"


export function add_vec3(a, b) {
    return new THREE.Vector3(a.x + b.x, a.y + b.y, a.z + b.z)
}

export function sub_vec3(a, b) {
    return new THREE.Vector3(a.x - b.x, a.y - b.y, a.z - b.z)
}


export function line_line_intersection(A, B, C, D, inRange = false) {
    /*
        inRange A-B

    */

    // Line AB represented as a1x + b1y = c1
    var a1 = B.y - A.y;
    var b1 = A.x - B.x;
    var c1 = a1 * (A.x) + b1 * (A.y);

    // Line CD represented as a2x + b2y = c2
    var a2 = D.y - C.y;
    var b2 = C.x - D.x;
    var c2 = a2 * (C.x) + b2 * (C.y);

    var determinant = a1 * b2 - a2 * b1;

    if (determinant == 0) {
        // The lines are parallel. This is simplified
        // by returning a pair of FLT_MAX
        return new THREE.Vector2(MAX, MAX);
    }
    else {
        var x = (b2 * c1 - b1 * c2) / determinant;
        var y = (a1 * c2 - a2 * c1) / determinant;
        if (!inRange)
            return new THREE.Vector2(x, y)
        else
            if (x < Math.max(A.x, B.x) && x > Math.min(A.x, B.x))
                return new THREE.Vector2(x, y)
            else
                return new THREE.Vector2(MAX, MAX);
    }
}

export function center_point(a, b) {
    console.log("center", a, b)
    return new THREE.Vector3((a.x + b.x) / 2, (a.y + b.y) / 2, (a.z + b.z) / 2)
}

export function dot_vec3(a, b) {
    return a.x * b.x + a.y * b.y + a.z * b.z
}

export function length_vec3(a) {
    return Math.sqrt(Math.pow(a.x, 2) + Math.pow(a.y, 2) + Math.pow(a.z, 2))
}