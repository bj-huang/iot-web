import Vue from 'vue'
import Router from 'vue-router'
import mainContainer from './../components/mainContainer'
import runingData from './../views/runingData/index.vue'
import login from './../views/login/index.vue'
import history from './../views/history/index.vue'
import analysis from './../views/analysis/index.vue'
import model from './../views/model/index.vue'
import modelNode from './../views/model/node.vue'
import modelData from './../views/model/data.vue'
import warning from './../views/warning/index.vue'
import device from './../views/device/index.vue'
import noFound from './../views/noFound.vue'

Vue.use(Router)

let router = new Router({
  routes: [
    {
      path: '/',
      component: mainContainer,
      children: [
        {
          path: '/',
          name: '实时数据',
          component: runingData
        },
        {
          path: '/runingData',
          name: '实时数据',
          component: runingData
        },
        {
          path: '/history',
          name: '历史数据',
          component: history
        },
        {
          path: '/analysis',
          name: '数据分析',
          component: analysis
        },
        {
          path: '/model',
          name: '模型管理',
          component: model,
        },
        {
          path: '/model/:deviceId',
          name: '节点管理',
          component: modelNode,
          props: true
        },
        {
          path: '/model/:deviceId/:nodeId',
          name: '数据管理',
          component: modelData,
          props: true
        },
        {
          path: '/device',
          name: '设备接入',
          component: device
        },
        {
          path: '/warning',
          name: '报警记录',
          component: warning
        },
      ]
    },
    {
      path: '/login',
      name: '登录',
      component: login
    },
    {
      path: '*',
      name: '404',
      component: noFound
    }
  ]
})

export default router