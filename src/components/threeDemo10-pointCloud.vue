
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

        camera = new THREE.PerspectiveCamera(70, container.clientWidth/container.clientHeight, 0.1, 10);
        camera.position.z = 3
        camera.position.x = 1
        camera.position.y = 1

        scene = new THREE.Scene()
        scene.add(new THREE.AxesHelper(1))

        renderer = new THREE.WebGLRenderer({antialias:true});
        renderer.setSize(container.clientWidth,container.clientHeight);
        container.appendChild(renderer.domElement);

        controls = new OrbitControls( camera, renderer.domElement );

        let group = new THREE.Group();

        let boxGeometry = new THREE.BoxGeometry(2.5, 5, 2.5, 10, 15, 10);
        let cylinderGeometry = new THREE.CylinderGeometry(1, 1, 5, 15, 15);
        let box = this.createPointsCloud(boxGeometry);
        let cylinder = this.createPointsCloud(cylinderGeometry);

        box.position.x = -2;
        cylinder.position.x = 2;
        group.add(cylinder);
        group.add(box);
        scene.add(group);
            
       },
       createPointsCloud(geometry) {
            /* 精灵材质 */
            let spriteMaterial = new THREE.PointsMaterial({
                color: 0xffffff,
                size:0.23,
                transparent: true,
                map: this.generateSprite()
            });
            let points = new THREE.Points(geometry, spriteMaterial);
            return points;
       },
       generateSprite() {
            /* 常见画布并设置宽高 */
            let canvas = document.createElement('canvas');
            canvas.width = 8;
            canvas.height = 8;
            /* 创建图形 */
            let ctx = canvas.getContext("2d");
            let gradient = ctx.createRadialGradient(
                canvas.width / 2, canvas.height / 2, 0,
                canvas.width / 2, canvas.height / 2, canvas.width / 2
            );
            gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
            gradient.addColorStop(0.2, 'rgba(0, 255, 255, 1)');
            gradient.addColorStop(0.6, 'rgba(0, 0, 64, 1)');

            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            let texture = new THREE.Texture(canvas);
            texture.needsUpdate = true;
            return texture;
       },
       animate(){
        //    mesh.rotateY(0.01);
        //    num += 0.01
        //    mesh.position.y = Math.sin(num)
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