'use strict';
import * as THREE from './src/three.module.js';
// import { OrbitControls } from 'https://cdn.jsdelivr.net/npm/three@0.114/examples/jsm/controls/OrbitControls.js';
import * as dat from './src/dat/dat.gui.module.js';
// import {GUI} from "https://cdn.jsdelivr.net/npm/lil-gui@0.16.1/dist/lil-gui.umd.min.js"
import { GLTFLoader } from './src/loaders/GLTFLoader.js';
import {DRACOLoader} from './src/loaders/DRACOLoader.js';
// import {CSS2DObject, CSS2DRenderer} from 'https://cdn.jsdelivr.net/npm/three@0.114/examples/jsm/renderers/CSS2DRenderer.js'
import {EffectComposer} from './src/postprocessing/EffectComposer.js';
import {RenderPass} from './src/postprocessing/RenderPass.js';
import {BokehPass} from './src/postprocessing/BokehPass.js';
import {UnrealBloomPass} from './src/postprocessing/UnrealBloomPass.js';
import { FBXLoader } from './src/loaders/FBXLoader.js';
import { RoomEnvironment } from './src/environments/RoomEnvironment.js';
import { CSS2DRenderer, CSS2DObject } from './src/renderers/CSS2DRenderer.js';
import { OrbitControls } from './src/controls/OrbitControls.js';
// import {Stats} from 'https://cdn.jsdelivr.net/npm/stats.js@0.17.0/src/Stats.js';
const DayNames = {
    1: 'Mon',
    3: 'Wed',
    5: 'Fri'
  };
let pageNow='';
let rotWorldMatrix;
var xAxis = new THREE.Vector3(1,0,0);
var yAxis = new THREE.Vector3(0,1,0);
var zAxis = new THREE.Vector3(0,0,1);
let camera, scene, renderer, labelRenderer,UIRenderer, light,light2;
let group = new THREE.Group();
let groupNow = new THREE.Group();
let earthAvailable = true

var w = window.innerWidth / 2;
var h = window.innerHeight / 2;

let t = 0;
const randomAngle = [];
const number = 100;
const gui = new dat.GUI();
let controls;   

// const fog = new THREE.Fog({color:'black', near:5, end:10})
const textureLoader =new THREE.TextureLoader();
const bakedTexture = textureLoader.load('src/model/newModel/baked.jpg');
const bakedNetworkTexture = textureLoader.load('src/model/newModel/bakedNetwork.jpg');
const bakedMaterial = new THREE.MeshMatcapMaterial({map:bakedTexture});
const bakedNetworkMaterial = new THREE.MeshMatcapMaterial({map:bakedNetworkTexture});
bakedTexture.flipY = false;
bakedTexture.outputEncoding = THREE.sRGBEncoding;
bakedNetworkTexture.flipY = false;
bakedNetworkTexture.outputEncoding = THREE.sRGBEncoding;
const dracoLoader = new DRACOLoader();
const gltfLoader = new GLTFLoader();
const canvas = document.querySelector('.webgl');
let surface;
let netPoint = new THREE.Group();

let network,satellite;
let networkExist= false;
let satelliteExist = false;
const surfaceMaterial = new THREE.MeshStandardMaterial();
let previousDeltaSpeedY=0,previousDeltaSpeedX=0;
const raycaster = new THREE.Raycaster();
const mouse  = new THREE.Vector2();
let currentIntersect = null ;
let mousedown = false;
let previousMouseDown = false;
let mouseup = true;
let deltaX, deltaY, previousX=mouse.x, previousY=mouse.y;
let interfaceSerial= { Serial:1};
let obj;
let ambientLight;

//main
let main=document.getElementById("main");

//NetworkUI
let Network = document.querySelector(".Network");
let NetworkData = document.querySelector(".NetworkData");
let NetworkText = document.querySelector(".NetworkText");
let NetworkMenu = document.querySelector(".NetworkMenu");
let sateButton = document.getElementsByClassName("button");
let netDiv = document.getElementsByClassName("netDiv");
let netIcon = document.getElementsByClassName("netIcon");
let NetworkSerial = document.getElementsByClassName("NetworkSerial");
let logoBack=document.getElementById('mainBack');//返回

// let satellite1 = document.getElementById("one");
let satellite1 = document.getElementsByClassName("button");

// SatelliteUI
let satelliteRoot = new THREE.Group();

let satelliteUI = document.querySelector(".satelliteUI");
let satelliteCaption = document.querySelector(".satelliteCaption");
let satelliteText = document.querySelector(".satelliteText");
let satelliteMenu = document.querySelector(".satelliteMenu");
let sateDiv = document.getElementsByClassName("sateDiv");
let sateIcon = document.getElementsByClassName("sateIcon");
let satelliteSerial = document.getElementsByClassName("satelliteSerial");

//SatelliteIndication
let flank1Part,bottomPart,topPart,flank1,bottom,top,satelliteBack,flank1Label,bottomLabel,topLabel;

//curve
const points=[];
for (var i = 0; i < 5; i++) {
    var randomX = -20 + Math.round(Math.random() * 50);
    var randomY = -15 + Math.round(Math.random() * 40);
    var randomZ = -20 + Math.round(Math.random() * 40);

    points.push(new THREE.Vector3(randomX, randomY, randomZ));
}
const CurveGeometry = new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points), 20, 2, 8, false);
const material = new THREE.MeshBasicMaterial({color:0x00ff00});
const CurveMesh = new THREE.Mesh(CurveGeometry, material);

//Loader
dracoLoader.setDecoderPath('./src/draco/');
gltfLoader.setDRACOLoader(dracoLoader);

//postprocessing
let composer,renderPass,bokehPass,unrealBloomPass;


//enterPage
let enterHomepage = document.querySelector(".enter");//🌟🌟
let welcome = document.querySelector(".welcome");

//HomePage
let back = document.querySelector(".return");//back-earth页面的内容
let upBlock = document.querySelectorAll(".upBlock");
let bottomBlock = document.querySelector(".bottomBlock");
let mainMenu = document.querySelector(".mainMenu");
let className = ['mainMenu','return','upBlock','bottomBlock'];
let glitch = document.querySelector(".glitch");
let Net1=document.getElementsByClassName("odd");//🌟🌟
let Net2=document.getElementsByClassName("even");//🌟🌟

