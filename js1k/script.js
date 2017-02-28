var canvas = document.getElementsByTagName("canvas")[0];
var div = 3;
canvas.width /= div; canvas.height /= div;
var ctx = canvas.getContext("2d");
var imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
var data = imageData.data;
for(var i=0; i<data.length;i+=4) {
    data[i]     = Math.floor(Math.random()*255);     // red
    data[i + 1] = Math.floor(Math.random()*255); // green
    data[i + 2] = Math.floor(Math.random()*255); // blue
    data[i+3] = 255;
}
var prex,prey;
document.addEventListener("mousemove",
    function(e) {
        mouseTo(e.pageX/div,e.pageY/div);
    }
);
document.addEventListener("touchmove",
    function(e) {
        mouseTo(e.touches[0].pageX/div,e.touches[0].pageY/div);
    }
);

function mouseTo(x,y) {
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 10;
    ctx.lineCap = ctx.lineJoin = "round";
    ctx.beginPath();
    ctx.moveTo(prex,prey);
    ctx.lineTo(x,y);
    ctx.stroke();
    imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    data = imageData.data;
    prex = x;
    prey = y;
}

function loop() {
    for(var i=0; i<data.length;i+=4) {
        for(var c=0;c<3;c++) {
            var x = Math.floor(Math.random()*5)-2;
            var y = Math.floor(Math.random()*5)-2;
            move(data, i+c, i+c+(x*4 + y*canvas.width*4 + canvas.width*canvas.height*4)%(canvas.height*canvas.width*4));
        }
    }
    ctx.putImageData(imageData, 0, 0);
    requestAnimationFrame(loop);
}
loop();

function move(data, a, b) {
    if(data[b]>data[a]) {
        data[a] = data[b];
        data[b] >>=1;
    }
}