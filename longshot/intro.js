window.onload = function() {
    var renderer = new THREE.WebGLRenderer({antiAlias:true});
    renderer.setSize( WIDTH, HEIGHT );
    renderer.setPixelRatio(window.devicePixelRatio);
    var camera = new THREE.OrthographicCamera(-WIDTH/2, WIDTH/2, 144/2, -144/2, 0.1, THREE.Infinity );
//    var camera = new THREE.PerspectiveCamera(75, innerWidth / innerHeight, 0.1, 1000000);
    var scene = new THREE.Scene();
    setResizer(renderer, camera);

    camera.position.set(0,0,600);
//    camera.rotateX(-.2);
    document.getElementById("main").appendChild( renderer.domElement );

    var tex = THREE.ImageUtils.loadTexture("img/title.jpeg");

    var background = new THREE.Mesh(new THREE.PlaneGeometry(1,1),
        new THREE.MeshBasicMaterial(
            {
//                color: 0xcccccc,
                transparent: false, opacity: 1,
            map: tex}
        )
    );

///    background.rotateX(-Math.PI/2);
    background.position.set(0,0,-100);
    background.geometry.scale(960,144,1);
    scene.add(background);

    var overlay = new THREE.Mesh(new THREE.PlaneGeometry(1,1),
        new THREE.MeshBasicMaterial(
            {
//                color: 0xcccccc,
                transparent: true, opacity: 1,
                map: THREE.ImageUtils.loadTexture("img/presskey.png")}
        )
    );

///    background.rotateX(-Math.PI/2);
    overlay.position.set(0,0,0);
    overlay.geometry.scale(960,144,1);
    scene.add(overlay);

    var changingScene = false;
//    var keyboard = setupKeyboard();
    function loop(time) {
        coreTime = time;
        overlay.visible =
            changingScene ? (time/50|0) % 4!==0 : (time/200|0) % 4!==0;
        requestAnimationFrame( loop );
        renderer.render(scene,camera);
    }
    loop(0);

    document.addEventListener("keydown", function(e) {
        if(!changingScene) {
            changingScene = true;
            new Audio('snd/countdown.ogg').play();
            setTimeout(function() {
                    location.replace("game.html");
            },2000);
        }
    });
};

