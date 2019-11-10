<template>
    <div class="runData">
        <div class="item" v-for="(item, index) in runDataList" :key="index">
            <div class="container">
                <div class="wrap" :style="item.warningColor">
                    <p class="value">
                        <em>{{ item.dataName }}</em>
                        <strong>{{ item.value }}</strong>
                        <span>{{ item.unit }}</span>
                    </p>
                </div>
                <p class="device">{{ item.nodeName }}</p>
            </div>
        </div>
    </div>
</template>

<script>
import { statusCode } from "./../../config.js";
export default {
    data(){
        return {
            runDataList: []
        }
    },
    mounted(){
        let deviceInfor = window.localStorage.getItem('deviceInfor')
        try {
            deviceInfor = JSON.parse(deviceInfor)
        } catch (err) {
            deviceInfor = null
        }
        if(deviceInfor && deviceInfor.modelId) {
            this.init(deviceInfor.modelId)
        }
        this.$bus.on('select-change', params => {
            this.init(params.modelId)
        })
        this.$bus.on('websocket', (data) => {
            let deviceInfor = window.localStorage.getItem('deviceInfor')
            let parseData = {}
            let parseError = false
            try {
                parseData = JSON.parse(data)
                deviceInfor = JSON.parse(deviceInfor)
            } catch(err){
                parseError = true
            }
            if(!parseError && (parseData.id == deviceInfor.deviceId || parseData.id == 'all')) {
                switch(parseData.type) {
                    case 'data':
                        parseData.data.forEach(element => {
                            let id = element.id
                            this.runDataList.forEach(item => {
                                if(id == item.id) {
                                    item.value = element.value
                                    item.warning = element.warning
                                    if(element.warning) {
                                        item.warningColor = 'background: radial-gradient(rgba(255,50,100,.5),rgba(255,50,100,.2));'
                                    } else {
                                        item.warningColor = 'background: radial-gradient(rgba(35, 140, 35,.5),rgba(35, 140, 35,.2));'
                                    }
                                }
                            });
                        });
                        break
                    case 'warning':
                        parseData.data.forEach(element => {
                            let id = element.id
                            this.runDataList.forEach(item => {
                                if(id == item.id) {
                                    
                                }
                            });
                        });
                        break
                    default:
                        break
                }
            }
        })
    },
    methods: {
        init(deviceId){
            this.$axios({
                url: '/api/data',
                params: {deviceId}
            }).then(({data}) => {
                if (data.status == statusCode.SUCCESS) {
                    this.runDataList = []
                    data.result.forEach(element => {
                        let item = {
                            id: element._id,
                            type: element.dataType,
                            dataName: element.name,
                            value: '--',
                            nodeName: element.nodeId.name,
                            warningColor: ''
                        }
                        let calculate = element.calculate
                        if(Array.isArray(calculate) && calculate.length > 0) {
                            switch (element.dataType) {
                                case "key":

                                    break
                                case "analog":
                                    item.unit = calculate[0].value
                                    break
                                default:
                                    break
                            }
                        }
                        item.warning = false
                        this.runDataList.push(item)
                    });
                    this.$bus.emit('websocketsend', 'REQUEST')
                } else {
                    this.$Notice.warning({
                    title: "请求异常"
                    });
                }
            })
        }
    }
}
</script>


<style lang="scss">
.runData {
    display: flex;
    justify-content: flex-start;
    flex-wrap: wrap;
    .item {
        width: 20%;
        flex: none;
        padding-bottom: 2%;
        .container {
            padding: 8px;
            width: 116px;
            margin: 0 auto;
            box-shadow: 0 0 10px #ccc;
            border-radius: 6px;
        }
        .wrap {
            width: 100px;
            height: 100px;
            // background: radial-gradient(rgba(255,51,102,.5),rgba(255,51,102,.2));
            // box-shadow: 0 0 10px #ccc;
            background: #ccc;
            border-radius: 10%;
        }
        .value {
            width: 100%;
            height: 100%;
            color: #fff;
            font-size: 12px;
            display: flex;
            justify-content: center;
            align-items: center;
            flex-direction: column;
            span, strong, em {
                flex: none;
            }
            strong {
                font-size: 18px;
            }
        }
        .device {
            font-style: 14px;
            width: 100%;
            line-height: 30px;
            text-align: center;
        }
        // overflow: hidden;
    }
}
</style>
