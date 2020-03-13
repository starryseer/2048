cc.Class({
    extends: cc.Component,

    properties: {
        
    },

    // onLoad () {},

    start () {

    },

    onButtonClick:function(target,customerData){
        cc.systemEvent.emit('over',{});
        this.node.setPosition(cc.v2(720,0));
    }

    // update (dt) {},
});
