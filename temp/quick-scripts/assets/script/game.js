(function() {"use strict";var __module = CC_EDITOR ? module : {exports:{}};var __filename = 'preview-scripts/assets/script/game.js';var __require = CC_EDITOR ? function (request) {return cc.require(request, require);} : function (request) {return cc.require(request, __filename);};function __define (exports, require, module) {"use strict";
cc._RF.push(module, 'a3304PmriJHe5QzABfAaego', 'game', __filename);
// script/game.js

'use strict';

var ROWS = 4;
var NUMBERS = [2, 4];
var MINLEN = 50;
var MOVEINTERVAL = 0.1;

cc.Class({
    extends: cc.Component,

    properties: {
        scoreLab: cc.Label,
        score: 0,
        blockPrefab: cc.Prefab,
        interval: 20,
        overFrame: cc.Node,
        blockParent: cc.Node
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad: function onLoad() {
        var _this = this;

        this.drawBgBlock();
        this.init();
        cc.systemEvent.on('over', function (data) {
            _this.init();
        });
    },

    drawBgBlock: function drawBgBlock() {
        this.blockSize = (cc.winSize.width - this.interval * (ROWS + 1)) / ROWS;
        var x = this.interval + this.blockSize / 2;
        var y = this.blockSize;
        this.positions = [];
        for (var i = 0; i < ROWS; i++) {
            this.positions.push(new Array(ROWS).fill(0));
            for (var j = 0; j < ROWS; j++) {
                var block = cc.instantiate(this.blockPrefab);
                block.width = this.blockSize;
                block.height = this.blockSize;
                this.blockParent.addChild(block);
                block.setPosition(cc.v2(x, y));
                this.positions[i][j] = cc.v2(x, y);
                block.emit('setNum', 0);
                x += this.interval + this.blockSize;
            }
            x = this.interval + this.blockSize / 2;
            y += this.interval + this.blockSize;
        }
    },

    init: function init() {
        this.updateScore(0);
        if (this.blocks) {
            for (var i = 0; i < ROWS; i++) {
                for (var j = 0; j < ROWS; j++) {
                    if (this.blocks[i][j] != null) this.blocks[i][j].destroy();
                }
            }
        }

        this.data = [];
        this.blocks = [];
        for (var i = 0; i < ROWS; i++) {
            this.blocks.push(new Array(ROWS).fill(null));
            this.data.push(new Array(ROWS).fill(0));
        }

        this.addBlock();
        this.addBlock();
        this.addBlock();
        this.addEventHandler();
    },

    getEmptyLocation: function getEmptyLocation() {
        var locations = [];
        for (var i = 0; i < this.blocks.length; i++) {
            for (var j = 0; j < this.blocks[i].length; j++) {
                if (this.blocks[i][j] == null) {
                    locations.push({ x: i, y: j });
                }
            }
        }
        return locations;
    },

    updateScore: function updateScore(number) {
        this.score = number;
        this.scoreLab.string = "分数：" + this.score;
    },

    addBlock: function addBlock() {
        var locations = this.getEmptyLocation();
        var location = locations[Math.floor(Math.random() * locations.length)];
        if (location.length == 0) return false;

        var x = location.x;
        var y = location.y;
        var position = this.positions[x][y];
        var block = cc.instantiate(this.blockPrefab);
        var num = NUMBERS[Math.floor(Math.random() * NUMBERS.length)];
        block.width = this.blockSize;
        block.height = this.blockSize;
        this.blockParent.addChild(block);
        block.setPosition(position);
        block.emit('setNum', num);
        this.blocks[x][y] = block;
        this.data[x][y] = num;
        return true;
    },

    addEventHandler: function addEventHandler() {
        this.node.on('touchstart', this.touchStart, this);

        this.node.on('touchend', this.touchEnd, this);

        this.node.on('touchcancel', this.touchEnd, this);
    },

    destroyEventHandler: function destroyEventHandler() {
        this.node.off('touchstart', this.touchStart, this);
        this.node.off('touchend', this.touchEnd, this);
        this.node.off('touchcancel', this.touchEnd, this);
    },

    touchStart: function touchStart(event) {
        this.startPoint = event.getLocation();
    },

    touchEnd: function touchEnd(event) {
        this.endPoint = event.getLocation();

        var vec = this.endPoint.sub(this.startPoint);
        if (vec.mag() > MINLEN) {
            if (Math.abs(vec.x) > Math.abs(vec.y)) {
                if (vec.x > 0) this.moveRight();else this.moveLeft();
            } else {
                if (vec.y > 0) this.moveUp();else this.moveDown();
            }
        }
    },

    checkFail: function checkFail() {
        for (var i = 0; i < ROWS; i++) {
            for (var j = 0; j < ROWS; j++) {
                var n = this.data[i][j];
                if (n == 0) return false;
                if (i > 0 && n == this.data[i - 1][j]) return false;
                if (i < ROWS - 1 && n == this.data[i + 1][j]) return false;
                if (j > 0 && n == this.data[i][j - 1]) return false;
                if (j < ROWS - 1 && n == this.data[i][j + 1]) return false;
                if (n == 2048) return true;
            }
        }
        return true;
    },

    gameOver: function gameOver() {
        this.destroyEventHandler();
        this.overFrame.setPosition(cc.v2(0, 0));
    },

    afterMove: function afterMove(hasMoved) {
        if (hasMoved) {
            this.addBlock();
            this.updateScore(this.score + 1);
        }

        if (this.checkFail()) {
            this.gameOver();
        }
    },

    moveRight: function moveRight() {
        var _this2 = this;

        cc.log('r');
        var hasMoved = false;
        var toMove = [];
        var move = function move(x, y, callback) {
            if (y == ROWS - 1 || _this2.data[x][y] == 0) {
                callback && callback();
                return;
            } else if (_this2.data[x][y + 1] == 0) {
                var block = _this2.blocks[x][y];
                var position = _this2.positions[x][y + 1];
                _this2.blocks[x][y] = null;
                _this2.blocks[x][y + 1] = block;
                _this2.data[x][y + 1] = _this2.data[x][y];
                _this2.data[x][y] = 0;

                _this2.doMove(block, position, function () {
                    move(x, y + 1, callback);
                });
                hasMoved = true;
            } else if (_this2.data[x][y + 1] == _this2.data[x][y]) {

                var block = _this2.blocks[x][y];
                var position = _this2.positions[x][y + 1];
                _this2.blocks[x][y] = null;
                _this2.data[x][y] = 0;
                _this2.data[x][y + 1] *= 2;
                _this2.blocks[x][y + 1].emit('setNum', _this2.data[x][y + 1]);
                _this2.doMove(block, position, function () {
                    block.destroy();
                    callback && callback();
                });
                hasMoved = true;
            } else {
                callback && callback();
                return;
            }
        };

        for (var i = 0; i < ROWS; i++) {
            for (var j = ROWS - 1; j >= 0; j--) {
                if (this.data[i][j] != 0) {
                    toMove.push({ x: i, y: j });
                }
            }
        }

        var counter = 0;
        for (var i = 0; i < toMove.length; i++) {
            move(toMove[i].x, toMove[i].y, function () {
                counter++;
                if (counter == toMove.length) {
                    _this2.afterMove(hasMoved);
                }
            });
        }
    },

    doMove: function doMove(block, position, callback) {
        var moveTo = cc.moveTo(MOVEINTERVAL, position);
        var call = cc.callFunc(function () {
            callback && callback();
        });
        block.runAction(cc.sequence(moveTo, call));
    },

    moveLeft: function moveLeft() {
        var _this3 = this;

        cc.log('l');
        var hasMoved = false;
        var toMove = [];
        var move = function move(x, y, callback) {
            if (y == 0 || _this3.data[x][y] == 0) {
                callback && callback();
                return;
            } else if (_this3.data[x][y - 1] == 0) {
                var block = _this3.blocks[x][y];
                var position = _this3.positions[x][y - 1];
                _this3.blocks[x][y] = null;
                _this3.blocks[x][y - 1] = block;
                _this3.data[x][y - 1] = _this3.data[x][y];
                _this3.data[x][y] = 0;

                _this3.doMove(block, position, function () {
                    move(x, y - 1, callback);
                });
                hasMoved = true;
            } else if (_this3.data[x][y - 1] == _this3.data[x][y]) {

                var block = _this3.blocks[x][y];
                var position = _this3.positions[x][y - 1];
                _this3.blocks[x][y] = null;
                _this3.data[x][y] = 0;
                _this3.data[x][y - 1] *= 2;
                _this3.blocks[x][y - 1].emit('setNum', _this3.data[x][y - 1]);
                _this3.doMove(block, position, function () {
                    block.destroy();
                    callback && callback();
                });
                hasMoved = true;
            } else {
                callback && callback();
                return;
            }
        };

        for (var i = 0; i < ROWS; i++) {
            for (var j = 0; j < ROWS; j++) {
                if (this.data[i][j] != 0) {
                    toMove.push({ x: i, y: j });
                }
            }
        }

        var counter = 0;
        for (var i = 0; i < toMove.length; i++) {
            move(toMove[i].x, toMove[i].y, function () {
                counter++;
                if (counter == toMove.length) {
                    _this3.afterMove(hasMoved);
                }
            });
        }
    },
    moveUp: function moveUp() {
        var _this4 = this;

        cc.log('u');
        var hasMoved = false;
        var toMove = [];
        var move = function move(x, y, callback) {
            if (x == ROWS - 1 || _this4.data[x][y] == 0) {
                callback && callback();
                return;
            } else if (_this4.data[x + 1][y] == 0) {
                var block = _this4.blocks[x][y];
                var position = _this4.positions[x + 1][y];
                _this4.blocks[x][y] = null;
                _this4.blocks[x + 1][y] = block;
                _this4.data[x + 1][y] = _this4.data[x][y];
                _this4.data[x][y] = 0;

                _this4.doMove(block, position, function () {
                    move(x + 1, y, callback);
                });
                hasMoved = true;
            } else if (_this4.data[x + 1][y] == _this4.data[x][y]) {

                var block = _this4.blocks[x][y];
                var position = _this4.positions[x + 1][y];
                _this4.blocks[x][y] = null;
                _this4.data[x][y] = 0;
                _this4.data[x + 1][y] *= 2;
                _this4.blocks[x + 1][y].emit('setNum', _this4.data[x + 1][y]);
                _this4.doMove(block, position, function () {
                    block.destroy();
                    callback && callback();
                });
                hasMoved = true;
            } else {
                callback && callback();
                return;
            }
        };

        for (var i = ROWS - 1; i >= 0; i--) {
            for (var j = ROWS - 1; j >= 0; j--) {
                if (this.data[i][j] != 0) {
                    toMove.push({ x: i, y: j });
                }
            }
        }

        var counter = 0;
        for (var i = 0; i < toMove.length; i++) {
            move(toMove[i].x, toMove[i].y, function () {
                counter++;
                if (counter == toMove.length) {
                    _this4.afterMove(hasMoved);
                }
            });
        }
    },
    moveDown: function moveDown() {
        var _this5 = this;

        cc.log('d');
        var hasMoved = false;
        var toMove = [];
        var move = function move(x, y, callback) {
            if (x == 0 || _this5.data[x][y] == 0) {
                callback && callback();
                return;
            } else if (_this5.data[x - 1][y] == 0) {
                var block = _this5.blocks[x][y];
                var position = _this5.positions[x - 1][y];
                _this5.blocks[x][y] = null;
                _this5.blocks[x - 1][y] = block;
                _this5.data[x - 1][y] = _this5.data[x][y];
                _this5.data[x][y] = 0;

                _this5.doMove(block, position, function () {
                    move(x - 1, y, callback);
                });
                hasMoved = true;
            } else if (_this5.data[x - 1][y] == _this5.data[x][y]) {

                var block = _this5.blocks[x][y];
                var position = _this5.positions[x - 1][y];
                _this5.blocks[x][y] = null;
                _this5.data[x][y] = 0;
                _this5.data[x - 1][y] *= 2;
                _this5.blocks[x - 1][y].emit('setNum', _this5.data[x - 1][y]);
                _this5.doMove(block, position, function () {
                    block.destroy();
                    callback && callback();
                });
                hasMoved = true;
            } else {
                callback && callback();
                return;
            }
        };

        for (var i = 0; i < ROWS; i++) {
            for (var j = ROWS - 1; j >= 0; j--) {
                if (this.data[i][j] != 0) {
                    toMove.push({ x: i, y: j });
                }
            }
        }

        var counter = 0;
        for (var i = 0; i < toMove.length; i++) {
            move(toMove[i].x, toMove[i].y, function () {
                counter++;
                if (counter == toMove.length) {
                    _this5.afterMove(hasMoved);
                }
            });
        }
    }

    // update (dt) {},
});

cc._RF.pop();
        }
        if (CC_EDITOR) {
            __define(__module.exports, __require, __module);
        }
        else {
            cc.registerModuleFunc(__filename, function () {
                __define(__module.exports, __require, __module);
            });
        }
        })();
        //# sourceMappingURL=game.js.map
        