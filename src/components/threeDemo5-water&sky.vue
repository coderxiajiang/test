
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
import { Water } from "three/examples/jsm/objects/Water.js"
import { Sky } from "three/examples/jsm/objects/Sky.js"
import { GUI } from "three/examples/jsm/libs/lil-gui.module.min.js"

let scene = null,
camera=null,
renderer=null,
mesh=null,
controls=null,
material =null,
water,
sun,
sky,
cube,
pmremGenerator,
renderTarget,
gui,
sunParams;
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

           camera = new THREE.PerspectiveCamera(55, container.clientWidth/container.clientHeight, 1, 2000);
           camera.position.set(30,30,100)

           scene = new THREE.Scene()

           renderer = new THREE.WebGLRenderer({antialias:true});
           renderer.setPixelRatio( window.devicePixelRatio);
           renderer.setSize(container.clientWidth,container.clientHeight);
           renderer.toneMapping = THREE.ACESFilmicToneMapping; //使太阳的光圈变小
           container.appendChild(renderer.domElement);
           cube,
           pmremGenerator = new THREE.PMREMGenerator(renderer)
           controls = new OrbitControls( camera, renderer.domElement );
           controls.target.set(0,10,0)
           controls.update()
           scene.add(new THREE.AxesHelper(100))
           //-------------基本要素--------
       },
       animate(){
           requestAnimationFrame(this.animate);
           const time = window.performance.now()*0.001;
           cube.position.y = Math.sin(time)*20 +5;
           cube.rotation.x = time * 0.5
           cube.rotation.z = time * 0.5
           water.material.uniforms['time'].value += 1/60
           renderer.render(scene,camera); 
       },
       initMesh(){
         sun=new THREE.Vector3(-80,5,-100) 
         water = new Water(
             new THREE.PlaneGeometry(10000,10000), 
             {
                 waterNormals:new THREE.TextureLoader().load(
                     '../../static/img/textures/waternormals.jpg',
                     function(texture){
                         texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
                     }
                 ),
                sunDirection:sun,
                sunColor:0xffffff,
                waterColor:0x001e0f,
             }
         )
         water.rotation.x = -Math.PI/2
         scene.add(water)

         sky = new Sky();
         sky.scale.setScalar(10000)
         scene.add(sky)


         const skyUniforms = sky.material.uniforms;
         skyUniforms['turbidity'].value = 10;//浑浊度 fog
         skyUniforms['rayleigh'].value = 2;//瑞利值

         sunParams = {
           elevation:2,//极角，  theta角 类似于纬度
           azimuth:-150//方位角   phi 角度 类似于经度
         }


         cube = new THREE.Mesh(
          new THREE.BoxGeometry(30,30,30),
          new THREE.MeshStandardMaterial()
         )
         scene.add(cube)

         this.enableGUI()
       },
       enableGUI(){
         gui = new GUI()
         const folderSun = gui.addFolder('太阳');
         folderSun.add(sunParams,'elevation',0,90,0.05).onChange(this.updateSun)
         folderSun.add(sunParams, 'azimuth', -180, 180, 0.1).onChange(this.updateSun)
         const waterParams = water.material.uniforms;
         const folderWater = gui.addFolder('水');
         folderWater.add(waterParams.distortionScale,'value',0,240,0.1).name('distortionScale')
         folderWater.add(waterParams.size,'value',0.1,20,0.1).name('size')
       },
       updateSun(){
         const theta = THREE.MathUtils.degToRad(90 - sunParams.elevation)//极角
         const phi = THREE.MathUtils.degToRad(sunParams.azimuth)//方位角
         sun.setFromSphericalCoords(1,theta,phi)
         sky.material.uniforms['sunPosition'].value.copy(sun)
         
         //物体的反射效果
         if(renderTarget !== undefined) renderTarget.dispose()//如果存在就销毁
         renderTarget = pmremGenerator.fromScene(sky)
         scene.environment = renderTarget.texture
       }
   },
   mounted(){

       this.init()

       this.initMesh()

       this.updateSun()

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