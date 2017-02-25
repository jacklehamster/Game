var canvas = document.getElementsByTagName("canvas")[0];
var ctx = canvas.getContext("2d");
var time = 0;
var nop = function() {};
var loop = nop;
var preNext = nop;
var loadGameFunction;
var skip = location.search.indexOf("skip") > 0;

var sounds = {
    collect: new Audio('media/collect.ogg'),
    hit: new Audio('media/hit.ogg'),
    jump: new Audio('media/jump.ogg'),
    shoot: new Audio('media/shoot.ogg'),
};

var state = {
    name: "",
    slots: [],
};

function clearCanvas() {
    ctx.clearRect(0,0,canvas.width,canvas.height);
    makeBackground();
}
function nextScene() {
    loop = nop;
    preNext(); preNext = nop;
    sceneIndex = Math.min(scenes.length-1, sceneIndex+1);
    scenes[sceneIndex]();
}
function loadGame(savedState) {
    loop = nop;
    preNext(); preNext = nop;

    state = savedState;
    sceneIndex = scenes.indexOf(loadGameFunction);
    loadGameFunction(true);
}
function startOver() {
    state.name = "";
    state.slots = [];
    loop = nop;
    preNext(); preNext = nop;
    sceneIndex = 0;
    scenes[sceneIndex]();
}
function makeBox() {
    for(var i=0;i<4;i++) box[i] += (arguments[i]-box[i])/8;
}
function makeHero() {
    for(var i=0;i<4;i++) hero[i+5] += (arguments[i]-hero[i+5])/8;
}
function makeText(text, start) {
    var size = Math.floor((time-start)/100);
    return text.slice(0,Math.max(0,Math.min(size,text.length)));
}
function enterText(text,start) {
    return text + (time > start && (time-start) % 1200 < 900 ? "_":"");
}

function saveState(id, state) {
    localStorage.setItem(id, JSON.stringify(
        {
            name: state.name,
            slots: state.slots.map(
                function(img) {
                    return img.src;
                }
            )
        }
    ));
}

function loadState(id) {
    var state = JSON.parse(localStorage.getItem(id));
    if(state) {
        state.slots = state.slots.map(function(url) {
            var img = new Image();
            img.src = url;
            img.style.borderRadius = "50%";
            return img;
        });
    }
    return state;
}

var grd=ctx.createRadialGradient(
    canvas.width/2-50,canvas.height/2+20,20,
    canvas.width/2+50,canvas.height/2-20,300);
//grd.addColorStop(0,"#D0E0E0");
grd.addColorStop(0,"#FFFFFF");
grd.addColorStop(1,"#EEFEFE");

var back = document.createElement("canvas");
back.width = canvas.width;
back.height = canvas.height;
back.getContext("2d").fillStyle = grd;
back.getContext("2d").fillRect(0,0,back.width,back.height);

var errorMessage = null;


