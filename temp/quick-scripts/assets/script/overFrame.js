(function() {"use strict";var __module = CC_EDITOR ? module : {exports:{}};var __filename = 'preview-scripts/assets/script/overFrame.js';var __require = CC_EDITOR ? function (request) {return cc.require(request, require);} : function (request) {return cc.require(request, __filename);};function __define (exports, require, module) {"use strict";
cc._RF.push(module, '8381cGGBzpFqqk8HHpdJ7be', 'overFrame', __filename);
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
        //# sourceMappingURL=overFrame.js.map
        