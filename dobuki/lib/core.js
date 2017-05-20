var core = {};

function setResizer(renderer, camera) {
    window.addEventListener("resize",function() {
        var gameWidth = window.innerWidth;
        var gameHeight = window.innerHeight;
        renderer.setSize( gameWidth, gameHeight );
        camera.left = -gameWidth / 2;
        camera.right = gameWidth / 2;
        camera.top = gameHeight / 2;
        camera.bottom = -gameHeight / 2;
        camera.updateProjectionMatrix();
    });
}

function gameLoop(time) {
    return true;
}

function initGame() {
    var WIDTH = innerWidth, HEIGHT = innerHeight;
    var renderer = new THREE.WebGLRenderer({antiAlias:true});
    renderer.setSize( WIDTH, HEIGHT );
    renderer.setPixelRatio(window.devicePixelRatio);
    var camera = new THREE.OrthographicCamera(-WIDTH/2, WIDTH/2, HEIGHT/2, -HEIGHT/2, 0.1, THREE.Infinity );
//    var camera = new THREE.PerspectiveCamera(75, innerWidth / innerHeight, 0.1, 1000000);
    var scene = new THREE.Scene();
    setResizer(renderer, camera);
    camera.position.set(0,0,600);
    document.body.appendChild( renderer.domElement );

    function loop(time) {
        requestAnimationFrame( loop );
        if(gameLoop(time)) {
            renderer.render(scene,camera);
        }
    }
    loop(0);

    core.scene = scene;
}

function setGameLoop(fun) {
    gameLoop = fun;
}