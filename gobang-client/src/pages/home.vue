<template>
  <div class="home_w">
    <div class="timer_w">
      <div class="left_w">
        <div class="icon">{{color=='black'?'我方':'对方'}}</div>
        <div class="timer">{{time1}}</div>
      </div>
      <div class="right_w">
        <div class="icon white">{{color=='white'?'我方':'对方'}}</div>
        <div class="timer white">{{time2}}</div>
      </div>
    </div>
    <div class="board_w" @click="_clickBoard" ref="board">
      <div class="waiting" v-if="waiting">等待中...</div>
      <div class="cell_w" v-for="n in 14*14"></div>
      <div class="chess_w" v-for="(chess, index) in chessArr" :style="{top:48*(chess.y-1)-24+'px',left:48*(chess.x-1)-24+'px'}" :class="{last_step: !chess.local && (index==chessArr.length-1 || index==chessArr.length-2 && chessArr[index+1].local)}">
        <div v-if="chess.c=='white'" class="white-chess"></div>
        <div v-else class="black-chess"></div>
        <div v-if="chess.local" class="choice_w">
          <div class="btn cancel_btn" @click.stop="_cancelStep">&#xe603;</div>
          <div class="btn confirm_btn" @click.stop="_confirmStep">&#xe676;</div>
        </div>
      </div>
    </div>
    <Dialog v-if="showPop" width="500px" height="400px">
      <div class="win_pop_wrap">
        <div class="w_title">{{result}}</div>
        <div class="restart" @click="_restart">重来</div>
      </div>
    </Dialog>
  </div>
</template>
<script type="text/javascript">
import Dialog from '@/components/Dialog';
export default {
  components: {
    Dialog
  },
  data() {
    return {
      chessArr: [],
      active: false,
      socket: null,
      color: '',
      showPop: false,
      roomid: '',
      showPop: false,
      result: '',
      time1: 0,
      time2: 0,
      waiting: true
    }
  },
  created() {
    this.socket = this.$route.params.socket;
    this.color = this.$route.params.color;
    this.roomid = this.$route.params.roomid;
    this.overtime = Number(this.$route.params.overtime);
    if (this.socket) {
      this._bindSocketEvent();
    } else {
      this.$router.back(-1);
    }
  },
  methods: {
    _bindSocketEvent() {
      var socket = this.socket;
      socket.on('disconnect', () => {
        console.log('离开房间');
        this.$toast({
          content: '对方离开了房间'
        });
        this.active = false;
        setTimeout(() => {
          this.$router.back(-1);
        }, 1000);
      });
      socket.on('start', (data) => {
        console.log('开始');
        this.$toast({
          content: '开始游戏'
        });
        if(data.color == this.color) {
          this.active = true;
          this._startTimer(this.color);
        }
      });
      //对方落子完成
      socket.on('ready', (data) => {
        console.log('ready');
        this.chessArr.push(data);
        this.active = true;
        this._startTimer(this.color);
      });
      //计时器
      socket.on('time', (data) => {
        this._startTimer(data.color);
      });
      //落子确认
      socket.on('confirm-move', () => {
        console.log('confirm-move');
        this.chessArr[this.chessArr.length - 1].local = false;
      });
      //胜利
      socket.on('win', (data) => {
        console.log('胜利')
        this.active = false;
        this.showPop = true;
        this.result = '胜利!';
        this.time1 = 0;
        this.time2 = 0;
        this._endTimer();
      });
      //失败
      socket.on('lose', (data) => {
        console.log('失败')
        this.active = false;
        this.showPop = true;
        this.result = '失败!';
        this.time1 = 0;
        this.time2 = 0;
        this._endTimer();
      });
      //重来确认
      socket.on('confirm-restart', (data) => {
        this.chessArr = [];
        this.showPop = false;
        this.waiting = true;
      });
    },
    _clickBoard(e) {
      if (!this.active) {
        return;
      }
      var x = Math.round((e.x - this.$refs.board.offsetLeft) / 48) + 1;
      var y = Math.round((e.y - this.$refs.board.offsetTop) / 48) + 1;
      var exist = false;
      for (var i = 0, len = this.chessArr.length; i < len; i++) {
        if (this.chessArr[i].x == x && this.chessArr[i].y == y) {
          exist = true;
          break;
        }
      }
      if (!exist) {
        this.chessArr.push({
          x: x,
          y: y,
          c: this.color,
          local: true
        });
      }
      this.active = false;
    },
    _confirmStep() {
      var p = this.chessArr[this.chessArr.length - 1];
      this.socket.emit('move', {
        x: p.x,
        y: p.y,
        c: p.c,
        roomid: this.roomid
      });
    },
    _cancelStep() {
      this.chessArr.splice(this.chessArr.length - 1, 1);
      this.active = true;
    },
    _restart() {
      this.socket.emit('restart', { roomid: this.roomid });
    },
    _startTimer(color) {
      clearTimeout(this.timer);
      this.waiting = false;
      if (color == 'black') {
        this.time1 = this.overtime;
        this.time2 = 0;
      } else {
        this.time2 = this.overtime;
        this.time1 = 0;
      }
      this.timer = setInterval(() => {
        if (color == 'black') {
          this.time1 > 0 && --this.time1;
        } else {
          this.time2 > 0 && --this.time2;
        }
      }, 1000);
    },
    _endTimer() {
      clearTimeout(this.timer);
    }
  }
}

