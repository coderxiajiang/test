
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
       renderPass:null
     }
   },
   methods:{
       init(){
           let container = document.getElementById('container');

           camera = new THREE.PerspectiveCamera(70, container.clientWidth/container.clientHeight, 0.1, 10000);
           camera.position.z = 1000
           

           scene = new THREE.Scene()

           renderer = new THREE.WebGLRenderer({antialias:true});
           renderer.setSize(container.clientWidth,container.clientHeight);
           container.appendChild(renderer.domElement);

           controls = new OrbitControls( camera, renderer.domElement );
            
           scene.add(new THREE.AmbientLight({intensity:50}))
           

           let material = new THREE.ShaderMaterial({
                uniforms: {
                    u_dem: {
                        value: new THREE.TextureLoader().load("static/img/gaocheng.png"),//static/img/dem2.png
                    },
                    u_map: {
                        value: new THREE.TextureLoader().load("static/img/wenli.png"),//static/img/adly.png
                    },
                },

                vertexShader: [
                    "varying vec2 vUv;",
                    "varying vec3 vPosition;",
                    "varying vec3 vNormal;",
                    "uniform sampler2D u_dem;",
                    "void main() {",
                    "   vUv = uv;",
                     "   vec4 Dem = texture(u_dem,uv);",
                     "   float vAmount = Dem.r;",
                     "   float bumpScale = 1.0;",//起伏程度
                     " vec3 vPosition = position + normal * bumpScale * vAmount;",
                     " gl_Position = projectionMatrix * modelViewMatrix * vec4(vPosition, 1.0);",
                    "}",
                ].join("\n"),

                fragmentShader: [
                    "varying vec2 vUv;",
                    "varying vec3 vPosition;",
                    "varying vec3 vNormal;",
                    "uniform sampler2D u_map;",
                    "uniform sampler2D u_dem;",
                    "void main() {",
                    "   gl_FragColor = texture(u_map,vUv);",
                    "}",
                ].join("\n"),
                transparent: true,
                // wireframe: true,
            });
        //同事版本
        // let material = new THREE.ShaderMaterial({
        //         uniforms: {
        //             u_dem: {
        //                 value: new THREE.TextureLoader().load("static/img/gaocheng.png"),
        //             },
        //             u_map: {
        //                 value: new THREE.TextureLoader().load("static/img/wenli.png"),
        //             },
        //         },

        //         vertexShader: [
        //             "varying vec2 vUv;",
        //             "varying vec3 vPosition;",
        //             "varying vec3 vNormal;",
        //             "uniform sampler2D u_dem;",
        //             "void main() {",
        //             "   vUv = uv;",
        //             "   vNormal = normal;",
        //             "   vec2 st = uv * clamp(normal.y,0.0,1.0);",
        //             "   vec4 Dem = texture(u_dem,uv);",
        //             "   float Y = Dem.r * 0.721 + Dem.g * 0.223 + Dem.b * 0.056;",
        //             // "   float Y = 1.-length(uv-0.5);",
        //             // "   Y = step(0.5,Y);",
        //             // "   Y =clamp(Y,0.0,1.0) * max(0.,normal.y);",
        //             "   Y *= Dem.a * 2.;",
        //             // "   Y -=max(0.0,normal.y) * 0.5;",
        //             "   gl_Position = projectionMatrix * modelViewMatrix * vec4(position.x,position.y,position.z + Y,1.0);",
        //             "   vPosition = vec3(position.x,position.y,Y);",
        //             "}",
        //         ].join("\n"),

        //         fragmentShader: [
        //             //
        //             "varying vec2 vUv;",
        //             "varying vec3 vPosition;",
        //             "varying vec3 vNormal;",
        //             "uniform sampler2D u_map;",
        //             "uniform sampler2D u_dem;",
        //             "void main() {",
        //             "   vec2 st = vUv;",
        //             "   vec2 t_st = st;",
        //             "   vec4 tex = texture(u_map,st);",
        //             // "   vec4 Dem = texture(u_dem,st);",

        //             // "   if(tex.a<0.01) discard;",

        //             "   float face = max(vNormal.y,0.0);",
        //             "   vec3 col = vec3(0.0);",
        //             // "   col += vec3(0.4);",
        //             // "   col *= (1.-tex.a* face) ;",
        //             // "   col +=tex.rgb * face;",
        //             "   col += tex.rgb;",
        //             // "   col = vec3(1.0,0.0,0.0);",
        //             "   gl_FragColor = vec4(col,1.0);",
        //             "}",
        //         ].join("\n"),
        //         transparent: true,
        //         // wireframe: true,
        //     });
            let plane = new THREE.Mesh(new THREE.PlaneGeometry(1, 1, 500, 500), material);
            plane.scale.set(1000, 1000, 40);

            plane.rotation.x = -Math.PI / 4;
            scene.add(plane);

           
       },
       animate(){
           requestAnimationFrame(this.animate);
           // mesh.rotation.x += 0.01;
           // mesh.rotation.y += 0.02;
           renderer.render(scene,camera); 
           controls.update();
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