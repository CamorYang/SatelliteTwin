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
import { FBXLoader } from './src/loaders/FBXLoader.js';
import { RoomEnvironment } from './src/environments/RoomEnvironment.js';
import { CSS2DRenderer, CSS2DObject } from './src/renderers/CSS2DRenderer.js';
import { OrbitControls } from './src/controls/OrbitControls.js';
// import { Object3D } from 'three';
const DayNames = {
    1: 'Mon',
    3: 'Wed',
    5: 'Fri'
  };
let pageNow='';
let rotWorldMatrix;
var xAxis = new THREE.Vector3(1,0,0);
var yAxis = new THREE.Vector3(0,1,0);
let camera, scene, renderer, UIRenderer, light,light2;
let group = new THREE.Group();
let groupNow = new THREE.Group();


let t = 0;
let networkMesh;
const randomAngle = [];
const number = 100;
const gui = new dat.GUI();
let controls;

// const fog = new THREE.Fog({color:'black', near:5, end:10})
const textureLoader =new THREE.TextureLoader();
const bakedTexture = textureLoader.load('./src/model/satellite/baked.img');
bakedTexture.flipY = false;
bakedTexture.outputEncoding = THREE.sRGBEncoding;
const dracoLoader = new DRACOLoader();
const gltfLoader = new GLTFLoader();
const canvas = document.querySelector('.webgl');
let surface;
let network = new THREE.Group();

let satellite;
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
let glb1,glb2;
let ambientLight;

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
let composer,renderPass,bokehPass;

// let icon = document.querySelector(".logo");
let back = document.querySelector(".return");
let enter = document.querySelector(".enter");
let welcome = document.querySelector(".welcome");
let upBlock = document.querySelectorAll(".upBlock");
let bottomBlock = document.querySelector(".bottomBlock");
let mainMenu = document.querySelector(".mainMenu");
let className = ['mainMenu','return','upBlock','bottomBlock'];
let glitch = document.querySelector(".glitch");
// let movingRegion = document.querySelector(".movingRegion");
let first=document.getElementById("first");
let logoBack=document.getElementById('mainBack');
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
//     }f
// }

logoBack.addEventListener('click',backToBefore);//返回事件添加
function backToBefore()//左上大返回按键
{
    if(pageNow==="page1")
    {
        console.log("page1来了");
        scene.remove(glb1);
        let add=document.getElementById("add");
        add.remove();
        glitch.classList.toggle("hide");
        mainMenu.classList.toggle("hide");
        back.classList.remove("hide");
        first.addEventListener('click',clickFunc);
        gsap.to(surface.position,{opacity:0, duration:1,x:-1.5});
        scene.add(surface);
        scene.environment=null;

    }
    else if(pageNow==="page2")
    {
        let divLeft=document.getElementById('divLeft');
        divLeft.remove();
        let img11=document.getElementById("img11");
        img11.remove();
        let divMain=document.getElementById("add3");
        divMain.remove();
        scene.remove(glb2);
        scene.add(glb1);
        addElementPage1();
        pageNow="page1";
    }

}
//点击mainMenu的返回菜单，弹回原有彩蛋
back.onclick = function(){
    mainMenu.classList.toggle("active");
    upBlock[0].classList.toggle("active");
    upBlock[1].classList.toggle("active");
    bottomBlock.classList.toggle("active");
    glitch.classList.toggle("hide");
};

//点击enter
enter.onclick=enterFunc;
function enterFunc(){

    // 移动camera和camera.lookAt
    gsap.to(camera.position,{x:0,y:0,z:10,duration:1});
    gsap.to([welcome,enter],{opacity:0,duration:0.4});
    gsap.to(bokehPass.uniforms.maxblur,{value:0.005});
    gsap.to(bokehPass.uniforms.aperture,{value:18});
    // gsap.to([glitch,mainMenu,back],{opacity:1,delay:0.7})
    // smoothMove
    // 显示下一个页面的UI
    glitch.classList.toggle("hide");
    mainMenu.classList.toggle("hide");
    back.classList.remove("hide");
    // bokehPass.uniforms.maxblur.value = 0.005
    // bokehPass.uniforms.aperture.value = 18
};

