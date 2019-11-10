<template>
  <div id="analysis">
    <div class="dateTimeWrap">
      <DatePicker
        type="daterange"
        placement="bottom-end"
        placeholder="Select date"
        style="width: 200px"
        v-model="dateBuffer"
        @on-change="dataDispose"
      ></DatePicker>
    </div>
    <div
      class="main"
      :class="chartStatus ? 'showMessage' : ''"
    >
      <div
        class="lineChart"
        :key="dataType"
        ref="lineChartKey"
        v-if="dataType == 'key'"
      ></div>
      <div
        class="lineChart"
        ref="lineChartAnalog"
        :key="dataType"
        v-if="dataType == 'analog'"
      ></div>
      <p class="message">{{ chartStatus }}</p>
    </div>
  </div>
</template>

<script>
let myChart = null;
import { statusCode } from "./../../config.js";
import { dateFtt } from "./../../utils/index.js";
export default {
  props: ["chosedDeviceId", "chosedNodeId", "chosedDataId"],
  data() {
    return {
      dataList: [],
      chartStatus: "请选择数据和时间进行分析",
      dataType: "",
      dateBuffer: [new Date(), new Date()]
    };
  },
  mounted() { 
    this.init();
  },
  methods: {
    init() {
      this.chartStatus = "请选择数据和时间进行分析";
      if (this.requestParams.dataId && this.dateBuffer) {
        this.chartStatus = "正在分析...";
        this.$axios({
          url: "/api/history/analysis",
          params: { ...this.requestParams, date: this.dateBuffer }
        }).then(({ data }) => {
          if (data.status == statusCode.SUCCESS) {
            this.dataList = data.result;
            if (data.dataInf && data.dataInf.calculate) {
              let dataInf = data.dataInf;
              let calculate = dataInf.calculate;

              this.chartStatus = "";
              this.dataType = dataInf.dataType;
              this.$nextTick(() => {
                switch (dataInf.dataType) {
                  case "key":
                    this.chartInitKey(calculate);
                    break;
                  case "analog":
                    this.chartInitAnalog(calculate);
                    break;
                  default:
                    break;
                }
              });
            }
          } else {
            this.$Notice.warning({
              title: "请求异常"
            });
          }
        });
      }
    },
    chartInitKey(calculate) {
      let seriesData = [];
      let timeList = [];
      let yAxisData = [];
      this.dataList.forEach(element => {
        seriesData.push(element.value);
        timeList.push(dateFtt("yyyy-MM-dd hh:mm:ss", element.time));
      });

      calculate.forEach(element => {
        yAxisData.push(element.value);
      });

      let option = {
        title: {
          text: "数据趋势图"
        },
        xAxis: {
          data: timeList
        },
        yAxis: {
          splitLine: {
            show: false
          },
          type: "category",
          data: yAxisData
        },
        dataZoom: [
          {
            startValue: timeList[0]
          },
          {
            type: "inside"
          }
        ],
        visualMap: {
          show: false,
          outOfRange: {
            color: "#999"
          },
          pieces: []
        },
        series: {
          name: "数据趋势图",
          type: "line",
          data: seriesData,
          markLine: {
            silent: true,
            data: []
          }
        }
      };
      if (seriesData.length > 0) {
        let myChart = this.$echarts.init(this.$refs.lineChartKey);
        myChart.setOption(option);
      } else {
        this.chartStatus = "您选择的时间段没有数据";
      }
    },
    chartInitAnalog(calculate) {
      let seriesData = [];
      let timeList = [];
      let pieces = [];
      let markLineData = [];
      let maxNumber = -Infinity;
      let minNumber = Infinity;

      this.dataList.forEach(element => {
        maxNumber = maxNumber > element.value ? maxNumber : element.value;
        minNumber = minNumber < element.value ? minNumber : element.value;
        seriesData.push(element.value);
        timeList.push(dateFtt("yyyy-MM-dd hh:mm:ss", element.time));
      });
      maxNumber = Math.ceil(maxNumber / 10) * 10;
      minNumber = Math.floor(minNumber / 10) * 10;

      if (typeof calculate[0].warningMin == "number") {
        pieces.push({
          gt: 0,
          lte: calculate[0].warningMin,
          color: "#0000FF"
        });
        markLineData.push({
          yAxis: calculate[0].warningMin
        });
      }
      if (
        typeof calculate[0].warningMin == "number" &&
        typeof calculate[0].warningMax == "number"
      ) {
        pieces.push({
          gt: calculate[0].warningMin,
          lte: calculate[0].warningMax,
          color: "#238C23"
        });
      }
      if (typeof calculate[0].warningMax == "number") {
        pieces.push({
          gt: calculate[0].warningMax,
          lte: 9999,
          color: "#FF3264"
        });
        markLineData.push({
          yAxis: calculate[0].warningMax
        });
      }

      let option = {
        title: {
          text: "数据趋势图"
        },
        xAxis: {
          data: timeList
        },
        yAxis: {
          splitLine: {
            show: false
          }
          //   min: minNumber,
          //   max: maxNumber,
        },
        dataZoom: [
          {
            startValue: timeList[0]
          },
          {
            type: "inside"
          }
        ],
        visualMap: {
          show: false,
          pieces: pieces,
          outOfRange: {
            color: "#999"
          }
        },
        series: {
          name: "数据趋势图",
          type: "line",
          data: seriesData,
          markLine: {
            silent: true,
            data: markLineData
          }
        }
      };
      if (seriesData.length > 0) {
        let myChart = this.$echarts.init(this.$refs.lineChartAnalog);
        myChart.setOption(option);
      } else {
        this.chartStatus = "您选择的时间段没有数据";
      }
    },
    dataDispose(params){
      this.init()
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
#analysis {
  height: 100%;
  display: flex;
  flex-direction: column;
  .dateTimeWrap {
    display: flex;
    justify-content: flex-end;
    align-items: center;
  }
  .main {
    position: relative;
    flex: auto;
    height: 100%;
    .lineChart {
      visibility: visible;
      height: 100%;
    }
    .message {
      position: absolute;
      top: 20px;
      bottom: 0;
      left: 0;
      right: 0;
      display: none;
      justify-content: center;
      align-items: center;
      color: #fff;
      background: #ccc;
      font-size: 20px;
    }
  }
  .showMessage {
    .message {
      display: flex;
    }
    .lineChart {
      visibility: hidden;
    }
  }
}
</style>
