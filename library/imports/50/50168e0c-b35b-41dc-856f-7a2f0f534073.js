"use strict";
cc._RF.push(module, '501684Ms1tB3IVvei8PU0Bz', 'block');
// script/block.js

'use strict';

var _color = require('./color');

var _color2 = _interopRequireDefault(_color);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

cc.Class({
    extends: cc.Component,

    properties: {
        numberLab: cc.Label
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad: function onLoad() {
        this.node.on('setNum', this.setNum.bind(this));
    },
    start: function start() {},
    setNum: function setNum(number) {
        if (number == 0) {
            this.numberLab.node.active = false;
        }
        this.numberLab.string = number;
        if (number in _color2.default) {
            this.node.color = _color2.default[number];
        }
    }

    // update (dt) {},

});

cc._RF.pop();