let movingRegion = document.querySelector(".movingRegion");

// const stats = new Stats();
// main.appendChild(stats.dom);


// logoBack.addEventListener('click',backToBefore);//返回事件添加


init();
update();

//点击enter
logoBack.onclick = backToBefore;//返回
enterHomepage.onclick = enterEarth;//首页的进入
for(const element of satellite1){element.onclick = enterSatellite;}
for(const element of netDiv){ element.onclick = refreshNetwork;}
for(const element of satelliteSerial){ element.onclick = refreshSatellite;}
// satellite1.onclick = enterSatellite;

function refreshSatellite(){
    escapeFromSatellite();
    //3.接着，loadSatellite
    // addSatellite("src/model/newModel/222.glb").then(function(result,reject){
    addModel({url:"newModel/satellite.glb",scale:"big"}).then(function(result,reject){
    
    //4.change fov etc.
    gsap.to(bokehPass.uniforms.maxblur,{value:0,duration:0.4,delay:0.6});
    gsap.to(bokehPass.uniforms.aperture,{value:0,duration:0.4,delay:0.6});
    gsap.to(bokehPass.uniforms.focus,{value:0,duration:0.4,delay:0.6});

    //5.addSatelliteUI
    addSatelliteUI();
    });
}

function refreshNetwork(){
    //
    escapeFromNetwork();
    addModel({url:"newModel/network-Merged.glb",scale:"small"}).then(function(result,reject){
    
        //4.change fov etc.
        gsap.to(bokehPass.uniforms.maxblur,{value:0,duration:0.4,delay:0.6});
        gsap.to(bokehPass.uniforms.aperture,{value:0,duration:0.4,delay:0.6});
        gsap.to(bokehPass.uniforms.focus,{value:0,duration:0.4,delay:0.6});
    
        // 4.加载后续menu
        addNetworkUI();
    
        //5.弹出back按钮
        gsap.to(logoBack,{opacity:1,duration:0.4,delay:0.6});
    
        document.addEventListener('keypress',rotateTheNetwork);
    
    
        });
    
        // 5.修改pageNow——本质上是修改绑定事件
        pageNow="page1";
        
        // bokehPass change
}

function rotateTheNetwork(key){
    switch(key.keyCode){
        case 119://w
            console.log("w pressed");
            // DIYGsapTo(network,xAxis,0.23+Math.PI/2);
            // DIYGsapTo(network,yAxis,-0.04);
            // DIYGsapTo(network,zAxis,0.09);

            gsap.to(network.rotation,{y:network.rotation.y+Math.PI/2,duration:1});

            // DIYGsapTo(network,yAxis);
            // DIYGsapTo(network,zAxis);
        case 97://a
            gsap.to(network.rotation,{x:network.rotation.x+Math.PI/2,y:network.rotation.y-Math.PI/6,z:network.rotation.z-Math.PI/2,duration:1});
        case 115://s
            gsap.to(network.rotation,{x:network.rotation.x-Math.PI/2,duration:1});
            // DIYGsapTo(network,xAxis,0.23+Math.PI/2);
            // DIYGsapTo(network,yAxis,-0.04);
            // DIYGsapTo(network,zAxis,0.09);
        case 100://d
            gsap.to(network.rotation,{x:network.rotation.x-Math.PI/2,y:network.rotation.y+Math.PI/6,z:network.rotation.z+Math.PI/2,duration:1});

            gsap.to(network.rotation,{y:network.rotation.y-Math.PI/2,duration:1});

            // DIYGsapTo(network,xAxis,0.23-Math.PI/2);
            // DIYGsapTo(network,yAxis,-0.04);
            // DIYGsapTo(network,zAxis,0.09);
    }

    //清除原有UI
    // 2.UI消失的动画调整
    gsap.to([logoBack,Network,NetworkData,NetworkText,NetworkMenu],{opacity:0,duration:0.4});  
    for(const element of [logoBack,Network,NetworkData,NetworkText,NetworkMenu]) {element.style.pointerEvents = "none";} 
    gsap.to(netDiv,{opacity:0,duration:0.4});   for(const element of netDiv) {element.style.pointerEvents = "none";} 
    gsap.to(netIcon,{opacity:0,duration:0.4});   for(const element of netIcon) {element.style.pointerEvents = "none";} 
    gsap.to(NetworkSerial,{opacity:0,duration:0.4});    for(const element of NetworkSerial) {element.style.pointerEvents = "none";}  


    //加载UI
     addNetworkUI();

     //5.弹出back按钮
     gsap.to(logoBack,{opacity:1,duration:0.4,delay:0.6});
 

}

function DIYGsapTo(object,axis,angle){
    let frameRate = 60;
    for(let i =0;i<frameRate;i++)
            {
                rotateAroundWorldAxis(network,axis,angle/frameRate);
                // gsap.to(network,)
            }
}

function enterEarth(){
    // 移除UI
    gsap.to(camera.position,{x:0,y:0,z:10,duration:1});
    gsap.to([welcome,enterHomepage],{opacity:0,duration:0.4});
    gsap.to(bokehPass.uniforms.maxblur,{value:0.005});
    gsap.to(bokehPass.uniforms.aperture,{value:18});

    // 显示下一个页面的UI
    glitch.classList.toggle("hide");
    mainMenu.classList.toggle("hide");
    back.classList.remove("hide");

    enterHomepage.style.pointerEvents = "none";
    // console.log("welcome是:",welcome);

    //激活pointerEvents
    for(const element of Net1){element.style.pointerEvents = "auto"; element.onclick = enterNetwork;}//network页面的第一个satellite
    for(const element of Net2){element.style.pointerEvents = "auto"; element.onclick = enterNetwork;}//network页面的第一个satellite


}

