const ROWS = 4;
const NUMBERS = [2,4];
const MINLEN = 50;
const MOVEINTERVAL = 0.1;

cc.Class({
    extends: cc.Component,

    properties: {
        scoreLab:cc.Label,
        score:0,
        blockPrefab:cc.Prefab,
        interval:20,
        overFrame:cc.Node,
        blockParent:cc.Node
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad:function(){
        this.drawBgBlock();
        this.init();
        cc.systemEvent.on('over',(data)=>{
            this.init();
        });
    },

    drawBgBlock:function()
    {
        this.blockSize = (cc.winSize.width - this.interval * (ROWS+1))/ROWS;
        var x = this.interval + this.blockSize/2;
        let y = this.blockSize;
        this.positions = [];
        for(var i=0;i<ROWS;i++)
        {
            this.positions.push(new Array(ROWS).fill(0));
            for(var j=0;j<ROWS;j++)
            {
                var block = cc.instantiate(this.blockPrefab);
                block.width = this.blockSize;
                block.height = this.blockSize;
                this.blockParent.addChild(block);
                block.setPosition(cc.v2(x,y));
                this.positions[i][j] = cc.v2(x,y);
                block.emit('setNum',0);
                x+=this.interval + this.blockSize;
            }
            x = this.interval + this.blockSize/2;
            y+=this.interval+this.blockSize;
        }
    },

    init:function()
    {
        this.updateScore(0);
        if(this.blocks)
        {
            for(var i =0;i<ROWS;i++)
            {
                for(var j=0;j<ROWS;j++)
                {
                    if(this.blocks[i][j] != null)
                        this.blocks[i][j].destroy();
                }
            }
        }

        this.data = [];
        this.blocks = [];
        for(var i =0;i<ROWS;i++)
        {
            this.blocks.push(new Array(ROWS).fill(null));
            this.data.push(new Array(ROWS).fill(0));
        }

        this.addBlock();
        this.addBlock();
        this.addBlock();
        this.addEventHandler();
    },

    getEmptyLocation:function()
    {
        var locations = [];
        for(var i = 0;i<this.blocks.length;i++)
        {
            for(var j=0;j<this.blocks[i].length;j++)
            {
                if(this.blocks[i][j] == null)
                {
                    locations.push({x:i,y:j});
                }
            }
        }
        return locations;
    },

    updateScore:function(number)
    {
        this.score = number;
        this.scoreLab.string = "分数："+this.score;
    },

    addBlock:function(){
        var locations = this.getEmptyLocation();
        var location = locations[Math.floor(Math.random()*locations.length)];
        if(location.length == 0) return false;

        var x = location.x;
        var y = location.y;
        var position = this.positions[x][y];
        var block = cc.instantiate(this.blockPrefab);
        var num = NUMBERS[Math.floor(Math.random()*NUMBERS.length)];
        block.width = this.blockSize;
        block.height = this.blockSize;
        this.blockParent.addChild(block);
        block.setPosition(position);
        block.emit('setNum',num);
        this.blocks[x][y] = block;
        this.data[x][y] = num;
        return true;
    },

    addEventHandler:function(){
        this.node.on('touchstart',this.touchStart,this);

        this.node.on('touchend',this.touchEnd,this);

        this.node.on('touchcancel',this.touchEnd,this);

    },

    destroyEventHandler:function(){
        this.node.off('touchstart',this.touchStart,this);
        this.node.off('touchend',this.touchEnd,this);
        this.node.off('touchcancel',this.touchEnd,this);

    },

    touchStart:function(event){
        this.startPoint = event.getLocation();
    },

    touchEnd:function(event)
    {
        this.endPoint = event.getLocation();
            
        var vec = this.endPoint.sub(this.startPoint);
        if(vec.mag() > MINLEN)
        {
            if(Math.abs(vec.x) > Math.abs(vec.y))
            {
                if(vec.x >0)
                    this.moveRight();
                else
                    this.moveLeft();
            }
            else
            {
                if(vec.y >0)
                    this.moveUp();
                else
                    this.moveDown();
            }
        }
    },

    checkFail:function(){
        for(var i=0;i<ROWS;i++)
        {
            for(var j=0;j<ROWS;j++)
            {
                var n = this.data[i][j];
                if(n == 0) return false;
                if(i > 0 && n == this.data[i-1][j]) return false; 
                if(i < (ROWS - 1) && n == this.data[i+1][j]) return false; 
                if(j > 0 && n == this.data[i][j-1]) return false; 
                if(j < (ROWS - 1) && n == this.data[i][j+1]) return false; 
                if(n == 2048) return true; 
            }
        }
        return true;
    },

    gameOver:function(){
        this.destroyEventHandler();
        this.overFrame.setPosition(cc.v2(0,0));
    },
    
    afterMove:function(hasMoved){
        if(hasMoved)
        {
            this.addBlock();
            this.updateScore(this.score+1);
        }

        if(this.checkFail())
        {
            this.gameOver();
        }


    },

    moveRight:function()
    {
        cc.log('r');
        var hasMoved = false;
        var toMove = [];
        var move = (x,y,callback) =>{
            if(y == (ROWS - 1) || this.data[x][y] == 0)
            {
                callback && callback();
                return;
            }
            else if(this.data[x][y+1] == 0)
            {
                var block = this.blocks[x][y];
                var position = this.positions[x][y+1];
                this.blocks[x][y] = null;
                this.blocks[x][y+1] = block;
                this.data[x][y+1] = this.data[x][y];
                this.data[x][y] = 0;

                this.doMove(block,position,()=>{
                    move(x,y+1,callback);
                });
                hasMoved = true;
            }
            else if(this.data[x][y+1] == this.data[x][y])
            {

                var block = this.blocks[x][y];
                var position = this.positions[x][y+1];
                this.blocks[x][y] = null;
                this.data[x][y] = 0;
                this.data[x][y+1]*=2;
                this.blocks[x][y+1].emit('setNum',this.data[x][y+1]);
                this.doMove(block,position,()=>{
                    block.destroy();
                    callback && callback();
                });
                hasMoved = true;
            }
            else
            {
                callback && callback();
                return;
            }
        };

        for(var i=0;i<ROWS;i++)
        {
            for(var j=ROWS-1;j>=0;j--)
            {
                if(this.data[i][j] != 0)
                {
                    toMove.push({x:i,y:j});
                }
            }
        }

        var counter = 0;
        for(var i=0;i<toMove.length;i++)
        {
            move(toMove[i].x,toMove[i].y,()=>{
                counter++;
                if(counter == toMove.length)
                {
                    this.afterMove(hasMoved);
                }
            });
        }
    },

    doMove:function(block,position,callback)
    {
        var moveTo = cc.moveTo(MOVEINTERVAL,position);
        var call  = cc.callFunc(()=>{
            callback && callback();
        });
        block.runAction(cc.sequence(moveTo,call));
    },


    moveLeft:function()
    {
        cc.log('l');
        var hasMoved = false;
        var toMove = [];
        var move = (x,y,callback) =>{
            if(y == 0 || this.data[x][y] == 0)
            {
                callback && callback();
                return;
            }
            else if(this.data[x][y-1] == 0)
            {
                var block = this.blocks[x][y];
                var position = this.positions[x][y-1];
                this.blocks[x][y] = null;
                this.blocks[x][y-1] = block;
                this.data[x][y-1] = this.data[x][y];
                this.data[x][y] = 0;

                this.doMove(block,position,()=>{
                    move(x,y-1,callback);
                });
                hasMoved = true;
            }
            else if(this.data[x][y-1] == this.data[x][y])
            {

                var block = this.blocks[x][y];
                var position = this.positions[x][y-1];
                this.blocks[x][y] = null;
                this.data[x][y] = 0;
                this.data[x][y-1]*=2;
                this.blocks[x][y-1].emit('setNum',this.data[x][y-1]);
                this.doMove(block,position,()=>{
                    block.destroy();
                    callback && callback();
                });
                hasMoved = true;
            }
            else
            {
                callback && callback();
                return;
            }
        };

        for(var i=0;i<ROWS;i++)
        {
            for(var j=0;j<ROWS;j++)
            {
                if(this.data[i][j] != 0)
                {
                    toMove.push({x:i,y:j});
                }
            }
        }

        var counter = 0;
        for(var i=0;i<toMove.length;i++)
        {
            move(toMove[i].x,toMove[i].y,()=>{
                counter++;
                if(counter == toMove.length)
                {
                    this.afterMove(hasMoved);
                }
            });
        }
    },
    moveUp:function()
    {
        cc.log('u');
        var hasMoved = false;
        var toMove = [];
        var move = (x,y,callback) =>{
            if(x == (ROWS-1) || this.data[x][y] == 0)
            {
                callback && callback();
                return;
            }
            else if(this.data[x+1][y] == 0)
            {
                var block = this.blocks[x][y];
                var position = this.positions[x+1][y];
                this.blocks[x][y] = null;
                this.blocks[x+1][y] = block;
                this.data[x+1][y] = this.data[x][y];
                this.data[x][y] = 0;

                this.doMove(block,position,()=>{
                    move(x+1,y,callback);
                });
                hasMoved = true;
            }
            else if(this.data[x+1][y] == this.data[x][y])
            {

                var block = this.blocks[x][y];
                var position = this.positions[x+1][y];
                this.blocks[x][y] = null;
                this.data[x][y] = 0;
                this.data[x+1][y]*=2;
                this.blocks[x+1][y].emit('setNum',this.data[x+1][y]);
                this.doMove(block,position,()=>{
                    block.destroy();
                    callback && callback();
                });
                hasMoved = true;
            }
            else
            {
                callback && callback();
                return;
            }
        };

        for(var i=ROWS-1;i>=0;i--)
        {
            for(var j=ROWS-1;j>=0;j--)
            {
                if(this.data[i][j] != 0)
                {
                    toMove.push({x:i,y:j});
                }
            }
        }

        var counter = 0;
        for(var i=0;i<toMove.length;i++)
        {
            move(toMove[i].x,toMove[i].y,()=>{
                counter++;
                if(counter == toMove.length)
                {
                    this.afterMove(hasMoved);
                }
            });
        }
    },
    moveDown:function()
    {
        cc.log('d');
        var hasMoved = false;
        var toMove = [];
        var move = (x,y,callback) =>{
            if(x == 0 || this.data[x][y] == 0)
            {
                callback && callback();
                return;
            }
            else if(this.data[x-1][y] == 0)
            {
                var block = this.blocks[x][y];
                var position = this.positions[x-1][y];
                this.blocks[x][y] = null;
                this.blocks[x-1][y] = block;
                this.data[x-1][y] = this.data[x][y];
                this.data[x][y] = 0;

                this.doMove(block,position,()=>{
                    move(x-1,y,callback);
                });
                hasMoved = true;
            }
            else if(this.data[x-1][y] == this.data[x][y])
            {

                var block = this.blocks[x][y];
                var position = this.positions[x-1][y];
                this.blocks[x][y] = null;
                this.data[x][y] = 0;
                this.data[x-1][y]*=2;
                this.blocks[x-1][y].emit('setNum',this.data[x-1][y]);
                this.doMove(block,position,()=>{
                    block.destroy();
                    callback && callback();
                });
                hasMoved = true;
            }
            else
            {
                callback && callback();
                return;
            }
        };

        for(var i=0;i<ROWS;i++)
        {
            for(var j=ROWS-1;j>=0;j--)
            {
                if(this.data[i][j] != 0)
                {
                    toMove.push({x:i,y:j});
                }
            }
        }

        var counter = 0;
        for(var i=0;i<toMove.length;i++)
        {
            move(toMove[i].x,toMove[i].y,()=>{
                counter++;
                if(counter == toMove.length)
                {
                    this.afterMove(hasMoved);
                }
            });
        }
    },

    // update (dt) {},
});
