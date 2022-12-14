// three.js
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
// physics
console.log('Three.js version r' + THREE.REVISION)
import { AmmoPhysics, ExtendedMesh, PhysicsLoader } from '@enable3d/ammo-physics'

// CSG
import { CSG } from '@enable3d/three-graphics/jsm/csg'
import { gen_cut_mesh_from_line, enable, set_raycast, lineMesh } from "./cut"
// Flat
import { TextTexture, TextSprite } from '@enable3d/three-graphics/jsm/flat'

export var intervalTime
var prevTime
const width = window.innerWidth
const height = window.innerHeight
const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000)
export var cube
export var miniCube
camera.position.set(0, 0, 20)
camera.lookAt(0, 0, 0)
// renderer
const renderer = new THREE.WebGLRenderer()
renderer.setSize(width, height)
renderer.autoClear = false
document.body.appendChild(renderer.domElement)
const controls = new OrbitControls(camera, renderer.domElement)
const scene = new THREE.Scene()

var objectList: THREE.Mesh[] = []

document.addEventListener('pointerdown', (event) => {
    // console.log("click")

    enable(true, scene)
    var camDir = new THREE.Vector3();
    camera.getWorldDirection(camDir)
    console.log("camDir", camDir)
    scene.add(lineMesh)

});
document.addEventListener('pointerup', (event) => {
    controls.enabled = true;
    enable(false, scene)
    console.log("release")
});
document.addEventListener('mousemove', (event) => {
    //if (controls.enabled) return
    //gen_cutter(scene, camera)
    console.log("move")
});
document.addEventListener("keydown", onDocumentKeyDown, false);
function onDocumentKeyDown(event) {
    var keyCode = event.which;
    if (keyCode == 32) {

        controls.enabled = !controls.enabled;
        // console.log("space")
        // enable(true, scene)
        // operate_cut(scene, objectLists)
    }

};

const MainScene = () => {
    // sizes


    // scene

    scene.background = new THREE.Color(0x909090)

    // camera


    // you can access Ammo directly if you want
    // new Ammo.btVector3(1, 2, 3).y()

    // 2d camera/2d scene
    const scene2d = new THREE.Scene()
    const camera2d = new THREE.OrthographicCamera(0, width, height, 0, 1, 1000)
    camera2d.position.setZ(10)



    // csg
    const mat = new THREE.MeshNormalMaterial()
    const meshA = new THREE.Mesh(new THREE.BoxBufferGeometry(1, 1, 1))
    const meshB = new THREE.Mesh(new THREE.SphereBufferGeometry(0.5, 16, 16))
    meshA.position.set(3, 3, 0)
    meshB.position.set(3.25, 3.1, 0.4)
    const meshC_0 = CSG.intersect(meshA, meshB)
    const meshC_1 = CSG.subtract(meshA, meshB)
    const meshC_2 = CSG.union(meshA, meshB)
    meshC_0.material = mat
    meshC_1.material = mat
    meshC_2.material = mat
    meshC_0.position.setX(3)
    meshC_1.position.setX(5)
    meshC_2.position.setX(7)
    scene.add(meshC_0, meshC_1, meshC_2)
    // objectList.push(meshC_0)
    // objectList.push(meshC_1)
    // objectList.push(meshC_2)

    //const cutMesh = gen_cut_mesh_from_line(scene)
    scene.add(lineMesh)









    // add 2d text
    const text = new TextTexture('some 2d text', { fontWeight: 'bold', fontSize: 48 })
    const sprite = new TextSprite(text)
    const scale = 0.5
    sprite.setScale(scale)
    sprite.setPosition(0 + (text.width * scale) / 2 + 12, height - (text.height * scale) / 2 - 12)
    scene2d.add(sprite)

    // dpr
    const DPR = window.devicePixelRatio
    renderer.setPixelRatio(Math.min(2, DPR))



    // light
    scene.add(new THREE.AmbientLight(0x111111));

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.125);

    directionalLight.position.x = 0;
    directionalLight.position.y = 0;
    directionalLight.position.z = 1;
    directionalLight.position.normalize();

    scene.add(directionalLight);

    var pointLight = new THREE.PointLight(0xffffff, 1);
    //scene.add(pointLight);

    //pointLight.add(new THREE.Mesh(new THREE.SphereGeometry(4, 8, 8), new THREE.MeshBasicMaterial({ color: 0xffffff })));
    // physics
    const physics = new AmmoPhysics(scene as any)
    physics.debug?.enable()

    // extract the object factory from physics
    // the factory will make/add object without physics
    const { factory } = physics

    // blue box
    //physics.add.box({ x: 0.05, y: 10 }, { lambert: { color: 0x2194ce } })

    // static ground
    //physics.add.ground({ width: 20, height: 20 })

    // add a normal sphere using the object factory
    // (NOTE: This will be factory.add.sphere() in the future)
    // first parameter is the config for the geometry
    // second parameter is for the material
    // you could also add a custom material like so { custom: new THREE.MeshLambertMaterial({ color: 0x00ff00 }) }
    // const greenSphere = factory.add.sphere({ y: 2, z: 5 }, { lambert: { color: 0x00ff00 } })
    // // once the object is created, you can add physics to it
    // physics.add.existing(greenSphere)

    // green box
    const geometry = new THREE.BoxBufferGeometry(3, 3, 3)
    const material = new THREE.MeshPhongMaterial({ color: 0xdddddd, specular: 0x009900, shininess: 30 })
    material.opacity = 0.9
    //material.transparent = true
    cube = new ExtendedMesh(geometry, material)
    cube.position.set(0, 0, 0)
    {
        // const newMesh = CSG.subtract(cube, cutMesh)
        // newMesh.material = mat
        // newMesh.position.set(0, 9, 0)
        // //newMesh.material.side = THREE.DoubleSide;
        // scene.add(newMesh)
    }
    scene.add(cube)
    objectList.push(cube)
    physics.add.existing(cube as any)
    cube.body.setCollisionFlags(2) // make it kinematic

    const geometry1 = new THREE.BoxBufferGeometry(1, 1, 1)
    miniCube = new ExtendedMesh(geometry1, material)
    miniCube.position.set(5, 0, 0)
    scene.add(miniCube)
    objectList.push(miniCube)
    // merge children to compound shape


    // clock
    // const clock = new THREE.Clock()

    // loop
    const animate = () => {
        const d = new Date();
        intervalTime = d.getTime() - prevTime
        prevTime = d.getTime()
        const timer = 0.0001 * Date.now();
        pointLight.position.x = Math.sin(timer * 7) * 300;
        pointLight.position.y = Math.cos(timer * 5) * 400;
        pointLight.position.z = Math.cos(timer * 3) * 300;
        // physics.update(clock.getDelta() * 1000)
        // physics.updateDebugger()

        // you have to clear and call render twice because there are 2 scenes
        // one 3d scene and one 2d scene
        renderer.clear()
        renderer.render(scene, camera)
        renderer.clearDepth()
        renderer.render(scene2d, camera2d)

        requestAnimationFrame(animate)
    }
    requestAnimationFrame(animate)

    set_raycast(renderer, camera, objectList, scene)

}


// '/ammo' is the folder where all ammo file are
PhysicsLoader('./ammo', () => MainScene())
