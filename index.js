'use strict'
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.114/build/three.module.js'     
import { OrbitControls } from 'https://cdn.jsdelivr.net/npm/three@0.114/examples/jsm/controls/OrbitControls.js';
import * as dat from '../node_modules/dat.gui/build/dat.gui.module.js'
// import {GUI} from "https://cdn.jsdelivr.net/npm/lil-gui@0.16.1/dist/lil-gui.umd.min.js"
import { GLTFLoader } from 'https://cdn.jsdelivr.net/npm/three@0.114/examples/jsm/loaders/GLTFLoader.js';
import {DRACOLoader} from 'https://cdn.jsdelivr.net/npm/three@0.114/examples/jsm/loaders/DRACOLoader.js'
import {CSS2DObject, CSS2DRenderer} from 'https://cdn.jsdelivr.net/npm/three@0.114/examples/jsm/renderers/CSS2DRenderer.js'
import {EffectComposer} from 'https://cdn.jsdelivr.net/npm/three@0.114/examples/jsm/postprocessing/EffectComposer.js'
import {RenderPass} from 'https://cdn.jsdelivr.net/npm/three@0.114/examples/jsm/postprocessing/RenderPass.js'
import {BokehPass} from 'https://cdn.jsdelivr.net/npm/three@0.114/examples/jsm/postprocessing/BokehPass.js'
// import { Object3D } from 'three';
const DayNames = {
    1: 'Mon',
    3: 'Wed',
    5: 'Fri'
  }

let rotWorldMatrix
var xAxis = new THREE.Vector3(1,0,0)
var yAxis = new THREE.Vector3(0,1,0)
let camera, scene, renderer, UIRenderer, light,light2
let group = new THREE.Group()


let t = 0
let networkMesh
const randomAngle = []
const number = 100
const gui = new dat.GUI();
// const fog = new THREE.Fog({color:'black', near:5, end:10})
const textureLoader =new THREE.TextureLoader()
const bakedTexture = textureLoader.load('./src/model/satellite/baked.jpg')
bakedTexture.flipY = false
bakedTexture.outputEncoding = THREE.sRGBEncoding
const dracoLoader = new DRACOLoader()
const gltfLoader = new GLTFLoader()
const canvas = document.querySelector('.webgl')
let surface
let network = new THREE.Group()

let satellite
const surfaceMaterial = new THREE.MeshStandardMaterial()
let previousDeltaSpeedY=0,previousDeltaSpeedX=0
const raycaster = new THREE.Raycaster()
const mouse  = new THREE.Vector2()
let currentIntersect = null   
let mousedown = false
let previousMouseDown = false
let mouseup = true
let deltaX, deltaY, previousX=mouse.x, previousY=mouse.y
let interfaceSerial= { Serial:1}
let obj


//curve
const points=[]
for (var i = 0; i < 5; i++) {
    var randomX = -20 + Math.round(Math.random() * 50);
    var randomY = -15 + Math.round(Math.random() * 40);
    var randomZ = -20 + Math.round(Math.random() * 40);

    points.push(new THREE.Vector3(randomX, randomY, randomZ));
}
const CurveGeometry = new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points), 20, 2, 8, false)
const material = new THREE.MeshBasicMaterial({color:0x00ff00})
const CurveMesh = new THREE.Mesh(CurveGeometry, material)

//Loader
dracoLoader.setDecoderPath('./src/draco/')
gltfLoader.setDRACOLoader(dracoLoader)

//postprocessing
let composer,renderPass,bokehPass

let icon = document.querySelector(".logo")
let back = document.querySelector(".return")
let enter = document.querySelector(".enter")
let welcome = document.querySelector(".welcome")
let upBlock = document.querySelectorAll(".upBlock")
let bottomBlock = document.querySelector(".bottomBlock")
let mainMenu = document.querySelector(".mainMenu")
let className = ['mainMenu','return','upBlock','bottomBlock']
let glitch = document.querySelector(".glitch")
let movingRegion = document.querySelector(".movingRegion")
//点击顶部icon，隐藏所有按钮，回到首页
// icon.onclick = function()
// {
//     //all other UI turn into hide, if you have hide then pass, if you have no hide then you hide
//     let elements = []
//     for(const element of className)
//     {
//         elements = document.getElementsByClassName(element)
//         for(const temp of elements)
//         if(!temp.classList.find("hide"))
//         {
//             temp.classList.toggle("hide")
//         }
//     }
// }

