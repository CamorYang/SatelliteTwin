const canvas = document.querySelector('.webgl')

const renderer = new THREE.WebGLRenderer({
    canvas:canvas
})
renderer.setSize(window.innerWidth, window.innerHeight)

const camera = new  THREE.PerspectiveCamera(45,aspect = window.innerWidth/window.innerHeight,1, 500)
camera.position.set(0,0,100)
camera.lookAt(0,0,0)

const scene = new THREE.Scene()

const material = new THREE.LineBasicMaterial({color:0xff0000})

const points = []
points.push(new THREE.Vector3(0,-1,0))
points.push(new THREE.Vector3(0,2,1))
points.push(new THREE.Vector3(1,-1,3))

const geometry = new THREE.BufferGeometry().setFromPoints(points)

const line = new THREE.Line(geometry,material)
scene.add(line)

renderer.render(scene,camera)