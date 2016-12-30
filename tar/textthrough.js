var count = Math.floor((DOBUKI.time-(this.startCount||0)) / 20) + 0;
var returnedText;
for(var i=0;i<this.narrative.length;i++) {
    var text = this.narrative[i];
    var speed = 7;
    if(count/speed<text.length) {
        returnedText = text.substr(0,Math.floor(count/speed));
        break;
    } else {
        count -= speed*text.length;
    }
    
    if(count<100) {
        returnedText = text;
        break;
    } else {
        count -= 100;
    }
    
    if(i<this.narrative.length-1) {
    } else {
        this.startCount = DOBUKI.time;
    }
}
return returnedText;