var started = false;
function makeBackground() {
    if(!started && sceneIndex===0) {
        ctx.fillStyle=started||sceneIndex>0?grd:"#000000";
        ctx.fillRect(0,0,canvas.width,canvas.height);
        ctx.fillStyle="#000000";
    } else {
        ctx.drawImage(back,0,0);
        ctx.fillStyle="#555566";
    }
}
var hero = [null,0,0,0,0,0,0,0,0];
var box = [canvas.width/2,canvas.height/2,1,1];
var sceneIndex = 0;
var scenes = [
    function() {
        var start = time+1000;
        var error = 0;

        loop = function () {
            started = time>=start;
            clearCanvas();
            ctx.font = "30px Comic";
            ctx.fillText(makeText("Welcome... what is your name?", start),260,150);
            if(time - start > 4000) {
                var shake = error ? Math.max(0,(300+error-time)/3) : 0;
                if(shake ===0) {
                    error = 0;
                }
                makeBox(
                    200 + (Math.random()-.5)*shake,
                    200 + (Math.random()-.5)*shake,
                    500,
                    80
                );
            } else {
                makeBox(0,0,canvas.width,canvas.height);
                if(!started) {
                    ctx.fillStyle=grd;
                    ctx.fillRect.apply(ctx,box);
                }
            }
            ctx.strokeRect.apply(ctx,box);
            ctx.font = "60px Comic";
            ctx.fillText(enterText(state.name,start + 4500),250,260);
        }
        var f;
        document.addEventListener("keydown",
            f = function(e) {
                e = e || event;
                if(e.keyCode===13) {
                    if(state.name === "SKIP") {
                        var savedState = loadState("game");
                        if(savedState) {
                            loadGame(savedState);
                        } else {
                            state.name = "";
                        }
                    } else if(state.name.length) {
                        nextScene();
                    } else {
                        error = time;
                    }
                } else if(e.keyCode===8) {
                    state.name = state.name.slice(0,state.name.length-1);
                } else {
                    var key = e.key || String.fromCharCode("0x"+e.keyIdentifier.split("U+")[1]);
                    state.name += key.toUpperCase();
                    if(state.name===" ") state.name = "";
                    if(state.name.length>10) state.name = state.name.slice(1);
                }
                e.preventDefault();
            }
        );
        function cancel(e) {
            e = e || event;
            e.preventDefault();
            return false;
        }
        document.addEventListener('dragover', cancel);
        document.addEventListener('dragenter', cancel);
        document.addEventListener('dragleave', cancel);
        document.addEventListener('drop', cancel);

        preNext = function() {
            document.removeEventListener("keydown",f);
            document.removeEventListener('dragover', cancel);
            document.removeEventListener('dragenter', cancel);
            document.removeEventListener('dragleave', cancel);
            document.removeEventListener('drop', cancel);
        }
    },
    promptImage = function() {
        var start = time;
        var message = [
            null,
            ["Hello " + state.name + ". May I see you?", "Please drop a picture in the box below.", "The picture doesn't have to be you, it can be your avatar.","Transparent backgrounds and animated gif are ok. Square images are best."],
            ["You look great "+state.name+"! Let's keep going.", "What do you like? Please drop a picture below", "Good example of pictures to drop are:","hearts, flowers, happy face, bubbles, puppies, rainbows..."],
            ["How about something you dislike?", "Can you drop that picture below?", "Good example of pictures are: skulls, vampire bats,","space alien, trolls, a witch on a broom, a photo of Donald Trump..."],
            ["Finally, can you drop one more picture?", "Just choose something random.","Like: pizza, wet socks, fish, a car, beer bottle,","cheese, your underwear, an iPhone, a photo of Donald Trump..."]
        ];

        var dropped = 0;
        var mx = 0, my = 0;
        var img = new Image();
        state.slots[sceneIndex-1] = img;
        img.style.borderRadius = "50%";
        var dragOver = 0;
        img.addEventListener("load", function(e) {
            hero[5] = mx - img.naturalWidth/2;
            hero[6] = my - img.naturalHeight/2;
            hero[7] = img.naturalWidth;
            hero[8] = img.naturalHeight;
        });
        hero[0] = img;
        loop = function() {
            clearCanvas();
            ctx.font = "25px Comic";
            ctx.fillText(makeText(message[sceneIndex][0],start),290,30);
            ctx.fillText(makeText(message[sceneIndex][1],start+4500),255,60);
            ctx.fillText(makeText(message[sceneIndex][2],start+9000),150,405);
            ctx.fillText(makeText(message[sceneIndex][3],start+15000),150,435);
            var max = Math.max(img.naturalWidth, img.naturalHeight);
            if(dropped && time-dropped>600 && img.naturalWidth) {
                makeBox(
                    400,
                    175,
                    100*img.naturalWidth/max,
                    100*img.naturalHeight/max
                );
            } else {
                makeBox(
                    300 + dragOver*Math.sin(time/30)*20,
                    75 + dragOver*Math.sin(time/30)*20,
                    300 -2*dragOver*Math.sin(time/30)*20,
                    300 -2*dragOver*Math.sin(time/30)*20);
            }
            ctx.strokeRect.apply(ctx,box.map(Math.round));
            hero[3] = img.naturalWidth; hero[4] = img.naturalHeight;
            makeHero(400,175,100*img.naturalWidth/max,100*img.naturalHeight/max);
            ctx.drawImage.apply(ctx,hero);
            if(dropped && time - dropped > 1000) {
                nextScene();
            }
        }

        function cancel(e) {
            e = e || event;
            if(e.type=='dragenter') {
                dragOver = 1;
            }else if(e.type=='dragleave') {
                dragOver = 0;
            }
            e.preventDefault();
            return false;
        }

        preNext = function() {
            document.removeEventListener('dragover', cancel);
            document.removeEventListener('dragenter', cancel);
            document.removeEventListener('dragleave', cancel);
            document.removeEventListener('drop', f);
        }

        // Tells the browser that we *can* drop on this target
        var f;
        document.addEventListener('dragover', cancel);
        document.addEventListener('dragenter', cancel);
        document.addEventListener('dragleave', cancel);
        document.addEventListener('drop', f = function (e) {
            e = e || event;
            dropped = time;
            dragOver = 0;
            if (e.preventDefault) { e.preventDefault(); } // stops the browser from redirecting off to the image.
            mx = e.pageX;
            my = e.pageY;
            var dt    = e.dataTransfer;
            var items = dt.items;
            var files = dt.files;
            var file = files[0];
            var reader = new FileReader();
            reader.addEventListener( 'loadend', function(e) {
                if((file.type!='image/gif'
                    &&file.type!='image/jpeg'
                    &&file.type!='image/png')) {

                    return;
                } else if(file.size>10000000) {
                    return;
                }
                var bin = this.result;
                img.src = this.result;
                reader = null;
            });

            reader.readAsDataURL(file);
            return false;
        });
    },
    promptImage,
    promptImage,
    promptImage,
    function() {
        var start = time;
        makeBox(
            0,
            0,
            canvas.width,
            canvas.height
        );

        function cancel(e) {
            e = e || event;
            e.preventDefault();
            return false;
        }
        document.addEventListener('dragover', cancel);
        document.addEventListener('dragenter', cancel);
        document.addEventListener('dragleave', cancel);
        document.addEventListener('drop', cancel);

        loop = function () {
            clearCanvas();
            ctx.font = "30px Comic";
            ctx.fillText(makeText("Let's go over this again shall we?", start),260,100);
            ctx.fillText(makeText("        is what "+state.name+" looks like.", start+4000),260,150);
            ctx.fillText(makeText("        is something "+state.name+" is fond of.", start+8000),260,200);
            ctx.fillText(makeText(".. not so much ", start+13000),260,250);
            ctx.fillText(makeText("About            ... let's just say it got thrown in there.", start+17000),260,300);
            ctx.fillText(makeText("Are you happy with your choices?", start+26000),260,350);
            ctx.fillText(makeText("Press the  space bar  for YES, esc for NO.", start+31000),260,400);
            for(var i=0; i<state.slots.length;i++) {
                if(time-start > timings[i]) {
                    var scale = 50/state.slots[i].naturalHeight;
                    ctx.drawImage(state.slots[i],
                        0,0,state.slots[i].naturalWidth,state.slots[i].naturalHeight,
                        locations[i][0],locations[i][1],state.slots[i].naturalWidth*scale, state.slots[i].naturalHeight*scale);
                }
            }
            if(time-start > 33000) {
                makeBox(
                    locations[4][0]+Math.sin(time/50)*8,
                    locations[4][1]+Math.sin(time/50)*8,
                    locations[4][2]+-2*Math.sin(time/50)*8,
                    locations[4][3]+-2*Math.sin(time/50)*8
                );
                ctx.strokeRect.apply(ctx,box.map(Math.round));
            }
        }

        var f;
        document.addEventListener("keydown",
            f = function(e) {
                e = e || event;
                if(time-start > 33000 || skip) {
                    if(e.keyCode===32) {
                        nextScene();
                    } else if(e.keyCode===27) {
                        startOver();
                    }
                }
                e.preventDefault();
            }
        );
        preNext = function() {
            document.removeEventListener("keydown",f);
            document.removeEventListener('dragover', cancel);
            document.removeEventListener('dragenter', cancel);
            document.removeEventListener('dragleave', cancel);
            document.removeEventListener('drop', cancel);
        }
    },
    loadGameFunction = function(loading) {
        if(loading) {
            loop = function () {
                clearCanvas();
                if(state.slots.every(function(slot) {
                    return slot.getW();
                })) {
                    nextScene();
                }
            }
        } else {
            nextScene();
        }
    },
    function() {

        //  handle gif
        var gifSlots = [null,null,null,null];
        for(var i=0;i<state.slots.length;i++) {
            if(state.slots[i].src.slice(-4).toLowerCase()===".gif" || state.slots[i].src.indexOf("data:image/gif;")===0) {
                gifSlots[i] = getGif(state.slots[i].src);
            }
        }
        window.gg = gifSlots;

        function rotateGif(gif,index) {
            if(gif) {
                var canvas = gif.canvases[gif.getFrame()];
                if(canvas) {
                    state.slots[index] = canvas;
                }
            }
        }


        saveState("game", state);

        function cancel(e) {
            e = e || event;
            e.preventDefault();
            return false;
        }
        document.addEventListener('dragover', cancel);
        document.addEventListener('dragenter', cancel);
        document.addEventListener('dragleave', cancel);
        document.addEventListener('drop', cancel);

        var scale = 50/state.slots[0].getH();
        var pos = [
            locations[0][0],
            locations[0][1],
            state.slots[0].getW()*scale,
            state.slots[0].getH()*scale,
        ];
        var jumpy=0;
        var bounce = 0;
        var bounceTime = 0;

        var currentTime = time;
        var delay = time+1000;

        var lines = [
            [900,410,200,delay],
            [950,420,150,delay],
            [1000,415,100,delay],
            [1100,435,170,delay],
            [1200,430,130,delay],
        ];
        var mountains = [
            [1970,150,delay],
            [2050,250,delay],
            [2130,200,delay],
            [3300,300,delay],
            [3450,270,delay],
        ];

        var foeSizes = [
            50,300,400,500,800
        ];

        var foes = [
            [4000,0,delay,300,0,0],
            [12000,0,delay,500,0,0],
            [13000,0,delay,100,0,0],
            [50000,0,delay,100,0,0],
            [70000,0,delay,350,0,0],
            [82000,0,delay,100,1,0],
            [103000,0,delay,100,1,0],
            [110000,0,delay,100,1,0],
        ];

        var rand = 2;

        var ppos = {};
        function getFoePosition(foe) {
            var foeScale = foe[3]/3/state.slots[2].getH();
            var t = time-foe[2];
            var x,y;
            x = foe[0]-t/2;
            var h = foe[3]<=100 ? (t*1.5 % (foe[3]*2)-foe[3])/foe[3] : (t/4 % (foe[3]*2)-foe[3])/foe[3];
            h = 1-h*h;
            y = foe[4]===0
                ? 400-state.slots[2].getH()*foeScale-h*foe[3]/2
                : h*foe[3]/2;
            ppos.x = x+state.slots[2].getW()*foeScale/2;
            ppos.y = y+state.slots[2].getH()*foeScale/2;
            return ppos;
        }



        function drawFoe(foe) {
            var foeScale = foe[3]/3/state.slots[2].getH();
            var t = time-foe[2];
            var pos = getFoePosition(foe);

            if(foe[5]<foe[6]) {
                ctx.save();
                ctx.beginPath();
                ctx.arc(pos.x, pos.y,
                    Math.min(state.slots[2].getW()*foeScale,state.slots[2].getH()*foeScale)/2,
                    0, Math.PI*2,true
                );
                ctx.closePath();
                ctx.clip();
                ctx.drawImage(state.slots[2],
                    state.slots[2].getW()*0,
                    state.slots[2].getW()*0,
                    state.slots[2].getW()*1,
                    state.slots[2].getH()*1,
                    pos.x-state.slots[2].getW()*foeScale/2,
                    pos.y-state.slots[2].getH()*foeScale/2,
                    state.slots[2].getW()*foeScale,
                    state.slots[2].getH()*foeScale
                );
                ctx.restore();
            }
            if(pos.x+100 < 0) {
                if(gameOver) {
                    foe[5] = foe[6];
                } else {
                    foe[0] += 1000 + 1000*Math.random();
                    rand += (Math.random()-.5)*2;
                    rand = Math.max(0,rand);
                    foe[5] = 0;
                }
//                foe[3] = foeSizes[ Math.round(rand) % foeSizes.length ];
            }
        }

        function drawLine(line) {
            var t = time-line[3];
            var x = line[0]-t/5;
            ctx.moveTo(x,line[1]);
            ctx.lineTo(x+line[2],line[1]);
            if(x+line[1] < 0) {
                line[3] = time;
            }
        }

        var foes = [
            [4000,0,delay,300,0,0,2],
            [12000,0,delay,500,0,0,3],
            [13000,0,delay,100,0,0,1],
            [20000,0,delay,100,0,0,1],
            [22000,0,delay,350,0,0,2],
            [42000,0,delay,100,1,0,1],
            [50300,0,delay,100,1,0,1],
            [106100,0,delay,200,1,0,1],
        ];

        var bonuses = [
            [900,400,delay,true,1],
            [900,400,delay,true,1],
            [900,400,delay,true,1],
            [900,400,delay,true,1],
            [900,400,delay,true,1],
            [900,400,delay,true,1],
            [900,400,delay,true,1],
            [900,400,delay,true,1],
        ];
        var bonusIndex = 0;
        function drawBonus(bonus) {
            var t = time - bonus[2];
            var size = bonus[4]*25;
            var scale = size/state.slots[1].getH();
            var x = bonus[0] - t/5;
            var y = bonus[1] - state.slots[1].getH()*scale/2;
            if(!bonus[3]) {
                ctx.drawImage(state.slots[1],
                    state.slots[1].getW()*0,
                    state.slots[1].getH()*0,
                    state.slots[1].getW()*1,
                    state.slots[1].getH()*1,
                    x,
                    y,
                    state.slots[1].getW()*scale,
                    state.slots[1].getH()*scale
                );
            }
            if(x+state.slots[1].getW()*scale < 0) {
                bonus[4] = true;
            }
        }

        function drawMountain(mountain) {
            var t = time - mountain[2];
            var x = mountain[0] - t/20;
            var height = mountain[1]/2;
            ctx.beginPath();
            ctx.moveTo(x,400);
            ctx.lineTo(x+height,400-height);
            ctx.lineTo(x+height*2,400);
            ctx.closePath();
            ctx.fill();
//            ctx.beginPath();
//            ctx.moveTo(x+height,400-height);
//            ctx.lineTo(x+height*2,400);
//            ctx.stroke();
            if(x+height*2 < 0) {
                mountain[2] = time;
            }
        }

        var shots = [
            [900,-1000,delay,true],
//            [900,-1000,delay+400,true],
//            [900,-1000,delay+800,true],
//            [900,-1000,delay+1200,true],
//            [900,-1000,delay+1600,true],
        ];
//        var shotIndex = 0;

        var spos = {};
        function getShotPosition(shot,time,scaleFactor) {
            var t = time - shot[2];
            var scale = 40/state.slots[3].getH()*scaleFactor;
            var x = shot[0] + t;
            var y = shot[1] + state.slots[3].getH()*scale/2;

            var h = (t-300)/300;
            h = 1-h*h;

            y -= h*250;
            spos.x = x;
            spos.y = y;
            return spos;
        }

        function drawShot(shot) {
            if (gameOver) return;
            drawShotHelper(shot, time, 1);
            if(hearts>=50) {
                drawShotHelper(shot, time-20, .8);
                drawShotHelper(shot, time-40, .5);
            }
        }

        function drawShotHelper(shot, time, scaleFactor) {
            var t = time - shot[2];
            var scale = 40/state.slots[3].getH() * scaleFactor;
            var ppos = getShotPosition(shot,time,scaleFactor);
            var angle = (t + shot[0] + shot[1])/100;
            if(!shot[3]) {
                ctx.translate(ppos.x, ppos.y);
                ctx.rotate(angle);
                ctx.drawImage(state.slots[3],
                    0,
                    0,
                    state.slots[3].getW(),
                    state.slots[3].getW(),
                    - state.slots[3].getW()*scale/2,
                    - state.slots[3].getH()*scale/2,
                    state.slots[3].getW()*scale,
                    state.slots[3].getH()*scale
                );
                ctx.rotate(-angle);
                ctx.translate(-ppos.x, -ppos.y);
            }

            if(t > 800 || shot[3]) {
                shot[0] = pos[0];
                shot[1] = pos[1];
                shot[2] = time;
                shot[3] = false;
                if(scaleFactor===1)
                    sounds.shoot.play();
            }
        }

        var particles = new Array(100);
        for(var i=0;i<particles.length;i++) {
            particles[i] = [0, 0, 0, 0, delay, null, true, false];
        }
        var particleIndex = 0;
        function fetchParticle() {
            var particle = particles[particleIndex];
            particleIndex = (particleIndex+1)%particles.length;
            return particle;
        }

        var movingParticles = [];

        function throwParticle(x,y,img,bonus) {
            var particle = fetchParticle();
            particle[0] = x;
            particle[1] = y;
            particle[2] = (Math.random()-.5)*100;
            particle[3] = -(.5+Math.random())*100;
            particle[4] = time;
            particle[5] = img;
            particle[6] = false;
            particle[7] = bonus;
            movingParticles.push(particle);
        }

        function breakParticle(particle) {
            particle[7] = false;
        }

        function drawParticle(particle) {
            var t = time - particle[4];
            var img = particle[5];
            var scale = 20/img.getH();
            var x = particle[0]-img.getW()*scale + t/500*particle[2];
            var y = particle[1];

            var h = (t-250)/500;
            h = 1-h*h;

            y += h*particle[3];

            var final = 3000;
            if(particle[7] && gameOver) {
                particle[7] = false;
            }
            if(particle[7]) {
                final = 500+Math.abs(particle[2])*10;
                var tt = t/final;
                x = (1-tt)*x + tt*45;
                y = (1-tt)*y + tt*45;
            }

            ctx.save();
            var angle = ((particle[2]%2<1?time:-time) + particle[2] + particle[3])/200;
            ctx.translate(x, y);
            ctx.rotate(angle);
            ctx.beginPath();
            ctx.arc(0, 0,
                Math.min(img.getW()*scale,img.getH()*scale)/2,
                0, Math.PI*2,true
            );
            ctx.closePath();
            ctx.clip();

            ctx.drawImage(particle[5],
                0,
                0,
                img.getW(),
                img.getH(),
                -img.getW()*scale/2,
                -img.getH()*scale/2,
                img.getW()*scale,
                img.getH()*scale
            );
            ctx.rotate(-angle);
            ctx.translate(-x, -y);
            ctx.restore();

            if(t > final) {
                particle[6] = true;
                if(particle[7]) {
                    hearts++;
                    pulse = time;
                    score += 100 * (hearts>=500?2:1);
                }
            }
        }

        var gameOver = 0;
        var hearts = 0;

        function checkBonus(bonus) {
            if(gameOver) {
                return;
            }
//            [900,400,delay,true],
            if(!bonus[3] && (!hit || time-hit>1000)) {
                var t = time - bonus[2];
                var scale = 50/state.slots[1].getH();
                var x = bonus[0] - t/5 + state.slots[1].getW()*scale/2;
                var y = bonus[1] - state.slots[1].getH()*scale/2;
                var radius = Math.min(state.slots[1].getW()*scale,state.slots[1].getH()*scale)/2;
                var dx = pos[0] - x;
                var dy = pos[1] - y;
                var dist = Math.sqrt(dx*dx+dy*dy);
                if(dist < radius + pos[2]/2) {
                    bonus[3] = time;
                    var count = bonus[4]*3;
                    for(var p=0;p<count;p++) {
                        throwParticle(pos[0],pos[1],state.slots[1],true);
                    }
                    sounds.collect.play();
                    return;
                }
            }
        }

        function checkCollision(foe) {
            if(gameOver) {
                return;
            }
            if(foe[5]<foe[6]) {
                var foeScale = foe[3]/3/state.slots[2].getH();
                var radius = Math.min(state.slots[2].getW()*foeScale,state.slots[2].getH()*foeScale)/2;

                var ppos= getFoePosition(foe);

                if(!hit || time-hit>3000) {
                    var dx = pos[0] - ppos.x;
                    var dy = pos[1] - ppos.y;
                    var dist = Math.sqrt(dx*dx+dy*dy);
                    if(dist < radius + pos[2]/4) {
                        sounds.hit.play();
                        movingParticles.forEach(breakParticle);
                        if(!hearts) {
                            gameOver = time;
                            if(score > best) {
                                best = score;
                                bestName = state.name;
                                localStorage.setItem("best", best);
                                localStorage.setItem("bestName", bestName);
                                console.log(bestName);
                            }
                            for(var p=0;p<8;p++) {
                                throwParticle(pos[0],pos[1],state.slots[0],false);
                            }
                            return;
                        } else {
                            jumpy = -20;
                            hit = time;
                            var pcount = Math.min(particles.length,Math.ceil(hearts/3));
                            for(var p=0;p<pcount;p++) {
                                throwParticle(pos[0],pos[1],state.slots[1],false);
                            }
                            hearts = 0;
                        }
                    }
                }

                for(var i=0;i<shots.length;i++) {
                    if(!shots[i][3]) {
                        var spos = getShotPosition(shots[i],time,1);
                        if(spos.x < 900) {
                            var dx = ppos.x - spos.x;
                            var dy = ppos.y - spos.y;
                            var dist = Math.sqrt(dx*dx+dy*dy);
                            //console.log(dist, radius+20);
                            if(dist < radius+10) {
                                foe[5]+= (hearts>=50?2:1);
                                shots[i][3] = true;
                                sounds.hit.play();
                                if(foe[5]>=foe[6]) {
                                    var bonus = bonuses[bonusIndex];
                                    bonusIndex = (bonusIndex + 1)%bonuses.length;
                                    bonus[0] = ppos.x;
                                    bonus[1] = ppos.y;
                                    bonus[2] = time;
                                    bonus[3] = false;
                                    bonus[4] = foe[6];
                                    score += 1000 * (hearts>=500?2:1);
                                }
                                var count = foe[5]>=foe[6] ? foe[6]*4 : 3;
                                for(var p=0;p<count;p++) {
                                    throwParticle(ppos.x,ppos.y,foe[5]>=foe[6]?state.slots[2]:state.slots[3],false);
                                }
                            }
                        }
                    }
                }
            }
        }

        function filterParticle(particle) {
            return !particle[6];
        }

        loop = function () {
            clearCanvas();
            var w = time-bounceTime < 200 && bounce ? Math.cos((time-bounceTime)/10) * bounce/5 : 0;

            ctx.beginPath();
            lines.forEach(drawLine);
            ctx.stroke();

            ctx.fillStyle = "#EEEEFF";
            mountains.forEach(drawMountain);

            foes.forEach(checkCollision);
            bonuses.forEach(checkBonus);

            bonuses.forEach(drawBonus);
            shots.forEach(drawShot);

            if(!gameOver && (!hit || time-hit>3000 || time%100>30)) {
                var doubleJump = hearts>=20 && hearts<100;
                var plane = hearts>=100;

                var x = pos[0];
                var y = pos[1];
                var flip = pos[1] < 400-pos[3]/2 && jumpCount === 2;
                var angle = flip ? jumpy*(400-pos[3]/2-pos[1])/2000 * Math.PI : (hit && time-hit<1000) ? time : jumpy/100;
                ctx.translate(x, y);
                ctx.rotate(angle);
                ctx.drawImage(state.slots[0],
                    0,0,state.slots[0].getW(),state.slots[0].getH(),
                    w-pos[2]/2,
                    -w-pos[3]/2,
                    pos[2]-w*2,
                    pos[3]+w*2);
                ctx.rotate(-angle);
                ctx.translate(-x, -y);
                if(doubleJump) {
                    ctx.beginPath();
                    ctx.arc(x,y,pos[2]*(40+time%200)/200,Math.PI/2-Math.PI/8,Math.PI/2+Math.PI/8);
                    ctx.stroke();
                } else if(plane) {
                    ctx.beginPath();
                    ctx.arc(x,y,pos[2]*(40+time%200)/400,Math.PI-Math.PI/8,Math.PI+Math.PI/8);
                    ctx.stroke();
                    ctx.beginPath();
                    ctx.arc(x,y,pos[2]*(40+time%200)/400,-Math.PI/8,+Math.PI/8);
                    ctx.stroke();
                }
            }


            foes.forEach(drawFoe);
            movingParticles.forEach(drawParticle);


            for(var i=movingParticles.length-1;i>=0;i--) {
                if(!filterParticle(movingParticles[i])) {
                    movingParticles[i] = movingParticles[movingParticles.length-1];
                    movingParticles.pop();
                }
            }

            if(!gameOver) {
                while(currentTime < time) {
                    if(space) {
                        jump(false);
                    }
                    if(pos[1]+pos[3]/2+jumpy > 400) {
                        pos[1] = 400 - pos[3] / 2;
                        bounceTime = time;
                        bounce = jumpy;
                        jumpy = -jumpy * bounceValue;
                        if (jumpy > -1) {
                            jumpy = 0;
                            bounce = 0;
                            bounceTime = 0;
                        }
                    } else if(pos[1]-pos[3]/2+jumpy < 0) {
                        bounceTime = time;
                        bounce = jumpy;
                        jumpy = -jumpy * bounceValue;
                    } else if(pos[1] < 400-pos[3]/2) {
                        jumpy++;
                    }
                    if(jumpy) {
                        pos[1] += jumpy;
                    }
                    currentTime+=20;
                    score+=(hearts>=500?2:1);
                }
            }

            if(!gameOver) {
                makeBox(
                    0,
                    400,
                    900,
                    2
                );
                ctx.strokeRect.apply(ctx,box.map(Math.round));
            }

            if(hearts) {
                var t = time-pulse;
                var pu = Math.max(100-t,0)/10;

                ctx.drawImage(state.slots[1],
                    0,0,state.slots[1].getW(),state.slots[1].getH(),
                    20-pu/2,
                    40-pu/2,
                    30+pu,
                    30+pu);
            }

            if(hearts>0) {
                ctx.fillStyle = "#AAAABB";
                ctx.font = "20px Comic";
                if(hearts < 20) {
                    ctx.fillText(hearts + " / 20: DBL JUMP",60,60);
                } else if(hearts < 50) {
                    ctx.fillText(hearts + " / 50: DBL DMG",60,60);
                } else if(hearts < 100) {
                    ctx.fillText(hearts + " / 100: WINGS",60,60);
                } else if(hearts < 500) {
                    ctx.fillText(hearts + " / 500: DBL SCORE",60,60);
                } else {
                    ctx.fillText(hearts + " / 1000000000: GOD MODE",60,60);
                }
            }
            if(score>0) {
                visualScore +=  (score -visualScore)/10;
                ctx.fillStyle = "#AAAABB";
                ctx.font = "20px Comic";
                var vScore = Math.round(visualScore);
                ctx.fillText(vScore >= best ? vScore : vScore + " < " + best + " (" + bestName + ")",30,30);
            }

            gifSlots.forEach(rotateGif);

            if(gameOver) {
                ctx.fillStyle = "#CCCCDD";
                ctx.font = "60px Comic";
                ctx.fillText(makeText("GAME OVER", gameOver),270,220);
                makeBox(
                    250,
                    150,
                    400,
                    100
                );
                ctx.strokeRect.apply(ctx,box.map(Math.round));
                ctx.font = "25px Comic";
                ctx.fillText(makeText("Press the space bar to continue, esc to start over.", gameOver+11000),210,400);
            }
        }

        var level = 1;
        var xp = [
            20,
            50,
            100,
            500,
            5000,
        ];

        var score = 0;
        var visualScore = 0;
        var pulse = 0;
        var hit = 0;

        var jumpCount = 0;
        function jump(justJump) {
            var plane = hearts>=100;
            if(plane) {
                if(pos[1] === 400-pos[3]/2 && jumpy===0) {
                    jumpy = -5;
                    sounds.jump.play();
                } else if(justJump) {
                    jumpy = -5;
                } else {
                    jumpy-= 1.5;
                }
            } else {
                var doubleJump = hearts>=20;
                if(pos[1] === 400-pos[3]/2 && jumpy===0) {
                    jumpy = -16;
                    jumpCount = 1;
                    sounds.jump.play();
                } else if(doubleJump && justJump && jumpCount == 1) {
                    jumpy = -16;
                    jumpCount = 2;
                    sounds.jump.play();
                } else {
                    jumpy -= 1/2;
                }
            }
        }

        var f,f2;
        document.addEventListener("keydown",
            f = function(e) {
                e = e || event;
                if(e.keyCode===32) {
                    if(!gameOver) {
                        jump(!space);
                        space = true;
                    } else if(time-gameOver>3000) {
                        var savedState = loadState("game");
//                        loadGame(savedState);

                        loadGame(state);
                    }
                } else if(e.keyCode===27) {
                    startOver();
                }
                e.preventDefault();
            }
        );
        document.addEventListener("keyup",
            f2 = function(e) {
                e = e || event;
                if(e.keyCode===32) {
                    space = false;
                }
                e.preventDefault();
            }
        );
        var space = false;

        preNext = function() {
            document.removeEventListener("keydown",f);
            document.removeEventListener("keyup",f2);
            document.removeEventListener('dragover', cancel);
            document.removeEventListener('dragenter', cancel);
            document.removeEventListener('dragleave', cancel);
            document.removeEventListener('drop', cancel);
        }
    },
    nop,
];

