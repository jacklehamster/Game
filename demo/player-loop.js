if(DOBUKI.model.player.locked) {
   return;
}

var goalX = this.parent.position.x + this.parent.action.dx;
var goalY = this.parent.position.y + this.parent.action.dy;

function isBlock(x,y) {
    var ground = DOBUKI.model.map.objects.a(Math.round((x-12)/50),Math.round(y/50));
    var tile = ground ? DOBUKI.model.map.tiles[ground.tile] : null;
    if(!tile || tile.block) {
        return {block:ground};
    }
    
    var ground = DOBUKI.model.map.objects.a(Math.round((x+12)/50),Math.round(y/50));
    var tile = ground ? DOBUKI.model.map.tiles[ground.tile] : null;
    if(!tile || tile.block) {
        return {block:ground};
    }
    return false;
}

var blockX = isBlock(goalX,this.parent.position.y);
var blockY = isBlock(this.parent.position.x,goalY);
var blockXY = isBlock(goalX,goalY);

/*
if(blockY && blockY.block && blockY.block.collision) {
    if(!blockY.block.collision.start) {
        blockY.block.collision.start = DOBUKI.time;
    }
    
    if(!blockY.block.collision.collided) {
        blockY = false;
    }
}

if(blockX && blockX.block && blockX.block.collision) {
    if(!blockX.block.collision.start) {
        blockX.block.collision.start = DOBUKI.time;
    }
    if(!blockX.block.collision.collided) {
        blockX = false;
    }
}

if(blockXY && blockXY.block && blockXY.block.collision) {
    if(!blockXY.block.collision.start) {
        blockXY.block.collision.start = DOBUKI.time;
    }
    if(!blockXY.block.collision.collided) {
        blockXY = false;
    }
}*/
var blocker = (blockXY?blockXY.block:null)||(blockX?blockX.block:null)||(blockY?blockY.block:null);
var state = blocker ? DOBUKI.model.state[blocker.tile+","+blocker.x+","+blocker.y] : null;
if(state && state.unblock) {
    if(blockY && blockY.block===blocker) {
        blockY = false;
    }
    if(blockX && blockX.block===blocker) {
        blockX = false;
    }
    if(blockXY && blockXY.block===blocker) {
        blockXY = false;
    }
}

if(!blockXY && (!blockX || !blockY)) {
  this.parent.position.x = goalX;
  this.parent.position.y = goalY;    
  this.parent.position.z = -this.parent.position.y;
} else if(!blockX && goalX != this.parent.position.x) {
  this.parent.position.x = goalX;
} else if(!blockY && goalY != this.parent.position.y) {
  this.parent.position.y = goalY;
  this.parent.position.z = -this.parent.position.y;
} else {
    if(blocker) {
        console.log(blocker.tile+","+blocker.x+","+blocker.y);
        if(state) {
            var cutt = DOBUKI.model.view.objects[0].objects.a(blocker.x,blocker.y).frame.cut[0]/32;
            if(cutt<2) {
                if(state) {
                    state.state = cutt+1;
                }
                DOBUKI.model.view.objects[0].objects.a(blocker.x,blocker.y).frame.cut[0]=(cutt+1)*32;
                if(state.state==2) {
                    state.unblock = true;
                }
            }
        }
    }
}
