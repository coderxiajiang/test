
<template>
    <div id="container"></div>
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
  var container;
  var camera, scene, planeMesh, renderer,controls;
  export default {
   data () {
     return {
      
     }
   },
   methods:{
        init() {
          container = document.getElementById('container');
     
          camera = new THREE.PerspectiveCamera(70, container.clientWidth/container.clientHeight, 0.1, 100);
          camera.position.z = 3
          camera.position.x = 1
          camera.position.y = 1
     
          scene = new THREE.Scene();
     
          var geometry = new THREE.PlaneBufferGeometry(1, 1);
  
          var uniforms = {
            radius: {
                type: "f",
                value: 0.5,
            },
            u_time: {
                type: "f",
                value: 0.5,
            },
        };
        var vertexShader = `
            varying vec2 vUv;
            void main() {
              vUv = uv;
              gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
            }
            `;
        var fragmentShader = `
            #define PI 3.1415926535897932384626433832795
            #ifdef GL_ES
            precision mediump float;
            #endif
            uniform vec2 u_resolution;
            uniform float u_time;
            varying vec2 vUv;
         
            //二维旋转矩阵
            mat2 rotate2d(float _angle){
              return mat2(cos(_angle),-sin(_angle),sin(_angle),cos(_angle));
            }
            
            float drawCircle(vec2 st,vec2 center,float radius) { 
              float pct = distance(st,center);
              float line_width = 0.01;
              //return smoothstep(pct-0.02,pct,st.y)-smoothstep(pct,pct+0.02,st.y);
              return smoothstep(radius-line_width,radius,pct)-smoothstep(radius,radius+line_width,pct);
            }
         
            //绘制指定两点间的直线
            float line_segment_with_two_point (vec2 st,vec2 start,vec2 end,float line_width){
              vec2 line_vector_from_end = normalize(vec2(start.x,start.y) - vec2(end.x,end.y));//结束点指向起始点的向量
              vec2 line_vector_from_start = -line_vector_from_end;//起始点指向结束点的向量
              vec2 st_vector_from_end = st - vec2(end.x,end.y); //结束点指向画布中任意点的向量
              vec2 st_vector_from_start = st - vec2(start.x,start.y);//起始点指向画布中任意点的向量
         
              float proj1 = dot(line_vector_from_end,st_vector_from_end);
              float proj2 = dot(line_vector_from_start,st_vector_from_start);
         
              if(proj1>0.0&&proj2>0.0){//通过点乘结果>0判断是否同相，过滤掉线段两头超出部分
                //屏幕上任意点到直线的垂直距离
                float dist = sin(acos(dot(line_vector_from_end,st_vector_from_end)/length(st_vector_from_end)))*length(st_vector_from_end);
                
                return pow(1.0-smoothstep(0.0,line_width,dist),6.0);
              }
            }
         
            float flowingLine(vec2 st,float line_width,float radius){
              //u_time前加负号使之变为顺时针旋转
              st = rotate2d( -u_time*1.5) * st;
         
              float x  = cos(0.0)*radius;
              float y  = sin(0.0)*radius;
         
              return  line_segment_with_two_point (st,vec2(x,y),vec2(0.0),line_width);
            }
         
            //绘制小点模拟被扫描物体
            float smallPoint(vec2 st,vec2 position,vec2 vector,float radius){
         
              // 从原点指向物体的向量
              vec2 positionVector = position - vec2(0.0);
         
              //雷达扫描光起始线与指向物体的向量间的夹角
              float angle = acos(dot(positionVector,vector)/(length(positionVector)*length(vector)));
         
              float dist = distance(st,position);
         
              return (1.0 -step(radius*sin(angle/2.0-PI/16.0),dist));
         
            }
         
            //绘制雷达扫描光及被扫描物体
            float sectorFlowingLight(vec2 oriSt,float radius){
              vec2 st = oriSt;
              //u_time前加负号使之变为顺时针旋转
              st = rotate2d( -u_time*1.5) * st;
         
              vec2 center = vec2(0.0);
         
              vec2 vector0 = vec2(cos(0.0),sin(0.0)) - center;
              vec2 vector1 = st -center;
              vec2 vector2 = vec2(cos(PI/2.0),sin(PI/2.0)) - center;
         
              float dotProd = dot(vector1,vector2);
         
              //计算0度线与圆心到st上向量的夹角
              float angle = acos(dot(vector0,vector1)/(length(vector0)*length(vector1)));
         
            
              if(dotProd>0.0&&dotProd<1.0&&angle>0.0&&angle<PI/2.0&&distance(st,vec2(0.0))<0.6){
                //雷达扫描光
                float pct = (1.0-smoothstep(0.0,PI/2.0,angle))*0.7;
         
                //小圆点1
                float point1 = smallPoint(oriSt,vec2(0.3,0.3),vector1,0.04);
                pct = mix(pct,point1,0.1);  
         
                //小圆点2
                float point2 = smallPoint(oriSt,vec2(0.1,0.2),vector1,0.06);
                pct = mix(pct,point2,0.3);  
         
                return  pct; 
              } 
            }
         
            
            void main( void ) {
              //窗口坐标调整为[-1,1],坐标原点在屏幕中心
              //vec2 st = (gl_FragCoord.xy * 2. - u_resolution) / u_resolution.y;
         
              //窗口坐标调整为[0,1],坐标原点在屏幕左下角
              //vec2 st = gl_FragCoord.xy/u_resolution;
      
              vec2 st = vUv;
              st-=0.5;
              st*=1.2;
         
              vec3 line_color = vec3(0.0,1.0,0.0);
         
              vec3 color = vec3(0.0,0.0,0.0);
         
              float pct = 0.0;
              
              //绘制圆边界
              pct = drawCircle(st,vec2(0.0,0.0),0.6);
              color +=pct*line_color;
         
              //绘制雷达扫描光起始线
              pct = flowingLine(st,0.02,0.6);
              color += pct*line_color;
         
              //绘制雷达扫描光与被扫描物体
              pct = sectorFlowingLight(st,0.6);
              color += pct*line_color;
         
              gl_FragColor = vec4(color, 1.);
            }
            `;
     
          var material = new THREE.ShaderMaterial({
            uniforms: uniforms,
            vertexShader: vertexShader,
            fragmentShader: fragmentShader
          });
     
          planeMesh = new THREE.Mesh(geometry, material);
     
     
          scene.add(planeMesh);
          scene.add(new THREE.AxesHelper(1))

     
     
          renderer = new THREE.WebGLRenderer();
          renderer.setSize(container.clientWidth,container.clientHeight);
     
          container.appendChild(renderer.domElement);
          
          controls = new OrbitControls( camera, renderer.domElement );
          //console.log(controls);
         // controls.autoRotate = true
        //   uniforms.u_resolution.value.x = renderer.domElement.width;
        //   uniforms.u_resolution.value.y = renderer.domElement.height;
     
        },
       animate() {
          requestAnimationFrame(this.animate);
     
          planeMesh.material.uniforms.u_time.value += 0.01;

          
          controls.update();
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
  