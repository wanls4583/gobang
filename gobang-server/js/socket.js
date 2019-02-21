const HAS_EXIST_ROOM = 1;
const NOT_EXIST_ROOM = '2';
const LEAVE_ROOM = 3; //对方已经离开房间

const uuidV1 = require('uuid/v1');
const Bang = require('./bang.js');

const PRE_FIX = 'room_';

module.exports = {
    init(server) {
        var io = require('socket.io')(server);
        this.rooms = [];
        this.overtime = 10;
        io.on('connection', (socket) => {
            console.log('connection');
            this.creatRoomEvent(socket);
            this.joinRoomEvent(socket);
            this.leaveRoomEvent(socket);
            this.moveEvent(socket);
            this.restartEvent(socket);
        });
    },
    //创建对局
    creatRoomEvent(socket) {
        socket.on('create-room', (data) => {
            console.log('create-room', data);
            var roomid = data.roomid;
            if (!this.rooms[PRE_FIX + roomid]) {
                this.rooms.push(roomid);
                this.rooms[PRE_FIX + roomid] = {
                    creater: {
                        user: data.user || uuidV1(),
                        socket: socket
                    },
                    bang: new Bang()
                }
                socket.emit('confirm-create', { color: 'black', overtime: this.overtime });
            } else {
                socket.emit('error', { code: HAS_EXIST_ROOM });
                socket.disconnect();
            }
        });
    },
    //加入对局
    joinRoomEvent(socket) {
        socket.on('join-room', (data) => {
            console.log('join-room', data);
            var roomid = data.roomid;
            var room = this.rooms[PRE_FIX + roomid];
            if (room) {
                room.joinner = {
                    user: data.user || uuidV1(),
                    socket: socket
                }
                room.creater.socket.emit('start', {color: 'black'});
                room.now = this.rooms[PRE_FIX + roomid].creater;
                socket.emit('confirm-join', { color: 'white', overtime: this.overtime });
                room.joinner.socket.emit('time', {color: 'black'});
                this.startTimer(room);
            } else {
                socket.emit('error', { code: NOT_EXIST_ROOM });
                socket.disconnect();
            }
        })
    },
    //离开
    leaveRoomEvent(socket) {
        socket.on('disconnect', () => {
            console.log('disconnect');
            for (var i = 0; i < this.rooms.length; i++) {
                var room = this.rooms[PRE_FIX + this.rooms[i]];
                if (room.creater.socket == socket) {
                    if (room.joinner) {
                        room.joinner.socket.disconnect();
                        this.rooms[PRE_FIX + this.rooms[i]] = null;
                        this.rooms.splice(i, 1);
                        this.endTimer(room);
                        break;
                    }
                } else {
                    room.creater.socket.disconnect();
                    this.rooms[PRE_FIX + this.rooms[i]] = null;
                    this.rooms.splice(i, 1);
                    this.endTimer(room);
                    break;
                }
            }
        });
    },
    //落子
    moveEvent(socket) {
        socket.on('move', (data) => {
            console.log('move', data);
            var roomid = data.roomid;
            var room = this.rooms[PRE_FIX + roomid];
            if (!room) {
                console.log('disconnect');
                socket.emit('error', { code: LEAVE_ROOM });
                socket.disconnect();
                return;
            }
            socket.emit('confirm-move');
            if (socket == room.creater.socket && room.now != room.joinner) {
                console.log('emit ready1');
                room.joinner.socket.emit('ready', data); //通知对方准备落子
                room.creater.socket.emit('time', {color: 'white'});
                room.now = room.joinner;
                if (room.bang.step(data, true)) { //创建者方胜利
                    console.log('emit creater win');
                    room.creater.socket.emit('win');
                    room.joinner.socket.emit('lose');
                    this.endTimer(room);
                } else {
                    this.startTimer(room);
                }
            } else if (room.now != room.creater) {
                console.log('emit ready2');
                room.creater.socket.emit('ready', data); //通知对方准备落子
                room.joinner.socket.emit('time', {color: 'black'});
                room.now = room.creater;
                this.startTimer(room);
                if (room.bang.step(data)) { //加入者方胜利
                    console.log('emit joinner win');
                    room.joinner.socket.emit('win');
                    room.creater.socket.emit('lose');
                    this.endTimer(room);
                } else {
                    this.startTimer(room);
                }
            }
        });
    },
    //重新开始
    restartEvent(socket) {
        socket.on('restart', (data) => {
            console.log('move', data);
            var roomid = data.roomid;
            var room = this.rooms[PRE_FIX + roomid];
            socket.emit('confirm-restart');
            if (socket == room.creater.socket) { //创建者准备就绪
                room.bang.restart(true);
                if (room.bang.joinerReady) {
                    room.now = room.creater;
                    this.startTimer(room);
                    room.creater.socket.emit('start', {color: 'black'});
                    room.joinner.socket.emit('time', {color: 'black'});
                }
            } else { //加入准备就绪
                room.bang.restart();
                if (room.bang.createrReady) {
                    room.now = room.creater;
                    this.startTimer(room);
                    room.creater.socket.emit('start', {color: 'black'});
                    room.joinner.socket.emit('time', {color: 'black'});
                }
            }
        });
    },
    //设置定时器
    startTimer(room) {
        clearTimeout(room.timer);
        room.timer = setTimeout(() => {
            if (room.now == room.creater) {
                console.log('emit creater overtime');
                room.creater.socket.emit('overtime');
                room.creater.socket.emit('lose');
                room.joinner.socket.emit('win');
            } else {
                console.log('emit joinner overtime');
                room.joinner.socket.emit('overtime');
                room.joinner.socket.emit('lose');
                room.creater.socket.emit('win');
            }
        }, this.overtime * 1000);
    },
    endTimer(room) {
        clearTimeout(room.timer);
    }
}