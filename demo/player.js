var dx=0, dz=0, drot=0;
var keyboard = DOBUKI.model.keyboard;

if(keyboard.pressed[87] || keyboard.pressed[38]) {  //w
    dz --;
}
if(keyboard.pressed[83] || keyboard.pressed[40]) {  //s
    dz ++;
}
if(keyboard.pressed[65]) {  //a
    dx --;
}
if(keyboard.pressed[68]) {  //d
    dx ++;
}
if(keyboard.pressed[81] || keyboard.pressed[37]) {  //q
    drot ++;
}
if(keyboard.pressed[69] || keyboard.pressed[39]) {  //e
    drot --;
}
this.rotation.y += drot*Math.PI/64;
var realDZ = Math.cos(this.rotation.y) * dz - Math.sin(this.rotation.y) * dx;
var realDX = Math.cos(this.rotation.y) * dx + Math.sin(this.rotation.y) * dz;
this.position.x += realDX*5;
this.position.z += realDZ*5;
