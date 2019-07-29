<template>
  <div :class="$style.container">
    <group :gutter="0">
      <h4 :class="$style.title">手机号登录</h4>
      <x-input title="手机号" placeholder="请输入手机号" mask="999 9999 9999"   :max="13" is-type="china-mobile" v-model="form.phone">
        <div slot="right" :class="$style.code" @click.native="handleGetCodeClick">{{msg}}</div>
      </x-input>
      <x-input title="验证码" placeholder="请输入验证码" mask="9999" :max="4" class="vux-1px-b"  :is-type="phoneCode" v-model="form.code"></x-input>  
    </group>
    <x-button type="primary" :class="$style.btn">确定</x-button>
   
  </div>
</template>

<script>
import { XInput, Group, XButton, Toast } from 'vux'
export default {
  data () {
    return {
      form: {
        phone: '',
        code: ''
      },
      msg: '获取验证码',
      timer: null,
      phoneCode: function (value) {
        return {
          valid: value.length === 4,
          msg: '请输入4位有效验证码'
        }
      }
    }
  },
  components: {
    Group,
    XInput,
    XButton,
    Toast
  },
  beforeDestroy () {
    if (this.timer) {
      clearInterval(this.timer)
    }
  },
  methods: {
    /**
     * 获取验证码
     */
    handleGetCodeClick () {
      if (this.timer || this.msg !== '获取验证码') {
        return false
      } else {
        let count = 60
        this.msg = `${count}s 后重试`
        this.timer = setInterval(() => {
          count--
          if (count === 0) {
            this.msg = '获取验证码'
            clearInterval(this.timer)
            this.timer = null
          } else {
            this.msg = `${count}s 后重试`
          }
        }, 1000)
      }
    }
  }
}
</script>

<style lang='less' module>
.container {
  background: #fff;
  padding: 0px 30px;
  .title {
    margin:100px auto 50px 30px;
    color:#222;
    font-size:16px;
  }
  .code {
    color:#1AAD19;
    font-size:14px;
  }
  .btn {
    margin-top:100px;
  }
}
</style>