window.onload = function() {
    var renderer = new THREE.WebGLRenderer({antiAlias:true});
    renderer.setSize( innerWidth, innerHeight );
    var camera = new THREE.OrthographicCamera(-innerWidth/2, innerWidth/2, innerHeight/2, -innerHeight/2, 0.1, THREE.Infinity );
    var scene = new THREE.Scene();
    setResizer(renderer, camera);

    camera.position.set(0,0,600);
    document.body.appendChild( renderer.domElement );

    var background = new THREE.Mesh(new THREE.PlaneGeometry(1,1),
        new THREE.MeshBasicMaterial(
            {
                map: THREE.ImageUtils.loadTexture('img/alley.jpeg'),
            }
        )
    );
    background.position.set(0,0,-200);
    background.geometry.scale(800,600,1);
    scene.add(background);


    var lupinMat = getLupinMat();

    //  lupin
    var lupin = new THREE.Mesh(
        new THREE.PlaneGeometry( 1, 1), null
    );
    lupin.position.set(
        0,
        0,
        0
    );
    setInitialPosition(lupin);
//    lupin.offset = {x:0,y:50};
    updatePosition(lupin);
    lupin.geometry.scale(200,160,1);
    lupin.dx = 0;
    lupin.dy = 0;
    scene.add(lupin);
    window.l = lupin;

    var keyboard = setupKeyboard();
//    window.k = keyboard;

    var crossRoadExit = {x:320,y:-112};
    var travelExit = {  x: -255, y: 102 };
    var windowExit = { x: 140, y: 90 };
    setCheckPosition(function (lupin) {
        if(dist2d(lupin.position, crossRoadExit) < 35) {
            loadScene('crossroads', { x: -160, y: -100, dx: 1 }, lupin);
        }
        if(dist2d(lupin.position, windowExit) < 30 && lupin.color===0) {
            loadScene('window', { x: -200, y: -194, dx:1 }, lupin);
        }
        if(dist2d(lupin.position, travelExit) < 30 && lupin.color===1) {
            loadScene('travel', { x: -200, y: -194, dx:1 }, lupin);
        }
    });


    var leftGuardMat = new THREE.MeshBasicMaterial({
        map:new THREE.ImageUtils.loadTexture('img/bodyguard-pink.png'),
        transparent:true,
        side: THREE.DoubleSide,
    });
    var leftGuard = new THREE.Mesh(
        new THREE.PlaneGeometry( 1, 1), leftGuardMat
    );
    leftGuard.position.set(
        -200,
        120,
        0
    );
    leftGuard.offset = {x:0,y:-30};
    updatePosition(leftGuard);
    leftGuard.geometry.scale(-250,200,1);
    scene.add(leftGuard);



    var rightGuardMat = new THREE.MeshBasicMaterial({
        map:new THREE.ImageUtils.loadTexture('img/bodyguard-yellow.png'),
        transparent:true,
        side: THREE.DoubleSide,
    });
    var rightGuard = new THREE.Mesh(
        new THREE.PlaneGeometry( 1, 1), rightGuardMat
    );
    rightGuard.position.set(
        80,
        100,
        0
    );
    rightGuard.offset = {x:0,y:-30};
    updatePosition(rightGuard);
    rightGuard.geometry.scale(250,200,1);
    scene.add(rightGuard);

    function loop(time) {
        var index = (time/100|0);
        moveLupin(lupin, keyboard, 1);
        updateLupin(lupin, index, lupinMat);

        requestAnimationFrame( loop );
        renderer.render(scene,camera);
    }
    loop(0);
};