function enterNetwork()//显示network大模型
{
    // 1.移除地球 ,并解绑地球的事件
    surface.material.transparent = true;
    gsap.to(surface.material,{opacity:0,duration:0.4}).then(scene.remove(surface));    earthAvailable = false;

    // 2.移除原有UI 
    gsap.to([glitch,mainMenu],{opacity:0,duration:0.4}).then(glitch.style.pointerEvents = "none" , mainMenu.style.pointerEvents = "none");

    for(const element of Net1){element.style.pointerEvents = "none";}
    for(const element of Net2){element.style.pointerEvents = "none";}

    // 3.加载glb1🌟🌟🌟
    // addNetwork("src/model/newModel/network.glb");
    addModel({url:"newModel/network-Merged.glb",scale:"small"}).then(function(result,reject){
    
    //4.change fov etc.
    gsap.to(bokehPass.uniforms.maxblur,{value:0,duration:0.4,delay:0.6});
    gsap.to(bokehPass.uniforms.aperture,{value:0,duration:0.4,delay:0.6});
    gsap.to(bokehPass.uniforms.focus,{value:0,duration:0.4,delay:0.6});

    // 4.加载后续menu
    addNetworkUI();

    //5.弹出back按钮
    gsap.to(logoBack,{opacity:1,duration:0.4,delay:0.6});

    document.addEventListener('keypress',rotateTheNetwork);


    });

    // 5.修改pageNow——本质上是修改绑定事件
    pageNow="page1";
    
    // bokehPass change


}

//第一个按键点击事件
function enterSatellite(){
    
    //1.使network消失
        
    escapeFromNetwork();
    networkExist = false;

    //2.更换Page计数
    pageNow="page2";

    //3.接着，loadSatellite
    // addSatellite("src/model/newModel/222.glb").then(function(result,reject){
    addModel({url:"newModel/satellite.glb",scale:"big"}).then(function(result,reject){
    
    //4.change fov etc.
    gsap.to(bokehPass.uniforms.maxblur,{value:0,duration:0.4,delay:0.6});
    gsap.to(bokehPass.uniforms.aperture,{value:0,duration:0.4,delay:0.6});
    gsap.to(bokehPass.uniforms.focus,{value:0,duration:0.4,delay:0.6});

    //5.addSatelliteUI
    addSatelliteUI();
    });
    
}

function addNetworkUI()//添加大模型页面
{
    // UI on the left side
    gsap.to([Network,NetworkData,NetworkText,logoBack],{opacity:1,duration:0.4,delay:0.6});  
    gsap.to(logoBack,{left:123,duration:0.4,delay:0.6});
    gsap.to(sateButton,{opacity:1,duration:0.4,delay:0.6});
    Network.style.pointerEvents = "auto";NetworkData.style.pointerEvents = "auto";NetworkText.style.pointerEvents = "auto";logoBack.style.pointerEvents = "auto";
    for (const element of sateButton){element.style.pointerEvents = "auto";}

    // UI on the right side
    gsap.to(NetworkMenu,{opacity:1,duration:0.4,delay:0.6});
    gsap.to(netDiv,{opacity:1,duration:0.4,delay:0.6});
    gsap.to(netIcon,{opacity:1,duration:0.4,delay:0.6});
    gsap.to(NetworkSerial,{opacity:1,duration:0.4,delay:0.6});
    NetworkMenu.style.pointerEvents = "auto";
    // satellite1.style.pointerEvents = "auto";
    for(const element of satellite1){element.style.pointerEvents = "auto";}
    for (const element of netDiv){element.style.pointerEvents = "auto";}
    for (const element of netIcon){element.style.pointerEvents = "auto";}
    for (const element of NetworkSerial){element.style.pointerEvents = "auto";}

}

function escapeFromNetwork(){
    // 1.模型消失
    scene.remove(network);
    
    // 2.UI消失的动画调整
    gsap.to([logoBack,Network,NetworkData,NetworkText,NetworkMenu],{opacity:0,duration:0.4});  
    for(const element of [logoBack,Network,NetworkData,NetworkText,NetworkMenu]) {element.style.pointerEvents = "none";} 
    gsap.to(netDiv,{opacity:0,duration:0.4});   for(const element of netDiv) {element.style.pointerEvents = "none";} 
    gsap.to(netIcon,{opacity:0,duration:0.4});   for(const element of netIcon) {element.style.pointerEvents = "none";} 
    gsap.to(NetworkSerial,{opacity:0,duration:0.4});    for(const element of NetworkSerial) {element.style.pointerEvents = "none";}  
}

function addSatelliteUI()//小模型页面添加
{
    // 出现logoBack
    gsap.to(logoBack,{left:790,opacity:1,duration:0.4,delay:0.6});logoBack.style.pointerEvents = "auto";
    //出现右侧UI
    gsap.to([satelliteUI,satelliteCaption,satelliteText],{opacity:1,duration:0.4,delay:0.6});
    satelliteUI.style.pointerEvents = "auto"; satelliteCaption.style.pointerEvents = "auto"; satelliteText.style.pointerEvents = "auto";
    
    //出现右下角的菜单式UI
    gsap.to(satelliteMenu,{opacity:1,duration:0.4,delay:0.6});satelliteMenu.style.pointerEvents = "auto";
    gsap.to(sateDiv,{opacity:1,duration:0.4,delay:0.6});for(const element of sateDiv){element.style.pointerEvents = "auto";}
    gsap.to(sateIcon,{opacity:1,duration:0.4,delay:0.6});for(const element of sateIcon){element.style.pointerEvents = "auto";}
    gsap.to(satelliteSerial,{opacity:1,duration:0.4,delay:0.6});for(const element of satelliteSerial){element.style.pointerEvents = "auto";}

    flank1Part = satellite.getObjectByName('flank15');
    bottomPart = satellite.getObjectByName('bottom2');
    topPart = satellite.getObjectByName('top4');
   
    // satellite.layers.enableAll();
    
    //随行的UI
    //捕获
    flank1 = document.querySelector(".flank1");
    bottom = document.querySelector(".bottom");
    top = document.querySelector(".top");
    satelliteBack = document.querySelector(".back");
    //渐进出现
    gsap.to([flank1,bottom,top],{opacity:1,duration:0.4,delay:0.6});
    //恢复pointerevents
    flank1.style.pointerEvents = "auto";
    bottom.style.pointerEvents = "auto";
    top.style.pointerEvents = "auto";

    satelliteIndicationPositionSet();
    flank1.onclick = enterFlank1;
    bottom.onclick = enterBottom;
    top.onclick = enterTop;

    gui.add(satellite.position,"x",-6,0,0.01).name("satellitePosX");
    gui.add(satellite.position,"y",-2,6,0.01).name("satellitePosY");
    gui.add(satellite.position,"z",-2,2,0.01).name("satellitePosZ");
    gui.add(satellite.rotation,"x",-Math.PI*2,Math.PI*2,0.01).name("satelliteRotX");
    gui.add(satellite.rotation,"y",-Math.PI*2,Math.PI*2,0.01).name("satelliteRotY");
    gui.add(satellite.rotation,"z",-Math.PI*2,Math.PI*2,0.01).name("satelliteRotZ");
    gui.add(satellite.scale,"x",-2,2,0.01).name("satelliteScaleX");
    gui.add(satellite.scale,"y",-2,2,0.01).name("satelliteScaleY");
    gui.add(satellite.scale,"z",-2,2,0.01).name("satelliteScaleZ");

}

