<template>
  <div class="loginContainer">
    <Card style="width:400px; background: rgba(255, 255, 255, 0.3)">
      <p slot="title">河北科技师范学院</p>
      <Form
        ref="formValidate"
        :model="formValidate"
        :rules="ruleValidate"
        :label-width="80"
      >
        <FormItem
          label="用户名"
          prop="userName"
        >
          <Input
            v-model="formValidate.userName"
            placeholder="请输入你的用户名"
            @on-keyup.enter="submit"
          ></Input>
        </FormItem>
        <FormItem
          label="密码"
          prop="password"
        >
          <Input
            v-model="formValidate.password"
            type="password"
            placeholder="******"
            @on-keyup.enter="submit"
          ></Input>
        </FormItem>
      </Form>
      <Divider />
      <Row>
        <Col
          span="16"
          offset="4"
        >
        <Button
          type="primary"
          long
          @click="submit"
        >登录</Button></Col>

      </Row>

    </Card>

  </div>
</template>

<script>
export default {
  data() {
    return {
      formValidate: {
        userName: "",
        password: ""
      },
      ruleValidate: {
        userName: [
          {
            required: true,
            message: "请输入正确的用户名",
            trigger: "blur"
          }
        ],
        password: [
          {
            required: true,
            message: "请输入密码",
            trigger: "blur"
          }
        ]
      }
    };
  },
  methods: {
    submit(){
        this.$refs.formValidate.validate(valid => {
        if (valid) {
            if(this.formValidate.userName === 'admin' && this.formValidate.password === 'admin') {
                window.sessionStorage.setItem('token', 'true')
                this.$router.push('/')
            } else {
                this.$Notice.error({title: '账户名/密码错误'})
                this.$refs.formValidate.resetFields();
            }
        } else {

        }
      });
    }
  }
};
</script>

<style lang="scss" scoped>
.loginContainer {
  background: url("/static/images/login.jpeg");
  background-size: cover;
  background-position: bottom center;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>