first.addEventListener('click',clickFunc);//第一个圆圈点击事件添加
function clickFunc()//显示network大模型
{
    gsap.to(surface.position, {
        x:10,
        duration: 1,
        onComplete: function () {
            pageNow="page1";
            scene.remove(surface);
            addModel({url:"network/network.glb",scale:"small"}).then(function(result,reject)
            {
                //fov-change
                gsap.to(bokehPass.uniforms.maxblur,{value:0})
                gsap.to(bokehPass.uniforms.aperture,{value:0})
                // gsap.to(camera.position,{x:0,y:0,z:-10,duration:1})
                camera.position.set(0,0,-10)
                camera.lookAt(network.position)
                // gsap.to(surface,{opacity:0, duration:1})
                //UIChange
                glitch.classList.toggle("hide");
                mainMenu.classList.toggle("hide");
                addElementPage1();

            });
        }
    });

}
function addElementPage1()//添加大模型页面
{
    let main=document.getElementById("main");
    let divMain=document.createElement("div");
    divMain.id="add";
    divMain.style.width='700px';
    divMain.style.height='500px';
    divMain.style.background="white";
    divMain.style.position="absolute";
    divMain.style.left="100px";
    divMain.style.top="200px";
    main.appendChild(divMain);
    let button1=document.createElement("button");
    button1.style.width='100px';
    button1.style.height='30px';
    button1.style.border='none';
    // div1.style.background="#bbbbbb";
    button1.style.position="absolute";
    button1.innerHTML="Sa16-2521";
    button1.style.top="30px";
    button1.style.position="absolute";
    button1.style.left="20px";
    divMain.appendChild(button1);

    let button2=document.createElement("button");
    button2.style.width='100px';
    button2.style.height='30px';
    button2.style.border='none';
    button2.style.position="absolute";
    button2.style.left="140px";
    button2.innerHTML="Sa16-2520";
    button2.style.top="30px";
    divMain.appendChild(button2);

    let button3=document.createElement("button");
    button3.style.width='100px';
    button3.style.height='30px';
    button3.style.border='none';
    button3.style.position="absolute";
    button3.style.left="280px";
    button3.innerHTML="Sa16-2519";
    button3.style.top="30px";
    divMain.appendChild(button3);

    let button4=document.createElement("button");
    button4.style.width='100px';
    button4.style.height='30px';
    button4.style.border='none';
    button4.style.position="absolute";
    button4.style.left="420px";
    button4.innerHTML="Sa15-2519";
    button4.style.top="30px";
    divMain.appendChild(button4);

    let button5=document.createElement("button");
    button5.style.width='100px';
    button5.style.height='30px';
    button5.style.border='none';
    button5.style.position="absolute";
    button5.style.left="560px"
    button5.innerHTML="Sa17-2519";
    button5.style.top="30px";
    divMain.appendChild(button5);
    first.removeEventListener('click',clickFunc);
    button1.addEventListener('click',buttonClick);//左侧第一个安检点击事件添加
}
function buttonClick()//第一个安检点击事件
{
    pageNow="page2";
    scene.remove(glb1);
    let add=document.getElementById("add");
    add.remove();

    //UIChange
    glitch.classList.toggle("hide");
    mainMenu.classList.toggle("hide");
    addModel({url:"network/222.glb",scale:"big"}).then(function(result,reject)
    {
        //fov-change
        gsap.to(bokehPass.uniforms.maxblur,{value:0});
        gsap.to(bokehPass.uniforms.aperture,{value:0});
        // gsap.to(camera.position,{x:0,y:0,z:-10,duration:1})
        camera.position.set(0,0,-10);
        camera.lookAt(network.position);
        glb2.rotation.x=-Math.PI/2;

        glitch.classList.toggle("hide");
        mainMenu.classList.toggle("hide");
        //UIChange
        addElementPage2();

    });
}
function addElementPage2()//小模型页面添加
{
    let main=document.getElementById("main");
    //右侧白框
    let divMain=document.createElement("div");
    divMain.id="add3";
    divMain.style.width='40%';
    divMain.style.height='100%';
    divMain.style.background="none";
    divMain.style.position="absolute";
    divMain.style.right="0px";
    // divMain.style.top="200px";
    main.appendChild(divMain);
    let p=document.createElement("p");
    p.innerHTML='卫星26-17';
    p.style.color='red';
    p.style.top='40%';
    p.style.left="40%";
    p.style.position="absolute";
    p.style.fontSize='30px';
    divMain.appendChild(p);
    let divtext=document.createElement("div");
    divtext.innerHTML='信息填入此处即可';
    divtext.style.color='gray';
    divtext.style.top='45%';
    divtext.style.left="10px";
    divtext.style.position="absolute";
    divMain.appendChild(divtext);
    //左侧标记
    let divLeft=document.createElement("div");
    divLeft.id='divLeft';
    divLeft.style.width='800px';
    divLeft.style.height='600px';
    divLeft.style.border='none';
    divLeft.style.position="absolute";
    // divLeft.style.background="white";
    divLeft.style.top="200px";
    divLeft.style.left="200px";
    main.appendChild(divLeft);

    //frank1
    let img11=document.createElement("button");
    img11.id="img11";
    img11.style.width='64px';
    img11.style.height='64px';
    img11.style.border='none';
    // div1.style.background="#bbbbbb";
    // img11.style.top="300px";
    img11.style.position="absolute";
    img11.style.left="130px";
    img11.style.top="250px";
    img11.style.background="url('./src/img/圆形选中.png')";
    main.appendChild(img11);
    let p1=document.createElement("p");
    p1.innerHTML='Flank1';
    p1.style.color='red';
    p1.style.top='70px';
    p1.style.left="20px";
    p1.style.position="absolute";
    p1.style.fontSize='30px';
    divLeft.appendChild(p1);
    //bottom
    let img22=document.createElement("button");
    img22.id="img22";
    img22.style.width='64px';
    img22.style.height='64px';
    img22.style.border='none';
    // div1.style.background="#bbbbbb";
    img22.style.top="90px";
    img22.style.position="absolute";
    img22.style.left="380px";
    img22.style.background="url('./src/img/圆形选中.png')";
    // img22.src='./src/img/圆形选中.png';
    divLeft.appendChild(img22);
    let p2=document.createElement("p");
    p2.innerHTML='Bottom';
    p2.style.color='red';
    p2.style.top='120px';
    p2.style.left="444px";
    p2.style.position="absolute";
    p2.style.fontSize='30px';
    divLeft.appendChild(p2);

    let img33=document.createElement("button");
    img33.id="img33";
    img33.style.width='64px';
    img33.style.height='64px';
    img33.style.border='none';
    // div1.style.background="#bbbbbb";
    img33.style.top="400px";
    img33.style.position="absolute";
    img33.style.left="300px";
    img33.style.background="url('./src/img/圆形选中.png')";
    divLeft.appendChild(img33);
    let p3=document.createElement("p");
    p3.innerHTML='Top';
    p3.style.color='red';
    // p2.style.top='56px';
    p3.style.left="330px";
    p3.style.top="464px";
    p3.style.position="absolute";
    p3.style.fontSize='30px';
    divLeft.appendChild(p3);
    img11.addEventListener('click',img11Click);
    img22.addEventListener('click',img22Click);
    img33.addEventListener('click',img33Click);
}
function img11Click(event)//Flank1点击事件
{
    console.log("11111111111111");
    gsap.to(glb2.rotation,
        {
        duration:1,delay:0,
        y:Math.PI ,
        x:0
    });
    gsap.to(camera.position, {
        x: 2.3,
        y: -0.5,
        z: -3,
        duration: 1,
        // onComplete: function () {
        // 这是相机运动完成的回调,可以执行其他的方法.
        // }
    });
    let data={
        info1:{
            name:'卫星轨道参数',
            text:'轨道参数输入此处'
        },
        info2:{
            name:'卫星状态参数',
            text:'状态参数输入此处'
        }
    };
    let img11=document.getElementById("img11");// top bottom flank图标及名称移除 事件取消绑定
    img11.removeEventListener('click',img11Click);
    img11.remove();
    let img22=document.getElementById("img22");
    let img33=document.getElementById("img33");
    img22.removeEventListener('click',img22Click);
    img33.removeEventListener('click',img33Click);
    let divLeft=document.getElementById('divLeft');
    divLeft.remove();
    addInfoBottom(data);
}
function img22Click()//bottom点击事件
{
    gsap.to(glb2.rotation,{duration:1,delay:0,x:3*Math.PI / 4});
    gsap.to(camera.position, {
        x: 1,
        y: -0.5,
        z: -3,
        duration: 1,
        // onComplete: function () {
        // 这是相机运动完成的回调,可以执行其他的方法.
        // }
    });
    let data={//此处更改想要显示的信息
        info1:{
            name:'卫星轨道参数',
            text:'轨道参数输入此处'
        },
        info2:{
            name:'卫星状态参数',
            text:'状态参数输入此处'
        }
    };
    let img11=document.getElementById("img11");// top bottom flank图标及名称移除 事件取消绑定
    img11.removeEventListener('click',img11Click);
    img11.remove();
    let img22=document.getElementById("img22");
    let img33=document.getElementById("img33");
    img22.removeEventListener('click',img22Click);
    img33.removeEventListener('click',img33Click);
    let divLeft=document.getElementById('divLeft');
    divLeft.remove();
    addInfoBottom(data);//添加细节信息
}

