
<template>
    <div id="container"></div>
  </template>
  
  <script>
  import {TilesRenderer} from '3d-tiles-renderer';
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
  var container;
  var camera, scene, planeMesh, renderer,controls,tilesRenderer,box,offsetParent;
  export default {
   data () {
     return {
      
     }
   },
   methods:{
        init() {
          container = document.getElementById('container');
     
          // camera = new THREE.PerspectiveCamera(70, container.clientWidth/container.clientHeight, 0.1, 100);
          // camera.position.z =  17.306505
          // camera.position.x = 2439.411011
          // camera.position.y = -1266.465759
     
          scene = new THREE.Scene();
     
          scene.add(new THREE.AxesHelper(1))
          const dirLight = new THREE.DirectionalLight( 0xffffff );
          dirLight.position.set( 1, 2, 3 );
          scene.add( dirLight );

          const ambLight = new THREE.AmbientLight( 0xffffff, 0.2 );
          scene.add( ambLight );

          box = new THREE.Box3();
          offsetParent = new THREE.Group();
          scene.add( offsetParent );

          camera = new THREE.PerspectiveCamera( 60, container.clientWidth/container.clientHeight, 1, 4000 );
          camera.position.set( 40, 40, 40 );
          // cameraHelper = new THREE.CameraHelper( camera );
          // scene.add( cameraHelper );

     
     
          renderer = new THREE.WebGLRenderer();
          renderer.setSize(container.clientWidth,container.clientHeight);
     
          container.appendChild(renderer.domElement);
          
          controls = new OrbitControls( camera, renderer.domElement );

        // ... initialize three scene ...
 
        tilesRenderer = new TilesRenderer( '../../static/baoli(osgTo3dtitles)/tileset.json' );
        tilesRenderer.setCamera( camera );
        tilesRenderer.setResolutionFromRenderer( camera, renderer );
        console.log(123,tilesRenderer)
        //offsetParent.add( tilesRenderer.group );
        scene.add( tilesRenderer.group );
        },
       animate() {
          requestAnimationFrame(this.animate);
          controls.update();
          if (tilesRenderer.getBounds(box)) {
            box.getCenter(tilesRenderer.group.position);
            tilesRenderer.group.position.multiplyScalar(-1);
          }
          //offsetParent.rotation.set( 0, 0, 0 );
          //offsetParent.updateMatrixWorld(true);
          //camera.updateMatrixWorld();
          tilesRenderer.update();
          renderer.render(scene, camera);

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
  