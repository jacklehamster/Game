var dialog = DOBUKI.model.dialog;

var dur = DOBUKI.time - dialog.start;

var speed = 50;
var pause = 1500;

if(dialog.discussion) {
    for(var i=0; i<dialog.discussion.length; i++) {
        if(dur < dialog.discussion[i].length*speed) {
            dialog.text = (i>0?dialog.discussion[i-1]+"\n":"") + dialog.discussion[i].substr(0,Math.floor(dur/speed));
            return;
        } else if(dur < dialog.discussion[i].length*speed + pause) {
            dialog.text = (i>0?dialog.discussion[i-1]+"\n":"") + dialog.discussion[i];
            return;
        }
        dur -= pause + dialog.discussion[i].length*speed;
    }
    if (dur < pause*3)
       dialog.text = (dialog.discussion.length>1?dialog.discussion[dialog.discussion.length-2]+"\n":"") + dialog.discussion[dialog.discussion.length-1];
    else
        dialog.text = null;
}



//console.log(this.parent.text.text);