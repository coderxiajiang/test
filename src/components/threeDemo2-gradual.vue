
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

           camera = new THREE.PerspectiveCamera(70, container.clientWidth/container.clientHeight, 0.1, 100);
           camera.position.set(2,2,2)

           scene = new THREE.Scene()

           renderer = new THREE.WebGLRenderer({antialias:true});
           renderer.setSize(container.clientWidth,container.clientHeight);
           container.appendChild(renderer.domElement);

           controls = new OrbitControls( camera, renderer.domElement );
            
           scene.add(new THREE.AmbientLight({intensity:1}))
           this.uniforms = {
               ...this.uniforms,
               uColor1:{value:new THREE.Color('#ffffff')},
               uColor2:{value:new THREE.Color('#00ffff')},
               uHeight: 2.0,
           }
           //加入方块
           let geometry =  new THREE.BoxBufferGeometry(1,1,1);
           // scene.add(mesh);
           //Shader object
           //Mesh(BufferGeometry,ShaderMeterial)
           //ShaderMeterial
           //1.uniforms: 全局变量
           //2.vertexShader:顶点着色器，定义位置信息的 
               //uv指的是plangeometry的attributes里的uv
               //position指的是plangeometry的attributes里的position
           //3.fragmentShader：片段着色器，定义颜色的
              //vUv和vertexShader里的vUv是同一个
           const shaderMeterial = new THREE.ShaderMaterial({side:2,depthTest:true})
           mesh = new THREE.Mesh(geometry, shaderMeterial)
           mesh.scale.set(0.2,1.6,0.2)
           scene.add(mesh);
           console.log(geometry,shaderMeterial)
           shaderMeterial.uniforms = this.uniforms
           shaderMeterial.vertexShader = `
           precision highp float;
            varying vec3 vNormal;
            varying vec3 vPosition;
            void main() {
            //将attributes的normal通过varying赋值给了向量vNormal
                vNormal = normal;
                vPosition = position;
                    //projectionMatrix是投影变换矩阵 modelViewMatrix是相机坐标系的变换矩阵
                gl_Position = projectionMatrix * modelViewMatrix * vec4( position.x, position.y, position.z, 1.0 );
            }
           `
           shaderMeterial.fragmentShader =`
            precision highp float;
             varying vec3 vNormal;
             varying vec3 vPosition;
             uniform vec3 uColor1;
             uniform vec3 uColor2;
             uniform float uHeight;
             void main() {
                vec3 gradient = mix(uColor2, uColor1, vPosition.y+0.5);
                gl_FragColor = vec4(gradient, 1.0);
             }
            `
       },
       changeColor(event){
               let mouseX = event.clientX;//鼠标单击位置横坐标
               let mouseY = event.clientY;//鼠标单击位置纵坐标 
               const rect=container.getBoundingClientRect();//拿到div相对屏幕坐标的偏移量
               //屏幕坐标转标准设备坐标
               const x = ((mouseX - rect.left) / container.clientWidth) * 2 - 1;
               const y = - ((mouseY - rect.top) / container.clientHeight) * 2 + 1;
               let standardVector  = new THREE.Vector3(x, y);//标准设备坐标
               //标准设备坐标转世界坐标
               let worldVector = standardVector.unproject(camera);
               //射线投射方向单位向量(worldVector坐标减相机位置坐标)
               let ray = worldVector.sub(camera.position).normalize();
               //创建射线投射器对象 
               let raycaster = new THREE.Raycaster(camera.position, ray);
               raycaster.camera=camera//设置一下相机
           
               //返回射线选中的对象 //第一个参数是检测的目标对象 第二个参数是目标对象的子元素
               let intersects= raycaster.intersectObjects(scene.children,true);
               console.log(intersects)
               //加入呼吸灯
               this.outlineObj([intersects[0].object])
               //单纯变颜色
               if (intersects.length > 0) {
                   console.log("捕获到对象");
                   console.log(scene.children);
                   console.log(intersects)
                   //将所有的相交的模型的颜色设置为红色,其余的恢复为原来的白色
                   for (var i = 0; i < scene.children.length; i++) {
                       if(intersects[0].object.name==scene.children[i].name){
                           scene.children[i].material.color.set(0xff0000);
                       }
                       else{
                           scene.children[i].material.color.set(0xffffff);
                       }
                   }
               }else{
                   console.log("没捕获到对象"); 
               }    
       },
       outlineObj(selectedObjects) {
           // 创建一个EffectComposer（效果组合器）对象，然后在该对象上添加后期处理通道。
           this.composer = new EffectComposer(renderer)
           // 新建一个场景通道  为了覆盖到原理来的场景上
           this.renderPass = new RenderPass(scene, camera)
           this.composer.addPass(this.renderPass);
           // 物体边缘发光通道
           this.outlinePass = new OutlinePass(new THREE.Vector2(window.innerWidth, window.innerHeight), scene, camera, selectedObjects)
           this.outlinePass.selectedObjects = selectedObjects
           this.outlinePass.edgeStrength = 10.0 // 边框的亮度
           this.outlinePass.edgeGlow = 1// 光晕[0,1]
           this.outlinePass.usePatternTexture = false // 是否使用父级的材质
           this.outlinePass.edgeThickness = 8.0 // 边框宽度
           this.outlinePass.downSampleRatio = 1 // 边框弯曲度
           this.outlinePass.pulsePeriod = 5 // 呼吸闪烁的速度
           this.outlinePass.visibleEdgeColor.set(parseInt(0x00ff00)) // 呼吸显示的颜色
           this.outlinePass.hiddenEdgeColor = new THREE.Color(0, 0, 0) // 呼吸消失的颜色
           this.outlinePass.clear = true
           this.composer.addPass(this.outlinePass)
           // 自定义的着色器通道 作为参数
           // var effectFXAA = new ShaderPass(FXAAShader)
           // effectFXAA.uniforms.resolution.value.set(1 / window.innerWidth, 1 / window.innerHeight)
           // effectFXAA.renderToScreen = true
           // this.composer.addPass(effectFXAA)
       },
       createText() {
           //使用文本实体
           // var fontload = new FontLoader();
           // fontload.load( 'static/fonts/helvetiker_regular.typeface.json', function ( response ) {
           // var options ={
           //     size:0.1,
           //     height:0,
           //     font:response,
           //     bevelThickness:2,
           // }    
           // var geometry  = new TextGeometry("66", options)
           // var material = new THREE.MeshNormalMaterial();

           // var text= new THREE.Mesh(geometry, material);

           // text.position.y =0.2
           // text.position.x =-0.08
           // scene.add(text);
           // });

           //使用文本精灵贴图
           var text = "Leo Test Label";  // 目标文字
           var canvas = document.createElement("canvas");
           var ctx = canvas.getContext("2d");
           var width = ctx.measureText(text).width;
           var scalek = width / 200; // 计算放缩比
           var spriteMaterial = new THREE.SpriteMaterial({
               map: new THREE.CanvasTexture(this.getTextCanvas(text)),
               transparent: true, //开启透明(纹理图片png有透明信息)
           });
           // 创建精灵模型对象，不需要几何体geometry参数
           var sprite = new THREE.Sprite(spriteMaterial);
           sprite.scale.set(scalek, 0.1, 0.1); //精灵大小
           sprite.position.set(   // 设置精灵图位置
               0,
               0.2,
               0
           );
           // sprite.translateY(0.8);
           
           scene.add(sprite);
       },
       getTextCanvas(text) {
           var canvas = document.createElement("canvas");
           var ctx = canvas.getContext("2d");
           var width = ctx.measureText(text).width + 10, // 根据文字数量来决定宽度
               height = 30;//固定高度
           canvas.width = width;
           canvas.height = height;
           ctx.fillStyle = "transparent"; // 背景颜色
           ctx.fillRect(0, 0, width, height);
           ctx.font = 10 + 'px " bold';
           ctx.fillStyle = "#fff"; // 字体颜色
           ctx.textAlign = "center";
           ctx.textBaseline = "middle";
           ctx.fillText(text, width / 2, height / 2);// 实现边框
           
       
           return canvas;
       },
       animate(){
           requestAnimationFrame(this.animate);
           // mesh.rotation.x += 0.01;
           // mesh.rotation.y += 0.02;
           renderer.render(scene,camera); 
           controls.update();
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