var bounceValue = .2;
var locations = [[250,110],[250,165],[445,215],[345,265],
    [375,374,125,40],
];
var timings = [4000, 8000, 15000, 18000];


scenes[0]();
function looper(t) {
    DOK.time = time = t;
    loop();
    requestAnimationFrame(looper);
}
looper(0);

var best = localStorage.getItem("best") || 0;
var bestName = localStorage.getItem("bestName") || "";

function getGif(src) {
    var gif = DOK.createGif(src);
    var canvases = [];
    gif.addEventListener("load", function(e) {
        var width = gif.naturalWidth, height = gif.naturalHeight;

        for (var i = 0; i < gif.frameCount; i++) {
            makeCanvas(gif,i,width,height);
        }
    });

    function makeCanvas(gif,index,width,height) {
        var canvas = document.createElement('canvas');
        canvas.width = width; canvas.height = height;
        canvas.src = src;
        var ctx = canvas.getContext("2d");
        gif.putOnCanvas(
            ctx,
            0,0,
            width,
            height,
            0,
            0,
            width,
            height,
            index,
            function() {
                canvases[index] = canvas;
            }
        );
    }
    gif.canvases = canvases;
    return gif;
}

HTMLCanvasElement.prototype.getW = Image.prototype.getW = function() {
    return this.naturalWidth?this.naturalWidth:this.width;
}
HTMLCanvasElement.prototype.getH = Image.prototype.getH = function() {
    return this.naturalHeight?this.naturalHeight:this.height;
}
HTMLCanvasElement.prototype.src = null;