function satelliteIndicationPositionSet(){
    var vector;
    var flank1Vector = flank1Part.getWorldPosition();
    vector = flank1Vector.project(camera);
    flank1.style.left = Math.round(vector.x *w + w)+"px";
    flank1.style.top = Math.round(-vector.y * h + h)+"px";
    
    
    var bottomVector = bottomPart.getWorldPosition();
    vector = bottomVector.project(camera);
    bottom.style.left = Math.round(vector.x *w + w)+"px";
    bottom.style.top = Math.round(-vector.y * h + h)+"px";
    
    
    var topVector = topPart.getWorldPosition();
    vector = topVector.project(camera);
    top.style.left = Math.round(vector.x *w + w)+"px";
    top.style.top = Math.round(-vector.y * h + h)+"px";
    
}

function enterFlank1(event)//Flank1点击事件
{
    //这个地方要做三个事：
    // 0.去掉原有的三个UI点-gsap+pointerEvents
    gsap.to(flank1,{opacity:0,duration:0.4});flank1.style.pointerEvents = "none";
    gsap.to(bottom,{opacity:0,duration:0.4});bottom.style.pointerEvents = "none";
    gsap.to(top,{opacity:0,duration:0.4});top.style.pointerEvents = "none";

    // 1.变化scale，rotation，position使效果出色
    gsap.to(satellite.position,{x:-7,y:3.36,z:-0.19,duration:1});
    gsap.to(satellite.rotation,{x:2.27,y:2.82,z:2.41,duration:1});
    gsap.to(satellite.scale,{x:0.02,y:0.02,z:0.02,duration:1});

    
    // 2.出现back,绑定事件
    satelliteBack.style.pointerEvents = "auto";
    satelliteBack.id = "flank1";//备忘用于escapeToSatellite的转变
    gsap.to(satelliteBack,{opacity:1,duration:0.4,delay:0.6});
    satelliteBack.style.left = 100 + "px";
    satelliteBack.style.top = 100 + "px";
    satelliteBack.onclick = escapeToSatellite;

    // 3.添加新的可视化内容
    let flank1Indication1 = document.querySelector(".flank1Indication1");
    let flank1Indication2 = document.querySelector(".flank1Indication2");
    let flank1Indication3 = document.querySelector(".flank1Indication3");
    let flank1Circle = document.getElementsByClassName("flank1Circle");
    let flank1Dot = document.getElementsByClassName("flank1Dot");
    let flank1Item = document.getElementsByClassName("flank1Item");
    let flank1Props = document.getElementsByClassName("flank1Props");
    gsap.to([flank1Indication1,flank1Indication2,flank1Indication3],{opacity:1,duration:0.4,delay:0.6});
    gsap.to(flank1Circle,{opacity:1,duration:0.4,delay:0.6}); for(const item of flank1Circle) { item.style.pointerEvents = "auto"};
    gsap.to(flank1Dot,{opacity:1,duration:0.4,delay:0.6}); for(const item of flank1Dot) { item.style.pointerEvents = "auto"};
    gsap.to(flank1Item,{opacity:1,duration:0.4,delay:0.6}); for(const item of flank1Item) { item.style.pointerEvents = "auto"};
    gsap.to(flank1Props,{opacity:1,duration:0.4,delay:0.6}); for(const item of flank1Props) { item.style.pointerEvents = "auto"};

    flank1Indication1.style.pointerEvents = "auto";
    flank1Indication2.style.pointerEvents = "auto";
    flank1Indication3.style.pointerEvents = "auto";

}

function enterBottom()//bottom点击事件
{
    // 0.去掉原有的三个UI点-gsap+pointerEvents
    gsap.to(flank1,{opacity:0,duration:0.4});flank1.style.pointerEvents = "none";
    gsap.to(bottom,{opacity:0,duration:0.4});bottom.style.pointerEvents = "none";
    gsap.to(top,{opacity:0,duration:0.4});top.style.pointerEvents = "none";

    // 1.调衡scale，rotation，position使效果出色
    gsap.to(satellite.position,{x:-2.89,y:0.82,z:1.5,duration:1});
    gsap.to(satellite.rotation,{x:2.41,y:0.1,z:2.41,duration:1});
    gsap.to(satellite.scale,{x:0.02,y:0.02,z:0.02,duration:1});
    
    // 2.出现back,绑定事件
    satelliteBack.style.pointerEvents = "auto";
    gsap.to(satelliteBack,{opacity:1,duration:0.4,delay:0.6});
    satelliteBack.id = "bottom";
    satelliteBack.style.left = 100 + "px";
    satelliteBack.style.top = 100 + "px";
    satelliteBack.onclick = escapeToSatellite;

    // 3.添加新的可视化内容
    let bottomIndication1 = document.querySelector(".bottomIndication1");
    let bottomIndication2 = document.querySelector(".bottomIndication2");
    let bottomIndication3 = document.querySelector(".bottomIndication3");
    let bottomCircle = document.getElementsByClassName("bottomCircle");
    let bottomDot = document.getElementsByClassName("bottomDot");
    let bottomItem = document.getElementsByClassName("bottomItem");
    let bottomProps = document.getElementsByClassName("bottomProps");
    gsap.to([bottomIndication1,bottomIndication2,bottomIndication3],{opacity:1,duration:0.4,delay:0.6});
    gsap.to(bottomCircle,{opacity:1,duration:0.4,delay:0.6}); for(const item of bottomCircle) { item.style.pointerEvents = "auto"};
    gsap.to(bottomDot,{opacity:1,duration:0.4,delay:0.6}); for(const item of bottomDot) { item.style.pointerEvents = "auto"};
    gsap.to(bottomItem,{opacity:1,duration:0.4,delay:0.6}); for(const item of bottomItem) { item.style.pointerEvents = "auto"};
    gsap.to(bottomProps,{opacity:1,duration:0.4,delay:0.6}); for(const item of bottomProps) { item.style.pointerEvents = "auto"};

    bottomIndication1.style.pointerEvents = "auto";
    bottomIndication2.style.pointerEvents = "auto";
    bottomIndication3.style.pointerEvents = "auto";
}

