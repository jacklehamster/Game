var cA = document.getElementsByTagName("canvas")[0];
var Q = 4;
cA.width /= Q; cA.height /= Q;
var C = cA.getContext("2d");
var iD = C.getImageData(0, 0, cA.width, cA.height);
var data = iD.data;
for(var i=0; i<data.length;i++) {
    data[i]     = i%4==3?255: Math.floor(Math.random()*255);
}
var prex,prey;
document.addEventListener("mousemove",
    function(e) {
        mT(e.pageX/Q,e.pageY/Q);
    }
);
document.addEventListener("touchmove",
    function(e) {
        mT(e.touches[0].pageX/Q,e.touches[0].pageY/Q);
    }
);

function mT(x, y) {
    C.strokeStyle = "#ffffff";
    C.lineWidth = 10;
    C.lineCap = C.lineJoin = "round";
    C.beginPath();
    C.moveTo(prex,prey);
    C.lineTo(x,y);
    C.stroke();
    iD = C.getImageData(0, 0, cA.width, cA.height);
    data = iD.data;
    prex = x;
    prey = y;
}

function loop() {
    for(var i=0; i<data.length;i+=4) {
        for(var c=0;c<3;c++) {
            var x = Math.floor(Math.random()*5)-2;
            var y = Math.floor(Math.random()*5)-2;
            M(data, i+c, i+c+(x*4 + y*cA.width*4 + cA.width*cA.height*4)%(cA.height*cA.width*4));
        }
    }
    C.putImageData(iD, 0, 0);
    requestAnimationFrame(loop);
}
loop();

function M(data, a, b) {
    if(data[b]>data[a]) {
        data[a] = data[b];
        data[b] >>=1;
    }
}