function img33Click()//top点击事件
{
    gsap.to(glb2.rotation,{duration:1,delay:0,y:Math.PI / 10,x:0});
    gsap.to(camera.position, {
        x: 1.6,
        y: 0.2,
        z: -3,  
        duration: 1,
        // onComplete: function () {
        // 这是相机运动完成的回调,可以执行其他的方法.
        // }
    });
    let data={//在此处修改各部件显示信息
        info1:{
            name:'卫星轨道参数',
            text:'轨道参数输入此处'
        },
        info2:{
            name:'卫星状态参数',
            text:'状态参数输入此处'
        }
    };
    let img11=document.getElementById("img11");// top bottom flank图标及名称移除 事件取消绑定
    img11.removeEventListener('click',img11Click);
    img11.remove();
    let img22=document.getElementById("img22");
    let img33=document.getElementById("img33");
    img22.removeEventListener('click',img22Click);
    img33.removeEventListener('click',img33Click);
    let divLeft=document.getElementById('divLeft');
    divLeft.remove();
    addInfoBottom(data);
}

function addInfoBottom(data)//添加部件信息
{
    let main=document.getElementById("main");
    let divMain=document.createElement("divMain");
    divMain.id="divmain";
    main.appendChild(divMain);
    let circle1=document.createElement("button");
    circle1.id="circle1";
    circle1.style.width='48px';
    circle1.style.height='48px';
    circle1.style.border='none';
    // div1.style.background="#bbbbbb";
    // img11.style.top="300px";
    circle1.style.position="absolute";
    circle1.style.left="700px";
    circle1.style.top="500px";
    circle1.style.background="url('./src/img/circle.png')";
    divMain.appendChild(circle1);
    let p1=document.createElement("p");
    p1.innerHTML=data.info1.name;
    p1.style.color='gray';
    p1.style.top='505px';
    p1.style.left="748px";
    p1.style.position="absolute";
    p1.style.fontSize='20px';
    divMain.appendChild(p1);
    let divtext=document.createElement("div");
    divtext.innerHTML=data.info1.text;
    divtext.style.color='gray';
    divtext.style.top='535px';
    divtext.style.left="748px";
    divtext.style.width='400px';
    divtext.style.position="absolute";
    divMain.appendChild(divtext);

    let circle2=document.createElement("button");
    circle2.id="circle2";
    circle2.style.width='48px';
    circle2.style.height='48px';
    circle2.style.border='none';
    circle2.style.position="absolute";
    circle2.style.left="452px";
    circle2.style.top="700px";
    circle2.style.background="url('./src/img/circle.png')";
    divMain.appendChild(circle2);
    let p2=document.createElement("p");
    p2.innerHTML=data.info2.name;
    p2.style.color='gray';
    p2.style.top='705px';
    p2.style.left="500px";
    p2.style.position="absolute";
    p2.style.fontSize='20px';
    divMain.appendChild(p2);
    let divtext2=document.createElement("div");
    divtext2.innerHTML=data.info2.text;
    divtext2.style.color='gray';
    divtext2.style.top='735px';
    divtext2.style.left="500px";
    divtext2.style.width='400px';
    divtext2.style.position="absolute";
    let back=document.createElement("button");
    back.id="back";
    back.style.width='48px';
    back.style.height='48px';
    back.style.border='none';
    back.style.position="absolute";
    back.style.left="50%";
    back.style.bottom="10px";
    back.style.background="url('./src/img/back.png')";
    divMain.appendChild(back);
    back.addEventListener('click',backFunc);//绑定返回事件 下中那个按键
    divMain.appendChild(divtext2);
}
function backFunc()//小模型细节查看后 的返回事件
{
    let back=document.getElementById("back");
    back.removeEventListener("click",backFunc);
    let divmain=document.getElementById("divmain");
    divmain.remove();
    gsap.to(glb2.rotation,{duration:1,delay:0,x:-Math.PI/2,y:0,z:0});
    gsap.to(camera.position, {
        x: 0,
        y: 0,
        z: -10,
        duration: 1,
        // onComplete: function () {
        // 这是相机运动完成的回调,可以执行其他的方法.
        // }
    });
    let add3=document.getElementById("add3");
    add3.remove();
    addElementPage2();
}