function enterTop()//top点击事件
{
    // 0.去掉原有的三个UI点-gsap+pointerEvents
    gsap.to(flank1,{opacity:0,duration:0.4});flank1.style.pointerEvents = "none";
    gsap.to(bottom,{opacity:0,duration:0.4});bottom.style.pointerEvents = "none";
    gsap.to(top,{opacity:0,duration:0.4});top.style.pointerEvents = "none";

    // 1.调衡scale，rotation，position使效果出色
    gsap.to(satellite.position,{x:-4.06,y:2.23,z:0,duration:1});
    gsap.to(satellite.rotation,{x:2.41,y:3.22,z:0.77,duration:1});
    gsap.to(satellite.scale,{x:0.019,y:0.019,z:0.019,duration:1});

    // 2.出现back,绑定事件
    satelliteBack.style.pointerEvents = "auto";
    gsap.to(satelliteBack,{opacity:1,duration:0.4,delay:0.6});
    satelliteBack.id = "top";
    satelliteBack.style.left = 100 + "px";
    satelliteBack.style.top = 100 + "px";
    satelliteBack.onclick = escapeToSatellite;

    // 3.添加新的可视化内容
    let topIndication1 = document.querySelector(".topIndication1");
    let topIndication2 = document.querySelector(".topIndication2");
    let topCircle = document.getElementsByClassName("topCircle");
    let topDot = document.getElementsByClassName("topDot");
    let topItem = document.getElementsByClassName("topItem");
    let topProps = document.getElementsByClassName("topProps");
    gsap.to([topIndication1,topIndication2],{opacity:1,duration:0.4,delay:0.6});
    gsap.to(topCircle,{opacity:1,duration:0.4,delay:0.6}); for(const item of topCircle) { item.style.pointerEvents = "auto"};
    gsap.to(topDot,{opacity:1,duration:0.4,delay:0.6}); for(const item of topDot) { item.style.pointerEvents = "auto"};
    gsap.to(topItem,{opacity:1,duration:0.4,delay:0.6}); for(const item of topItem) { item.style.pointerEvents = "auto"};
    gsap.to(topProps,{opacity:1,duration:0.4,delay:0.6}); for(const item of topProps) { item.style.pointerEvents = "auto"};

    topIndication1.style.pointerEvents = "auto";
    topIndication2.style.pointerEvents = "auto";

}

function escapeToSatellite(){
    // 1.消除原有的UI
    gsap.to(satelliteBack,{opacity:0,duration:0.4});
    satelliteBack.style.pointerEvents = "none";
    // 2.gsap回到原始rotation，scale,position
    gsap.to(satellite.scale,{x:0.005,y:0.005,z:0.005,duration:1});
    gsap.to(satellite.position,{x:-2,y:0,z:0,duration:1});
    gsap.to(satellite.rotation,{x:2.97,y:2.43,z:2.63,duration:1});

    //生成三个UI点
    gsap.to(flank1,{opacity:1,duration:1});flank1.style.pointerEvents = "auto";
    gsap.to(bottom,{opacity:1,duration:1});bottom.style.pointerEvents = "auto";
    gsap.to(top,{opacity:1,duration:1});top.style.pointerEvents = "auto";

    //进行原有的判定
    switch(satelliteBack.id){
        case "flank1":
            let flank1Indication1 = document.querySelector(".flank1Indication1");
            let flank1Indication2 = document.querySelector(".flank1Indication2");
            let flank1Indication3 = document.querySelector(".flank1Indication3");
            let flank1Circle = document.getElementsByClassName("flank1Circle");
            let flank1Dot = document.getElementsByClassName("flank1Dot");
            let flank1Item = document.getElementsByClassName("flank1Item");
            let flank1Props = document.getElementsByClassName("flank1Props");
            gsap.to([flank1Indication1,flank1Indication2,flank1Indication3],{opacity:0,duration:0.4});
            gsap.to(flank1Circle,{opacity:0,duration:0.4}); for(const item of flank1Circle) { item.style.pointerEvents = "none"};
            gsap.to(flank1Dot,{opacity:0,duration:0.4}); for(const item of flank1Dot) { item.style.pointerEvents = "none"};
            gsap.to(flank1Item,{opacity:0,duration:0.4}); for(const item of flank1Item) { item.style.pointerEvents = "none"};
            gsap.to(flank1Props,{opacity:0,duration:0.4}); for(const item of flank1Props) { item.style.pointerEvents = "none"};

            flank1Indication1.style.pointerEvents = "none";
            flank1Indication2.style.pointerEvents = "none";
            flank1Indication3.style.pointerEvents = "none";
            satelliteBack.id = "";
        case "top":
            let topIndication1 = document.querySelector(".topIndication1");
            let topIndication2 = document.querySelector(".topIndication2");
            let topIndication3 = document.querySelector(".topIndication3");
            let topCircle = document.getElementsByClassName("topCircle");
            let topDot = document.getElementsByClassName("topDot");
            let topItem = document.getElementsByClassName("topItem");
            let topProps = document.getElementsByClassName("topProps");
            gsap.to([topIndication1,topIndication2,topIndication3],{opacity:0,duration:0.4});
            gsap.to(topCircle,{opacity:0,duration:0.4}); for(const item of topCircle) { item.style.pointerEvents = "none"};
            gsap.to(topDot,{opacity:0,duration:0.4}); for(const item of topDot) { item.style.pointerEvents = "none"};
            gsap.to(topItem,{opacity:0,duration:0.4}); for(const item of topItem) { item.style.pointerEvents = "none"};
            gsap.to(topProps,{opacity:0,duration:0.4}); for(const item of topProps) { item.style.pointerEvents = "none"};

            topIndication1.style.pointerEvents = "none";
            topIndication2.style.pointerEvents = "none";
            topIndication3.style.pointerEvents = "none";
            satelliteBack.id = "";

        case "bottom":
            let bottomIndication1 = document.querySelector(".bottomIndication1");
            let bottomIndication2 = document.querySelector(".bottomIndication2");
            let bottomIndication3 = document.querySelector(".bottomIndication3");
            let bottomCircle = document.getElementsByClassName("bottomCircle");
            let bottomDot = document.getElementsByClassName("bottomDot");
            let bottomItem = document.getElementsByClassName("bottomItem");
            let bottomProps = document.getElementsByClassName("bottomProps");
            gsap.to([bottomIndication1,bottomIndication2,bottomIndication3],{opacity:0,duration:0.4});
            gsap.to(bottomCircle,{opacity:0,duration:0.4}); for(const item of bottomCircle) { item.style.pointerEvents = "none"};
            gsap.to(bottomDot,{opacity:0,duration:0.4}); for(const item of bottomDot) { item.style.pointerEvents = "none"};
            gsap.to(bottomItem,{opacity:0,duration:0.4}); for(const item of bottomItem) { item.style.pointerEvents = "none"};
            gsap.to(bottomProps,{opacity:0,duration:0.4}); for(const item of bottomProps) { item.style.pointerEvents = "none"};
        
            bottomIndication1.style.pointerEvents = "none";
            bottomIndication2.style.pointerEvents = "none";
            bottomIndication3.style.pointerEvents = "none";
            satelliteBack.id = "";
    }

}

