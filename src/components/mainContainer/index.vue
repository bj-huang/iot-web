<template>
  <div class="layout">
    <Layout>
      <Header>
        <Menu
          mode="horizontal"
          theme="dark"
          active-name="1"
          @on-select="logout"
        >
          <div class="layout-logo">
            智慧物联系统
          </div>
          <div class="layout-nav">
            <MenuItem name="logout">
            <Icon type="ios-paper"></Icon>
            登出
            </MenuItem>
          </div>
        </Menu>
      </Header>
      <Layout>
        <Sider
          hide-trigger
          :style="{background: '#fff', overflow: 'hidden'}"
        >
          <el-menu
            default-active="1"
            class="el-menu-vertical-demo"
            :router="true"
          >
            <el-menu-item index="/runingData">
              <Icon type="md-alarm" />
              <span slot="title">实时数据</span>
            </el-menu-item>
            <el-menu-item index="/history">
              <Icon type="ios-calendar" />
              <span slot="title">历史数据</span>
            </el-menu-item>
            <el-menu-item index="/warning">
              <Icon type="md-notifications" />
              <span slot="title">报警记录</span>
            </el-menu-item>
            <el-menu-item index="/analysis">
              <Icon type="md-calculator" />
              <span slot="title">数据分析</span>
            </el-menu-item>
            <el-menu-item index="/model">
              <Icon type="md-cube" />
              <span slot="title">模型管理</span>
            </el-menu-item>
            <el-menu-item index="/device">
              <Icon type="md-construct" />
              <span slot="title">设备接入</span>
            </el-menu-item>
          </el-menu>
        </Sider>
        <Layout :style="{padding: '0 24px 24px'}">
          <div class="topBar">
            <Breadcrumb :style="{margin: '24px 0'}">
              <BreadcrumbItem
                v-for="(item, index) in breadcrumb"
                :key="index"
              >{{ item }}</BreadcrumbItem>
            </Breadcrumb>
            <div class="selectWrap" v-if="selectShow">
              <div class="item">
                <strong>设备</strong>
                <Select v-model="deviceModel" style="width:200px" @on-change="selectChange">
                  <Option v-for="item in deviceList" :value="item.value" :key="item.value">{{ item.label }}</Option>
                </Select>
              </div>
              <div class="item" v-if="nodeDataShow">
                <strong>节点</strong>
                <Select v-model="nodeModel" style="width:200px" @on-change="selectNode">
                  <Option v-for="item in nodeList" :value="item.value" :key="item.value">{{ item.label }}</Option>
                </Select>
              </div>
              <div class="item" v-if="nodeDataShow">
                <strong>数据</strong>
                <Select v-model="dataModel" style="width:200px" @on-change="selectData">
                  <Option v-for="item in dataList" :value="item.value" :key="item.value">{{ item.label }}</Option>
                </Select>
              </div>
            </div>
          </div>

          <Content :style="{padding: '24px', minHeight: '280px', background: '#fff'}">
            <div id="app">
              <router-view :chosedDataId="dataModel" :chosedNodeId="nodeModel" :chosedDeviceId="chosedDeviceId"/>
            </div>
          </Content>
        </Layout>
      </Layout>
    </Layout>
  </div>
