import * as THREE from 'three'
import { CSG } from '@enable3d/three-graphics/jsm/csg'
// import { GUI } from 'dat.gui'
// import * as ThreeMeshUI from "three-mesh-ui";

import { add_vec3 } from "./utils/function"
import { Boolean_op, MAX } from "./utils/const"
import { operate_boolean } from "./cut"
export function init(scene: any) {


    var light1 = new THREE.SpotLight()
    light1.position.set(2.5, 5, 5)
    light1.angle = Math.PI / 4
    light1.penumbra = 0.5
    light1.castShadow = true
    light1.shadow.mapSize.width = 1024
    light1.shadow.mapSize.height = 1024
    light1.shadow.camera.near = 0.5
    light1.shadow.camera.far = 20
    scene.add(light1)

    var light2 = new THREE.SpotLight()
    light2.position.set(-2.5, 5, 5)
    light2.angle = Math.PI / 4
    light2.penumbra = 0.5
    light2.castShadow = true
    light2.shadow.mapSize.width = 1024
    light2.shadow.mapSize.height = 1024
    light2.shadow.camera.near = 0.5
    light2.shadow.camera.far = 20
    scene.add(light2)

    init_dat(scene)

}

function init_dat(scene: any) {

    // const gui = new GUI()
    // var obj = { add: function () { console.log("clicked") } };

    // gui.add(obj, 'add');



}
export var cubeMesh
export var sphereMesh
export function set_csg(scene: any, objectLists: any) {


    //create a cube and sphere and intersect them
    cubeMesh = new THREE.Mesh(
        new THREE.BoxGeometry(1, 3, 3),
        new THREE.MeshPhongMaterial({ color: 0xff0000 })
    )
    // cubeMesh = CSG.toMesh(
    //     CSG.fromMesh(cubeMesh),
    //     new THREE.Matrix4()
    // )

    sphereMesh = new THREE.Mesh(
        new THREE.SphereGeometry(1.45, 8, 8),
        new THREE.MeshPhongMaterial({ color: 0x0000ff })
    )
    // cubeMesh = CSG.toMesh(
    //     CSG.fromMesh(sphereMesh),
    //     new THREE.Matrix4()
    // )

    var cylinderMesh1 = new THREE.Mesh(
        new THREE.CylinderGeometry(0.85, 0.85, 2, 8, 1, false),
        new THREE.MeshPhongMaterial({ color: 0x00ff00 })
    )
    const cylinderMesh2 = new THREE.Mesh(
        new THREE.CylinderGeometry(0.85, 0.85, 2, 8, 1, false),
        new THREE.MeshPhongMaterial({ color: 0x00ff00 })
    )
    const cylinderMesh3 = new THREE.Mesh(
        new THREE.CylinderGeometry(0.85, 0.85, 2, 8, 1, false),
        new THREE.MeshPhongMaterial({ color: 0x00ff00 })
    )
    objectLists.push(cubeMesh);

    objectLists.push(cylinderMesh1);
    objectLists.push(cylinderMesh2);
    objectLists.push(cylinderMesh3);


    cubeMesh.position.set(-5, 0, -6)
    scene.add(cubeMesh)
    sphereMesh.position.set(-2, 0, -6)
    scene.add(sphereMesh)
    sphereMesh.name = "sphereMesh"
    objectLists.push(sphereMesh);
    // const cubeCSG = CSG.fromMesh(cubeMesh)
    // const sphereCSG = CSG.fromMesh(sphereMesh)

    //operate_boolean(sphereMesh, cubeMesh, Boolean_op.Subtract, scene, objectLists)
    // operate_boolean(sphereMesh, cubeMesh, Boolean_op.Subtract, scene, objectLists)
    // operate_boolean(sphereMesh, cubeMesh, Boolean_op.Subtract, scene, objectLists)
    // const cubeSphereIntersectCSG = sphereCSG.subtract(cubeCSG)
    // const cubeSphereIntersectMesh = CSG.toMesh(
    //     cubeSphereIntersectCSG,
    //     new THREE.Matrix4()
    // )

    // cubeSphereIntersectMesh.material = new THREE.MeshPhongMaterial({
    //     color: 0xff00ff
    // })
    // cubeSphereIntersectMesh.position.set(-2.5, 0, -3)
    // scene.add(cubeSphereIntersectMesh)
    // objectLists.push(cubeSphereIntersectMesh);

    //create 3 cylinders at different rotations and union them
    cylinderMesh1.position.set(1, 0, -6)
    scene.add(cylinderMesh1)
    cylinderMesh2.position.set(3, 0, -6)
    cylinderMesh2.geometry.rotateX(Math.PI / 2)
    scene.add(cylinderMesh2)
    cylinderMesh3.position.set(5, 0, -6)
    cylinderMesh3.geometry.rotateZ(Math.PI / 2)
    scene.add(cylinderMesh3)

    // var cylinderCSG1 = CSG.fromMesh(cylinderMesh1)
    // const cylinderCSG2 = CSG.fromMesh(cylinderMesh2)
    // const cylinderCSG3 = CSG.fromMesh(cylinderMesh3)

    const mat = new THREE.MeshLambertMaterial({ color: 0x00ff00 })

    const meshA = new THREE.Mesh(new THREE.BoxBufferGeometry(1, 1, 1))
    const meshB = new THREE.Mesh(new THREE.SphereBufferGeometry(0.5, 16, 16))
    meshA.position.set(3, 3, 0)
    meshB.position.set(3.25, 3.1, 0.4)
    const meshC_0 = CSG.intersect(meshA, meshB)
    // const meshC_1 = CSG.subtract(meshA, meshB)
    // const meshC_2 = CSG.union(meshA, meshB)
    meshC_0.material = new THREE.MeshStandardMaterial({ roughness: 0, metalness: 0.4, color: 'red' })
    // meshC_1.material = mat
    // meshC_2.material = mat
    meshC_0.position.setX(3)
    // meshC_1.position.setX(5)
    // meshC_2.position.setX(7)
    scene.add(meshC_0)

    // const tmpPosition = cylinderMesh1.position

    // scene.remove(cylinderMesh1)
    // cylinderCSG1 = cylinderCSG1.union(
    //     cylinderCSG2.union(cylinderCSG3)
    // )
    // cylinderMesh1 = CSG.toMesh(
    //     cylinderCSG1,
    //     new THREE.Matrix4()
    // )

    // cylinderMesh1.material = new THREE.MeshPhongMaterial({
    //     color: 0xffa500
    // })
    // cylinderMesh1.position.set(tmpPosition.x, tmpPosition.y, tmpPosition.z)

    // scene.add(cylinderMesh1)



    // objectLists.push(cylindersUnionMesh);

    // //subtract the cylindersUnionCSG from the cubeSphereIntersectCSG
    // const finalCSG = cubeSphereIntersectCSG.subtract(cylinderCSG1)
    // const finalMesh = CSG.toMesh(finalCSG, new THREE.Matrix4())
    // objectLists.push(finalMesh);

    // const material = new THREE.MeshPhongMaterial({
    //     map: new THREE.TextureLoader().load('../k.png')
    // })


    // finalMesh.material = material
    //scene.add(finalMesh)

}

