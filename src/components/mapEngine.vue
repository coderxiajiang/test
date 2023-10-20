
<template>
    <div class="map" ref="map">
       <canvas ref="canvas" @mousedown="onMousedown"></canvas>
    </div>
</template>
  
<script>
 export default {
   data () {
     return {
        EARTH_RAD:6378137,// 地球半径
        zoom:17,
        TILE_SIZE:256,// 瓦片像素
        ctx:null,
        width:0,
        height:0,
        centerTile:[],
        isMousedown: false,
        center:[120.148872,30.230895],
        // 缓存瓦片
        tileCache: {},
        // 记录当前画布上需要的瓦片
        currentTileCache: {}
     }
   },
   methods:{
    // 角度转弧度
    angleToRad(angle){
        return angle * (Math.PI / 180)
    },
    // 弧度转角度
    radToAngle(rad){
        return rad * (180 / Math.PI)
    },
    // 获取某一层级下的分辨率
    getResolution(n){
        var EARTH_PERIMETER = 2 * Math.PI * this.EARTH_RAD//地球周长
        const tileNums = Math.pow(2, n)
        const tileTotalPx = tileNums * this.TILE_SIZE
        return EARTH_PERIMETER / tileTotalPx
    },
    // 4326转3857
    lngLat2Mercator(lng,lat){
         // 经度先转弧度，然后因为 弧度 = 弧长 / 半径 ，得到弧长为 弧长 = 弧度 * 半径 
        let x = this.angleToRad(lng) * this.EARTH_RAD; 
        // 纬度先转弧度
        let rad = this.angleToRad(lat)
        // 下面我就看不懂了，各位随意。。。
        let sin = Math.sin(rad)
        let y = this.EARTH_RAD / 2 * Math.log((1 + sin) / (1 - sin))
        return [x, y]
    },
    // 3857转4326
    mercatorToLngLat(x, y){
        let lng = this.radToAngle(x) / this.EARTH_RAD
        let lat = this.radToAngle((2 * Math.atan(Math.exp(y / this.EARTH_RAD)) - (Math.PI / 2)))
        return [lng, lat]
    },
    // 根据3857坐标及缩放层级计算瓦片行列号
    getTileRowAndCol(x, y, z){
        var EARTH_PERIMETER = 2 * Math.PI * this.EARTH_RAD //地球周长
        x += EARTH_PERIMETER / 2     // ++
        y = EARTH_PERIMETER / 2 - y  // ++
        let resolution = this.getResolution(z)
        let row = Math.floor(x / resolution / this.TILE_SIZE)
        let col = Math.floor(y / resolution / this.TILE_SIZE)
        return [row, col]
    },
    // 计算4326经纬度对应的像素坐标
    getPxFromLngLat(lng, lat, z){
    var EARTH_PERIMETER = 2 * Math.PI * this.EARTH_RAD //地球周长
    let [_x, _y] = this.lngLat2Mercator(lng, lat)// 4326转3857
    // 转成世界平面图的坐标
    _x += EARTH_PERIMETER / 2
    _y = EARTH_PERIMETER / 2 - _y
    let resolution = this.getResolution(z)// 该层级的分辨率
    // 米/分辨率得到像素
    let x = Math.floor(_x / resolution)
    let y = Math.floor(_y / resolution)
    return [x, y]
    },
    // 拼接瓦片地址
    getTileUrl(x, y, z){
        let domainIndexList = [1, 2, 3, 4]
        let domainIndex =
            domainIndexList[Math.floor(Math.random() * domainIndexList.length)]
        return `https://webrd0${domainIndex}.is.autonavi.com/appmaptile?x=${x}&y=${y}&z=${z}&lang=zh_cn&size=1&scale=1&style=8`
    },
    //加载中心瓦片
    initCenterTitle(){
        // 容器大小
        let { width, height } = this.$refs.map.getBoundingClientRect()
        this.width = width
        this.height = height
        // 设置画布大小
        let canvas = this.$refs.canvas
        canvas.width = width
        canvas.height = height
        // 获取绘图上下文
        this.ctx = canvas.getContext('2d')
        // 中心点对应的瓦片
        let centerTile = this.getTileRowAndCol(
            ...this.lngLat2Mercator(...this.center),// 4326转3857
            this.zoom// 缩放层级
        )
        this.centerTile = centerTile
        console.log('centerTile',centerTile)
        // 中心瓦片左上角对应的像素坐标
        let centerTilePos = [centerTile[0] * this.TILE_SIZE, centerTile[1] * this.TILE_SIZE]
        // 中心点对应的像素坐标
        let centerPos = this.getPxFromLngLat(...this.center,this.zoom)
        console.log('centerPos',centerPos,centerTilePos)
        // 中心像素坐标距中心瓦片左上角的差值
        this.offset = [
            centerPos[0] - centerTilePos[0],
            centerPos[1] - centerTilePos[1]
        ]
        // 移动画布原点到画布中间
        this.ctx.translate(this.width / 2, this.height / 2)
        // 加载瓦片图片
        let img = new Image()
        // 拼接瓦片地址
        img.src = this.getTileUrl(...centerTile, this.zoom)
        img.onload = () => {
            // 渲染到canvas
            this.ctx.drawImage(img, -this.offset[0], -this.offset[1])
            this.initOtherTitle()
        }
        console.log('width,height',this.width,this.height)
    },
    //加载辅助线
    addfuzhuLine(){
        //绘制辅助线
        this.ctx.moveTo(-960,0);
        this.ctx.lineTo(960,0);
        //执行绘画的动作，如果没有执行stroke函数不会有任何的效果
        this.ctx.stroke();
        this.ctx.moveTo(0,-477.5);
        this.ctx.lineTo(0,477.5);
        //执行绘画的动作，如果没有执行stroke函数不会有任何的效果
        this.ctx.stroke();
    },
    //加载其他瓦片
    initOtherTitle(){
      // 计算瓦片数量
      let rowMinNum = Math.ceil((this.width / 2 - this.offset[0]) / this.TILE_SIZE)// 左
      let colMinNum = Math.ceil((this.height / 2 - this.offset[1]) / this.TILE_SIZE)// 上
      let rowMaxNum = Math.ceil((this.width / 2 - (this.TILE_SIZE - this.offset[0])) / this.TILE_SIZE)// 右
      let colMaxNum = Math.ceil((this.height / 2 - (this.TILE_SIZE - this.offset[1])) / this.TILE_SIZE)// 下
      // 从上到下，从左到右，加载瓦片
      for (let i = -rowMinNum; i <= rowMaxNum; i++) {
            for (let j = -colMinNum; j <= colMaxNum; j++) {
                // 加载瓦片图片
                let img = new Image()
                img.src = this.getTileUrl(
                    this.centerTile[0] + i,// 行号
                    this.centerTile[1] + j,// 列号
                    this.zoom
                )
                img.onload = () => {
                    // 渲染到canvas
                    this.ctx.drawImage(
                        img, 
                        i * this.TILE_SIZE - this.offset[0], 
                        j * this.TILE_SIZE - this.offset[1]
                    )
                    this.addfuzhuLine()
                }
            }
        }
    },
    // 鼠标按下
    onMousedown(e) {
        if (e.which === 1) {
            this.isMousedown = true;
        }
    },

    // 鼠标移动
    onMousemove(e) {
        if (!this.isMousedown) {
            return;
        }
        // 计算本次拖动的距离对应的经纬度数据
        let mx = e.movementX * this.getResolution(this.zoom);
        let my = e.movementY * this.getResolution(this.zoom);
        // 把当前中心点经纬度转成3857坐标
        let [x, y] = this.lngLat2Mercator(...this.center);
        // 更新拖动后的中心点经纬度
        this.center = this.mercatorToLngLat(x - mx, my + y);
        this.clear()
        this.initCenterTitle()
    },

    // 鼠标松开
    onMouseup() {
        this.isMousedown = false;
    },
    //清空画布
    clear(){
        this.ctx.clearRect(0, 0, 1920, 955);
    }
   },
   mounted(){
        window.addEventListener("mousemove", this.onMousemove);
        window.addEventListener("mouseup", this.onMouseup);
        this.initCenterTitle()
   }
 }
</script>
  
<style scoped>
  .map{
      width: 100vw;
      height: 100vh;
  }
</style>