</template>
<script>
import { statusCode, systemName } from './../../config.js'
let timer = null
export default {
  data () {
    return {
      breadcrumb: [],
      deviceModel: '',
      nodeModel: '',
      dataModel: '',
      deviceList: [],
      nodeList: [],
      dataList: [],
      selectShow: true,
      nodeDataShow: true,
      chosedDeviceId: ''
    }
  },
  created () {
    this.init()
    this.deviceInit()
    this.$bus.on('update-access', () => {
      this.deviceInit()
    })
  },
  methods: {
    init () {
      this.breadcrumb = [systemName, this.$route.name]
      let checkTopBarSelect = name => {
        if (name == '模型管理' || name == '设备接入') {
          this.selectShow = false
        } else {
          this.selectShow = true
          if (name == '实时数据' || name == '首页') {
            this.nodeDataShow = false
          } else {
            this.nodeDataShow = true
          }
        }
      }
      checkTopBarSelect(this.$route.name)
      this.$router.afterHooks.push((to, form) => {
        this.breadcrumb = [systemName, to.name]
        checkTopBarSelect(to.name)
      })

      if (!window.sessionStorage.getItem('token')) {
        this.$router.push('/login')
      }
      this.$router.beforeHooks.push((to, form, next) => {
        let login = window.sessionStorage.getItem('token')
        if (!login && to.name != '登录') {
          next({ path: '/login' })
        } else {
          next()
        }
      })

      this.$Notice.config({
        duration: 3
      })
      this.$axios.interceptors.response.use(
        function (response) {
          return response
        },
        () => {
          this.$Notice.error({
            title: '服务器异常'
          })
        }
      )
      let websocket = new WebSocket(`ws://${location.hostname}:3002`)
      websocket.onopen = () => {
        timer = setInterval(() => {
          websocket.send(new Date().getTime())
        }, 60000)
        this.$bus.on('websocketsend', (msg) => {
          websocket.send(msg)
        })
      }
      websocket.onmessage = ({ data }) => {
        this.$bus.emit('websocket', data)
      }
      websocket.onerror = () => {
        console.log('websocket err')
      }
      this.$Notice.config({ duration: 2 })
    },
    deviceInit () {
      this.$axios({
        url: '/api/access'
      }).then(({ data }) => {
        if (data.status === statusCode.SUCCESS) {
          this.deviceList = []
          // 读取本地存储的设备信息
          let chosedDevice = window.localStorage.getItem('deviceInfor')

          let defaultItem = ''
          // 遍历从服务器拿到的数据
          data.result.forEach((element, index) => {
            let value = {
              deviceId: element._id,
              devicename: element.name,
              modelId: element.deviceId._id,
              modelName: element.deviceId.name
            }
            let valueStr = JSON.stringify(value)
            // 与本地数据做匹配 优先级最高 如果匹配到使选择器选中该项
            if (chosedDevice && valueStr == chosedDevice) {
              this.deviceModel = chosedDevice
              this.chosedDeviceId = value.deviceId
            }
            // 将数据中第一项缓存
            if (index === 0) {
              defaultItem = valueStr
            }
            // 将数据推入select option 列表
            this.deviceList.push({
              value: valueStr,
              label: element.name
            })
          })
          // 如果再循环中没有匹配成功 且存在第一项 将选中第一项
          if (this.deviceModel == '' && defaultItem) {
            this.deviceModel = defaultItem
            this.selectChange(defaultItem)
          } else if (defaultItem == '') {
            this.deviceModel = ''
            window.localStorage.removeItem('deviceInfor')
          }
          this.nodeInit()
        } else {
          this.$Notice.warning({
            title: '请求异常'
          })
        }
      })
    },
    selectChange (value) {
      window.localStorage.setItem('deviceInfor', value)
      let parseData = JSON.parse(value)
      this.$bus.emit('select-change', parseData)

      this.chosedDeviceId = parseData.deviceId
      this.dataModel = ''
      this.nodeModel = ''
      this.nodeList = []
      this.dataList = []
      this.nodeInit()
    },
    nodeInit () {
      if (this.deviceModel) {
        let modelId = JSON.parse(this.deviceModel).modelId
        if (modelId) {
          this.$axios({
            url: '/api/node',
            params: { deviceId: modelId }
          }).then(({ data }) => {
            if (data.status == statusCode.SUCCESS) {
              this.nodeList = []
              data.result.forEach(element => {
                let item = {
                  value: element._id,
                  label: element.name
                }
                this.nodeList.push(item)
              })
            } else {
              this.$Notice.warning({
                title: '请求异常'
              })
            }
          })
        }
      }
    },
    selectNode (value) {
      this.dataModel = ''
      this.dataList = []
      this.dataInit()
    },
    dataInit () {
      if (this.deviceModel) {
        let modelId = JSON.parse(this.deviceModel).modelId
        if (modelId && this.nodeModel) {
          this.$axios({
            url: '/api/data',
            params: { deviceId: modelId, nodeId: this.nodeModel }
          }).then(({ data }) => {
            if (data.status == statusCode.SUCCESS) {
              this.dataList = []
              data.result.forEach(element => {
                let item = {
                  value: element._id,
                  label: element.name
                }
                this.dataList.push(item)
              })
            } else {
              this.$Notice.warning({
                title: '请求异常'
              })
            }
          })
        }
      }
    },
    selectData (value) {
      window.sessionStorage.setItem('chosedDataId', value)
    },
    logout (params) {
      console.log(params)
      if (params === 'logout') {
        window.sessionStorage.removeItem('token')
        this.$router.push('/login')
      }
    }
  }
}
</script>

<style lang="scss">
.layout {
  background: #f5f7f9;
  position: relative;
  overflow: hidden;
}
.ivu-layout-header {
}
.ivu-menu-horizontal {
  width: 100%;
  height: 100%;
  display: flex !important;
  justify-content: space-between;
  align-items: center;
}

.layout-logo {
  padding: 0 10px;
  height: 30px;
  background: #5b6270;
  border-radius: 3px;
  font-size: 18px;
  line-height: 30px;
  color: #fff;
}
.el-menu .ivu-icon {
  margin-right: 5px;
  width: 24px;
  text-align: center;
  font-size: 18px;
  vertical-align: middle;
}
.topBar {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.selectWrap {
  display: flex;
  justify-content: flex-end;
  strong  {
    padding: 10px;
  }
}
</style>