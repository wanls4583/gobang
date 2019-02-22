<template>
  <div class="entry_w">
    <div class="bg_w">
      <div class="bg"></div>
      <div class="layer"></div>
    </div>
    <div class="title">五子棋</div>
    <div class="btn_w">
      <div class="btn create" @click="_createRoom">创建房间</div>
      <div class="btn join" @click="_joinRoom">加入房间</div>
    </div>
    <Dialog v-if="showPop" width="500px" height="400px">
      <div class="pop_wrap">
        <div class="p_title">请输入房间号</div>
        <div class="input_w"><input v-model="roomid"></div>
        <div class="btn_r_w">
          <div class="btn cancel" @click="showPop=false">取消</div>
          <div class="btn confirm" @click="_confirmRoom">确定</div>
        </div>
      </div>
    </Dialog>
  </div>
</template>
<script type="text/javascript">
import io from 'socket.io-client';
import Dialog from '@/components/Dialog';
const uuidV1 = require('uuid/v1');

export default {
  components: {
    Dialog
  },
  data() {
    return {
      socket: null,
      showPop: false,
      roomid: ''
    }
  },
  created() {
    
  },
  beforeRouteEnter (to, from, next) {
    next((vm)=>{
      if(vm.socket && vm.socket.connected) {
        vm.socket.disconnect();
      }
      vm.socket = io('http://vultr.lisong.hn.cn:3000');
      vm.socket.on('connect', () => {
        console.log('连接成功');
      });
      vm._bindSocketEvent();
    });
    next();
  },
  methods: {
    _bindSocketEvent() {
      var socket = this.socket;
      //房间创建成功
      socket.on('confirm-create', (data) => {
        console.log('创建成功');
        this.$toast({
          content: '创建成功'
        });
        this.$router.push({ name: 'Home', params: { socket: socket, color: data.color, overtime: data.overtime, roomid: this.roomid } });
      });
      //加入房间成功
      socket.on('confirm-join', (data) => {
        console.log('加入房间成功');
        this.$toast({
          content: '加入房间'
        });
        this.$router.push({ name: 'Home', params: { socket: socket, color: data.color, overtime: data.overtime, roomid: this.roomid } });
      });
    },
    _createRoom() {
      this.showPop = true;
      this.opType = 'create';
    },
    _joinRoom() {
      this.showPop = true;
      this.opType = 'join';
    },
    _confirmRoom() {
      if (!this.roomid) {
        return;
      }
      if (this.opType == 'create') {
        this.socket.emit('create-room', { roomid: this.roomid });
      } else {
        this.socket.emit('join-room', { roomid: this.roomid });
      }
      this.showPop = false;
    }
  }
}

</script>
<style lang="scss">
$chessWidth:48px;
.entry_w {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  .bg_w {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: -1;
  }
  .bg {
    width: 100%;
    height: 100%;
    background: url('~@/assets/entry_bg.jpg') no-repeat;
    background-size: cover;
    filter: blur(50px)
  }
  .layer {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.3);
  }
}
.title {
  margin-bottom: 200px;
  font-size: 80px;
  color: #fff;
  font-weight: bold;
  text-align: center;
}
.btn_w {
  position: relative;
  z-index: 2;
  width: 14*$chessWidth;
  margin: 0 auto;
  .btn {
    height: 80px;
    margin-top: 60px;
    line-height: 80px;
    text-align: center;
    font-size: 30px;
    border-radius: 4px;
    background-color: #4A90E2;
    color: #fff;
  }
}
.pop_wrap {
  background-color: #fff;
  border-radius: 8px;
  color: #333;
  .p_title {
    padding: 30px;
    font-size: 30px;
    line-height: 30px;
    text-align: center;
  }
  .input_w {
    width: 450px;
    height: 60px;
    margin: 0 auto;
    border: 1px solid #999;
    input {
      border-style: none;
      outline-style: none;
      width: 100%;
      height: 100%;
      padding: 0 10px;
      box-sizing: border-box;
      font-size: 30px;
    }
  }
  .btn_r_w {
    display: flex;
    justify-content: space-between;
    border-top: 1px solid #999;
    height: 80px;
    margin-top: 50px;
    .btn {
      width: 50%;
      height: 100%;
      box-sizing: border-box;
      font-size: 30px;
      line-height: 80px;
      text-align: center;
      &:first-child {
        border-right: 1px solid #999;
      }
    }
  }
}

</style>
