var noMat = new THREE.MeshBasicMaterial( { transparent: true, opacity: 0 } );

function move() {
    this.dy -=.5;
    var newX = this.position.x + (this.grounded?this.dx:this.dx*1.5);
    var newY = this.position.y + this.dy;
    if(newY<-144/2+this.radius) {
        newY = -144/2+this.radius;
        this.dy = -this.dy*this.bounce;
        this.dx *= .95;
        if(Math.abs(this.dy)<.1) {
            this.dy = 0;
            this.grounded = true;
        }
    }
    if(newX<-960/2+this.radius) {
        newX = -960/2+this.radius;
        this.dx = -this.dx*this.bounce;
        if(Math.abs(this.dx)<.1) {
            this.dx = 0;
        }
    }
    if(newX>960/2-this.radius) {
        newX = 960/2-this.radius;
        this.dx = -this.dx*this.bounce;
        if(Math.abs(this.dx)<.1) {
            this.dx = 0;
        }
    }
    this.position.x = newX;
    this.position.y = newY;
    if(this.canRotate) {
        if(Math.abs(this.dy)>.2)
            this.rotateX(-this.dy/100);
        if(Math.abs(this.dx)>.3)
            this.rotateZ(-this.dx/50);
    }
}

function checkKeyboard() {
}

function setCheckKeyboard(fun) {
    checkKeyboard = fun;
}

function setResizer(renderer, camera) {
    window.addEventListener("resize",function() {
        var gameWidth = innerWidth;
        var gameHeight = innerHeight;
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
        keyboard[event.keyCode] = true;
        checkKeyboard(keyboard);
        event.preventDefault();
    });
    document.addEventListener("keyup", function(event) {
        event = event || window.event;
        keyboard[event.keyCode] = false;
        if(waitRelease[event.keyCode]) {
            waitRelease[event.keyCode] = false;
        }
        checkKeyboard(keyboard);
        event.preventDefault();
    });

    return keyboard;
}

function dist2d(a,b) {
    var dx = a.x-b.x;
    var dy = a.y-b.y;
    return Math.sqrt(dx*dx + dy*dy);
}

THREE.Mesh.prototype.move = move;
THREE.Mesh.prototype.dx = 0;
THREE.Mesh.prototype.dy = 0;
THREE.Mesh.prototype.radius = 0;
THREE.Mesh.prototype.bounce = 0;
THREE.Mesh.prototype.rotVector = {x:0, y:0, z:0};
THREE.Mesh.prototype.grounded = false;