export function set_skybox(scene: any) {
    const loader = new THREE.CubeTextureLoader();

    const filename = "Daylight"
    const basePath = "../skybox/";
    const baseFilename = basePath + filename;
    const fileType = ".bmp";
    const sides = ["Right", "Left", "Top", "Bottom", "Front", "Back"];
    const skyboxImagepaths = sides.map(side => {
        return baseFilename + "_" + side + fileType;
    });

    const texture = loader.load(skyboxImagepaths);


    scene.background = texture;
}


function find_xx_yy(p1: THREE.Vector3, p2: THREE.Vector3, size) {
    var slope, xx, yy
    if ((p1.y - p2.y) == 0) {
        slope = -MAX
        xx = 0
        yy = size
    }
    else {
        if ((p1.x - p2.x) == 0)
            slope = 0
        else
            slope = -1 / ((p1.y - p2.y) / (p1.x - p2.x))
        xx = Math.sqrt(Math.pow(size, 2) / (slope * slope + 1))
        yy = slope * xx
    }
    return [xx, yy]
}

function gen_face_from_pair(p1, p2, vertices, idx) {
    // 00 01 10
    vertices[idx++] = p1[0].x
    vertices[idx++] = p1[0].y
    vertices[idx++] = p1[0].z

    vertices[idx++] = p1[1].x
    vertices[idx++] = p1[1].y
    vertices[idx++] = p1[1].z

    vertices[idx++] = p2[0].x
    vertices[idx++] = p2[0].y
    vertices[idx++] = p2[0].z

    // 01 10 11

    vertices[idx++] = p1[1].x
    vertices[idx++] = p1[1].y
    vertices[idx++] = p1[1].z

    vertices[idx++] = p2[1].x
    vertices[idx++] = p2[1].y
    vertices[idx++] = p2[1].z

    vertices[idx++] = p2[0].x
    vertices[idx++] = p2[0].y
    vertices[idx++] = p2[0].z

    return idx
}