//点击mainMenu的返回菜单，弹回原有彩蛋
back.onclick = function(){
    mainMenu.classList.toggle("active")
    upBlock[0].classList.toggle("active")
    upBlock[1].classList.toggle("active")
    bottomBlock.classList.toggle("active")
    glitch.classList.toggle("hide")
    // obj.position.set(-4.2,1.2,0)
}

console.log(enter)
//点击enter
enter.onclick = function(){
    // 去掉interface0中除logo外的所有element
    // removeEntryUI()
    console.log("enter activate")
    // 移动camera和camera.lookAt
    gsap.to(camera.position,{x:0,y:0,z:10,duration:1})
    gsap.to([welcome,enter],{opacity:0,duration:0.4})
    gsap.to(bokehPass.uniforms.maxblur,{value:0.005})
    gsap.to(bokehPass.uniforms.aperture,{value:18})
    // gsap.to([glitch,mainMenu,back],{opacity:1,delay:0.7})
    // smoothMove
    // 显示下一个页面的UI
    glitch.classList.toggle("hide")
    mainMenu.classList.toggle("hide")
    back.classList.remove("hide")
    // bokehPass.uniforms.maxblur.value = 0.005
    // bokehPass.uniforms.aperture.value = 18
}

movingRegion.onclick = function(){
    //remove the surface
    scene.remove(surface)
    // gsap.to(camera.position,{x:0,y:0,z:-10,duration:1})
    
    //initial the network
    initNetwork()

    //fov-change
    gsap.to(bokehPass.uniforms.maxblur,{value:0})
    gsap.to(bokehPass.uniforms.aperture,{value:0})
    // gsap.to(camera.position,{x:0,y:0,z:-10,duration:1})
    camera.position.set(0,0,-10)
    camera.lookAt(network.position)
    // gsap.to(surface,{opacity:0, duration:1})

    //UIChange
    glitch.classList.toggle("hide")
    mainMenu.classList.toggle("hide")

}

//EventListener
{
    //Convert mouse coordinates to 2D
    window.addEventListener('mousemove', (event) =>
    {
        mouse.x = event.clientX / window.innerWidth * 2 - 1
        mouse.y = - (event.clientY / window.innerHeight) * 2 + 1
    })

    //Click Listener
    window.addEventListener('click', () =>{
        if (currentIntersect){
            if(currentIntersect.object === surface){
                console.log('click on the surface   ')
            }}})

    window.addEventListener('mousedown', () =>{
        mousedown = true
        mouseup = false
    })

    window.addEventListener('mouseup', () =>{
        mouseup = true
        mousedown = false
    })
    window.addEventListener( 'resize', onWindowResize );
}

init()
// loadGLTF()
update()

function init() {

    //Camera
    camera = new THREE.PerspectiveCamera( 27, window.innerWidth / window.innerHeight, 0.001, 3500 );
    //Scene & Background Color
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xE1DFE4)
    //Light
    light = new THREE.AmbientLight({color:new THREE.Color(0xFFFBF0), intensity: 100});
    

    //initObjects
    generateParticle(number)//Particle
    initSurface()//earth

    // scene.add(CurveMesh);
    scene.add( light );
    scene.add(surface);
    // scene.add(network)
    // scene.add(satellite)

    gsap.fromTo([welcome,enter],{opacity:0},{duration:1,opacity:1,delay:1})
    
    // Axes helper
    //  const axesHelper = new THREE.AxesHelper(2);scene.add(axesHelper);
    
    //Controls
    // const controls = new OrbitControls(camera, canvas);controls.enableDamping = true;

    //position initialization
    camera.position.set(2.4,0,2)
    surface.position.set(2.4,0,0)

    // camera.lookAt(surface)

    rendererInitialization()//Renderer

    postprocessing()//postprocessing
    
    GUIInitialization()// UI()
}

function update() 
{
    requestAnimationFrame( update );
    t += 0.01
    
    //surface
    surfaceMaterial.emissiveIntensity =0.5+0.3* Math.sin(t) 

    //cast a ray
    raycaster.setFromCamera(mouse,camera)
    
    ParticleUpdate()

    RotateJudge()

    previousMouseDown = mousedown

    render()

}

//WindowResize
function onWindowResize() {

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();


    renderer.setSize(window.innerWidth, window.innerHeight);
    composer.setSize(window.innerWidth, window.innerHeight);
    // UIRenderer.setSize(window.innerWidth, window.innerHeight)

}