let rotationAll={//记录旋转角度
    x:0,
    y:0
};

// let Xaxis=new THREE.Vector3(-3,0,0);
// let Yaxis=new THREE.Vector3(-3,0,0);

canvas.onmousedown = function (event) {//canvas上添加鼠标点击事件 用于鼠标滑动控制glb1旋转
    if(network)
    {
        console.log("network:",network)
        event = event || window.event;//解决兼容性

        var ol = event.clientX - canvas.offsetLeft;
        var ot = event.clientY - canvas.offsetTop;

        console.log("ol:",ol,'ot:',ot);

        let right,down;

        document.onmousemove = function (event) {
            event = event || window.event;
            //获取鼠标坐标
            right = event.clientX - ol;
            down = event.clientY - ot;
        };
        //绑定一个松开事件
        document.onmouseup = function () {//按住并拖动时触发
            if(Math.abs(right)>Math.abs(down))//判断水平与竖直哪边偏移量较大
            {
                if(right>0)
                {
                    rotationAll.y=rotationAll.y+Math.PI / 2;
                    // gsap.to(network.rotateOnAxis,{duration:1,delay:0,y:rotationAll.y});
                    gsap.to(network.rotation,{duration:1,delay:0,y:rotationAll.y});
                }
                else
                {
                    // rotateAroundWorldAxis(network,yAxis,-Math.PI / 2);
                    rotationAll.y=rotationAll.y-Math.PI / 2;
                    gsap.to(network.rotation,{duration:1,delay:0,y:rotationAll.y});
                }
            }
            if(Math.abs(down)>Math.abs(right))
            {
                if(down>0)
                {
                    rotationAll.x=rotationAll.x-Math.PI / 2;
                    gsap.to(network.rotation,{duration:1,delay:0,x:rotationAll.x});
                }
                else {
                    rotationAll.x=rotationAll.x+Math.PI / 2;
                    gsap.to(network.rotation,{duration:1,delay:0,x:rotationAll.x});
                }
            }
            //当鼠标松开时，被拖拽元素固定在当前位置
            //取消document的onmousemove事件
            document.onmousemove = null;
            //取消document的onmouseup事件
            document.onmouseup = null;
        };
    }

};

