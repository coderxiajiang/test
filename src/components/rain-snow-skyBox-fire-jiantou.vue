
<template>
    <div id="container"></div>
    <!-- <img src="../../static/fonts/helvetiker_regular.typeface.json" alt=""> -->
</template>
  
<script>
import * as THREE from 'three'
import TWEEN from '../../static/Tween.min.js'
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
RollMat=null,
RollTexture=null
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

        camera = new THREE.PerspectiveCamera(10, container.clientWidth/container.clientHeight, 0.1, 10000);
        camera.position.z = 1000


        scene = new THREE.Scene()

        renderer = new THREE.WebGLRenderer({antialias:true});
        renderer.setSize(container.clientWidth,container.clientHeight);
        container.appendChild(renderer.domElement);

        controls = new OrbitControls( camera, renderer.domElement );
        
        scene.add(new THREE.AmbientLight({intensity:50}))
        this.createPlaneGeometryBasicMaterial()
        this.initactivejiantou()
        this.initFlame()

       },
       initactivejiantou(){
        RollMat = new THREE.MeshLambertMaterial();
        RollTexture = new THREE.TextureLoader().load( "static/img/jiantou2.png", function( map ) {
          RollMat.map = map;
            RollMat.needsUpdate = true;
            RollMat.transparent = true;
            RollMat.side = THREE.DoubleSide;
        } );
        RollTexture.wrapS = THREE.RepeatWrapping;
        RollTexture.wrapT=THREE.RepeatWrapping;
        this.addRollPlane()
       },
       addRollPlane() {
          var geometry = new THREE.PlaneGeometry( 400, 20 );
          var obj = new THREE.Mesh( geometry, RollMat );
          obj.position.set(0,-4,0);
          obj.rotation.x = -0.5 * Math.PI;
          obj.scale.set(0.25, 0.5, 1);    
          scene.add( obj );
       },
       createPlaneGeometryBasicMaterial(){
        const groundTexture =  new THREE.TextureLoader().load("static/img/cd.jpg");
        groundTexture.wrapS = groundTexture.wrapT = THREE.RepeatWrapping;
        groundTexture.repeat.set(3, 3)
        var cubeMaterial = new THREE.MeshStandardMaterial({
            map: groundTexture,
            side: THREE.DoubleSide,
        });
        // 创建地平面并设置大小
        var planeGeometry = new THREE.PlaneGeometry(100, 100);
        var plane = new THREE.Mesh(planeGeometry, cubeMaterial);

        // 设置平面位置并旋转
        plane.rotation.x = -0.5 * Math.PI;
        plane.position.x = 0;
        plane.position.z = -5;
        plane.position.y = -5;
        scene.add(plane);
       },
       initFlame() {
          //初始化一个空容器，装载粒子
		    	var krq = new THREE.Object3D();
					var texture = new THREE.TextureLoader().load("static/img/flamex.png");
					//sprite材质
					var material = new THREE.SpriteMaterial({
						//以canvas作为纹理
						map: texture,
						//混合度 加法混合
						blending: THREE.AdditiveBlending
					});

					//循环1000  添加粒子
					for (var i = 0; i < 2000; i++) {
						var particle = new THREE.Sprite(material);
						this.initParticle(particle, i);
						krq.add(particle);
						krq.name = "particles_flame";
					}
					scene.add(krq);
			 },
       initParticle(particle, delay) {
					particle.position.set(5, Math.random() + 5, 0);
					particle.scale.x = particle.scale.y = Math.random() * 3;
					//下面是一系列的动画
					var xx = Math.random() * 10 - 5;
					var yy = Math.cos((Math.PI / 100) * xx) * 20;
					//位移
					new TWEEN.Tween(particle.position)
						.delay(delay)
						.to({
							x: xx,
							y: yy,
							z: Math.random() * 10 - 5
						}, 2000)
						.onComplete(()=> {
							this.initParticle(particle, delay);
						})
						.start();
					// 大小
					new TWEEN.Tween(particle.scale)
						.delay(delay)
						.to({
							x: 0.01,
							y: 0.01
						}, 1000)
						.start();
			 },
       animate(){
           requestAnimationFrame(this.animate);
           // mesh.rotation.x += 0.01;
           // mesh.rotation.y += 0.02;
           renderer.render(scene,camera); 
           controls.update();
           TWEEN.update();
           RollTexture.offset.x += 0.001;
           if (this.composer) {
               this.composer.render()
           }
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