
<template>
    <div id="container">
        <div id="provinceInfo"></div>
    </div>
</template>
  
<script>
import * as THREE from 'three'
import * as d3 from "d3";
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls' // 控制器
import { CSM } from 'three/examples/jsm/csm/CSM.js';
import { CSMHelper } from 'three/examples/jsm/csm/CSMHelper.js';
import tag from './img/tag.png'
// 墨卡托投影转换
const projection = d3.geoMercator().center([104.0, 37.5]).scale(80).translate([0, 0]);
// 地图材质颜色
// const COLOR_ARR = [0x3C6EAB, 0x2F75AC, '#0465BD', '#4350C1', '#008495']
// const COLOR_ARR = [0x3C6EAB, 0x2F75AC, '#0465BD', '#357bcb', '#408db3']
const COLOR_ARR = ['#0465BD', '#357bcb', '#3a7abd']
const HIGHT_COLOR = '#4fa5ff'
let csmHelper;
const params = {
	orthographic: false,
	fade: false,
	far: 1000,
	mode: 'practical',
	// mode: 'uniform',
	lightX: - 1,
	lightY: - 1,
	lightZ: - 1,
	margin: 100,
	lightFar: 5000,
	lightNear: 1,
	autoUpdateHelper: true,
	updateHelper: function () {
		csmHelper.update();
	}
};

 export default {
   data () {
     return {
        tagData: [
        {"cityId":"110100","cityName":"北京","value":["116.405289","39.904987"],"projectCount":3,"deviceCount":1},
        {"cityId":"441200","cityName":"肇庆","value":["112.616609","23.20106"],"projectCount":14,"deviceCount":107},
        {"cityId":"460100","cityName":"海口","value":["110.208472","20.031379"],"projectCount":3,"deviceCount":20},
        {"cityId":"440100","cityName":"广州","value":["113.34669","23.147482"],"projectCount":4,"deviceCount":50},
        {"cityId":"440800","cityName":"湛江","value":["110.420038","21.193235"],"projectCount":3,"deviceCount":37},
        {"cityId":"530700","cityName":"丽江","value":["100.233025","26.872108"],"projectCount":1,"deviceCount":0},
        {"cityId":"445100","cityName":"潮州","value":["116.592724","23.488789"],"projectCount":2,"deviceCount":31},
        {"cityId":"440600","cityName":"佛山","value":["113.207172","23.134999"],"projectCount":3,"deviceCount":34}
      ]
     }
   },
   methods:{
       init(){
        this.provinceInfo = document.getElementById('provinceInfo');
        this.container = document.getElementById('container');
        this.width = this.container.offsetWidth
        this.height = this.container.offsetHeight
        console.log(this.container.offsetWidth,this.container.offsetHeight)
        // 创建webGL渲染器

        this.group = new THREE.Object3D(); // 标注
        this.selectedObject = null

        this.renderer = new THREE.WebGLRenderer( { antialias: true,alpha: true} );
        this.renderer.shadowMap.enabled = true; // 开启阴影
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 1.25;   

        // 根据自己的需要调整颜色模式
        // this.renderer.outputEncoding = THREE.sRGBEncoding;  

        // this.renderer.outputEncoding = THREE.sHSVEncoding;
        this.renderer.setPixelRatio( window.devicePixelRatio );

        // 清除背景色，透明背景
        this.renderer.setClearColor(0xffffff, 0);
        this.renderer.setSize(this.width, this.height);
        this.container.appendChild(this.renderer.domElement);

        // 场景
        this.scene = new THREE.Scene();
        this.scene.background = null

        // 相机 透视相机
        this.camera = new THREE.PerspectiveCamera(45, this.width / this.height, 0.1, 5000);
        this.camera.position.set(0, -40, 70);
        this.camera.lookAt(0, 0, 0); 

        //阴影模糊
        this.csm = new CSM( {
            maxFar: params.far,
            cascades: 4,
            mode: params.mode,
            parent: this.scene,
            shadowMapSize: 1024,
            lightDirection: new THREE.Vector3( params.lightX, params.lightY, params.lightZ ).normalize(),
            camera: this.camera
        } );
        this.csmHelper = new CSMHelper( this.csm );
        this.csmHelper.visible = false;
        this.scene.add( this.csmHelper );

        //设置光源
        this.setLight()
        
        //绘制地面
        this.setPlayGround()

        this.setRaycaster();
        
        //设置控制
        this.controller = new OrbitControls(this.camera, this.renderer.domElement);
		this.controller.update();

        let jsonData = require('./json/china.json')
        this.initMap(jsonData)  
       },
       setRaycaster() {
        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();
        this.eventOffset = {};
        var _this = this;

            function onMouseMove(event) {
                // 父级并非满屏，所以需要减去父级的left 和 top
                let { top, left, width, height } = _this.container.getBoundingClientRect()
                let clientX = event.clientX - left
                let clientY = event.clientY - top

                _this.mouse.x = (clientX / width) * 2 - 1;
                _this.mouse.y = -(clientY / height) * 2 + 1;

                _this.eventOffset.x = clientX;
                _this.eventOffset.y = clientY;
                _this.provinceInfo.style.left = _this.eventOffset.x + 10 + 'px';
                _this.provinceInfo.style.top = _this.eventOffset.y - 20 + 'px';
            }

            // 标注
            function onPointerMove() {
                if ( _this.selectedObject ) {
                    console.log('selectedObject',_this.selectedObject)
                    _this.selectedObject.material.color.set( 0xfffffff);
                    _this.selectedObject = null;
                }

                if (_this.raycaster) {
                    console.log('raycaster',_this.raycaster)
                    const intersects = _this.raycaster.intersectObject( _this.group, true );
                    // console.log('select group', intersects)
                    if ( intersects.length > 0 ) {
                        const res = intersects.filter( function ( res ) {
        
                            return res && res.object;
        
                        } )[intersects.length - 1];
        
                        if ( res && res.object ) {
                            _this.selectedObject = res.object;
                            _this.selectedObject.material.color.set( '#f00' );
        
                        }
                    }
                }
            }

            // 标注点击
            function onClick() {
                if (_this.selectedObject) {
                    // 输出标注信息
                    console.log(_this.selectedObject._data)
                    _this.tagClick(_this.selectedObject._data)
                }
            }
            window.addEventListener('mousemove', onMouseMove, false);
            document.addEventListener( 'pointermove', onPointerMove );
            // document.addEventListener( 'click', onClick );
        },
       setLight() {

            let ambientLight = new THREE.AmbientLight(0xffffff, 0.2); // 环境光

            const light = new THREE.DirectionalLight( 0xffffff, 0.5 ); // 平行光
            light.position.set( 20, -50, 20 );

            light.castShadow = false;
            light.shadow.mapSize.width = 1024;
            light.shadow.mapSize.height = 1024;


            // 半球光
            let hemiLight = new THREE.HemisphereLight('#80edff','#75baff', 0.3)
            // 这个也是默认位置
            hemiLight.position.set(20, -50, 0)
            this.scene.add(hemiLight)

            const pointLight = new THREE.PointLight(0xffffff, 0.5)
            pointLight.position.set( 20, -50, 50 );

            pointLight.castShadow = true;
            pointLight.shadow.mapSize.width = 1024;
            pointLight.shadow.mapSize.height = 1024;


            const pointLight2 = new THREE.PointLight(0xffffff, 0.5)
            pointLight2.position.set( 50, -50, 20 );
            pointLight2.castShadow = false;
            pointLight2.shadow.mapSize.width = 1024;
            pointLight2.shadow.mapSize.height = 1024;

            const pointLight3 = new THREE.PointLight(0xffffff, 0.5)
            pointLight3.position.set( -50, -50, 20 );
            pointLight3.castShadow = false;
            pointLight3.shadow.mapSize.width = 1024;
            pointLight3.shadow.mapSize.height = 1024;

            this.scene.add(ambientLight);
            this.scene.add(light);
            this.scene.add(pointLight);
            this.scene.add(pointLight2);
            this.scene.add(pointLight3);
            
        },
       setPlayGround() {
            const groundMaterial = new THREE.MeshStandardMaterial( { 
                color: 0x031837, 
                // specular: 0x111111,
                metalness: 0,
                roughness: 1, 
                // opacity: 0.2,
                opacity: 0.5,
                transparent: true,
            } );
            const ground = new THREE.Mesh( new THREE.PlaneGeometry( 2000, 2000, 1, 1 ), groundMaterial );
            // ground.rotation.x = - Math.PI / 2;
            ground.position.z = 0
            // ground.castShadow = true;
            ground.receiveShadow = true;

            this.scene.add( ground );
        },
        // 绘制标注
        setTag(_data = []) {
            if (!_data || _data.length === 0) {
                return 
            }

            this.scene.remove(this.group)
            this.group = new THREE.Object3D();

            function paintTag(scale = 1) {
                let spriteMap = new THREE.TextureLoader().load( tag );

                _data.forEach(d => {
                    // 必须是不同的材质，否则鼠标移入时，修改材质会全部都修改
                    let spriteMaterial = new THREE.SpriteMaterial( { map: spriteMap, color: 0xffffff } );
                    const { value } = d
                    // 添加标点
                    const sprite1 = new THREE.Sprite( spriteMaterial );
                    
                    if (value && value.length !== 0) {
                        let [x, y] = projection(value)
                        sprite1.position.set(x, -y + 2, 6);
                    }
                    sprite1._data = d
                    sprite1.scale.set( 2 * scale, 3 * scale, 8 * scale );

                    this.group.add(sprite1)
                })
                spriteMap.dispose()
            }

            function setScale(scale = 1) {
                this.group.children.forEach(s => {
                    s.scale.set( 2 * scale, 3 * scale, 8 * scale );
                })
            }
            
            this.scene.add(this.group)

            paintTag.call(this, 0.1)
            setScale.call(this, 1)
            
            // let tween = new TWEEN.Tween({ val: 0.1 })
            // .to(
            //     {
            //         val: 1.2
            //     },
            //     1.5 * 1000
            // )
            // .easing(TWEEN.Easing.Quadratic.InOut)
            // .onUpdate((d) => {//高度增加动画
            //     setScale.call(this, d.val)
            // })
            // tween.start()
            
            // if (this.raycaster) {
            //     this.raycaster.setFromCamera(this.mouse, this.camera);
            // }
            // this.renderer.render(this.scene, this.camera);
            // console.log('render info', this.renderer.info)
            // TWEEN.update()
        },
       initMap(chinaJson) {
            /* ...省略  */   
            console.log('JSON',chinaJson)
            // 建一个空对象存放对象
            this.map = new THREE.Object3D();
            chinaJson.features.forEach((elem, index) => {
                // 定一个省份3D对象
                const province = new THREE.Object3D();
                // 每个的 坐标 数组
                const { coordinates } = elem.geometry;
                const color = COLOR_ARR[index % COLOR_ARR.length]
                // 循环坐标数组
                coordinates.forEach(multiPolygon => {
                    multiPolygon.forEach((polygon) => {
                        const shape = new THREE.Shape();                
                        for (let i = 0; i < polygon.length; i++) {
                            let [x, y] = projection(polygon[i]);                    
                            if (i === 0) {
                                shape.moveTo(x, -y);
                            }
                            shape.lineTo(x, -y);
                        }    
                        const extrudeSettings = {
                            depth: 4,
                            bevelEnabled: true,
                            bevelSegments: 1,
                            bevelThickness: 0.2
                        };    
                        const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);               
                        // 平面部分材质
                        const material = new THREE.MeshStandardMaterial( {
                            metalness: 1,
                            color: color,                    
                        } );
                        // 拉高部分材质
                        const material1 = new THREE.MeshStandardMaterial( {
                            metalness: 1,
                            roughness: 1,
                            color: color,//new THREE.Color(0xff0000),                    
                        } );
                        const mesh = new THREE.Mesh(geometry, [
                            material,
                            material1
                        ]);
                        // 设置高度将省区分开来
                        if (index % 2 === 0) {
                            mesh.scale.set(1, 1, 1.2);
                        }
                        // 给mesh开启阴影
                        mesh.castShadow = true
                        mesh.receiveShadow = true
                        mesh._color = color
                        province.add(mesh);
                    })    
                })   
                // 将geo的属性放到省份模型中
                province.properties = elem.properties;
                if (elem.properties.centorid) {
                    const [x, y] = projection(elem.properties.centorid);
                    province.properties._centroid = [x, y];
                }
                this.map.add(province);       
            })
            this.scene.add(this.map)
            this.setTag(this.tagData)
        },
       createProvinceInfo() { // 显示省份的信息      
            if (this.activeInstersect&&this.activeInstersect.length !== 0 && this.activeInstersect[0].object.parent.properties.name) {
                var properties = this.activeInstersect[0].object.parent.properties;

                this.provinceInfo.textContent = properties.name;

                this.provinceInfo.style.visibility = 'visible';
            } else {
                this.provinceInfo.style.visibility = 'hidden';
            }
       },
       animate(){
           requestAnimationFrame(this.animate);
           if (this.raycaster) {
                this.raycaster.setFromCamera(this.mouse, this.camera);
                // console.log(this.scene.children,this.map,this.group)
                // calculate objects intersecting the picking ray
                var intersects = this.raycaster.intersectObjects(this.map.children, true);//this.map.children和this.scene.children
                if (this.activeInstersect && this.activeInstersect.length > 0) { // 将上一次选中的恢复颜色
                    this.activeInstersect.forEach(element => {
                        const { object } = element
                        const { _color, material } = object
                        material[0].color.set(_color);
                        material[1].color.set(_color);
                    });
                }
        
                this.activeInstersect = []; // 设置为空
                // console.log('select', intersects)
                for (var i = 0; i < intersects.length; i++) {
                    // debugger;
                    if (intersects[i].object.material && intersects[i].object.material.length === 2) {
                        this.activeInstersect.push(intersects[i]);
                        intersects[i].object.material[0].color.set(HIGHT_COLOR);
                        intersects[i].object.material[1].color.set(HIGHT_COLOR);
                        break; // 只取第一个
                    }
                }
           }
           this.createProvinceInfo();
        //    this.camera.updateMatrixWorld();
           this.csm.update();
           this.renderer.render(this.scene,this.camera); 
           this.controller.update();
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
      background: #000;
     
  }
  #provinceInfo{
        position: absolute;
        color: #fff;
        user-select: none;
    }
</style>