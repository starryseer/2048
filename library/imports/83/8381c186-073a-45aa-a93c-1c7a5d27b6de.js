"use strict";
cc._RF.push(module, '8381cGGBzpFqqk8HHpdJ7be', 'overFrame');
// script/overFrame.js

'use strict';

cc.Class({
    extends: cc.Component,

    properties: {},

    // onLoad () {},

    start: function start() {},


    onButtonClick: function onButtonClick(target, customerData) {
        cc.systemEvent.emit('over', {});
        this.node.setPosition(cc.v2(720, 0));
    }

    // update (dt) {},
});

cc._RF.pop();