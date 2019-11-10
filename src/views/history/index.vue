<template>
  <div id="historyIndex">
    <Table
      border
      :columns="columns"
      :data="dataList"
    ></Table>
    <div class="pageWrap">
        <Page :total="total" size="small" @on-change="pageChange" />
    </div>
  </div>
</template>

<script>
import { statusCode } from "./../../config.js";
import { dateFtt } from "./../../utils/index.js";
export default {
  props: ["chosedDeviceId", "chosedNodeId", "chosedDataId"],
  data() {
    return {
      columns: [
        {
          title: "节点",
          key: "nodeName"
        },
        {
          title: "数据",
          key: "dataName"
        },
        {
          title: "原始值",
          key: "original"
        },
        {
          title: "处理值",
          key: "value"
        },
        {
          title: "时间",
          key: "time"
        }
      ],
      dataList: [],
      total: 0
    };
  },
  mounted() {
      this.init()
  },
  methods: {
    init(page) {
      if(page == undefined) page = 1
      this.$axios({
        url: "/api/history/data",
        params: { ...this.requestParams, page }
      }).then(({ data }) => {
        if (data.status == statusCode.SUCCESS) {
            this.total = data.count
            this.dataList = []
            data.result.forEach(element => {
            let item = {
                _id: element._id,
                nodeName: element.nodeId.name,
                dataName: element.dataId.name,
                original: element.original,
                value: element.value,
                time: dateFtt("yyyy-MM-dd hh:mm:ss",element.time)
            }
            this.dataList.push(item)
            })
        } else {
            this.$Notice.warning({
            title: "请求异常"
            });
        }
      });
    },
    pageChange(page){
        this.init(page)
    }
  },
  computed: {
    requestParams() {
      let params = {};
      if (this.chosedDeviceId) params.deviceId = this.chosedDeviceId;
      if (this.chosedNodeId) params.nodeId = this.chosedNodeId;
      if (this.chosedDataId) params.dataId = this.chosedDataId;
      return params;
    }
  },
  watch: {
    requestParams() {
      this.init();
    }
  }
};
</script>

<style lang="scss" scoped>
.pageWrap {
    padding: 20px;
    display: flex;
    justify-content: center;
    align-items: center;
}
</style>
