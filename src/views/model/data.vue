<template>
  <div class="model">
    <div class="topBar">
      <div class="wrap">
        <Steps :current="2">
          <Step title="设备管理"></Step>
          <Step title="节点管理"></Step>
          <Step title="数据管理"></Step>
        </Steps>
      </div>
      <div class="btnWrap">
        <Button size="small" icon="ios-arrow-back" @click="back">返回</Button>
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
      :data="tableData"
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
          :label-width="70"
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
          <FormItem label="类型" prop="dataType">
            <Select v-model="form.dataType" placeholder="请选择数据的类型" @on-change="typeChange">
                <Option value="analog">模拟量</Option>
                <Option value="key">映射型</Option>
            </Select>
          </FormItem>
          <div class="formWrap" v-if="form.dataType != ''">
            <div class="analog" v-if="form.dataType == 'analog'"> 
              <FormItem label="单位">
                <Input
                  v-model="form.calculate[0].value"
                  placeholder="单位"
                ></Input>
              </FormItem>
              <FormItem label="告警下限">
                <Input
                  v-model="form.calculate[0].warningMin"
                  placeholder="告警下限"
                ></Input>
              </FormItem>
              <FormItem label="告警上线">
                <Input
                  v-model="form.calculate[0].warningMax"
                  placeholder="告警上线"
                ></Input>
              </FormItem>
            </div>
            
            <div v-if="form.dataType == 'key'">
              <ul>
                <li class="title">
                  <span class="key">KEY</span>
                  <span class="value">VALUE</span>
                </li>
                <li v-for="(item, index) in form.calculate" :key="index">
                  <Radio v-model="item.warning">告警</Radio>
                  <Input class="key" v-model="item.key" placeholder="key"></Input>
                  <Input class="value" v-model="item.value" placeholder="value"></Input>
                  <Button type="error" @click="deleteKey(index)">删除</Button>
                </li>
                <li class="addKeyValue">
                  <Button long @click="addKey">添加</Button>
                </li>
              </ul>
            </div>
          </div>
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
  props: ['deviceId', 'nodeId'],
  data() {
    return {
      componentName: '数据',
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
          title: "类型",
          key: "dataType"
        },
        {
          title: "操作",
          key: "action",
          width: 140,
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
        index: "",
        description: "",
        dataType: "",
        calculate: []
      },
      rule: {
        name: [{ required: true, message: '名称不能为空', trigger: 'blur' }],
        index: [ { validator: checkNumber, trigger: 'blur' } ],
        dataType: [{ required: true, message: '请选择类型', trigger: 'change' }]
      },
      formStatus: 'add',
      modal: false,
      loading: false
    };
  },
  mounted() {
    if(this.deviceId && this.nodeId) {
      this.init();
    } else {
      this.$router.push('/noFound')
    }
  },
  methods: {
    init() {
      this.$axios({
        method: "get",
        url: "/api/data",
        params: {
          deviceId: this.deviceId,
          nodeId: this.nodeId
        }
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
    back(){
      this.$router.push(`/model/${this.deviceId}`)
    },
    addKey(){
      this.form.calculate.push({key: '', value: ''})
    },
    deleteKey(index){
      this.form.calculate.splice(index, 1)
    },
    typeChange(type){
      switch(type){
        case 'key': 
          this.form.calculate = [{key: '', value: ''}]
          break
        case 'analog': 
          this.form.calculate = [{key: 'analog', value: ''}]
          break
        default: 
          break
      }
    },
    add() {
      this.formStatus = 'add'
      this.clearForm()
      this.modal = true;
    },
    editor(item) {
      this.formStatus = item._index
      this.copyToForm(this.data[item._index])
      this.modal = true;
    },
    clearForm(){
      for (const key in this.form) {
        if (this.form.hasOwnProperty(key)) {
          if(key == 'calculate') {
            this.form[key] = []
          } else {
            this.form[key] = ""
          }
        }
      }
      this.$refs.deviceModelForm.resetFields();
    },
    copyToForm(item){
      for (const key in this.form) {
        if (this.form.hasOwnProperty(key)) {
          if(key == 'calculate' && Array.isArray(item[key]) && item[key].length > 0) {
            this.form[key] = []
            item[key].forEach(element => {
              this.form[key].push({...element})
            });
          } else {
            this.form[key] = item[key]!=undefined || item[key]!=null ? item[key] : ""
          }
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
            url: "/api/data",
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
      this.clearForm()
      this.modal = false;
    },
    submit() {
      this.$refs.deviceModelForm.validate(valid => {
        console.log(valid)
        if (valid) {
          let check = true
          for (const key in this.form.calculate) {
            if (this.form.calculate.hasOwnProperty(key)) {
              const element = this.form.calculate[key];
              if(element.key == '' || element.key == undefined || element.key == null || element.value == '' || element.value == undefined || element.value == null) {
                check = false
              }
            }
          }
          if(check) {
            this.loading = true;
            let axiosParams = {
              url: "/api/data",
              method: 'put',
              data: {
                ...this.form,
                deviceId: this.deviceId,
                nodeId: this.nodeId
              }
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
              this.clearForm()
            });
          } else {
            this.$Notice.warning({
              title: "规则校验失败"
            });
          }
        } else {
          this.$Notice.warning({
            title: "格式校验失败"
          });
        }
      });
    }
  },
  computed: {
    tableData(){
      let tableData = []
      this.data.forEach(element => {
        let { name, description, index, dataType, _id } = {...element}
        let item = { name, index, description, dataType, _id }
        switch(element.dataType){
          case 'key':
            item.dataType = '映射型'
            break
          case 'analog':
            item.dataType = '模拟量'
            break
          default:
            break
        }
        tableData.push(item)
      });
      return tableData
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
  .formWrap {
    border: 1px solid #ccc;
    padding: 10px;
    ul {
      li {
        display: flex;
        justify-content: space-between;
        align-items: center;
        .key {
          width: 100px;
          flex: none;
          margin-right: 10px;
        }
        .value {
          flex: auto;
          margin-right: 10px;
        }
        .ivu-btn {
          padding: 0 4px;
          line-height: 14px;
          height: 22px;
        }
        padding: 10px 0;
      }
      .title {
        text-align: center;
        background: #ccc;
        color: #fff;
        font-weight: bold;
      }
    }
  }
}
</style>
