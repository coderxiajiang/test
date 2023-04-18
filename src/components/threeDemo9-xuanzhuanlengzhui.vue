
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
import zhu from './img/zhu.png'
let scene = null,
camera=null,
renderer=null,
mesh=null,
controls=null,
texture=null,
num=0
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

        var geometry = new THREE.ConeGeometry( 0.5, 1, 4 );
        var material = new THREE.MeshBasicMaterial( {color: 0xffff00} );
        mesh = new THREE.Mesh(geometry, material);
        mesh.rotation.x = Math.PI
        scene.add(mesh);
            
       },
       animate(){
           mesh.rotateY(0.01);
           num += 0.01
           mesh.position.y = Math.sin(num)
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