
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
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js"
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js"//是一种库，用于压缩和解压缩3D几何网络（geometric mesh）和点云（point cloud）
let scene = null,
camera=null,
renderer=null,
mesh=null,
controls=null,
material =null,
clock = null,
mixer = null
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
           clock = new THREE.Clock();
           let container = document.getElementById('container');

           camera = new THREE.PerspectiveCamera(10, container.clientWidth/container.clientHeight, 1, 100);
           camera.position.set(5,2,8)

           scene = new THREE.Scene()
           scene.background = new THREE.Color( 0xbfe3dd );
           scene.add(new THREE.AxesHelper(1))

           renderer = new THREE.WebGLRenderer({antialias:true});
           renderer.setSize(container.clientWidth,container.clientHeight);
           container.appendChild(renderer.domElement);

           controls = new OrbitControls( camera, renderer.domElement );
           controls.target.set( 0, 0.5, 0 );
           controls.update();
           controls.enablePan = false;
           controls.enableDamping = true;
           
           scene.add(new THREE.AmbientLight({intensity:50}))
           //-------------基本要素--------
       },
       animate(){
           requestAnimationFrame(this.animate);
           var delta = clock.getDelta();
           mixer&&mixer.update( delta ); // update animation mixer 更新动画混合器
           renderer.render(scene,camera); 
       },
       initMesh(){
      //       const dracoLoader = new DRACOLoader();
			// dracoLoader.setDecoderPath( 'jsm/libs/draco/gltf/' );
            const loader = new GLTFLoader();
			// loader.setDRACOLoader( dracoLoader );
			loader.load( '/static/CesiumMan.glb', gltf=> {
        console.log('gltf',gltf)
				const model = gltf.scene;
				model.position.set( 0.5, 0.5, 0.5 );
				model.scale.set( 0.1, 0.1, 0.1 );
				scene.add( model );
        
        var animations = gltf.animations;
			  mixer = new THREE.AnimationMixer( model );
        animations.forEach(animation => {
          mixer.clipAction( animation ).play();//让模型动起来
        });

				this.animate();

			});
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