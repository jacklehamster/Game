var noMat = new THREE.MeshBasicMaterial( { transparent: true, opacity: 0 } );
var totalWidth = 900;
var coreTime = 0;
var scored = false;
var headStart = 5000;
var started = 0;
var WIDTH = 960;
var HEIGHT = 144;

var goalsound = new Audio('snd/goal.ogg');

function move() {
    this.dy -=.5;
    var newX = this.position.x + (!this.inAir?this.dx:this.dx*1.5);
    var newY = this.position.y + (!this.inAir?this.dy:this.dy*1.5);
    var newZ = this.position.z + (!this.inAir?this.dz:this.dz*1.5);
    if(newY<-144/2+this.radius) {
        newY = -144/2+this.radius;
        this.dy = -this.dy*this.bounce;
        this.inAir = 0;
        if(Math.abs(this.dy)<.2) {
            this.dy = 0;
        }
    }
    if(newY>144/2-this.radius) {
        newY = 144/2-this.radius;
        this.dy = -this.dy*this.bounce;
        if(Math.abs(this.dy)<.2) {
            this.dy = 0;
        }
    }
    if(newX<-totalWidth/2+this.radius) {
        if(this.bounce && this.position.y<-30 && !scored) {
//            this.bounce = 0;
//            scored = true;
            updateScore(0,1);
        }
        {
            if(!scored)
                newX = -totalWidth/2+this.radius;
            this.dx = -this.dx*this.bounce;
            if(Math.abs(this.dx)<.2) {
                this.dx = 0;
            }
        }
    }
    if(newX>totalWidth/2-this.radius) {
        if(this.bounce && this.position.y<-30 && !scored) {
//            this.bounce = 0;
//            scored = true;
            updateScore(1,0);
        }
        {
            if(!scored)
                newX = totalWidth/2-this.radius;
            this.dx = -this.dx*this.bounce;
            if(Math.abs(this.dx)<.2) {
                this.dx = 0;
            }
        }
    }
    this.position.x = newX;
    this.position.y = newY;
    this.position.z = newZ;
    if(this.canRotate) {
        if(Math.abs(this.dy)>.2)
            this.rotateX(-this.dy/50);
        if(Math.abs(this.dx)>.2)
            this.rotateZ(-this.dx/50);
    }
    this.grounded = this.position.y === -144/2+this.radius;
}

var scoreLeft=0,scoreRight = 0,timeout = 0;
var inGame = true;
function updateScore(left,right) {
    var gameOn = !gameOver();
    if(gameOn) {
        if(left || right) {
            goalsound.play();
        }
        scoreLeft += left;
        scoreRight += right;
    }
    document.getElementById('score').innerText =
        gameOn ? "GOAL\n" + [scoreLeft,scoreRight].join(' - ')
        :  "FINAL SCORE\n" + [scoreLeft,scoreRight].join(' - ');
    clearTimeout(timeout);
    if(gameOn)
        setTimeout(clearScore, 2000);
    if(!gameOn && inGame) {
        inGame = false;
        new Audio('snd/start.ogg').play();
    }
}

function clearScore() {
    document.getElementById('score').innerText = "";
}

function checkKeyboard() {
}

function setCheckKeyboard(fun) {
    checkKeyboard = fun;
}

function setResizer(renderer, camera) {
    window.addEventListener("resize",function() {
        var gameWidth = WIDTH;
        var gameHeight = HEIGHT;
        renderer.setSize( gameWidth, gameHeight );
        camera.left = -gameWidth / 2;
        camera.right = gameWidth / 2;
        camera.top = gameHeight / 2;
        camera.bottom = -gameHeight / 2;
        camera.updateProjectionMatrix();
    });
}

var loadingScene = false;
function loadScene(scene, position, lupin) {
    if(loadingScene) {
        return;
    }
    loadingScene = true;
    var hash = position ? '#' + position.x + ',' + position.y + ',' + parseInt(position.dx) + ',' + ((lupin?lupin.color:0)||0) : '';
    var url = scene + '.html' + hash;
    location.replace(url);
}

var waitRelease = {};
function setupKeyboard() {
    var keyboard = {};
    document.addEventListener("keydown", function(event) {
        event = event || window.event;
        if(!gameOver()) {
            keyboard[event.keyCode] = coreTime;
            checkKeyboard(keyboard, coreTime);
        }
        event.preventDefault();
    });
    document.addEventListener("keyup", function(event) {
        event = event || window.event;
        if(!gameOver()) {
            keyboard[event.keyCode] = 0;
            if(waitRelease[event.keyCode]) {
                waitRelease[event.keyCode] = 0;
            }
            checkKeyboard(keyboard, coreTime);
        }
        event.preventDefault();
    });

    return keyboard;
}

function dist2d(a,b) {
    var dx = a.x-b.x;
    var dy = a.y-b.y;
    return Math.sqrt(dx*dx + dy*dy);
}

function gameOver() {
    return coreTime-headStart-started>60000;
}



THREE.Mesh.prototype.move = move;
THREE.Mesh.prototype.dx = 0;
THREE.Mesh.prototype.dy = 0;
THREE.Mesh.prototype.dz = 0;
THREE.Mesh.prototype.radius = 0;
THREE.Mesh.prototype.bounce = 0;
THREE.Mesh.prototype.rotVector = {x:0, y:0, z:0};
THREE.Mesh.prototype.inAir = 0;