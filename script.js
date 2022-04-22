//@ts-ignore
// import {GLTFLoader} from './blog/node_modules/three/examples/jsm/loaders/GLTFLoader.js'
const gui = new dat.GUI({closed:true})
gui.hide()




const gltfLoader = new GLTFLoader()
console.log(gltfLoader)

//Scene 
const scene = new THREE.Scene()

// const gltfLoader = new THREE.GLTFLoader()
// console.log(gltfLoader)

const textureLoader =new THREE.TextureLoader()

const texture = textureLoader.load('https://camoyang.com/assets/img/1.png')

const ambientLight = new THREE.AmbientLight(0xffffff, 0.5) 

gui.add(ambientLight, 'intensity').min(0).max(1).step(0.01)

// const directionalLight = new THREE.DirectionalLight(0xffffff,1)
// directionalLight.position.set(0.5,1,2)
// scene.add(directionalLight)

const hemisphereLight = new THREE.HemisphereLight(0xff0000,0x0000ff,1)
scene.add(hemisphereLight)

//Debug UI
// const parameters = {
//     color : 0xffff00,
//     spin: () =>
//     {
//         gsap.to(mesh.rotation, { duration : 1, y : mesh.rotation.y + 10 })
//     }
// }
// gui.addColor(parameters,'color').onChange( ()=>
// {
//     material.color.set(parameters.color)
// })

// gui.add(parameters,'spin')


//Size
const sizes={width :window.innerWidth,height: window.innerHeight}

const cursor = {x:0,y:0}

window.addEventListener('dblclick', () =>
{
    const fullscreenElement = document.fullscreenElement || document.webkitFullscreenElement

    if(!document.fullscreenElement)   
    {
        if(canvas.requestFullscreen)
        {
            canvas.requestFullscreen()
        }
    } 
    else if (canvas.webkitRequestFullscreen)
    {
        canvas.webkitRequestFullscreen()
    }
    else
    { 
        if(document.exitFullscreen)
        {}
    }
}
)

window.addEventListener('resize', () => 
{
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update Camera
    camera.aspect = sizes.width / sizes.height

    //Update renderer
    renderer.setSize(sizes.width, sizes.height)
})

window.addEventListener('mousemove', (event) => 
{
    cursor.x = event.clientX / sizes.width - 0.5
    cursor.y = event.clientY / sizes.height - 0.5
    // console.log(cursor.x,cursor.y)
} )

const canvas = document.querySelector('.webgl')

const textureloader = new THREE.TextureLoader()

//Renderer
const renderer = new THREE.WebGLRenderer(
    {
        canvas: canvas
    }
)


const geometry = new THREE.BufferGeometry()
const count = 100
const positionArray = new Float32Array(count * 3 * 3)//each triangle composed of 3 vertices, each vertices composed of 3 cordinates

for ( let i = 0 ; i < count * 3 * 3; i++)
{
    positionArray[i] = (Math.random() - 0.5) * 3
}
const positionAttribute = new THREE.BufferAttribute(positionArray, 3)
geometry.setAttribute('position', positionAttribute)
//the property 'name' must be the string 'position'

//Object
// const geometry = new THREE.Geometry()

// for (let i =0 ; i < 50; i++)
// {
//     for (let j =0 ; j < 50; j++)
// {
//     geometry.vertices.push(new THREE.Vector3(
//         (Math.random()-0.5)* 4,
//         (Math.random()-0.5) * 4,
//         (Math.random()-0.5) * 4
//     ))     
// }
//     const verticesIndex = i * 3
//     geometry.faces.push(new THREE.Face3(
//         verticesIndex,
//         verticesIndex+1,
//         verticesIndex+2
//     ))
// }

// const vertex1 = new THREE.Vector3(0,0,0)
// geometry.vertices.push(vertex1)

// const vertex2 = new THREE.Vector3(0,1,0)
// geometry.vertices.push(vertex2)

// const vertex3 = new THREE.Vector3(0,0,1)
// geometry.vertices.push(vertex3)

// const face = new THREE.Face3(0,1,2)
// geometry.faces.push(face)

// const geometry = new THREE.TorusKnotGeometry(10,3,100,16)
// const geometry = new THREE.BoxBufferGeometry(1,1,1,4,4,4)
const geometryB = new THREE.BoxBufferGeometry(1,1,1)
console.log(geometryB.attributes.uv)

// const material =new THREE.MeshBasicMaterial({map:texture})
// material.color = new THREE.Color(0xffff00)
// // material.wireframe = true
// material.opacity  = 0.5
// material.transparent = true
// const material = new THREE.MeshNormalMaterial() 
// const material = new THREE.MeshLambertMaterial()
// const material = new THREE.MeshDepthMaterial()
// const material = new THREE.MeshPhongMaterial()
// const material = new THREE.MeshToonMaterial()
const material = new THREE.MeshStandardMaterial()
material.side = THREE.DoubleSide
material.metalness = 0.45
material.roughness = 0.65
// material.aoMap = texture
// material.aoMapIntensity = texture
// material.displacementMap = texture
// material.displacementScale = 0.05
// material.metalnessMap = texture
// material.roughnessMap = texture
// material.normalMap = texture 
// material.normalScale.set(0.5,0.5)
// material.transparent = true
// material.alphaMap = texture
// material.shininess = 100
// material.specular = new THREE.Color(0xff0000)
// material.matcap = texture
// material.wireframe = true
// material.flatShading = true
gui.add(material,'metalness').min(0).max(1).step(0.0001)
gui.add(material,'roughness').min(0).max(1).step(0.0001)
// gui.add(material,'aoMapIntensity').min(0).max(10).step(0.001)
// gui.add(material,'displacementScale').min(0).max(1).step(0.0001)

