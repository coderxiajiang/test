
<template>
    <div id="container"></div>
    <!-- <img src="../../static/fonts/helvetiker_regular.typeface.json" alt=""> -->
</template>
  
<script>
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls' // 控制器
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader' // 文本样式加载器
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry' // 文本样式加载器
//呼吸灯需引入的
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js"
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js"
import { OutlinePass } from "three/examples/jsm/postprocessing/OutlinePass.js"
import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass.js"
import { FXAAShader } from "three/examples/jsm/shaders/FXAAShader.js"
import line from './img/line.png'
let scene = null,
camera=null,
renderer=null,
mesh=null,
controls=null,
texture=null
 export default {
   data () {
     return {
       composer:null,
       outlinePass:null,
       renderPass:null
     }
   },
   methods:{
       init(){
        let container = document.getElementById('container');

        camera = new THREE.PerspectiveCamera(30, container.clientWidth/container.clientHeight, 0.1, 10);
        camera.position.z = 3
        camera.position.x = 1
        camera.position.y = 1

        scene = new THREE.Scene()
        scene.add(new THREE.AxesHelper(1))

        renderer = new THREE.WebGLRenderer({antialias:true});
        renderer.setSize(container.clientWidth,container.clientHeight);
        container.appendChild(renderer.domElement);

        controls = new OrbitControls( camera, renderer.domElement );

        texture = new THREE.TextureLoader().load(line)
        texture.wrapS = texture.wrapT = THREE.RepeatWrapping; //每个都重复
        texture.repeat.set(1, 1)
        texture.needsUpdate = true

        let material = new THREE.MeshBasicMaterial({
            map: texture,
            side: THREE.BackSide,
            transparent: true,
        })

        // 创建顶点数组
        let points = [new THREE.Vector3(0, 0, 0),
            new THREE.Vector3(0.5, 0, 0),
            new THREE.Vector3(0.5, 0, 1),
            new THREE.Vector3(0, 0, 1)
        ]
        
        let points2 = [new THREE.Vector3(0, 0, 0.5),
            new THREE.Vector3(0.5, 0.5, 0.5),
            new THREE.Vector3(1, 0, 0.5),
        ]

        // CatmullRomCurve3创建一条平滑的三维样条曲线
        let curve = new THREE.CatmullRomCurve3(points) // 曲线路径

        // 创建管道
        let tubeGeometry = new THREE.TubeGeometry(curve, 80, 0.01)
        
        let mesh = new THREE.Mesh(tubeGeometry, material);

        // CatmullRomCurve3创建一条平滑的三维样条曲线
        let curve2 = new THREE.CatmullRomCurve3(points2) // 曲线路径

        // 创建管道
        let tubeGeometry2 = new THREE.TubeGeometry(curve2, 80, 0.01)
        
        let mesh2 = new THREE.Mesh(tubeGeometry2, material);

        scene.add(mesh)
        scene.add(mesh2)
           
       },
       animate(){
           if(texture) texture.offset.x -= 0.01
           requestAnimationFrame(this.animate);
           renderer.render(scene,camera); 
           controls.update();
       }
   },
   mounted(){
       this.init()
       this.animate()
   }
 }
</script>
  
<style scoped>
  #container{
      width: 100vw;
      height: 100vh;
  }
</style>