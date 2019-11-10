<template>
  <div class="model">
    <div class="topBar">
      <div class="wrap">
        <Steps :current="0">
          <Step title="设备管理"></Step>
          <Step title="节点管理"></Step>
          <Step title="数据管理"></Step>
        </Steps>
      </div>
      <div class="btnWrap">
        <!-- <Button size="small" icon="ios-arrow-back">返回</Button> -->
        <Button
          size="small"
          type="primary"
          icon="ios-add-circle-outline"
          @click="add"
        >
          <span>添加</span>
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
            label="编号"
            prop="index"
          >
            <Input
              v-model="form.index"
              type="text"
              placeholder="请输入编号"
            ></Input>
          </FormItem>
          <FormItem
            label="描述"
            prop="description"
          >
            <Input
              v-model="form.description"
              type="textarea"
              :autosize="{minRows: 2,maxRows: 5}"
              placeholder="请输入描述"
            ></Input>
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
import { checkNumber } from './unit.js'
export default {
  data() {
    return {
      componentName: '设备',
      columns: [
        {
          title: "ID",
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
          title: "编号",
          key: "index"
        },
        {
          title: "描述",
          key: "description"
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
              ),
              h(
                "Button",
                {
                  props: {
                    type: "primary",
                    size: "small"
                  },
                  on: {
                    click: () => {
                      this.detail(params.row);
                    }
                  }
                },
                "详情"
              )
            ]);
          }
        }
      ],
      data: [],
      form: {
        _id: "",
        name: "",
        index: "",
        description: ""
      },
      rule: {
        name: [{ required: true, message: '名称不能为空', trigger: 'blur' }],
        index: [ { validator: checkNumber, trigger: 'blur' } ]
      },
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
            this.data = data.result;
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
    detail(item) {
      this.$router.push("/model/" + item._id);
    },
    delete(item) {
      this.$Modal.confirm({
        title: '提示',
        content: '确定删除' + this.componentName,
        loading: true,
        onOk: () => {
          this.$axios({
            method: "delete",
            url: "/api/device",
            data: { _id: item._id }
          }).then(({ data }) => {
            this.$Modal.remove();
            if (data.status == statusCode.SUCCESS) {
              this.data.splice(item._index, 1)
              this.$Notice.success({
                title: "删除成功"
              });
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
            url: "/api/device",
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
                this.data.unshift(newData)
              } else {
                let updateData = this.formTemplateGetData(data.result)
                this.data.splice(this.formStatus, 1, updateData)
              }
              this.$Notice.success({
                  title: "操作成功"
                });
            } else {
              if(data.status == statusCode.ERROR_UNIQUE) {
                this.$Notice.warning({
                  title: "名称或编号已存在"
                });
              } else {
                this.$Notice.warning({
                  title: "操作失败"
                });
              }
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