// const environmentMapTexture = new THREE.CubeTextureLoader().load([
//     'src/pic/textures/environmentMaps/0/px.jpg',
//     'src/pic/textures/environmentMaps/0/nx.jpg',
//     'src/pic/textures/environmentMaps/0/py.jpg',
//     'src/pic/textures/environmentMaps/0/ny.jpg',
//     'src/pic/textures/environmentMaps/0/pz.jpg',
//     'src/pic/textures/environmentMaps/0/nz.jpg'
// ])
// material.enMap = environmentMapTexture

const sphere = new THREE.Mesh(new THREE.SphereBufferGeometry(0.5, 16, 16), material)
sphere.position.x = 1
sphere.geometry.setAttribute('uv2', new THREE.BufferAttribute(sphere.geometry.attributes.uv.array,2))


const plane = new THREE.Mesh(new THREE.PlaneBufferGeometry(1,1), material)
plane.position.x = 0
plane.geometry.setAttribute('uv2', new THREE.BufferAttribute(plane.geometry.attributes.uv.array,2))

const plane2 = new THREE.Mesh(new THREE.PlaneBufferGeometry(5,5),material)
plane2.rotation.x = Math.PI *0.5
plane2.position.set(0,-0.5,0)
scene.add(plane2)

const torus = new THREE.Mesh(new THREE.TorusBufferGeometry(0.3,0.2,16,32), material)
torus.position.x = -1
torus.geometry.setAttribute('uv2', new THREE.BufferAttribute(torus.geometry.attributes.uv.array,2))

scene.add(sphere, plane, torus)

scene.add(ambientLight)

const pointLight = new THREE.PointLight(0xfffff, 0.5)
pointLight.position.set(2,3,4)
scene.add(pointLight)
// const mesh = new THREE.Mesh(geometryB, material)
//Scale
// mesh.scale.x = 2
// mesh.scale.y = 0.5
// mesh.scale.z = 0.5
// // mesh.scale.set(2,0.5,0.5)
// mesh.position.x = 1
// mesh.position.y = 1
// mesh.position.z = 2 
// mesh.position.set(0.7,-0.6,1)
// mesh.position.normalize()//正则化
// mesh.scale.normalize()
// //Rotation
// mesh.rotation.reorder('YXZ')
// mesh.rotation.y= Math.PI * 0.25
// mesh.rotation.x= Math.PI * 0.25
//Sizes
// scene.add(mesh)

//Debug UI
// gui.add(mesh.position, 'x', -3, 3, 0.01)//the first parameter is the object, the second parameter is the property you want to tweak
// gui.add(mesh.position, 'y').min(-3).max(3).step(0.01).name('elevation')

// gui.add(mesh,'visible')
// gui.add(mesh.material,'wireframe')
// gui.addColor

const group = new THREE.Group()
group.position.y=1
group.scale.y=0.5
group.rotation.y=1
const cube1 = new THREE.Mesh(new THREE.BoxGeometry(1,1,1),new THREE.MeshBasicMaterial({color:0x00ff00})) 
cube1.position.set(-1,1,1)
const cube2 = new THREE.Mesh(new THREE.BoxGeometry(1,1,1),new THREE.MeshBasicMaterial({color:0x0000ff}))
cube2.position.set(3,3,3)
group.add(cube1) 
group.add(cube2)
scene.add(group)

// Axes helper
const axesHelper = new THREE.AxesHelper(2)
scene.add(axesHelper)

//Camera
const camera = new THREE.PerspectiveCamera(fov = 75, aspect=1, near=0.001, far=10000)
camera.position.z = 3
// camera.lookAt(mesh)
scene.add(camera)   

//Controls
const controls = new THREE.OrbitControls(camera, canvas)
// controls.enabled = false
controls.enableDamping = true




renderer.setSize(sizes.width, sizes.height)
// renderer.setPixelRatio(window.devicePixelRatio)
renderer.setPixelRatio(Math.min(window.devicePixelRatio,2))
renderer.render(scene, camera)  
console.log("render complete")

//1 unit is arbitrary


//red cube












//Clock
let clock = new THREE.Clock()

//Animations

//Time 
let time = Date.now()


const tick = () => 
{
    // //Clock
    const elapsedTime = clock.getElapsedTime()
    // console.log(elapsedTime)
    // // mesh.position.x -=0.01 * elapsedTime
    // mesh.rotation.x =Math.PI * 2 * elapsedTime
    // camera.position.x = Math.cos(elapsedTime)
    // camera.position.y = Math.sin(elapsedTime)
    // // mesh.position.y +=0.01 * elapsedTime
    // mesh.rotation.y =Math.PI * 1 * elapsedTime 

    // Update Camera
    // camera.position.x = Math.sin(cursor.x * Math.PI * 2) * 3
    // camera.position.z = Math.cos(cursor.y * Math.PI * 2) * 3
    // camera.position.y = cursor. y * 5
    // camera.lookAt(mesh.position)
    // camera.lookAt(new THREE.Vector3())

    //Update Object
    sphere.rotation.y = elapsedTime * Math.PI * 0.25
    plane.rotation.y = elapsedTime * Math.PI * 0.25
    torus.rotation.y = elapsedTime * Math.PI * 0.25

    //Update controls
    controls.update()

    //Update Camera
    // camera.lookAt(torus)

    // //Render
    renderer.render(scene, camera)

    window.requestAnimationFrame(tick)
}

tick()