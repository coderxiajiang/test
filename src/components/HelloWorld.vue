
<template>
  <div>
    <div id="map3DView">
  </div>
  </div>
</template>
 
<script>
import '../../node_modules/cesium/Build/Cesium/Widgets/Widgets.css'
 
export default {
  name: 'map3DView',
  data () {
    return {  
            
    }
  },
  mounted(){
    Cesium.Ion.defaultAccessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI0NzhhMDI0NC05NDUwLTRjZWYtOWI5Mi1mYzNjNWQ5OGQ1ZWQiLCJpZCI6NDU0MTEsImlhdCI6MTYyNjA4MTg2MX0.dn2cDGd6p2ar3atcOEwX9LVjmgqcBj1RCqVaWkwFEcU';
    this.viewer = new Cesium.Viewer("map3DView", {
      requestRenderMode: true, // 开启请求的渲染模式
      maximumRenderTimeChange: Infinity, // 处理模拟时间改变
      animation: false, // 是否创建动画小器件，左下角仪表
      baseLayerPicker: false, // 是否显示图层选择器
      fullscreenButton: false, // 是否显示全屏按钮
      geocoder: false, // 是否显示geocoder小器件，右上角查询按钮
      homeButton: false, // 是否显示Home按钮
      infoBox: false, // 是否显示信息框
      shouldAnimate: true,  // 允许动画
      sceneModePicker: false, // 是否显示3D/2D选择器
      selectionIndicator: false, // 是否显示选取指示器组件鼠标绿色框
      timeline: true, // 是否显示时间轴
      navigationHelpButton: false, // 是否显示右上角的帮助按钮
      vrButton: false, // 是否显示双屏
      scene3DOnly: true, // 如果设置为true，则所有几何图形以3D模式绘制以节约GPU资源
      fullscreenElement: document.body, // 全屏时渲染的HTML元素
      allowDataSourcesToSuspendAnimation: false,
      navigationInstructionsInitiallyVisible: false,
      terrainProvider:
        Cesium.createWorldTerrain(),
      orderIndependentTranslucency: false,
      contextOptions: {
        webgl: {
          alpha: true,
          depth: true,
          stencil: true,
          antialias: true, //!mobilecheck(),
          premultipliedAlpha: true,
          //通过canvas.toDataURL()实现截图需要将该项设置为true
          preserveDrawingBuffer: true,
          failIfMajorPerformanceCaveat: true
        }
      },
      requestWaterMask: true // 水面特效
    })
    this.viewer.shadows = true //开启或关闭阴影
 
    // 关闭抗锯齿
    this.viewer.scene.fxaa = true
    this.viewer.scene.postProcessStages.fxaa.enabled = true;
 
    //开启帧率检测
    this.viewer.scene.debugShowFramesPerSecond = true;
 
    // 开启全球光照
    this.viewer.scene.globe.enableLighting = true
 
    //更改配置，性能优化
    this.viewer.scene.logarithmicDepthBuffer = true;
    // 取消双击事件-追踪该位置
    this.viewer.cesiumWidget.screenSpaceEventHandler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);
    
    this.viewer.camera.flyTo({ 
      destination: Cesium.Cartesian3.fromDegrees(103.04756,37.48098,21119200),
      orientation: {
        heading: 6.07, 
        pitch: -1.53,
      },
      duration: 5 
    })
    var redBox = viewer.entities.add({
      name : 'Red box with black outline',
      position: Cesium.Cartesian3.fromDegrees(-107.0, 40.0, 300000.0),
      box : {
        dimensions : new Cesium.Cartesian3(400000.0, 300000.0, 500000.0),
        material : Cesium.Color.RED.withAlpha(0.5),
        outline : true,
        outlineColor : Cesium.Color.BLACK
      }
    });

    this.viewer.zoomTo(viewer.entities);
  }
}
</script>
 
<style lang="scss" scoped>
#map3DView{
  width: 100%;
  height: 100%;
  overflow: hidden;
 
  /* cesium 去版权 */
    ::v-deep .cesium-widget-credits {
      display: none !important;
      visibility: hidden !important;
    }
    
    ::v-deep .cesium-widget-credits {
      display: none !important;
      visibility: hidden !important;
    }
 
    /* 隐藏时间轴 */
    ::v-deep .cesium-viewer-timelineContainer{
      display: none;
    }
    
    /* 帧率位置控制 */
    ::v-deep .cesium-performanceDisplay-defaultContainer{
      top: auto;
      bottom: 36px;
    }
 
    /* 隐藏帧率名称 */
    ::v-deep .cesium-performanceDisplay-throttled{
      display: none;
    }
  }
</style>