function addModel(object)//模型添加函数
{
    const environment = new RoomEnvironment();
    const pmremGenerator = new THREE.PMREMGenerator( renderer );
    scene.environment = pmremGenerator.fromScene( environment ).texture;//环境添加 使模型变亮
    return new Promise(function(resolve,reject) {

            var loader = new GLTFLoader();
            loader.setPath("./src/model/");
            loader.load(object.url, function (gltf) {//bdlg-xjj.glb
                gltf.scene.traverse(function (child) {
                    if (child.isMesh) {
                        child.material.side = THREE.DoubleSide;//设置贴图模式为双面贴图
                        if(object.scale ==="big"){child.material = bakedMaterial;} else {child.material = bakedNetworkMaterial;}
                        child.material.depthTest = true;
                        child.material.depthWrite = true;
                        child.material.transparent = true;
                        child.material.opacity = 0;;  
                    }

                });

                scene.add(gltf.scene);
                if(object.scale==="big")//satellite的模型
                {
                    satelliteExist = true;
                    satellite = gltf.scene;
                    // 4.opacity-change
                    gltf.scene.traverse( child =>{gsap.fromTo(child.material,{opacity:0},{opacity:1,duration:0.7,delay:1});});
                    // gltf.scene.traverse( child =>{console.log(child.position);});
                    // // 1.scale-change
                    gsap.fromTo(gltf.scene.scale,{x:0.01,y:0.01,z:0.01},{x:0.005,y:0.005,z:0.005,duration:0.7,delay:1});

                    // // 2.position-change
                    gsap.fromTo(gltf.scene.position,{x:-2,y:0,z:0},{x:-2,y:0,z:0,duration:0.7,delay:1});
                    // // 3.rotation-change
                    gsap.fromTo(gltf.scene.rotation,{x:2.22,y:0.79,z:0.79},{x:2.97,y:2.43,z:2.63,duration:0.7,delay:1});

                    

                    resolve(satellite);

                }
                else if(object.scale==="small")
                {
                    networkExist = true;
                    network = gltf.scene;
                    // opacity-change
                    gltf.scene.traverse( child =>{gsap.fromTo(child.material,{opacity:0},{opacity:1,duration:0.7,delay:1});});
                    // position-change
                    gsap.to(gltf.scene.position,{x:2.39,y:-0.14,z:-0.19,duration:1,delay:1});
                    // rotation-change
                    gsap.fromTo(gltf.scene.rotation,{x:0,y:0,z:0},{x:0.23,y:-0.04,z:0.09,duration:1,delay:1});
                    // scale-change
                    gsap.fromTo(gltf.scene.scale,{x:0.12,y:0.12,z:0.12},{x:0.2,y:0.2,z:0.2,duration:1,delay:1});
                    resolve(network);
                    gui.add(gltf.scene.scale,"x",0,1,0.01).name("networkScaleX");
                    gui.add(gltf.scene.scale,"y",0,1,0.01).name("networkScaleY");
                    gui.add(gltf.scene.scale,"z",0,1,0.01).name("networkScaleZ");
                    gui.add(gltf.scene.position,"x",2,4,0.01).name("networkPosX");
                    gui.add(gltf.scene.position,"y",-2,2,0.01).name("networkPosY");
                    gui.add(gltf.scene.position,"z",-2,2,0.01).name("networkPosZ");
                    gui.add(gltf.scene.rotation,"x",-Math.PI*2,Math.PI*2,0.01).name("networkRotX");
                    gui.add(gltf.scene.rotation,"y",-Math.PI*2,Math.PI*2,0.01).name("networkRotY");
                    gui.add(gltf.scene.rotation,"z",-Math.PI*2,Math.PI*2,0.01).name("networkRotZ");

                   
                }

            });
        }
    );
}

function init() {

    //Camera
    camera = new THREE.PerspectiveCamera( 27, window.innerWidth / window.innerHeight, 0.001, 3500 );
    // camera.layers.enableAll();
    //Scene & Background Color
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xE1DFE4);
    //Light
    // light = new THREE.AmbientLight({color:new THREE.Color(0xFFFBF0), intensity: 1});
    var ambientLight = new THREE.AmbientLight( 0xffffff, 1 );
    // ambientLight.layers.enableAll();
    scene.add( ambientLight );
    

    //initObjects
    generateParticle(number);//Particle
    initSurface();//earth
    initNetPoint();//netpoint

    // scene.add(CurveMesh);
    // scene.add( light );
    scene.add(surface);
    // scene.add(netPoint);
    console.log(netPoint);
    earthAvailable = true
    // scene.add(network)
    // scene.add(satellite)

    gsap.fromTo([welcome,enterHomepage],{opacity:0},{duration:1,opacity:1,delay:1})
    
    // Axes helper
    //  const axesHelper = new THREE.AxesHelper(2);scene.add(axesHelper);
    
    //Controls
    // const controls = new OrbitControls(camera, canvas);controls.enableDamping = true;

    //position initialization
    camera.position.set(2.4,0,2)
    surface.position.set(2.4,0,0)

    // camera.lookAt(surface)
    renderer = new THREE.WebGLRenderer( { antialias: true, canvas:canvas,logarithmicDepthBuffer:true } );
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.autoUpdate = true;
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( window.innerWidth, window.innerHeight );
    // renderer.shadowMap.type =  PCFSoftShadowMap;
    renderer.shadowMap.autoUpdate = true;
    renderer.shadowMap.needsUpdate = true;
    renderer.shadowMap.enabled = true;
    // renderer.outputEncoding = THREE.sRGBEncoding
    document.body.appendChild( renderer.domElement );

    // labelRenderer = new CSS2DRenderer();
    // labelRenderer.setSize(window.innerWidth,window.innerHeight);
    // labelRenderer.domElement.style.position = "absolute";
    // labelRenderer.domElement.style.top = "0px";
    // document.body.appendChild(labelRenderer.domElement);

    // rendererInitialization()//Renderer
    // animate();
    postprocessing()//postprocessing

    GUIInitialization()// UI()
}

