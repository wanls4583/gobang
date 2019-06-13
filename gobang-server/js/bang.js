module.exports = class Bang {
    constructor(server) {
        this.init();
    }
    //初始化
    init() {
        this.creater = [];
        this.joiner = [];
        for (var i = 0; i < 15; i++) {
            this.creater[i] = [];
            this.joiner[i] = [];
            for (var j = 0; j < 15; j++) {
                this.creater[i][j] = false;
                this.joiner[i][j] = false;
            }
        }
    }
    //重来
    restart(ifCreater) {
        if (ifCreater) {
            this.createrReady = true;
        } else {
            this.joinerReady = true;
        }
    }
    //落子
    step(data, ifCreater) {
        if (ifCreater) {
            this.creater[data.y][data.x] = true;
        } else {
            this.joiner[data.y][data.x] = true;
        }
        var result = this.check(data, ifCreater);
        if (result) {
            this.init();
            this.createrReady = false;
            this.joinerReady = false;
        }
        return result;
    }
    //落子超时
    overtime() {
        this.init();
        this.createrReady = false;
        this.joinerReady = false;
    }
    //检查是否已经5珠成线
    check(data, ifCreater) {
        var obj = ifCreater ? this.creater : this.joiner;
        var count;
        //横向
        count = 1;
        for (var i = data.x - 1; i >= 0; i--) {
            if (obj[data.y][i]) {
                count++;
            } else {
                break;
            }
        }
        if (count >= 5) {
            return true;
        }
        for (var i = data.x + 1; i < 15; i++) {
            if (obj[data.y][i]) {
                count++;
            } else {
                break;
            }
        }
        if (count >= 5) {
            return true;
        }
        //纵向
        count = 1;
        for (var i = data.y - 1; i >= 0; i--) {
            if (obj[i][data.x]) {
                count++;
            } else {
                break;
            }
        }
        if (count >= 5) {
            return true;
        }
        for (var i = data.y + 1; i < 15; i++) {
            if (obj[i][data.x]) {
                count++;
            } else {
                break;
            }
        }
        if (count >= 5) {
            return true;
        }
        //正斜
        count = 1;
        for (var i = data.y - 1, j = data.x + 1; i >= 0, j < 15; i--, j++) {
            if (obj[i][j]) {
                count++;
            } else {
                break;
            }
        }
        if (count >= 5) {
            return true;
        }
        for (var i = data.y + 1, j = data.x - 1; i < 15, j >= 0; i++, j--) {
            if (obj[i][j]) {
                count++;
            } else {
                break;
            }
        }
        if (count >= 5) {
            return true;
        }
        //反斜
        count = 1;
        for (var i = data.y - 1, j = data.x - 1; i >= 0, j >= 0; i--, j--) {
            if (obj[i][j]) {
                count++;
            } else {
                break;
            }
        }
        if (count >= 5) {
            return true;
        }
        for (var i = data.y + 1, j = data.x + 1; i < 15, j < 15; i++, j++) {
            if (obj[i][j]) {
                count++;
            } else {
                break;
            }
        }
        if (count >= 5) {
            return true;
        }
    }
}