function gen_face_from_quad(p1, p2, p3, p4, vertices, idx) {

    function face_side(side) {
        //0

        vertices[idx++] = p4[side].x
        vertices[idx++] = p4[side].y
        vertices[idx++] = p4[side].z

        vertices[idx++] = p3[side].x
        vertices[idx++] = p3[side].y
        vertices[idx++] = p3[side].z

        vertices[idx++] = p1[side].x
        vertices[idx++] = p1[side].y
        vertices[idx++] = p1[side].z

        //---------//
        vertices[idx++] = p1[side].x
        vertices[idx++] = p1[side].y
        vertices[idx++] = p1[side].z

        vertices[idx++] = p2[side].x
        vertices[idx++] = p2[side].y
        vertices[idx++] = p2[side].z

        vertices[idx++] = p4[side].x
        vertices[idx++] = p4[side].y
        vertices[idx++] = p4[side].z

        return idx
    }

    idx = face_side(0)
    idx = face_side(1)
    return idx
}
export function gen_face(scene) {

    const line = [new THREE.Vector3(-3, 4, -5),
    new THREE.Vector3(-2, 2, -5),
    new THREE.Vector3(0, 0, -5),
    new THREE.Vector3(2, -1, -5),
    new THREE.Vector3(4, -1, -5)
    ]
    var slope, size = 1, xx, yy, depth = 5
    const dirVector = new THREE.Vector3(0, 0, -depth)
    var new_point: any = []
    for (let i = 0; i < line.length - 1; i++) {
        var newPos = find_xx_yy(line[i], line[i + 1], size)
        // try to make it smooth 
        if (i == line.length - 3) {
            let newPos2 = find_xx_yy(line[i + 1], line[i + 2], size)
            newPos = [(newPos[0] + newPos2[0]) / 2, (newPos[1] + newPos2[1]) / 2]
        }
        xx = newPos[0]
        yy = newPos[1]
        if (i == 0)
            new_point.push([new THREE.Vector3(xx + line[i].x, yy + line[i].y, 0),
            new THREE.Vector3(line[i].x - xx, line[i].y - yy, 0)])
        new_point.push([new THREE.Vector3(xx + line[i + 1].x, yy + line[i + 1].y, 0),
        new THREE.Vector3(line[i + 1].x - xx, line[i + 1].y - yy, 0)])
    }
    var vertices = new Float32Array(2 * 3 * 6 * (line.length - 1) + 36 + 36 * (line.length - 1));
    var idx = 0
    for (let p = 0; p < new_point.length - 1; p++) {
        idx = gen_face_from_pair(new_point[p], new_point[p + 1], vertices, idx)
    }
    var temp = new_point.length
    for (let p = 0; p < temp; p++) {
        new_point.push([add_vec3(new_point[p][0], dirVector), add_vec3(new_point[p][1], dirVector)])
    }
    console.log(new_point.length)
    for (let p = new_point.length / 2; p < new_point.length - 1; p++) {
        idx = gen_face_from_pair(new_point[p], new_point[p + 1], vertices, idx)
    }
    idx = gen_face_from_pair(new_point[0], new_point[new_point.length / 2], vertices, idx)
    idx = gen_face_from_pair(new_point[new_point.length / 2 - 1], new_point[new_point.length - 1], vertices, idx)
    for (let p = 0; p < new_point.length / 2 - 1; p++) {
        idx = gen_face_from_quad(new_point[p], new_point[p + 1], new_point[new_point.length / 2 + p], new_point[new_point.length / 2 + 1 + p], vertices, idx)
    }
    // console.log(idx, 2 * 3 * 6 * (line.length - 1) + 36)
    const geometry = new THREE.BufferGeometry();
    // create a simple square shape. We duplicate the top left and bottom right
    // vertices because each vertex needs to appear once per triangle.


    //itemSize = 3 because there are 3 values (components) per vertex
    geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
    console.log(geometry.computeVertexNormals())
    const material = new THREE.MeshBasicMaterial({ color: 0xff0000 });
    const mesh = new THREE.Mesh(geometry, material);
    //mesh.material.side = THREE.DoubleSide;
    scene.add(mesh)
}