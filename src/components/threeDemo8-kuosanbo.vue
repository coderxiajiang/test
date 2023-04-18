
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
s = 0,
p = 1
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
        camera.position.x = -1
        camera.position.y = 3

        scene = new THREE.Scene()
        scene.add(new THREE.AxesHelper(1))

        renderer = new THREE.WebGLRenderer({antialias:true});
        renderer.setSize(container.clientWidth,container.clientHeight);
        container.appendChild(renderer.domElement);

        controls = new OrbitControls( camera, renderer.domElement );

        let texture = new THREE.TextureLoader().load(zhu)
        texture.wrapS = texture.wrapT = THREE.RepeatWrapping; //每个都重复
        texture.repeat.set(1, 1)
        texture.needsUpdate = true


        let geometry = new THREE.CylinderGeometry(0.2, 0.2, 0.1, 64);
        let materials = [
            new THREE.MeshBasicMaterial({
            map: texture,
            side: THREE.DoubleSide,
            transparent: true
            }),
            // new THREE.MeshBasicMaterial({
            // transparent: true,
            // opacity: 0,
            // side: THREE.DoubleSide
            // }),
            // new THREE.MeshBasicMaterial({
            // transparent: true,
            // opacity: 0,
            // side: THREE.DoubleSide
            // })
        ]
        mesh = new THREE.Mesh(geometry, materials)

        scene.add(mesh)

           
       },
       animate(){
            // 一定要在此函数中调用
            s += 0.01;
            p -= 0.005;
            if (s > 2) {
            s = 0;
            p = 1;
            }
            mesh.scale.set(1 + s, 1, 1 + s);
            mesh.material[0].opacity = p;
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