function animate() {//未使用
    requestAnimationFrame( animate );

    // required if controls.enableDamping or controls.autoRotate are set to true
    // controls.update();
    renderer.render( scene, camera );
}

let rotationAll={//记录旋转角度
    x:0,
    y:0
};
// let Xaxis=new THREE.Vector3(-3,0,0);
// let Yaxis=new THREE.Vector3(-3,0,0);
canvas.onmousedown = function (event) {//canvas上添加鼠标点击事件 用于鼠标滑动控制glb1旋转
    if(glb1)
    {
        console.log("glb1:",glb1)
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
                    // rotateAroundWorldAxis(glb1,yAxis,Math.PI / 2);
                    rotationAll.y=rotationAll.y+Math.PI / 2;
                    // gsap.to(glb1.rotateOnAxis,{duration:1,delay:0,y:rotationAll.y});
                    gsap.to(glb1.rotation,{duration:1,delay:0,y:rotationAll.y});
                }
                else
                {
                    // rotateAroundWorldAxis(glb1,yAxis,-Math.PI / 2);
                    rotationAll.y=rotationAll.y-Math.PI / 2;
                    gsap.to(glb1.rotation,{duration:1,delay:0,y:rotationAll.y});
                }
            }
            if(Math.abs(down)>Math.abs(right))
            {
                if(down>0)
                {
                    rotationAll.x=rotationAll.x-Math.PI / 2;
                    gsap.to(glb1.rotation,{duration:1,delay:0,x:rotationAll.x});
                }
                else {
                    rotationAll.x=rotationAll.x+Math.PI / 2;
                    gsap.to(glb1.rotation,{duration:1,delay:0,x:rotationAll.x});
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
                    }

                });

                scene.add(gltf.scene);
                if(object.scale==="big")
                {
                    // gltf.scene.scale.set(0.005,0.005,0.005);
                    gsap.to(gltf.scene.scale,{x:0.005,y:0.005,z:0.005,duration:1});
                    gsap.to(gltf.scene.position,{x:3,y:0,z:0,duration:1});
                    // gltf.scene.position.set(3,0,0);
                    glb2 = gltf.scene;
                    resolve(glb2);
                }
                else if(object.scale==="small")
                {
                    gsap.to(gltf.scene.scale,{x:0.33,y:0.3,z:0.3,duration:1});
                    // gltf.scene.scale.set(0.33,0.3,0.3);
                    gsap.to(gltf.scene.position,{x:-3,y:0,z:0,duration:1});
                    // gltf.scene.position.set(-3,0,0);
                    glb1 = gltf.scene;
                    resolve(glb1);
                }

            });
        }
    );
}

init();
// loadGLTF()
update();

function init() {

    //Camera
    camera = new THREE.PerspectiveCamera( 27, window.innerWidth / window.innerHeight, 0.001, 3500 );
    //Scene & Background Color
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xE1DFE4);
    //Light
    // light = new THREE.AmbientLight({color:new THREE.Color(0xFFFBF0), intensity: 100});
    var ambientLight = new THREE.AmbientLight( 0xcccccc, 1 );
    scene.add( ambientLight );

    //initObjects
    generateParticle(number)//Particle
    initSurface()//earthe

    // scene.add(CurveMesh);
    // scene.add( light );
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
    renderer = new THREE.WebGLRenderer( { antialias: true, canvas:canvas } );
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( window.innerWidth, window.innerHeight );
    // renderer.outputEncoding = THREE.sRGBEncoding
    document.body.appendChild( renderer.domElement );
    // rendererInitialization()//Renderer
    // animate();
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
    // controls = new OrbitControls( camera, renderer.domElement );
    // controls.maxPolarAngle = Math.PI * 0.5;
    // controls.target.set( 0, 10, 0 );
    // controls.minDistance = 0.0;
    // controls.maxDistance = 3000.0;

    // controls.update();
}