import colors from './color';
cc.Class({
    extends: cc.Component,

    properties: {
        numberLab:cc.Label
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        this.node.on('setNum',this.setNum.bind(this))

    },

    start () {

    },

    setNum(number)
    {
        if(number == 0)
        {
            this.numberLab.node.active = false;
        }
        this.numberLab.string = number;
        if(number in colors)
        {
            this.node.color = colors[number];
        }

        
    }

    // update (dt) {},
});
