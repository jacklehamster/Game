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
                map: THREE.ImageUtils.loadTexture('img/crossroads.jpeg'),
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

    var sleepRoomExit = {x:-140,y:75};
    var gatherRoomExit = {x:180,y:80};
    var diningRoomExit = {x:320,y:-112};
    var travelExit = { x:-330, y:-112 };
    setCheckPosition(function (lupin) {
        if(lupin.position.y > 280) {
            loadScene('toproom', { x: -9, y: -164, dx: lupin.lastDx }, lupin);
        }
        if(dist2d(lupin.position, sleepRoomExit) < 30) {
            loadScene('sleeproom', { x: 115, y: -121, dx: -1 }, lupin);
        }
        if(dist2d(lupin.position, gatherRoomExit) < 30) {
            loadScene('gatherroom', {  x: -325, y: -140, dx: 1 }, lupin);
        }
        if(dist2d(lupin.position, diningRoomExit) < 35) {
            loadScene('diner', {  x: -300, y: -140, dx: 1 }, lupin);
        }
        if(dist2d(lupin.position, travelExit) < 30) {
            loadScene('alley', { x: 300, y: -194, dx:-1 }, lupin);
        }
    });

    addStairs(
        [{x:0,y:124},{x:50,y:500}]
    );

    function loop(time) {
        var index = (time/100|0);
        moveLupin(lupin, keyboard, 1);
        updateLupin(lupin, index, lupinMat);

        requestAnimationFrame( loop );
        renderer.render(scene,camera);
    }
    loop(0);
};