//Background generation
function generateParticle(temp){
    //radius, widthSegments, heightSegments,
    
    for(let i=0; i<temp;i++)
    {
        randomAngle.push((Math.random()-0.5) * Math.PI)
        //Size
        const geometry = new THREE.SphereBufferGeometry(Math.random()*0.05*2,64,64)
        // let SphereMaterial = new THREE.MeshBasicMaterial({fog:true})
        let SphereMaterial = new THREE.MeshBasicMaterial()
        //Color & Material & Opacity
        const ColorCode = Math.floor(Math.random(1)*10)

        if(ColorCode <8) { SphereMaterial.color = new THREE.Color(0xFFFFFF)}
            else { SphereMaterial.color = new THREE.Color(0xD21635)}
        // transpancy
        //material.alhaMap controls the opacity in the grayscale
        const ball = new THREE.Mesh(geometry,SphereMaterial)

        //position
        ball.position.set((Math.random()-0.5)*10,(Math.random()-0.5)*5,-3)
        // ball.scale.set(0.5,0.5,0.5)

        group.add(ball)

    }
    scene.add(group)

}
//ParticleUpdate
function ParticleUpdate(){
    //background particle
    for(let i=0;i<group.children.length;i++)

    {
        group.children[i].position.set(

        group.children[i].position.x+Math.sin(randomAngle[i])*0.006,

        group.children[i].position.y+Math.cos(randomAngle[i])*0.006,

        -3
        )
        //lifeCountdown
        group.children[i].scale.set(group.children[i].scale.x*0.995+((Math.random()-0.5)*0.01),group.children[i].scale.y*0.995+((Math.random()-0.5)*0.01),group.children[i].scale.z*0.995+((Math.random()-0.5)*0.01))




        group.children[i].material.opacity *=0.9

        if(group.children[i].scale.x<0.4)

        {        
            generateParticle(1)
            group.remove(group.children[i])


            randomAngle.splice(i,1)
        }
    }
}

//Rotation with World axis
function rotateAroundWorldAxis(object, axis, radians){
    rotWorldMatrix = new THREE.Matrix4()
    rotWorldMatrix.makeRotationAxis(axis.normalize(),radians)

    rotWorldMatrix.multiply(object.matrix)

    object.matrix = rotWorldMatrix
    object.rotation.setFromRotationMatrix(object.matrix)
}

function RotateJudge()
{
    const Intersect = raycaster.intersectObject(surface)
    if(Intersect.length)
    {
        if(currentIntersect === null)
        {
            console.log('mouse enter')
        }
        currentIntersect = Intersect[0]
    }
    else 
    {
        if(currentIntersect)
        {
            console.log('mouse leave')
        }

        currentIntersect = null
    }

    //Intersect.length一直有  Rotation Judge
    if(!previousMouseDown)
    {
        if(mousedown)
        {
        previousX = mouse.x
        previousY = mouse.y
        deltaX = 0
        deltaY = 0
        }
    }
    else
    {
        if(Intersect.length && mousedown)
        {
            deltaX = mouse.x - previousX
            deltaY = mouse.y - previousY
            
            previousX = mouse.x
            previousY = mouse.y
            previousDeltaSpeedY = deltaX * Math.PI * 1
            previousDeltaSpeedX = -deltaY * Math.PI * 1
            rotateAroundWorldAxis(surface,xAxis,previousDeltaSpeedX)
            rotateAroundWorldAxis(surface,yAxis,previousDeltaSpeedY)
        }
    }

    // updateSurface
    rotateAroundWorldAxis(surface,xAxis,0.01*Math.PI*0.01)
    rotateAroundWorldAxis(surface,yAxis,0.01*Math.PI*0.05)
    // surface.position.set(0,t*Math.sin(Math.PI),0)
    surface.position.y = 0.1* Math.sin(t*Math.PI)

    if(previousDeltaSpeedX)
    {
        rotateAroundWorldAxis(surface,xAxis, 0.01*Math.PI*0.01)   
        previousDeltaSpeedX = 1/2*(previousDeltaSpeedX + 0.01*Math.PI*0.01)
    }
    else
    {
        rotateAroundWorldAxis(surface,xAxis,0.01*Math.PI*0.01)
    }
    if(previousDeltaSpeedY)
    {
        rotateAroundWorldAxis(surface,yAxis, 0.01*Math.PI*0.05)
        previousDeltaSpeedY = 1/2*(previousDeltaSpeedY + 0.01*Math.PI*0.05)
    }
    else
    {
        rotateAroundWorldAxis(surface,yAxis, 0.01*Math.PI*0.05)
    }

}


