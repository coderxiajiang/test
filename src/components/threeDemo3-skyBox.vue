
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
let scene = null,
camera=null,
renderer=null,
mesh=null,
controls=null
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

           camera = new THREE.PerspectiveCamera(90, container.clientWidth/container.clientHeight, 0.1, 100);
           camera.position.set(0.2,0,0.2)

           scene = new THREE.Scene()

           renderer = new THREE.WebGLRenderer({antialias:true});
           renderer.setSize(container.clientWidth,container.clientHeight);
           container.appendChild(renderer.domElement);

           controls = new OrbitControls( camera, renderer.domElement );
           controls.enableZoom = false; //鼠标中键
           controls.enablePan = false;//鼠标右键
           controls.rotateSpeed = -0.25//＋值模型与相机相反方向移动，—值模型与相机相同方向移动
           controls.enableDamping = true;//阻尼系数（惯性效果）
           scene.add(new THREE.AmbientLight({intensity:50}))
           const textures = this.getTexturesFromAtlasFile(
               '../../static/img/sun_temple_stripe.jpg',
               6
           )
           const materials = [];
           for(let i=0;i<textures.length;i++) {
               materials.push(
                   new THREE.MeshBasicMaterial({
                       map:textures[i]
                   })
               )
           }
           //加入方块
           let geometry =  new THREE.BoxGeometry(10,10,10);
           let material = new THREE.MeshBasicMaterial({color: 0xffffff})//new THREE.MeshNormalMaterial();
           mesh = new THREE.Mesh(geometry, materials);
           mesh.geometry.scale(1,1,-1)
           scene.add(mesh);
       },
       getTexturesFromAtlasFile(file,tilesNum){
           const textures = [];
           for(let i=0;i<tilesNum;i++){
               textures[i] = new THREE.Texture();
           }
           new THREE.ImageLoader().load(
               file,
               function(image) {
                   const width = image.height;
                   let canvas,context;
                   for(let i=0;i<tilesNum;i++){
                       canvas = document.createElement('canvas');
                       context = canvas.getContext('2d');
                       canvas.height = width;
                       canvas.width = width;
                       context.drawImage(image,width*i,0,width,width,0,0,width,width)
                       textures[i].image = canvas;
                       textures[i].needsUpdate = true;

                   }
                   console.log(image)
               }
           ) 
           return textures
       },
       animate(){
           requestAnimationFrame(this.animate);
           // mesh.rotation.x += 0.01;
           // mesh.rotation.y += 0.02;
           renderer.render(scene,camera); 
           controls.update();//当damping is enabled
           this.uniforms[ 'time' ].value = performance.now() / 1000;
        //    if (this.composer) {
        //        this.composer.render()
        //    }
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