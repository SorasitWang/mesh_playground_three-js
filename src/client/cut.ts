import * as THREE from 'three'
import { CSG } from '@enable3d/three-graphics/jsm/csg'
import { MeshLine, MeshLineMaterial, MeshLineRaycast } from 'three.meshline';
import { Boolean_op, MAX } from "./utils/const"
import { add_vec3, line_line_intersection, center_point, dot_vec3, length_vec3, sub_vec3, arr_find_vec3 } from "./utils/function"
import { cubeMesh, sphereMesh } from "./setup"
import { intervalTime, cube, miniCube } from "./client"
import { ThreeGraphics } from '@enable3d/three-graphics'
// const Dotenv = require('dotenv-webpack');
// import reindexBufferGeometry from "./utils/BufferGeometryIndexer.js"

const dis = 1
const OFFSET_TIME = 50;
const cutMaterial = new THREE.MeshPhongMaterial({ color: 0xFF0000 })
const cutGeometry = new THREE.BoxGeometry(0.1, 0.1, 1)
cutMaterial.opacity = 1.0
var intersectedObject
var collectTime = 0
var cutLine: any = []
var _camera: any
const samplingRate = 10;



var points: any[] = [];
//points.push(0, 0, 1.8)
//points.push(1, 3, 1.8)
var lineGeometry = new THREE.BufferGeometry().setFromPoints(points);
const lineMat = new MeshLineMaterial({ color: 0x0000FF, lineWidth: 0.03, sizeAttenuation: true });
const line = new MeshLine();
export const lineMesh = new THREE.Mesh(line, lineMat);


const lineMat1 = new MeshLineMaterial({ color: 0x0000FF, lineWidth: 0.01, sizeAttenuation: true });
const line1 = new MeshLine();
const line2 = new MeshLine();
const lineMesh1 = new THREE.Mesh(line1, lineMat);
const lineMesh2 = new THREE.Mesh(line2, lineMat);


line.setPoints(points)



export const cutMesh = new THREE.Mesh(cutGeometry, cutMaterial)

var _enable = false;
function gen_cutter(scene: any, camera: any) {
    if (!_enable) return
    if (intersectedObject == null) {
        scene.remove(cutMesh)
        return
    }
    var vector = new THREE.Vector3(); // create once and reuse it!

    camera.getWorldDirection(vector);
    console.log(vector)
    // create cutter_box associate with direction vector
    var offset = new THREE.Vector3(vector.x, vector.y, vector.z)

    // position at intercept position but look at camera
    //console.log(intersectedObject.point)
    cutMesh.position.set(intersectedObject.point.x, intersectedObject.point.y, intersectedObject.point.z)


    cutMesh.lookAt(camera.position)


    scene.add(cutMesh)


}

function destroy_cutter(scene: any) {
    scene.remove(cutMesh)
}

export function enable(t: any, scene: any) {
    console.log(_enable)
    _enable = t

    if (!t) destroy_cutter(scene)
}
export function set_raycast(renderer: any, camera: any, pickableObjects: any[], scene: any) {
    const raycaster = new THREE.Raycaster()

    let intersects: THREE.Intersection[]

    document.addEventListener('pointermove', onDocumentMouseMove, false)
    function onDocumentMouseMove(event: MouseEvent) {
        if (!_enable) return
        //console.log(pickableObjects)
        raycaster.setFromCamera(
            {
                x: (event.clientX / renderer.domElement.clientWidth) * 2 - 1,
                y: -(event.clientY / renderer.domElement.clientHeight) * 2 + 1
            },
            camera
        )
        intersects = raycaster.intersectObjects(pickableObjects, false)

        if (intersects.length > 0) {
            intersectedObject = intersects[0]
            collectTime += intervalTime;
            //console.log(collectTime)
            //points.push(intersectedObject.point.x, intersectedObject.point.y, intersectedObject.point.z)
            //lineGeometry = new THREE.BufferGeometry().setFromPoints(points);


            if (collectTime > OFFSET_TIME) {
                //if (cutLine.length < 2)
                points.push(intersectedObject.point.x, intersectedObject.point.y, intersectedObject.point.z + 0.05)
                cutLine.push(intersectedObject.point)
                line.setPoints(points)

                //operate_cut(scene, pickableObjects)
                collectTime = 0
            }
            //operate_cut(intersects[0])
        } else {
            intersectedObject = null
        }
        //line.geometry = lineGeometry
        gen_cutter(scene, camera)
        console.log("points", points)


        _camera = camera
        //console.log(intersects)

        // pickableObjects.forEach((o: THREE.Mesh, i) => {
        //     if (intersectedObject && intersectedObject.name === o.name) {
        //         pickableObjects[i].material = highlightedMaterial
        //     } else {
        //         pickableObjects[i].material = originalMaterials[o.name]
        //     }
        // })
    }

    document.addEventListener('pointerup', onDocumentMouseUp, false)
    function onDocumentMouseUp(event: MouseEvent) {
        if (cutLine.length == 0) return
        var mesh = gen_cut_mesh_from_line(scene)
        console.log("lineMesh", lineMesh)
        //console.log(mesh)
        //is_split(cube?.geometry, miniCube.geometry)
        operate_cut(scene, pickableObjects, mesh)

        scene.remove(lineMesh)
        scene.remove(mesh)
        points = []
        line.setPoints(points)
        cutLine = []
    }


}

