
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
controls=null,
container=null
const group = new THREE.Group();//用于将建筑物的各个零件组合起来
const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();
//建筑的长宽
const baseWidth = 40;
const baseLength = 60;
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
           container = document.getElementById('container');

           camera = new THREE.PerspectiveCamera(125, container.clientWidth/container.clientHeight, 0.1, 5000);
           camera.position.set(-30, 30, 50);
           

           scene = new THREE.Scene()

           renderer = new THREE.WebGLRenderer({antialias:true});
           renderer.setSize(container.clientWidth,container.clientHeight);
           container.appendChild(renderer.domElement);

           controls = new OrbitControls( camera, renderer.domElement );
            
           scene.add(new THREE.AmbientLight({intensity:50}))
           //辅助观察的坐标系
           const axesHelper = new THREE.AxesHelper(100);
           scene.add(axesHelper);

           scene.add(group);
           this.createGround()
           this.createFloor()
           let leftWall = this.createWall()
           leftWall.name = '左侧的墙'
           group.add(leftWall)
           leftWall.rotateY(Math.PI / 2);
           leftWall.position.set(-baseWidth / 2, 10, 0);
           const rightWall = leftWall.clone();
           rightWall.position.set(baseWidth / 2, 10, 0);
           rightWall.name = "右侧的墙";
           group.add(rightWall);
           let backWall = this.createNoDoorWall()
           group.add(backWall);
           let fontWall = this.createDoorWall()
           group.add(fontWall);
           let { roof, width } = this.createRoof();
           /* let leftRoof = roof;
           leftRoof.rotateX(THREE.MathUtils.degToRad(30));
           leftRoof.position.set(-baseWidth / 3 + 1, 22, 0);
           leftRoof.name = "左屋顶";
           group.add(leftRoof); */
           this.createDoor()
           this.createSkyBox()
           window.addEventListener("pointermove", this.onPointerMove);
           container.addEventListener(
                "click",
                () => {
                const intersects = raycaster.intersectObjects(scene.children);
                console.log(intersects[0]);
                console.log("点击了", intersects[0].object.name);
                if (intersects[0].object.name == "门") {
                    // console.log(intersects[0].object.parent.rotation.y);
                    let speed = 0.05;
                    //再次点击关门
                    if (intersects[0].object.parent.rotation.y <= -2.5) {
                    // console.log("关门");
                    let a = setInterval(() => {
                        if (intersects[0].object.parent.rotation.y >= 0) {
                        intersects[0].object.parent.rotation.y = 0;
                        clearInterval(a);
                        return;
                        }

                        intersects[0].object.parent.rotation.y += speed;
                    }, 1000 / 60);
                    } else {
                    // console.log("开门");
                    let a = setInterval(() => {
                        if (intersects[0].object.parent.rotation.y <= -2.5) {
                        clearInterval(a);
                        return;
                        }

                        intersects[0].object.parent.rotation.y -= speed;
                    }, 1000 / 60);
                    }
                }
                },
                false
            );

        


           
       },
       //天空盒
        createSkyBox() {
        const texture = new THREE.TextureLoader().load("static/img/nz.jpg");
        texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
        // texture.repeat.set(1, 1);
        const skyBox = new THREE.SphereGeometry(500, 100, 100);
        const material = new THREE.MeshPhongMaterial({
            map: texture,
            side: THREE.BackSide,
        });
        const skyBoxMesh = new THREE.Mesh(skyBox, material);
        scene.add(skyBoxMesh);
        },

       onPointerMove(event) {
        // 将鼠标位置归一化为设备坐标。x 和 y 方向的取值范围是 (-1 to +1)
        pointer.x = (event.clientX / container.clientWidth) * 2 - 1;
        pointer.y = -(event.clientY / container.clientHeight) * 2 + 1;
       },
       createDoor() {
        //纹理贴图
        const texture = new THREE.TextureLoader().load("static/img/door.jpg");
        //门的大小、尺寸
        const door = new THREE.BoxGeometry(10, 15, 0.5);
        const material = new THREE.MeshPhongMaterial({
            map: texture,
            transparent: true,
            opacity: 1,
        });
        const doorMesh = new THREE.Mesh(door, material);
        doorMesh.name = "门";
        //以下代码做出了更改
        const doorGroup = new THREE.Group();//添加一个门的父级
        doorGroup.name = "门的包裹";
        doorGroup.position.set(-5, 8, baseLength / 2);//通过父级来改变门的旋转轴
        //现在这个是相对于父级
        doorMesh.position.x = 5;
        doorGroup.add(doorMesh);
        group.add(doorGroup);
        return doorGroup;

        },
       createDoorWall() {
        let { shape } = this.genwallShape();
        const door = new THREE.Path();
        //门的位置
        door.moveTo(baseWidth / 2 + 5, 0);
        door.lineTo(baseWidth / 2 + 5, 16);
        door.lineTo(baseWidth / 2 - 5, 16);
        door.lineTo(baseWidth / 2 - 5, 0);
        door.lineTo(baseWidth / 2 + 5, 0);
        // 形状上的孔洞
        shape.holes.push(door);
        let mesh = this.createIrregularWall(shape, [
            -baseWidth / 2,
            0,
            baseLength / 2 - 1,
        ]);
        mesh.name = "带门的墙";
        return mesh
        },

       createNoDoorWall() {
        let { shape } = this.genwallShape();
        let mesh = this.createIrregularWall(shape, [-baseWidth / 2, 0, -baseLength / 2]);
        mesh.name = "带门的墙对面的墙";
        return mesh
        },
       genwallShape() {
        const shape = new THREE.Shape();
        let height = 20;//墙的高度
        shape.moveTo(0, 0); //起点
        shape.lineTo(0, height); //墙体高度
        shape.lineTo(baseWidth / 2 - 1, height + 5); //墙体顶点
        shape.lineTo(baseWidth / 2 - 1, height + 6); //墙体顶点
        shape.lineTo(baseWidth / 2 + 1, height + 6); //墙体顶点
        shape.lineTo(baseWidth / 2 + 1, height + 5); //墙体顶点
        shape.lineTo(baseWidth, height);
        shape.lineTo(baseWidth, 0);
        shape.lineTo(0, 0);
        return { shape };
        },
        //创建不规则墙体
        createIrregularWall(shape, position) {
        const extrudeSettings = {
            depth: 1,//定义深度，由于挤压几何体的点位都是x，y坐标组成的二位平面，这个参数定义向z轴的延展长度，即为墙的厚度
            bevelEnabled: false,
        };
        const wallTexture = new THREE.TextureLoader().load("static/img/wall1.jpg");
        const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
        wallTexture.wrapS = wallTexture.wrapT = THREE.RepeatWrapping;
        wallTexture.repeat.set(0.05, 0.05);
        const material = new THREE.MeshPhongMaterial({ map: wallTexture });
        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.set(...position);
        group.add(mesh);
        return mesh;
        },
        
        //创建地面
        createGround(){
        //导入材质
        const groundTexture =  new THREE.TextureLoader().load("static/img/cao.webp");
        groundTexture.wrapS = groundTexture.wrapT = THREE.RepeatWrapping;
        groundTexture.repeat.set(100, 100);
        const ground = new THREE.CircleGeometry(500, 100);
        const groundMaterial = new THREE.MeshLambertMaterial({
            side: THREE.DoubleSide,
            map: groundTexture,
            // transparent: true,
            // opacity: 0.2,
        });
        const groundMesh = new THREE.Mesh(ground, groundMaterial);
        groundMesh.name = "地面";//设置name属性
        groundMesh.rotateX(-Math.PI / 2);//旋转用于呈现一个水平的地面
        scene.add(groundMesh);
        },
        createFloor() {
        const texture = new THREE.TextureLoader().load("static/img/wood.jpg");
        //设置地板大小，由于后面将要生成墙体存在设置为1的厚度，因此这里对地板的x，z均-2
        const floor = new THREE.BoxGeometry(baseWidth - 2, 1, baseLength - 2);
        const material = new THREE.MeshPhongMaterial({ map: texture });
        const mesh = new THREE.Mesh(floor, material);
        mesh.position.set(0, 1, 0);
        mesh.name = "地板";
        group.add(mesh);
        },
        createWall() {
        const wallTexture = new THREE.TextureLoader().load("static/img/wall1.jpg");
        const wall = new THREE.BoxGeometry(baseLength, 20, 1);
        const wallMaterial = new THREE.MeshPhongMaterial({
            map: wallTexture,
        });
        //墙体的网格
        const wallMesh = new THREE.Mesh(wall, wallMaterial);
        return wallMesh;
        },
        createRoof() {

        //屋顶宽
        let width = Math.sqrt((baseWidth / 2) ** 2 + 5 ** 2) + 5;//+5让有一点屋檐的效果
        const geometry = new THREE.BoxGeometry(baseLength + 2, width, 1);
        const texture = new THREE.TextureLoader().load("static/img/tile.jpg");
        texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set(2, 2);
        const material = new THREE.MeshPhongMaterial({ map: texture });
        const mesh = new THREE.Mesh(geometry, material);
        const mesh2 = new THREE.Mesh(geometry, material);
        mesh.rotateZ(THREE.MathUtils.degToRad(75));
        mesh.rotateY(-Math.PI / 2);
        mesh2.rotateZ(THREE.MathUtils.degToRad(105));
        mesh2.rotateY(-Math.PI / 2);
        mesh.position.set(baseWidth / 3 - 1, 22, 0);
        mesh2.position.set(-baseWidth / 3 + 1, 22, 0);
        mesh.name = "右屋顶";
        group.add(mesh);
        group.add(mesh2);
        return { roof: mesh, width };

        },

       animate(){
           raycaster.setFromCamera(pointer, camera);
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