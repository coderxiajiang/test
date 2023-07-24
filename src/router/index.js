import Vue from 'vue'
import Router from 'vue-router'
import HelloWorld from '@/components/HelloWorld'
import threeDemo from '@/components/threeDemo'
import threeDemo2 from '@/components/threeDemo2-gradual'
import threeDemo3 from '@/components/threeDemo3-skyBox'
import threeDemo4 from '@/components/threeDemo4-manyPoint'
import threeDemo5 from '@/components/threeDemo5-water&sky'
import threeDemo6 from '@/components/threeDemo6-gltf'
import threeDemo7 from '@/components/threeDemo7-liuxian'
import threeDemo8 from '@/components/threeDemo8-kuosanbo'
import threeDemo9 from '@/components/threeDemo9-xuanzhuanlengzhui'
import threeDemo10 from '@/components/threeDemo10-pointCloud'
import threeDemo11 from '@/components/threeDemo11-fbx'
import threeDemo12 from '@/components/threeDemo12-fbx-jianbian+kuosan+biankuang+shangshengtiaodai+radar'
import threeDemo15 from '@/components/radar'
import china3D from '@/components/3d-china-map'
import earth from '@/components/earth-textureLoder'
import dem from '@/components/DEMstretch'
import openDoor from '@/components/openDoor'
import fire from '@/components/rain-snow-skyBox-fire-jiantou'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/cesium',
      name: 'HelloWorld',
      component: HelloWorld
    },
    {
      path: '/three',
      name: 'threeDemo',
      component: threeDemo
    },
    {
      path: '/three2',
      name: 'threeDemo2',
      component: threeDemo2
    },
    {
      path: '/three3',
      name: 'threeDemo3',
      component: threeDemo3
    },
    {
      path:'/three4',
      name:'threeDemo4',
      component:threeDemo4
    },
    {
      path:'/three5',
      name:'threeDemo5',
      component:threeDemo5
    },
    {
      path:'/three6',
      name:'threeDemo6',
      component:threeDemo6
    },
    {
      path:'/three7',
      name:'threeDemo7',
      component:threeDemo7
    },
    {
      path:'/three8',
      name:'threeDemo8',
      component:threeDemo8
    },
    {
      path:'/three9',
      name:'threeDemo9',
      component:threeDemo9
    },
    {
      path:'/three10',
      name:'threeDemo10',
      component:threeDemo10
    },
    {
      path:'/three11',
      name:'threeDemo11',
      component:threeDemo11
    },
    {
      path:'/three12',
      name:'threeDemo12',
      component:threeDemo12
    },
    {
      path:'/three13',
      name:'threeDemo13',
      component:openDoor
    },
    {
      path:'/3DChina',
      name:'3DChina',
      component:china3D
    },
    {
      path:'/earth',
      name:'earth',
      component:earth
    },
    {
      path:'/dem',
      name:'dem',
      component:dem
    },
    {
      path:'/three14',
      name:'three14',
      component:fire
    },
    {
      path:'/three15',
      name:'three15',
      component:threeDemo15
    }
  ]
})