function render()
{
    // renderer.render(scene,camera)
    composer.render()

}

function removeEntryUI()
{
    welcome.classList.toggle("hide")
    enter.classList.toggle("hide")
}

function initNetwork(){
    const bakedMaterial = new THREE.MeshDepthMaterial()
    gltfLoader.load(
        'src/model/network/network.gltf',
        (gltf) =>
        {
            gltf.scene.traverse((child) =>
            child.material = bakedMaterial
                )
            scene.add(gltf.scene)
            // console.log(scene)
            hyalinizeNetwork("right")
            gltf.scene.scale.set(0.3,0.3,0.3)
            gltf.scene.position.set(-3,0,0)
            gltf.scene.rotation.set(Math.PI/4,Math.PI/4,Math.PI/4)
        }
    )
}

function hyalinizeNetwork(direction){
    const part = ["-flank1","-flank2","-bottom","-middle","-up","top"]
    for(const element of part){
        const temp = scene.getObjectByName(direction+element)//temp就是那个文件
        console.log(temp)
        // temp.material.opacity = 0
    }
}

function initSurface(){

    // object & material
    surfaceMaterial.map = new textureLoader.load('src/model/earth/earthTexture/8k_earth_whitemap-2.png')
    surfaceMaterial.normalMap = new textureLoader.load('./src/model/earth/earthTexture/8k_earth_normal_map.png')
    surfaceMaterial.emissive = new THREE.Color(0xFFFFFF)
    surfaceMaterial.emissiveIntensity = 0.5
    surfaceMaterial.emissiveMap = new textureLoader.load('src/model/earth/earthTexture/8k_earth_emissive_map.png')
    surface = new THREE.Mesh(new THREE.SphereBufferGeometry(1.4,128,128),surfaceMaterial)

}

function initSatellite(){
    const bakedMaterial = new THREE.MeshBasicMaterial({map:bakedTexture})
    // bakedMaterial.depthWrite = true
    gltfLoader.load(
        './src/model/satellite/satellite.glb',
        (gltf) =>
        {
            gltf.scene.traverse((child) =>
            {
                child.material = bakedMaterial
            })
            network.add(gltf.scene) 
            //network.children[0].children代表了每个部位的不同设备
            // console.log(gltf.scene.children)
            network.add(gltf.scene)
            console.log(network)
            // network = gltf.scene.children[0].children
            //network.children[0]

            //addMaterial
            // for(let i = 0;i<network.length;i++)
            // {
            //     network[i].material = bakedMaterial
            // }
        }
    )
    // console.log(network)
    // console.log(network.position)
    scene.add(network)
    network.position.set(2.4,0,0)
    network.scale.set(0.3,0.3,0.3)
    network.rotation.set(Math.PI/4,0,Math.PI/4)
}

function GUIInitialization(){
    gui.add(camera.position,"x",-10,10,0.1).name("X position")
    gui.add(camera.position,"y",-10,10,0.1).name("Y position")
    gui.add(camera.position,"z",-10,10,0.1).name("Z position")
    gui.add(bokehPass.uniforms.focus,"value",0,100,0.1).name("focus")
    gui.add(bokehPass.uniforms.aperture,"value",0,100,0.1).name("aperture")
    gui.add(bokehPass.uniforms.maxblur,"value",0,0.01,0.0001).name("maxblur")
    gui.hide()
}

function postprocessing(){
    composer = new EffectComposer(renderer)
    renderPass = new RenderPass(scene,camera)
    renderPass.renderToScreen = true
    bokehPass = new BokehPass( scene, camera, {
        focus: 1,
        aspect:camera.aspect,
        aperture: 67,
        maxblur: 0.05,
        width: window.innerWidth,   
        height: window.innerHeight
    } );
    composer.addPass(renderPass)
    composer.addPass(bokehPass)
}

function rendererInitialization(){
    renderer = new THREE.WebGLRenderer( { antialias: true, canvas:canvas } )
    renderer.setPixelRatio( window.devicePixelRatio )
    renderer.setSize( window.innerWidth, window.innerHeight )
    // renderer.outputEncoding = THREE.sRGBEncoding
    document.body.appendChild( renderer.domElement )
}