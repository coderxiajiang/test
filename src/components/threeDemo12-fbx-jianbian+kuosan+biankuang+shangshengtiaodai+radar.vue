
<template>
  <div id="container"></div>
  <!-- <img src="../../static/fonts/helvetiker_regular.typeface.json" alt=""> -->
</template>

<script>
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls' // 控制器
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader.js"
import Shader from './threeDemo12-fbx-shader'
import gsap from "gsap"
let scene = null,
camera=null,
renderer=null,
mesh=null,
controls=null,
texture=null,
num=0,
planeMesh=null
// DL=null,
// DL2=null

const clock = new THREE.Clock()
clock.start()
export default {
 data () {
   return {
      surroundLineMaterial:null,
      time:{
          value: 0
      },
      StartTime:{
          value: 0
      },
      isStart:false, // 是否启动
   }
 },
 methods:{
     init(){
      let container = document.getElementById('container');

      camera = new THREE.PerspectiveCamera(70, container.clientWidth/container.clientHeight, 0.1, 100);
      camera.position.z = 3
      camera.position.x = 1
      camera.position.y = 1

      scene = new THREE.Scene()
      scene.add(new THREE.AxesHelper(1))

      renderer = new THREE.WebGLRenderer({antialias:true});
      renderer.setSize(container.clientWidth,container.clientHeight);
      container.appendChild(renderer.domElement);

      controls = new OrbitControls( camera, renderer.domElement );
      scene.add(new THREE.AmbientLight({intensity:50}))

      // DL = new THREE.SpotLight(0xffffff,3,0,0.0005);
      // DL.position.set(9970.9194946289062,400,0);
      // DL2 = new THREE.SpotLight(0xffffff,3,0,0.0005);
      // DL2.position.set(-12000,400,0);
      // console.log('DL',DL.shadow.camera);

      // scene.add(new THREE.AmbientLight({intensity:50}),DL,DL2)

      var loader = new FBXLoader();
      // 需要做城市效果的mesh 
      const cityArray = ['CITY_UNTRIANGULATED'];

      loader.load('/static/shanghai.FBX', fbx => {
          console.log('fbx',fbx)
          fbx.position.set( 0.5, 0, 0.5 );
          fbx.scale.multiplyScalar(.005);
          scene.add(fbx);
          fbx.traverse((child) => {
              if (child.name=='CITY_UNTRIANGULATED') {
                  //建筑
                  this.setCityMaterial(child);
                  // 添加包围线条效
                  this.surroundLine(child);
                  //添加雷达扫描
                  this.addRadar()
              }
          })
      })
          
     },
     addRadar(){
      var geometry = new THREE.PlaneGeometry(1, 1);
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
         
              gl_FragColor = vec4(color, length(color.rgb));
            }
            `;

        var material = new THREE.ShaderMaterial({
            uniforms: uniforms,
            vertexShader: vertexShader,
            fragmentShader: fragmentShader,
            transparent:true,
            side:2
        });

        planeMesh = new THREE.Mesh(geometry, material);
        planeMesh.position.set(1.2, 0.1, -0.8);
        planeMesh.scale.set(1, 1, 0);
       planeMesh.rotation.set(-Math.PI / 2, 0, 0);
        scene.add(planeMesh);
        console.log('planeMesh',planeMesh)
     },
     setCityMaterial(mesh){
        mesh.material.color =  new THREE.Color("#1B3045")
        mesh.material.onBeforeCompile = (shader)=>{
          //建筑渐变
          this.changeShaderByHeight(shader,mesh)
          //扩散光圈
          this.addLightRing(shader,mesh)
          //建筑上升条带
          this.ascendingBand(shader,mesh)

        }



     },
     changeShaderByHeight(shader,mesh){
       console.log('shader',shader,shader.fragmentShader)
       // 计算几何的边界框，更新boundingBox属性
       mesh.geometry.computeBoundingBox();
        // console.log(mesh.geometry.boundingBox); => Box3包围盒
        const { min, max } = mesh.geometry.boundingBox;
        console.log('max和min',max,min)
        // 物体的高度范围
        const uHeight = max.z - min.z;//因为坐标旋转z值相当于y值
        shader.uniforms.uHeight = {
            value: uHeight,
          };
          // 顶部颜色
          shader.uniforms.uTopColor = {
            value: new THREE.Color("#FFFFDC"),
          };
          //建筑生长时间
          shader.uniforms.uStartTime = this.StartTime;
          // 顶点着色器传递模型坐标给片元坐标系
          shader.vertexShader = shader.vertexShader.replace(
            "#include <common>",
            `
              #include <common>
              varying vec3 vPosition;
              uniform float uStartTime;
              `
          );
          // 在顶点着色器的主函数中为将要传递给片元着色器的varying变量赋值
          // position 是threejs底层定义好的模型坐标
          shader.vertexShader = shader.vertexShader.replace(
            "#include <fog_vertex>",
            `
              #include <fog_vertex>
              vPosition = position;
          `
          );
          const vertexPosition = `
  vec3 transformed = vec3(position.x, position.y, position.z * uStartTime);
          `
          shader.vertexShader = shader.vertexShader.replace("#include <begin_vertex>", vertexPosition);
          // 片元着色器接收： 1 外部传入的uniform变量；2 来自顶点着色器的varying变量
          shader.fragmentShader = shader.fragmentShader.replace(
            "#include <common>",
            `
              #include <common>
              uniform vec3 uTopColor;
              uniform float uHeight;
              varying vec3 vPosition;
            `
          );
          // 在片元着色器的主函数中
          shader.fragmentShader = shader.fragmentShader.replace(
            "#include <dithering_fragment>",
            `
              #include <dithering_fragment>
              vec4 distGradColor = gl_FragColor;
              // 设置渐变色比例
              float gradMix = (vPosition.z)/uHeight;//因为坐标旋转z值相当于y值
              // float gradMix = (vPosition.y+uHeight/2.0)/uHeight;
              // 设置渐变效果 mix(a,b,r) = (1-r)*a + br
              vec3 gradMixColor = mix(distGradColor.xyz,uTopColor,gradMix);
              // 片元赋色
              gl_FragColor = vec4(gradMixColor,1);
              // next
              `
          );
     },
     addLightRing(shader, mesh,center = new THREE.Vector2(0, 0)){
        console.log('shader',shader,shader.fragmentShader)
        // 计算几何的边界框，更新boundingBox属性
        mesh.geometry.computeBoundingBox();
        // console.log(mesh.geometry.boundingBox); => Box3包围盒
        const { min, max } = mesh.geometry.boundingBox;
        console.log('max和min',max,min)
        var size = new THREE.Vector3(
            max.x - min.x,
            max.y - min.y,
            max.z - min.z
        );
        // geometry大小
        shader.uniforms.u_Size = {
            value: size
        }
          // 设置扩散的中心点
          shader.uniforms.u_Center = { value: center };
          // 扩散的时间
          shader.uniforms.u_Time = { value: 0 };
          // 设置条带的宽度
          shader.uniforms.u_Width = { value: 0.05 };
          // 设置小圆的边界
          shader.uniforms.u_boundary = { value: 0.0 };
          // 设置半径
          shader.uniforms.R = { value: 0 };
          // 扩散
          shader.uniforms.u_Color = {
            value: new THREE.Color("#5588AA"),
          };
          // main函数外接收外部变量
          shader.fragmentShader = shader.fragmentShader.replace(
            "#include <common>",
            `
              #include <common>
              uniform vec3 u_Size;
              uniform vec3 u_Color;
              uniform vec2 u_Center;
              uniform float u_Time;
              uniform float u_Width;
              uniform float u_boundary;
              uniform float R;
            `
          );
          // // 效果一 圆环扩散
          // shader.fragmentShader = shader.fragmentShader.replace(
          //   "// next",
          //   `
          //   float radius = distance(vPosition.xy,u_Center);//因为坐标旋转y值相当于z值
          //   //  扩散范围的函数
          //   float spreadIndex = -(radius-u_Time) * (radius-u_Time) + radius;
          //   float a = pow(spreadIndex / radius, 2.0); 
          //   if(spreadIndex > 0.0) {
          //       gl_FragColor = mix(gl_FragColor,vec4(u_Color,1),a);
          //   }
          //   // next
          //   `
          // );
          // 效果一 圆环扩散(另一种写法且可以更改宽度)
          shader.fragmentShader = shader.fragmentShader.replace(
            "// next",
            `
            float pct = distance(vPosition.xy,u_Center);//因为坐标旋转y值相当于z值
            pct *= 0.001;
            vec3 col = vec3(0.0);
            float c = step(u_boundary,pct);
            c -= step(u_boundary+u_Width,pct);
            col = mix(gl_FragColor.rgb,u_Color,c);
            //col = mix(gl_FragColor.rgb,vec3(1.,0.0,0.0),vPosition.x/1000);
            //col = gl_FragColor.rgb * 1.-(vPosition.x*0.001) + vec3(1.0,0.0,0.0) * vPosition.x*0.001;
            gl_FragColor = vec4(col,1.0);
            // next
            `
          );
          // // 效果二 圆形扩散，内部透明度渐变
          // shader.fragmentShader = shader.fragmentShader.replace(
          //   "// next",
          //   `
          //   float R_ = R;
          //   float radius = distance(vPosition.xy,u_Center);//因为坐标旋转y值相当于z值
        
          //   if(radius < R_) {
          //     float a = radius /  R_;
          //     a = pow(a , 2.0);
          //     gl_FragColor = mix(gl_FragColor,vec4(u_Color,1),a);
          //   }

          //   // next
          //   `
          // );

        //这里使用了gsap这个轻量库
          gsap.to(shader.uniforms.u_Time, {
            value: 1000,  // 从初始值到该值为界限范围
            duration: 5,  // 5s一个周期
            ease: "power1.out", // 扩散速率函数
            repeat: -1, // 不断重复这个效果
          });
          gsap.to(shader.uniforms.R, {
            value: 1000,
            duration: 5,
            ease: "power1.out",
            repeat: -1,
          });
          gsap.to(shader.uniforms.u_boundary, {
            value: 0.5,  // 从初始值到该值为界限范围
            duration: 5,  // 5s一个周期
            ease: "power1.out", // 扩散速率函数
            repeat: -1, // 不断重复这个效果
          });
     },
     ascendingBand(shader,mesh){
      console.log('shader',shader,shader.fragmentShader)
      // 计算几何的边界框，更新boundingBox属性
      mesh.geometry.computeBoundingBox();
      // console.log(mesh.geometry.boundingBox); => Box3包围盒
      const { min, max } = mesh.geometry.boundingBox;
      console.log('max和min',max,min)
      var size = new THREE.Vector3(
          max.x - min.x,
          max.y - min.y,
          max.z - min.z
      );
      // geometry大小
      shader.uniforms.uSize = {
          value: size
      }
      // 扩散中心点
      shader.uniforms.uFlow = {
                value: new THREE.Vector3(
                    1, // 0 1开关
                    10, // 范围
                    20 // 速度
                )
            };
      // 效果颜色
      shader.uniforms.uFlowColor = {
          value: new THREE.Color("#5588AA")
      }
      shader.uniforms.utime = this.time;
      // main函数外接收外部变量
      shader.fragmentShader = shader.fragmentShader.replace(
          "#include <common>",
          `
            #include <common>
            uniform float utime;
            uniform vec3 uSize;
            uniform vec3 uFlow;
            uniform vec3 uFlowColor;
            float flowLine(float start,float width,float h){
              start *=1.+width*2.;
              //边界无过渡
              // float line = step(start-2.*width,h);
              // line -= step(start,h);
              //边界有过渡
               float line = smoothstep(start-2.*width,start-width,h);
               line *=smoothstep(start,start-width,h);
              return line;
            }
          `
        );
        
      shader.fragmentShader = shader.fragmentShader.replace(
            "// next",
            `
            vec3 col2 = vec3(0.,0.,0.);
            float c2= flowLine(fract(utime),0.02,vPosition.z/uSize.z);//fract()将时间限制在0-1里,大于1再从0开始//因为旋转,z值相当于y值//除uSize.z是为了归一化;如果想要条带倾斜可以vPosition.z/uSize.z-vPosition.y/uSize.y
            col2 = mix(gl_FragColor.rgb,uFlowColor,c2);
            gl_FragColor = vec4(col2,1.0);
            // next
            `
       );
     },
     surroundLine(object) {
        object.geometry.computeBoundingBox();
        object.geometry.computeBoundingSphere();
        // 获取线条geometry
        const geometry = new THREE.EdgesGeometry(object.geometry);
        // 获取物体的世界坐标 旋转等
        const worldPosition = new THREE.Vector3();
        object.getWorldPosition(worldPosition);
        // 确定oject的geometry的box size

        console.log(object.geometry.boundingBox)
        // 传递给shader重要参数
        const {
            max,
            min
        } = object.geometry.boundingBox;
        console.log('max',max,min)
        const size = new THREE.Vector3(
            max.x - min.x,
            max.y - min.y,
            max.z - min.z
        );

        const material = this.createSurroundLineMaterial({
            max,
            min,
            size
        });//叠加横向扫光特效
        // const material = new THREE.LineBasicMaterial({
        // color: new THREE.Color("#4C8BF5")
        // })

        const line = new THREE.LineSegments(geometry, material);

        line.name = 'surroundLine';

        line.scale.copy(object.scale);
        line.rotation.copy(object.rotation);
        line.position.copy(worldPosition);
        line.scale.multiplyScalar(.005);

        scene.add(line)
     },
      /**
     * 创建包围线条材质
     */
     createSurroundLineMaterial({
      max,
      min,
      size
  }) {
      if (this.surroundLineMaterial) return surroundLineMaterial;

      this.surroundLineMaterial = new THREE.ShaderMaterial({
          transparent: true,
          uniforms: {
              uColor: {
                  value: new THREE.Color("#4C8BF5")
              },
              uActive: {
                  value: new THREE.Color("#fff")
              },
              time: this.time,
              uOpacity: {
                  value: 0.6
              },
              uMax: {
                  value: max,
              },
              uMin: {
                  value: min,
              },
              uRange: {
                  value: 200
              },
              uSpeed: {
                  value: 2
              },
              uStartTime: this.StartTime
          },
          vertexShader: Shader.surroundLine.vertexShader,
          fragmentShader: Shader.surroundLine.fragmentShader
      });

      return this.surroundLineMaterial;
     },
     animate(){
         this.time.value = clock.getElapsedTime()*0.05;
        //  const dt = clock.getDelta();
        //  if (dt > 1) return false;
         // 启动
         if (this.isStart) {
            this.StartTime.value = clock.getElapsedTime()*0.5;
            if (this.StartTime.value >= 1) {
                this.StartTime.value = 1;
                this.isStart = false;
            }
         }
         else{
          this.StartTime.value = 1;
         }
         requestAnimationFrame(this.animate);
         renderer.render(scene,camera); 
         controls.update();
         if(planeMesh){
          planeMesh.material.uniforms.u_time.value += 0.01;
         }
     }
 },
 mounted(){
     this.init()
     this.isStart = true//开启建筑生长动画
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