
<template>
    <div id="container" style="background:#fff"></div>
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
let scene = null,
camera=null,
renderer=null,
mesh=null,
controls=null,
material =null
 export default {
   data () {
     return {
       composer:null,
       outlinePass:null,
       renderPass:null,
       uniforms:{time: {value:1.0}}
     }
   },
   methods:{
       init(){
           let container = document.getElementById('container');

           camera = new THREE.PerspectiveCamera(55, container.clientWidth/container.clientHeight, 2, 2000);
           camera.position.z=1000

           scene = new THREE.Scene()

           renderer = new THREE.WebGLRenderer({antialias:true});
           renderer.setSize(container.clientWidth,container.clientHeight);
           container.appendChild(renderer.domElement);

           controls = new OrbitControls( camera, renderer.domElement );
           scene.add(new THREE.AxesHelper(100))
           //-------------基本要素--------
       },
       animate(){
           requestAnimationFrame(this.animate);
           const time = Date.now()*0.00005
           const h = (360*(1.0+time)%360)/260
           material.color.setHSL(h,0.5,0.5)
           renderer.render(scene,camera); 
       },
       initMesh(){
          const geometry = new THREE.BufferGeometry()
          const vertices = [];
          for(let i=0;i<10000;i++){
              //-1000~1000
              const x =2000*Math.random() - 1000;
              const y=2000*Math.random() - 1000;
              const z =2000*Math.random() - 1000;
              vertices.push(x,y,z)
          }
          geometry.setAttribute(
              'position',
              new THREE.Float32BufferAttribute(vertices,3)
          )
          console.log(geometry)
          
          const texture = new THREE.TextureLoader().load('../../static/img/sprites/spark1.png')
          material = new THREE.PointsMaterial({
              alphaTest:0.5,
              transparent:true,
              size:50,
              map:texture
          })
          const particles = new THREE.Points(geometry,material)
          scene.add(particles)
       }
   },
   mounted(){

       this.init()

       this.initMesh()

       this.animate()
       //-------------基本方法--------
       
   }
 }
</script>
  
<style scoped>
  #container{
      width: 100vw;
      height: 100vh;
  }
</style>