function find_xx_yy(p1: THREE.Vector3, p2: THREE.Vector3, size: number) {
    var slope, xx, yy
    if ((p1.y - p2.y) == 0) {
        slope = -100000
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

function sort_wind_order(t, vertices, idx, numIdx, insidePoint) {
    var plane = new THREE.Plane()
    var a = new THREE.Vector3(vertices[3 * t[0]], vertices[3 * t[0] + 1], vertices[3 * t[0] + 2])
    var b = new THREE.Vector3(vertices[3 * t[1]], vertices[3 * t[1] + 1], vertices[3 * t[1] + 2])
    var c = new THREE.Vector3(vertices[3 * t[2]], vertices[3 * t[2] + 1], vertices[3 * t[2] + 2])
    plane.setFromCoplanarPoints(a, b, c)
    if (plane.distanceToPoint(insidePoint) > 0) {
        idx[numIdx++] = t[0] //a1
        idx[numIdx++] = t[2] //a2
        idx[numIdx++] = t[1] //b1
    }
    else {
        idx[numIdx++] = t[0] //a1
        idx[numIdx++] = t[1] //a2
        idx[numIdx++] = t[2] //b1
    }
    return numIdx
}

function gen_triangle(a1, a2, b1, b2, idx, numIdx, vertices, numVertex, arrange_point, insidePoint) {

    console.log("inside", insidePoint)
    // add to vertices
    var tmp = [a1, a2, b1, b2]
    var index: number[] = []
    tmp.forEach(function (t) {
        // code
        index.push(numVertex / 3)
        vertices[numVertex++] = arrange_point[t].x
        vertices[numVertex++] = arrange_point[t].y
        vertices[numVertex++] = arrange_point[t].z

        console.log(t, arrange_point[t].z)
    })

    // add to index
    console.log("innnn", index, numVertex)
    numIdx = sort_wind_order([index[0], index[2], index[1]], vertices, idx, numIdx, insidePoint)

    numIdx = sort_wind_order([index[2], index[3], index[1]], vertices, idx, numIdx, insidePoint)

    return [numIdx, numVertex]
}
function arrage_point(newPoint) {
    var re: THREE.Vector3[] = []
    let idx = 0
    for (var i = 0; i < newPoint.length; i++) {
        for (var j = 0; j < 2; j++) {
            re.push(newPoint[i][j])
        }
    }
    return re
}

function gen_side_face(p, idx, numIdx, vertices, numVertex, arrange_point, insidePoints) {
    var half_num = (2 * p + 2)
    var tmp
    for (let i = 0; i < p; i++) {
        tmp = gen_triangle(2 * i + 1, 2 * i + 3, half_num + 2 * i + 1, half_num + 2 * i + 3,
            idx, numIdx, vertices, numVertex, arrange_point, insidePoints[i])
        numIdx = tmp[0]
        numVertex = tmp[1]
    }
    for (let i = 0; i < p; i++) {
        tmp = gen_triangle(2 * i, 2 * i + 2, half_num + 2 * i, half_num + 2 * i + 2, idx,
            numIdx, vertices, numVertex, arrange_point, insidePoints[i])
        numIdx = tmp[0]
        numVertex = tmp[1]
    }
    return [numIdx, numVertex]

}

function gen_inter_face(p, idx, numIdx, vertices, numVertex, arrange_point, insidePoints) {
    var half_num = (2 * p + 2)

    var tmp = gen_triangle(0, 1, half_num, half_num + 1, idx, numIdx, vertices, numVertex, arrange_point, insidePoints[0])
    numIdx = tmp[0]
    numVertex = tmp[1]
    //console.log("inter", arrange_point[half_num], arrange_point[half_num + 1])
    tmp = gen_triangle(half_num - 2, half_num - 1, 2 * half_num - 2, 2 * half_num - 1,
        idx, numIdx, vertices, numVertex, arrange_point, insidePoints[insidePoints.length - 1])
    console.log("inter", arrange_point[half_num - 2], arrange_point[half_num - 1]
        , arrange_point[2 * half_num - 2], arrange_point[2 * half_num - 1])
    console.log("inter", half_num - 2, half_num - 1, 2 * half_num - 2, 2 * half_num - 1)
    // var t = [half_num - 2, half_num - 1, 2 * half_num - 2, 2 * half_num - 1]
    // var index: number[] = []
    // t.forEach(function (t) {
    //     // code
    //     index.push(numVertex / 3)
    //     vertices[numVertex++] = arrange_point[t].x
    //     vertices[numVertex++] = arrange_point[t].y
    //     vertices[numVertex++] = arrange_point[t].z

    //     console.log(t, arrange_point[t].z)
    // })

    // // add to index
    console.log("inter", idx)
    console.log("inter", vertices[3 * idx[idx.length - 1]], vertices[3 * idx[idx.length - 1] + 1], vertices[3 * idx[idx.length - 1] + 2])
    console.log("inter", vertices[3 * idx[idx.length - 2]], vertices[3 * idx[idx.length - 2] + 1], vertices[3 * idx[idx.length - 2] + 2])
    console.log("inter", vertices[3 * idx[idx.length - 3]], vertices[3 * idx[idx.length - 3] + 1], vertices[3 * idx[idx.length - 3] + 2])
    console.log("inter", vertices[3 * idx[idx.length - 4]], vertices[3 * idx[idx.length - 4] + 1], vertices[3 * idx[idx.length - 4] + 2])
    // idx[numIdx++] = index[0] //a1
    // idx[numIdx++] = index[1] //a2
    // idx[numIdx++] = index[2] //b1

    // idx[numIdx++] = index[2] //a1
    // idx[numIdx++] = index[1] //a2
    // idx[numIdx++] = index[3] //b1


    return [numIdx, numVertex]
}

function gen_front_face(p, idx, numIdx, vertices, numVertex, arrange_point, insidePoints) {
    var half_num = (2 * p + 2)
    var tmp
    for (let i = 0; i < p; i++) {
        tmp = gen_triangle(2 * i, 2 * i + 1, 2 * i + 2, 2 * i + 3, idx, numIdx, vertices, numVertex, arrange_point, insidePoints[i])
        numIdx = tmp[0]
        numVertex = tmp[1]
    }
    for (let i = 0; i < p; i++) {
        tmp = gen_triangle(half_num + 2 * i, half_num + 2 * i + 1,
            half_num + 2 * i + 2, half_num + 2 * i + 3, idx, numIdx, vertices, numVertex, arrange_point, insidePoints[i])
        numIdx = tmp[0]
        numVertex = tmp[1]
    }
    return [numIdx, numVertex]
}

function filterCutLine() {
    let count = 0
    var _cutLine = [cutLine[0]]
    for (let i = 1; i < cutLine.length - 1; i++) {
        if (count == samplingRate) {
            _cutLine.push(cutLine[i])
            count = 0
        }
        count++;
    }
    _cutLine.push(cutLine[cutLine.length - 1])
    cutLine = _cutLine
}

function slope_from_point(p1, p2) {
    if (p1.x == p2.x) return MAX * Math.sign(p1.y - p2.y)
    return (p1.y - p2.y) / (p1.x - p2.x);
}
function fix_flip(new_point) {

    // If 2 edge between ordered vertex are intercept , swap order (including the rest)
    for (let i = 0; i < new_point.length - 1; i++) {
        var m1 = slope_from_point(new_point[i][0], new_point[i + 1][0])
        var m2 = slope_from_point(new_point[i][1], new_point[i + 1][1])
        // if not parallel, swap the rest
        console.log("slope", i, m1, m2, new_point[i], new_point[i + 1])
        if (Math.abs(m1 - m2) > 1e-5)
            for (let j = i + 1; j < new_point.length; j++) {
                var b = new_point[j][1];
                new_point[j][1] = new_point[j][0];
                new_point[j][0] = b;
            }

        m1 = slope_from_point(new_point[i][0], new_point[i + 1][0])
        m2 = slope_from_point(new_point[i][1], new_point[i + 1][1])
        // if not parallel, swap the rest
        if (Math.abs(m1 - m2) > 1e-5)
            console.log("slopeNew", i, m1, m2, new_point[i], new_point[i + 1])
    }
}


function fix_intercept(candidate_point, start, end, cutLine) {
    var re = [start]
    var flip = false
    for (let i = 0; i < candidate_point.length; i++) {
        // console.log("fix_flip", i, cutLine[i], cutLine[i + 2], candidate_point[i][0])
        let check = line_line_intersection(cutLine[i], cutLine[i + 2], candidate_point[i][0], candidate_point[i][1], true)

        console.log("fix_flip", i, check.x != MAX,
            cutLine[i], cutLine[i + 2], candidate_point[i][0], candidate_point[i][1],)
        if (check.x == MAX) {
            re.push([candidate_point[i][2], candidate_point[i][3]])
            // for (let j = i + 1; j < candidate_point.length; j++) {
            //     candidate_point[j] = [candidate_point[j][2], candidate_point[j][3], candidate_point[j][0], candidate_point[j][1]]
            // }
        }
        else {
            re.push([candidate_point[i][0], candidate_point[i][1]])
        }
        // console.log("fix_flip", i, line_line_intersection(cutLine[i], cutLine[i + 2], candidate_point[i][2], candidate_point[i][3], true).x != MAX,
        //     cutLine[i], cutLine[i + 2], candidate_point[i][2], candidate_point[i][3])
        // re.push(candidate_point[i])
        // if (check.x != MAX) {
        //     //re.push([new_point[i + 1][1], new_point[i + 1][0]])
        //     var swap = new_point[i + 1][1]
        //     new_point[i + 1][1] = new_point[i + 1][0]
        //     new_point[i + 1][0] = swap
        // }

        //re.push(new_point[i + 1])
    }
    //for end
    let check = line_line_intersection(re[re.length - 1][0], end[0], re[re.length - 1][1], end[1], true)
    if (check.x == MAX) {
        re.push([end[0], end[1]])
    }
    else {
        re.push([end[1], end[0]])
    }
    return re
}
export function gen_cut_mesh_from_line(scene) {


    if (cutLine.length < 2) return
    //filterCutLine()
    console.log("cutline", cutLine)
    var slope, size = 0.03, xx, yy, depth = 6
    //cutLine = [cutLine[0], cutLine[Math.floor(cutLine.length / 2)], cutLine[cutLine.length - 1]]
    //cutLine = [new THREE.Vector3(-0.37, -0.5, 1.8), new THREE.Vector3(-0.18, -1.04, 1.8), new THREE.Vector3(0.63, 0.06, 1.8)]
    /*cutLine = [new THREE.Vector3(-0.11, 0.76, 1.5), new THREE.Vector3(-0.09, 0.18, 1.5)
        , new THREE.Vector3(-0.08, -0.1, 1.5), new THREE.Vector3(-0.03, -0.05, 1.5)
        , new THREE.Vector3(0.36, 0.45, 1.5), new THREE.Vector3(0.53, 0.64, 1.5)
        , new THREE.Vector3(0.5, -0.5, 1.5)]*/
    console.log("cutLine", cutLine)
    for (let c = 0; c < cutLine.length; c++) {
        cutLine[c].z += 0.3;
        //var tmp = cutLine[c].y
    }
    // cutLine = [new THREE.Vector3(-0.9, 0.6, 1.8), new THREE.Vector3(-0.9, -0.6, 1.8)
    //     , new THREE.Vector3(0.9, -0.6, 1.8)]
    // op([_cutLine[0], _cutLine[1]])
    // op([_cutLine[1], _cutLine[2]])
    // function op(cutLine) {
    var insidePoint: THREE.Vector3 = new THREE.Vector3((cutLine[0].x + cutLine[1].x) / 2, (cutLine[0].y + cutLine[1].y) / 2, (cutLine[0].z + cutLine[1].z) / 2)
    //console.log(insidePoint)

    insidePoint.z -= depth / 2.0
    //cutLine = [new THREE.Vector3(0, 0, -6), new THREE.Vector3(-4, 0, -6)]
    if (cutLine.length <= 0) return null;
    var cam_dir = new THREE.Vector3()
    _camera.getWorldDirection(cam_dir)

    const dirVector = new THREE.Vector3(0, 0, -depth)
    //console.log("dirVector", dirVector)
    var line: any = []



    var xx_yy, xx, yy
    // create parallel line border of each cut line
    for (let i = 0; i < cutLine.length - 1; i++) {
        xx_yy = find_xx_yy(cutLine[i], cutLine[i + 1], size)
        xx = xx_yy[0]
        yy = xx_yy[1]
        line.push([new THREE.Vector3(xx + cutLine[i].x, yy + cutLine[i].y, cutLine[i].z),
        new THREE.Vector3(cutLine[i].x - xx, cutLine[i].y - yy, cutLine[i].z)])
        line.push([new THREE.Vector3(xx + cutLine[i + 1].x, yy + cutLine[i + 1].y, cutLine[i + 1].z),
        new THREE.Vector3(cutLine[i + 1].x - xx, cutLine[i + 1].y - yy, cutLine[i + 1].z)])
    }
    console.log("line", line)


    // // find internal angle of each vertex 
    // var angleMore90: boolean[] = []
    // for (let i = 1; i < cutLine.length - 1; i++) {
    //     let a = sub_vec3(cutLine[i - 1], cutLine[i])
    //     let b = sub_vec3(cutLine[i + 1], cutLine[i])
    //     angleMore90.push(dot_vec3(a, b) / (length_vec3(a) * length_vec3(b)) < 0 ? true : false)
    // }
    // console.log("angle", angleMore90)

    // find intersect point of each line
    var new_point: any = []
    var candicate_point: any = []
    new_point.push(line[0])
    var need_flip = false
    for (let i = 0; i < line.length - 2; i += 2) {
        let t1, t2, t3, t4
        t1 = line_line_intersection(line[i][0], line[i + 1][0], line[i + 2][!need_flip ? 0 : 1], line[i + 3][!need_flip ? 0 : 1])
        t2 = line_line_intersection(line[i][1], line[i + 1][1], line[i + 2][!need_flip ? 1 : 0], line[i + 3][!need_flip ? 1 : 0])

        t3 = line_line_intersection(line[i][0], line[i + 1][0], line[i + 2][!need_flip ? 1 : 0], line[i + 3][!need_flip ? 1 : 0])
        t4 = line_line_intersection(line[i][1], line[i + 1][1], line[i + 2][!need_flip ? 0 : 1], line[i + 3][!need_flip ? 0 : 1])

        // let check = line_line_intersection(cutLine[i / 2], cutLine[i / 2 + 2], t1, t2, true)
        // console.log("check", check, cutLine[i], cutLine[i + 2]
        //     , line_line_intersection(line[i][0], line[i + 1][0], line[i + 2][0], line[i + 3][0])
        //     , line_line_intersection(line[i][1], line[i + 1][1], line[i + 2][1], line[i + 3][1]))
        // if (check.x == MAX) {
        //     // flip
        //     t1 = line_line_intersection(line[i][0], line[i + 1][0], line[i + 2][!need_flip ? 1 : 0], line[i + 3][!need_flip ? 1 : 0])
        //     t2 = line_line_intersection(line[i][1], line[i + 1][1], line[i + 2][!need_flip ? 0 : 1], line[i + 3][!need_flip ? 0 : 1])
        //     // console.log("check", check, cutLine[i], cutLine[i + 2]
        //     //     , line_line_intersection(line[i][0], line[i + 1][0], line[i + 2][1], line[i + 3][1])
        //     //     , line_line_intersection(line[i][1], line[i + 1][1], line[i + 2][0], line[i + 3][0]))
        //     need_flip = !need_flip
        //     //console.log("flip", i, check, t1, t2, cutLine[i / 2], cutLine[i / 2 + 2])
        // }
        // console.log("flip", i, check, t1, t2, cutLine[i / 2], cutLine[i / 2 + 2])
        // console.log("flip", i, line[i][0], line[i + 1][0], line[i + 2][!need_flip ? 0 : 1], line[i + 3][!need_flip ? 0 : 1])
        // console.log("flip", i, line[i][1], line[i + 1][1], line[i + 2][!need_flip ? 1 : 0], line[i + 3][!need_flip ? 1 : 0])

        // const xx = t1
        // if (!need_flip) {
        //     t1 = t2
        //     t2 = xx
        // }
        console.log("eachLine", t1, t2)
        new_point.push([new THREE.Vector3(t1.x, t1.y, cutLine[i / 2 + 1].z)
            , new THREE.Vector3(t2.x, t2.y, cutLine[i / 2 + 1].z)])
        candicate_point.push([new THREE.Vector3(t1.x, t1.y, cutLine[i / 2 + 1].z)
            , new THREE.Vector3(t2.x, t2.y, cutLine[i / 2 + 1].z)
            , new THREE.Vector3(t3.x, t3.y, cutLine[i / 2 + 1].z)
            , new THREE.Vector3(t4.x, t4.y, cutLine[i / 2 + 1].z)])

    }
    // if (need_flip)
    //     new_point.push([line[line.length - 1][1], line[line.length - 1][0]])
    // else
    new_point.push([line[line.length - 1][0], line[line.length - 1][1]])
    // candicate_point.push([new THREE.Vector3(line[line.length - 1][0].x, line[line.length - 1][0].y, line[line.length - 1][0].z)
    //     , new THREE.Vector3(line[line.length - 1][1].x, line[line.length - 1][1].y, line[line.length - 1][0].z)
    //     , new THREE.Vector3(line[line.length - 1][1].x, line[line.length - 1][1].y, line[line.length - 1][0].z)
    //     , new THREE.Vector3(line[line.length - 1][0].x, line[line.length - 1][0].y, line[line.length - 1][0].z)])
    console.log("newpoint before", new_point, candicate_point, cutLine)

    new_point = fix_intercept(candicate_point, new_point[0], [line[line.length - 1][0], line[line.length - 1][1]], cutLine)
    fix_flip(new_point)
    console.log("newpoint after", new_point)
    var p1: any = [], p2: any = []
    for (let p = 0; p < new_point.length; p++) {

        let sp = new THREE.Mesh(
            new THREE.SphereGeometry(0.1, 8, 8),
            new THREE.MeshPhongMaterial({ color: 0x0000ff })
        )
        // for (let sub = 0; sub < 2; sub++) {
        //     sp.position.set(new_point[p][sub].x, new_point[p][sub].y, new_point[p][sub].z)
        //     scene.add(sp)
        // }
        p1.push(add_vec3(new_point[p][0], new THREE.Vector3(0, 0, -0.2)))
        p2.push(add_vec3(new_point[p][1], new THREE.Vector3(0, 0, -0.2)))

    }

    line1.setPoints(p1)
    line2.setPoints(p2)
    scene.add(lineMesh1)
    scene.add(lineMesh2)

    //console.log("newpoint after", new_point)

    // find inside_point for each block
    var insidePoints: any = []
    var center
    for (let i = 0; i < cutLine.length - 1; i++) {
        center = center_point(cutLine[i], cutLine[i + 1])
        center.z -= depth / 2
        insidePoints.push(center)
    }
    console.log("insidePoints", insidePoints)




    // var new_point: any = []
    // for (let i = 0; i < cutLine.length - 1; i++) {
    //     var newPos = find_xx_yy(cutLine[i], cutLine[i + 1], size)
    //     console.log("newPos", newPos, cutLine[i], cutLine[i + 1])
    //     // try to make it smooth 
    //     if (i == cutLine.length - 3) {
    //         let newPos2 = find_xx_yy(cutLine[i + 1], cutLine[i + 2], size)
    //         newPos = [(newPos[0] + newPos2[0]) / 2, (newPos[1] + newPos2[1]) / 2]
    //         // scal to size
    //         let new_size = Math.sqrt(Math.pow(newPos[0], 2) + Math.pow(newPos[1], 2))
    //         newPos[0] *= size / new_size
    //         newPos[1] *= size / new_size
    //     }
    //     console.log("newPos", newPos, cutLine[i], cutLine[i + 1])
    //     xx = newPos[0]
    //     yy = newPos[1]
    //     if (i == 0)
    //         new_point.push([new THREE.Vector3(xx + cutLine[i].x
    //             , yy + cutLine[i].y, cutLine[i].z),
    //         new THREE.Vector3(cutLine[i].x - xx
    //             , cutLine[i].y - yy, cutLine[i].z)])
    //     new_point.push([new THREE.Vector3(xx + cutLine[i + 1].x
    //         , yy + cutLine[i + 1].y, cutLine[i + 1].z),
    //     new THREE.Vector3(cutLine[i + 1].x - xx
    //         , cutLine[i + 1].y - yy, cutLine[i + 1].z)])
    //     console.log("newPoint", new_point)

    // }
    //console.log("cutline", cutLine.length)


    // for (let p = 0; p < new_point.length - 1; p++) {
    //   idx = gen_face_from_pair(new_point[p], new_point[p + 1], vertices, idx)
    // }

    var temp = new_point.length
    for (let p = 0; p < temp; p++) {
        new_point.push([add_vec3(new_point[p][0], dirVector), add_vec3(new_point[p][1], dirVector)])
    }

    var idx = new Float32Array(24 * (cutLine.length - 1) + 12);
    var numIdx = 0, numVertex = 0
    console.log("newPoint", new_point)
    var arrange_point = arrage_point(new_point)
    var vertices = new Float32Array(12 * (4 * cutLine.length + 2));
    console.log("arrange", arrange_point)
    var tmp: any = [numIdx, numVertex]

    tmp = gen_front_face(cutLine.length - 1, idx, tmp[0], vertices, tmp[1], arrange_point, insidePoints)
    tmp = gen_side_face(cutLine.length - 1, idx, tmp[0], vertices, tmp[1], arrange_point, insidePoints)
    tmp = gen_inter_face(cutLine.length - 1, idx, tmp[0], vertices, tmp[1], arrange_point, insidePoints)
    console.log("tmp", tmp)
    //console.log(new_point.length)
    // for (let p = new_point.length / 2; p < new_point.length - 1; p++) {
    //   idx = gen_face_from_pair(new_point[p], new_point[p + 1], vertices, idx)
    // }
    // idx = gen_face_from_pair(new_point[0], new_point[new_point.length / 2], vertices, idx)
    // idx = gen_face_from_pair(new_point[new_point.length / 2 - 1], new_point[new_point.length - 1], vertices, idx)
    // for (let p = 0; p < new_point.length / 2 - 1; p++) {
    //   idx = gen_face_from_quad(new_point[p], new_point[p + 1], new_point[new_point.length / 2 + p], new_point[new_point.length / 2 + 1 + p], vertices, idx)
    // }
    // console.log(idx, 2 * 3 * 6 * (line.length - 1) + 36)
    var geometry = new THREE.BufferGeometry();
    var boxGeo = new THREE.BoxGeometry(4, 4, 1)
    // geometry.attributes.position = boxGeo.attributes.position
    // geometry.attributes.normal = boxGeo.attributes.normal
    // geometry.attributes.uv = boxGeo.attributes.uv

    // create a simple square shape. We duplicate the top left and bottom right
    // vertices because each vertex needs to appear once per triangle.


    //itemSize = 3 because there are 3 values (components) per vertex
    var normals = new Float32Array(vertices.length);
    for (let i = 0; i < normals.length; i += 3) {
        normals[i] = 1;
        normals[i + 1] = 0;
        normals[i + 2] = 0;
    }


    // const boxVertices = new Float32Array([
    //   2, 2, 0.5, 2, 2, - 0.5, 2, - 2, 0.5, 2, - 2, - 0.5, - 2, 2, - 0.5, - 2, 2, 0.5, - 2, - 2, - 0.5, - 2, - 2, 0.5, - 2,
    //   2, - 0.5, 2, 2, - 0.5, - 2, 2, 0.5, 2, 2, 0.5, - 2, - 2, 0.5, 2, - 2, 0.5, - 2, - 2, - 0.5, 2, - 2, - 0.5, - 2, 2, 0.5,
    //   2, 2, 0.5, - 2, - 2, 0.5, 2, - 2, 0.5, 2, 2, -0.5, -2, 2, -0.5, 2, -2, -0.5, -2, -2, -0.5])

    // var boxIndices = new Uint16Array([0, 2, 1, 2, 3, 1, 4, 6, 5, 6, 7, 5, 8, 10, 9, 10, 11, 9, 12, 14, 13, 14, 15, 13, 16, 18, 17, 18, 19, 17, 20, 22, 21, 22, 23, 21])
    var boxIndices = idx
    var boxVertices = vertices
    for (let i = 0; i < boxIndices.length; i += 3) {
        var plane = new THREE.Plane()
        var a = new THREE.Vector3(boxVertices[3 * boxIndices[i]], boxVertices[3 * boxIndices[i] + 1], boxVertices[3 * boxIndices[i] + 2])
        var b = new THREE.Vector3(boxVertices[3 * boxIndices[i + 1]], boxVertices[3 * boxIndices[i + 1] + 1], boxVertices[3 * boxIndices[i + 1] + 2])
        var c = new THREE.Vector3(boxVertices[3 * boxIndices[i + 2]], boxVertices[3 * boxIndices[i + 2] + 1], boxVertices[3 * boxIndices[i + 2] + 2])
        plane.setFromCoplanarPoints(a, b, c)


        //console.log("signed", plane.distanceToPoint(new THREE.Vector3(0, 0, 0)), a, b, c)
    }
    //boxIndices = new Uint16Array([2, 0, 1, 3, 2, 1, 6, 4, 5, 6, 7, 5, 8, 10, 9, 10, 11, 9, 12, 14, 13, 14, 15, 13, 16, 18, 17, 18, 19, 17, 22, 20, 21, 23, 22, 21])
    //console.log("vertices", vertices)
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(boxVertices, 3));
    //geometry.setAttribute('position.array', boxGeo.attributes.position.array);
    geometry.setAttribute('normal', new THREE.BufferAttribute(normals, 3));
    geometry.index = new THREE.Uint16BufferAttribute(boxIndices, 1, false)
    //console.log("boxGeo", boxGeo.attributes.position.array)

    //reindexBufferGeometry(geometry)
    // let bgeom = geometry;
    // if (!bgeom.isBufferGeometry) {
    //     bgeom = new THREE.BufferGeometry().fromGeometry(geometry)
    //     geometry = bgeom
    // }
    //reindexBufferGeometry(geometry)
    //console.log(geometry.computeVertexNormals())
    const material = new THREE.MeshPhongMaterial({ color: 0xFF0000 })
    const mesh = new THREE.Mesh(geometry, material);
    //mesh.position.set(0, 0, 0)
    //mesh.material.side = THREE.DoubleSide;
    mesh.name = "cutMesh"
    console.log(mesh)
    //mesh.scale.copy(new THREE.Vector3(2, 2, 1))
    //mesh.updateMatrix()
    // if (_camera != null)
    //     mesh.lookAt(_camera.position)
    scene.add(mesh)


    return mesh
}

export function operate_cut(scene, objectList, mesh) {

    // const meshCSG = CSG.fromMesh(mesh)
    // const cutCSG = CSG.fromMesh(cutMesh)


    if (intersectedObject == null) return

    const newMesh = CSG.subtract(cube, mesh)
    //newMesh.material = mat
    scene.remove(cube)
    scene.add(newMesh)

    // newMesh.position.set(0, 5, 0)
    // //newMesh.material.side = THREE.DoubleSide;
    // scene.add(newMesh)
    return
    console.log(mesh)

    var mesh1 = new THREE.Mesh(cutGeometry, cutMaterial)
    //mesh1.position.set(intersectedObject.point.x, intersectedObject.point.y, intersectedObject.point.z)
    //mesh.lookAt(_camera.position)

    operate_boolean(intersectedObject.object, mesh, Boolean_op.Subtract, scene, objectList)
    // const cubeSphereIntersectCSG = cubeCSG.intersect(sphereCSG)
    // const cubeSphereIntersectMesh = CSG.toMesh(
    //     cubeSphereIntersectCSG,
    //     new THREE.Matrix4()
    // )

    // cubeSphereIntersectMesh.material = new THREE.MeshPhongMaterial({
    //     color: 0xff00ff
    // })
    // cubeSphereIntersectMesh.position.set(-2.5, 0, -3)
    // scene.add(cubeSphereIntersectMesh)

}



export function operate_boolean(meshA, meshB, op, scene, objectList) {
    scene.remove(meshA)
    const index = objectList.indexOf(meshA);
    if (index > -1) { // only splice array when item is found
        objectList.splice(index, 1); // 2nd parameter means remove one item only
    }
    var newMesh: any

    // var ACSG = CSG.fromMesh(meshA)
    // var BCSG = CSG.fromMesh(meshB)

    var newCSG
    if (op == Boolean_op.Union)
        //newCSG = ACSG.union(BCSG)
        newMesh = CSG.union(meshA, meshB)
    else if (op == Boolean_op.Subtract)
        //newCSG = ACSG.subtract(BCSG)
        newMesh = CSG.subtract(meshA, meshB)
    else
        //newCSG = ACSG.intersect(BCSG)
        newMesh = CSG.intersect(meshA, meshB)
    console.log(newMesh)
    // var newMesh = CSG.toMesh(
    //     newCSG,
    //     new THREE.Matrix4(),
    //     meshA.material
    // )
    // CAREFUL!!! since now, position is not correct => can be used only for translation
    // newMesh.material = meshA.material
    // objectList.push(newMesh)
    // scene.add(newMesh)
    // scene.add(CSG.toMesh(
    //     BCSG,
    //     new THREE.Matrix4()
    // ))



}

function edit_pos(pos, value: THREE.Vector3) {
    console.log("edit before", pos)
    for (var i = 0; i < pos.length; i += 3) {
        pos[i] += 2.00000
        //pos[i + 1] += 0
        pos[i + 2] += 6.000000
    }
    console.log("edit after", pos)
    //return pos
}
function is_split(geo1: any, geo2: any) {

    console.log(geo1.attributes.position.array)

    var indices = new Uint16Array(geo1.index.array.length + geo2.index.array.length);
    for (var i = 0; i < geo1.index.array.length; i++)
        indices[i] = geo1.index.array[i];

    for (var i = 0; i < geo2.index.array.length; i++)
        indices[geo1.index.array.length + i] = geo2.index.array[i];
    console.log(indices)
    var pos = new Float32Array(geo1.attributes.position.array.length + geo2.attributes.position.array.length);
    for (var i = 0; i < geo1.attributes.position.array.length; i++)
        pos[i] = geo1.attributes.position.array[i];
    for (var i = 0; i < geo2.attributes.position.array.length; i++)
        pos[geo1.attributes.position.array.length + i] = geo2.attributes.position.array[i];



    //var indices = geo1.index.array.concat(geo2.index.array)
    //var pos = geo1.attributes.position.array.concat(geo2.attributes.position.array)
    //let vertex = new THREE.Vector3(pos.getX(0), pos.getY(0), pos.getZ(0));
    console.log("is_split", pos)
    console.log("is_split", indices)

    const vecIdx: any[] = []
    const verIdx: number[] = []

    for (let i = 0; i < pos.length - 3; i += 3) {
        let tmp = new THREE.Vector3(pos[i], pos[i + 1], pos[i + 2])
        if (arr_find_vec3(vecIdx, tmp) == -1) {
            vecIdx.push(tmp)
        }
    }
    console.log("vecIdx", vecIdx)

    for (let i = 0; i < pos.length - 3; i += 3) {
        let tmp = new THREE.Vector3(pos[i], pos[i + 1], pos[i + 2])
        var idx: number = arr_find_vec3(vecIdx, tmp)
        verIdx.push(idx)
    }
    console.log("verIdx", verIdx)

    const idxTree = new Array(vecIdx.length).fill(-1);



    const groupParent: number[] = []
    var numGroup = 0
    for (let i = 0; i < indices.length - 3; i += 3) {
        // these 3 vertices are connected
        var any_group = [-1], interlap = false
        for (let j = 0; j < 3; j++) {
            if (idxTree[indices[i + j]] != -1) {
                //console.log("IDXX", geometry.index.array[i + j])
                if (any_group.length != 1) {
                    interlap = true
                    any_group.push(indices[i + j])
                }
                else {
                    any_group = [idxTree[indices[i + j]]]
                }
            }
        }
        console.log("IDX__", interlap)
        if (!interlap) {
            if (any_group[0] == -1) {
                // create new group
                idxTree[indices[i]] = numGroup
                idxTree[indices[i + 1]] = numGroup
                idxTree[indices[i + 2]] = numGroup
                numGroup++
                groupParent.push(-1)
            }
            else {
                // assign all vertex to one group
                idxTree[indices[i]] = any_group[0]
                idxTree[indices[i + 1]] = any_group[0]
                idxTree[indices[i + 2]] = any_group[0]
            }
        }
        else {
            // have to merge group
            // let the least groupIDX be the parent of the other group
            any_group.sort(function (a, b) { return a - b });
            for (let k = 1; k < 3; k++) {
                groupParent[any_group[k]] = any_group[0]
            }
        }
    }
    console.log("IdxTree", idxTree)

    // set all group's parent to the top parent
    for (let j = 0; j < groupParent.length; j++) {
        if (groupParent[j] != -1) {
            var topParent
            var tmp = j
            while (true) {
                topParent = groupParent[tmp]
                if (topParent != -1)
                    tmp = groupParent[topParent]
                else
                    break
            }
            groupParent[j] = tmp
        }
    }

    // count all group
    var countGroup = 0
    for (let j = 0; j < groupParent.length; j++) {
        if (groupParent[j] == -1) countGroup++
    }
    console.log("allGroup", countGroup)


    //for
    //console.log("is_split", vertex)
}