</script>
<style lang="scss">
$chessWidth:48px;

.home_w {
  height: 100%;
  min-height: 850px;
  background: url(~@/assets/bg.jpg);
  background-size: 100% 100%;
  overflow: auto;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;

  .timer_w {
    width: 14*$chessWidth;
    height: 140px;
    margin-bottom: 30px;
    display: flex;
    justify-content: space-between;

    .left_w,
    .right_w {
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      align-items: center;
    }

    .icon {
      width: 100px;
      height: 100px;
      border-radius: 50%;
      background-color: #000;
      line-height: 100px;
      text-align: center;
      font-size: 36px;
      color: #fff;
      font-weight: bold;

      &.white {
        color: #000;
        background-color: #fff;
      }
    }

    .timer {
      line-height: 60px;
      color: #333;
      font-size: 40px;
      font-weight: bold;

      &.white {
        color: #fff;
      }
    }
  }

  .board_w {
    position: relative;
    display: flex;
    flex-wrap: wrap;
    width: 14*$chessWidth;
    height: 14*$chessWidth;
    border: 2px solid #333;

    .cell_w {
      width: $chessWidth;
      height: $chessWidth;
      border: 2px solid #333;
      box-sizing: border-box;
    }
    .waiting {
      position: absolute;
      white-space: nowrap;
      font-size: 60px;
      top: 50%;
      left: 50%;
      color: red;
      font-weight: bold;
      transform: translate(-50%,-50%);
    }
  }
}

.chess_w {
  position: absolute;
  width: $chessWidth;
  height: $chessWidth;

  &.last_step {
    border: 2px solid red;
    margin: -2px 0 0 -2px;
  }

  .choice_w {
    position: absolute;
    top: -60px;
    left: 50%;
    margin-left: -75px;
    width: 150px;
    height: 50px;
    display: flex;
    align-items: center;
    justify-content: space-between;

    .btn {
      width: 50px;
      height: 50px;
      border-radius: 50%;
      border: 2px solid #999;
      font-family: 'iconfont';
      font-size: 34px;
      line-height: 50px;
      text-align: center;
      background-color: #fff;

      &.confirm_btn {
        color: green;
      }

      &.cancel_btn {
        color: red;
      }
    }
  }
}

.white-chess {
  width: $chessWidth;
  height: $chessWidth;
  border-radius: 50%;
  background: radial-gradient(15px 15px at 15px 15px, #fff, #d8d8d8);
  box-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
}

.black-chess {
  width: $chessWidth;
  height: $chessWidth;
  border-radius: 50%;
  background: radial-gradient(10px 10px at 15px 15px, #fff, #333);
  box-shadow: 2px 2px 4px rgba(0, 0, 0, 0.4);
}

.win_pop_wrap {
  background-color: #fff;
  border-radius: 8px;
  padding: 40px;

  .w_title {
    margin: 0 auto 40px;
    color: #333;
    font-size: 40px;
    font-weight: bold;
    text-align: center;
  }

  .restart {
    width: 300px;
    height: 60px;
    margin: auto;
    line-height: 60px;
    text-align: center;
    background-color: #4A90E2;
    font-size: 24px;
    color: #fff;
  }
}

</style>
