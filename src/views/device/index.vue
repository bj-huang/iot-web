<template>
  <div class="model">
    <div class="topBar">
      <div class="wrap">
       
      </div>
      <div class="btnWrap">
        <Button
          size="small"
          type="primary"
          icon="ios-add-circle-outline"
          @click="add"
        >
          <span>接入新设备</span>
        </Button>
      </div>

    </div>
    <Divider />
    <Table
      border
      :columns="columns"
      :data="data"
    ></Table>
    <Modal
      v-model="modal"
      width="360"
      :mask-closable="false"
      :closable="false">
      <p
        slot="header"
        style="text-align:center"
      >
        <Icon :type="formStatus == 'add' ? 'md-add-circle' : 'md-paper'"></Icon>
        <span>{{formStatus == 'add' ? '添加' : '更新'}}{{componentName}}</span>
      </p>
      <div style="text-align:center">
        <Form
          ref="deviceModelForm"
          :model="form"
          :rules="rule"
          :label-width="50"
        >
          <FormItem
            label="名称"
            prop="name"
          >
            <Input
              v-model="form.name"
              placeholder="请输入名称"
            ></Input>
          </FormItem>
          <FormItem
            v-if="formStatus == 'add'"
            label="模型"
            prop="model">
            <Select v-model="form.deviceId">
                <Option v-for="item in deviceList" :value="item.value" :key="item.value">{{ item.label }}</Option>
            </Select>
          </FormItem>
        </Form>
      </div>
      <div slot="footer">
        <Button
          size="small"
          @click="cancel"
        >取消</Button>
        <Button
          type="primary"
          size="small"
          :loading="loading"
          @click="submit"
        >确认</Button>
      </div>
    </Modal>
  </div>
</template>

