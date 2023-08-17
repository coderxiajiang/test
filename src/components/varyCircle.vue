
<template>
    <div id="container"></div>
    <!-- <img src="../../static/fonts/helvetiker_regular.typeface.json" alt=""> -->
</template>
  
<script>
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls' // 控制器
let scene = null,
camera=null,
renderer=null,
mesh=null,
controls=null,
geometry=null,
material=null,
uniforms=null
 export default {
   data () {
     return {
       
     }
   },
   methods:{
       init(){
           let container = document.getElementById('container');

           camera = new THREE.PerspectiveCamera(70, container.clientWidth/container.clientHeight, 0.1, 10);
           camera.position.z = 1

           scene = new THREE.Scene()

           renderer = new THREE.WebGLRenderer({antialias:true});
           renderer.setSize(container.clientWidth,container.clientHeight);
           container.appendChild(renderer.domElement);

           controls = new OrbitControls( camera, renderer.domElement );
           
           geometry =  new THREE.PlaneGeometry(1,1);
           //let material = new THREE.MeshBasicMaterial({color: 0x0ca678})//new THREE.MeshNormalMaterial();
           var geometry = new THREE.PlaneGeometry(1, 1);
        uniforms = {
            u_time: {
                type: "f",
                value: 0.5,
            },
        };
        var vertex = `
         varying vec2 vUv;
         void main() {
             vUv = uv;
             gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0);
         }
        `;
        var fragment = `
            uniform float u_time;
            varying vec2 vUv;
         
            void main() {
              float dist = length(vUv - vec2(0.5));
              float radius = 0.5*(sin(u_time)*0.5+0.5);
              vec3 color = vec3(step(radius,dist));
              gl_FragColor = vec4(color,1.0);
         }
        `;

        var material = new THREE.ShaderMaterial({
            uniforms: uniforms,
            vertexShader: vertex,
            fragmentShader: fragment,
            transparent:true,
            side:2
        });

       var planeMesh = new THREE.Mesh(geometry, material);
    //     planeMesh.position.set(1.2, 0.1, -0.8);
    //     planeMesh.scale.set(1, 1, 0);
    //    planeMesh.rotation.set(-Math.PI / 2, 0, 0);
        scene.add(planeMesh);

          
       },
       animate(){
           uniforms.u_time.value +=0.05;
           requestAnimationFrame(this.animate);
           // mesh.rotation.x += 0.01;
           // mesh.rotation.y += 0.02;
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