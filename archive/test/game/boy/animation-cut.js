var bcut = [0,0,128,128];
var move = DOBUKI.model.player.action;
var frameCount = move.dx==0 && move.dy==0 ? 1 : 4;
var frame = Math.floor(DOBUKI.time / 100) % frameCount;
var c = frame % 2;
var r = Math.floor(frame/2);
bcut[0] = c*128;
bcut[1] = r*128;

return bcut;