<script>
import { statusCode } from "./../../config.js";
export default {
  data() {
    return {
      componentName: '设备',
      columns: [
        {
          title: "设备ID",
          key: "_id",
          render: (h, params) => {
            return h("div", [
              h("Icon", {
                props: {
                  type: "person"
                }
              }),
              h("strong", params.row._id)
            ]);
          }
        },
        {
          title: "名称",
          key: "name"
        },
        {
          title: "模型ID",
          key: "deviceId"
        },
        {
          title: "模型名称",
          key: "deviceName"
        },
        {
          title: "操作",
          key: "action",
          width: 170,
          align: "center",
          render: (h, params) => {
            return h("div", [
              h(
                "Button",
                {
                  props: {
                    type: "success",
                    size: "small"
                  },
                  style: {
                    marginRight: "5px"
                  },
                  on: {
                    click: () => {
                      this.editor(params.row);
                    }
                  }
                },
                "编辑"
              ),
              h(
                "Button",
                {
                  props: {
                    type: "error",
                    size: "small"
                  },
                  style: {
                    marginRight: "5px"
                  },
                  on: {
                    click: () => {
                      this.delete(params.row);
                    }
                  }
                },
                "删除"
              )
            ]);
          }
        }
      ],
      data: [],
      form: {
        _id: "",
        name: "",
        deviceId: ""
      },
      rule: {
        name: [{ required: true, message: '名称不能为空', trigger: 'blur' }],
        deviceId: [{ required: true, message: '请选择模型', trigger: 'change' }]
      },
      deviceList: [],
      formStatus: 'add',
      modal: false,
      loading: false
    };
  },
  mounted() {
    this.init();
  },
  methods: {
    init() {
      this.$axios({
        method: "get",
        url: "/api/device"
      }).then(({ data }) => {
        if (data.status == statusCode.SUCCESS) {
          if (Array.isArray(data.result)) {
              this.deviceList = []
            data.result.forEach(element => {
                this.deviceList.push({
                    label: element.name,
                    value: element._id
                })
            });
          } else {
            this.$Notice.warning({
              title: "模型格式错误"
            });
          }
        } else {
          this.$Notice.warning({
            title: "模型加载失败"
          });
        }
      });
      this.$axios({
        method: "get",
        url: "/api/access"
      }).then(({ data }) => {
        if (data.status == statusCode.SUCCESS) {
          if (Array.isArray(data.result)) {
            this.data = []
            data.result.forEach(element => {
                let item = {}
                item._id = element._id
                item.name = element.name
                item.deviceId = element.deviceId._id
                item.deviceName = element.deviceId.name
                this.data.push(item)
            });
          } else {
            this.$Notice.warning({
              title: "数据格式错误"
            });
          }
        } else {
          this.$Notice.warning({
            title: "数据加载失败"
          });
        }
      });
    },
    add() {
      this.formStatus = 'add'
      this.clearForm()
      this.modal = true;
    },
    editor(item) {
      this.formStatus = item._index
      this.copyToForm(item)
      this.modal = true;
    },
    clearForm(){
      for (const key in this.form) {
        if (this.form.hasOwnProperty(key)) {
          this.form[key] = ""
        }
      }
    },
    copyToForm(item){
      for (const key in this.form) {
        if (this.form.hasOwnProperty(key)) {
          this.form[key] = item[key]!=undefined || item[key]!=null ? item[key] : ""
        }
      }
    },
    formTemplateGetData(item){
      let data = {}
      for (const key in this.form) {
        if (this.form.hasOwnProperty(key)) {
          data[key] = item[key]!=undefined || item[key]!=null ? item[key] : ""
        }
      }
      return data
    },
    delete(item) {
      this.$Modal.confirm({
        title: '提示',
        content: '确定删除' + this.componentName,
        loading: true,
        onOk: () => {
          this.$axios({
            method: "delete",
            url: "/api/access",
            data: { _id: item._id }
          }).then(({ data }) => {
            this.$Modal.remove();
            if (data.status == statusCode.SUCCESS) {
              this.data.splice(item._index, 1)
              this.$Notice.success({
                title: "删除成功"
              });
              this.$bus.emit('update-access')
            } else {
              this.$Notice.warning({
                title: "删除失败"
              });
            }
          });
        }
      })
    },
    cancel() {
      this.$refs.deviceModelForm.resetFields();
      this.clearForm()
      this.modal = false;
    },
    submit() {
      this.$refs.deviceModelForm.validate(valid => {
        if (valid) {
          this.loading = true;
          let axiosParams = {
            url: "/api/access",
            method: 'put',
            data: this.form
          }
          if(this.formStatus == 'add') {
            axiosParams.method = 'post'
          } 
          this.$axios(axiosParams).then(({ data }) => {
            if (data.status == statusCode.SUCCESS) {
              if(this.formStatus == 'add') {
                let newData = this.formTemplateGetData(data.result)
                for(let i=0; i<this.deviceList.length; i++) {
                  if(newData.deviceId == this.deviceList[i].value) {
                    newData.deviceName = this.deviceList[i].label
                  }
                }
                this.data.unshift(newData)
              } else {
                let updateData = this.formTemplateGetData(data.result)
                this.data[this.formStatus].name = data.result.name
              }
              this.$Notice.success({
                  title: "操作成功"
                });
              this.$bus.emit('websocketsend', 'REST_WRITE_LIST')
              // this.$bus.emit('update-access')
            } else {
              this.$Notice.warning({
                title: "请求异常"
              });
            }
            this.modal = false;
            this.loading = false;
          });
        } else {
          this.$Notice.warning({
            title: "格式校验失败"
          });
        }
      });
    }
  }
};
</script>

<style lang="scss">
.topBar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  .wrap {
    width: 70%;
  }
  .btnWrap {
    display: flex;
    justify-content: flex-end;
    .ivu-btn {
      margin-right: 20px;
    }
  }
}
.ivu-alert {
  margin-bottom: 0;
}
.ivu-modal {
  .ivu-btn {
    padding: 1px 7px 2px;
    font-size: 12px;
    border-radius: 3px;
  }
}
</style>
