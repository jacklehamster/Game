var move = DOBUKI.model.player.action;
if(move.dx!=0) {
    move.lastDX = move.dx;
}

if(move.dy>0) {
    return 'boy/boy-walk-up.png';
} else if(move.dy<0) {
    return 'boy/boy-walk-down.png';
} else if(move.dx<0) {
    return 'boy/boy-walk-left.png';
} else if(move.dx>0) {
    return 'boy/boy-walk-right.png';
}

return move.lastDX <=0 ? 'boy/boy.png' : 'boy/boy-still-right.png';