function update() 
{
    requestAnimationFrame( update );
    t += 0.01;
    
    //surface
    surfaceMaterial.emissiveIntensity =0.5+0.3* Math.sin(t);

    //network, y上下波动
    if(networkExist){
        network.position.y += 0.001*Math.sin(2*t);
    }

    //satellite,y上下波动
    if(satelliteExist){
        satellite.position.y += 0.001*Math.sin(2*t);
        satelliteIndicationPositionSet();
    }

    //satelliteUI上下波动
    

    //cast a ray
    raycaster.setFromCamera(mouse,camera);
    
    ParticleUpdate();

    RotateJudge();

    previousMouseDown = mousedown;

    // stats.update();

    render();

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

function initNetPoint(){
    //生成多个sphere

    for(let i = 0; i<50; i ++){
        let sphere = new THREE.Mesh(new THREE.SphereGeometry(1,32,32),new THREE.MeshBasicMaterial());
        // sphere.material.color = new THREE.Color(0xC71515);//color
        const ColorCode = Math.floor(Math.random(1)*10);
        if(ColorCode <8){sphere.material.color = new THREE.Color(0xFFFFFF);}
            else{sphere.material.color = new THREE.Color(0xD21635);}
        sphere .castShadow = true;
        sphere.scale.set(0.05,0.05,0.05);//scale;
        let angle1 = Math.PI*2*(Math.random()-0.5);
        let angle2 = Math.PI*2*(Math.random()-0.5);
        sphere.position.set(2.4+1.6*Math.cos(angle2)*Math.sin(angle1),0+1.6*Math.cos(angle2)*Math.cos(angle1),0+1.6*Math.sin(angle2));//position
        netPoint.add(sphere);
    }
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
    if(earthAvailable){
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
    rotateAroundWorldAxis(surface,xAxis,0.01*Math.PI*0.01);
    rotateAroundWorldAxis(surface,yAxis,0.01*Math.PI*0.05);


    // surface.position.set(0,t*Math.sin(Math.PI),0)
    surface.position.y = 0.1* Math.sin(t*Math.PI)
    // netPoint.position.copy(surface.position)

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
    

}


function render()
{
    // renderer.render(scene,camera)
    composer.render();
    // labelRenderer.render(scene,camera);

}

function initSurface(){

    // object & material
    surfaceMaterial.map = new textureLoader.load('src/model/earth/earthTexture/8k_earth_whitemap-2.png');
    surfaceMaterial.normalMap = new textureLoader.load('./src/model/earth/earthTexture/8k_earth_normal_map.png');
    surfaceMaterial.emissive = new THREE.Color(0xFFFFFF);
    surfaceMaterial.emissiveIntensity = 0.5;
    surfaceMaterial.emissiveMap = new textureLoader.load('src/model/earth/earthTexture/8k_earth_emissive_map.png');
    surface = new THREE.Mesh(new THREE.SphereBufferGeometry(1.4,128,128),surfaceMaterial);
}


function GUIInitialization(){
    gui.add(camera.position,"x",-10,10,0.1).name("X position");
    gui.add(camera.position,"y",-10,10,0.1).name("Y position");
    gui.add(camera.position,"z",-10,10,0.1).name("Z position");
    gui.add(bokehPass.uniforms.focus,"value",0,100,0.1).name("focus");
    gui.add(bokehPass.uniforms.aperture,"value",0,100,0.1).name("aperture");
    gui.add(bokehPass.uniforms.maxblur,"value",0,0.01,0.0001).name("maxblur");
    // gui.add(unrealBloomPass,"strength",0,0.3,0.01).name("strength");
    // gui.add(unrealBloomPass,"threshold",0,5,0.01).name("threshold");
    // gui.add(unrealBloomPass,"radius",0,5,0.01).name("radius");
    // gui.hide();
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
    // unrealBloomPass完全不够用啊
    // unrealBloomPass = new UnrealBloomPass(new THREE.Vector2(window.innerWidth,window.innerHeight),0.01,0.1,0.85);

    //下面开启selectiveBloomPass____add dependencies
    // const selectiveBloomEffect = new SelectiveBloomEffect(scene,camera);
    // selectiveBloomEffect.inverted = treu;
    // const selectiveBloomPass = new EffectPass(camera,smaaEffect,selectiveBloomEffect);
    // console.log(unrealBloomPass);
    composer.addPass(renderPass);
    // composer.addPass(selectiveBloomPass);
    composer.addPass(bokehPass);
}

function backToBefore()//左上大返回按键
{
    if(pageNow==="page1")//network回到earth
    {
        //这一页需要
        // 1.调整blur，focus等;✅
        gsap.to(bokehPass.uniforms.maxblur,{value:0.005,duration:0.4});
        gsap.to(bokehPass.uniforms.aperture,{value:18,duration:0.4});
        
        //EscapeFromNetwork
        escapeFromNetwork();
        // 2.地球出现的动画调整 :add,position,opacity
        scene.add(surface);
        earthAvailable = true;
        gsap.fromTo(surface.position,{x:3,y:0,z:0},{x:2.4,duration:0.4,delay:0.6});
        gsap.to(surface.material,{opacity:1,duration:0.4,delay:0.6});
        
        // 5.原有UI出现
        // glitch.classList.toggle("hide");
        // mainMenu.classList.toggle("hide");
        // back.classList.remove("hide");
        gsap.to([glitch,mainMenu,back],{opacity:1,duration:0.4,delay:0.6});
        
        for(const temp of [glitch,mainMenu,back])
        {temp.style.pointerEvents= "auto";}
        // glitch.style.style.pointerEvents = "auto";
        // mainMenu.style.style.pointerEvents = "auto";
        // back.style.style.pointerEvents = "auto";


        for (const element of Net1){element.style.pointerEvents = "auto";element.onclick = enterNetwork;}
        for (const element of Net2){element.style.pointerEvents = "auto";element.onclick = enterNetwork;}

        
        scene.environment=null;

    }
    else if(pageNow==="page2")
    {
        //1.模型先消失，再add，并改变satelliteExist
        //2.UI消失
        escapeFromSatellite();
        satelliteExist = false;
        
        //3.enterNetwork
        enterNetwork();
        //3.addNetworkUI()
        addNetworkUI();

        pageNow="page1";
        networkExist = true;


        //看看要不要收掉原有的内容；
    }

}

function escapeFromSatellite(){
    // 1.模型消失
    satellite.traverse(child =>{;gsap.to(child.material,{opacity:0,duration:0.4});child.pointerEvents="none";});
    scene.remove(satellite);

    // 2.UI消失的动画调整
    gsap.to([logoBack,satelliteUI,satelliteCaption,satelliteText,satelliteMenu],{opacity:0,duration:0.4});  
    for(const element of [logoBack,satelliteUI,satelliteCaption,satelliteText,satelliteMenu]) {element.style.pointerEvents = "none";} 
    gsap.to(sateDiv,{opacity:0,duration:0.4});   for(const element of sateDiv) {element.style.pointerEvents = "none";} 
    gsap.to(sateIcon,{opacity:0,duration:0.4});   for(const element of sateIcon) {element.style.pointerEvents = "none";} 
    gsap.to(satelliteSerial,{opacity:0,duration:0.4});    for(const element of satelliteSerial) {element.style.pointerEvents = "none";}  
    
    // 三大UI消失
    gsap.to(flank1,{opacity:0,duration:0.4});flank1.style.pointerEvents = "none";
    gsap.to(bottom,{opacity:0,duration:0.4});bottom.style.pointerEvents = "none";
    gsap.to(top,{opacity:0,duration:0.4});top.style.pointerEvents = "none";

}
//点击mainMenu的返回菜单，弹回原有彩蛋
back.onclick = function(){
    mainMenu.classList.toggle("active");
    upBlock[0].classList.toggle("active");
    upBlock[1].classList.toggle("active");
    bottomBlock.classList.toggle("active");
    glitch.classList.toggle("hide");
};
