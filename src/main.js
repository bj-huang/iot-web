// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import router from './router'
import iView from 'iview';
import axios from 'axios';
import echarts from 'echarts'
import Bus from 'vue-bus'
import 'iview/dist/styles/iview.css';
import './assets/style/index.scss';
import { Menu, MenuItem, MenuItemGroup, Submenu } from 'element-ui';

Vue.component(Menu.name, Menu);
Vue.component(MenuItem.name, MenuItem);
Vue.component(MenuItemGroup.name, MenuItemGroup);
Vue.component(Submenu.name, Submenu);

Vue.config.productionTip = false

Vue.prototype.$axios = axios
Vue.prototype.$echarts = echarts

Vue.use(iView);
Vue.use(Bus);

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  components: { App },
  template: '<App/>'
})
