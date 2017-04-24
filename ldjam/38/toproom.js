window.onload = function() {
    var renderer = new THREE.WebGLRenderer({antiAlias:true});
    renderer.setSize( innerWidth, innerHeight );
    var camera = new THREE.OrthographicCamera(-innerWidth/2, innerWidth/2, innerHeight/2, -innerHeight/2, 0.1, THREE.Infinity );
    var scene = new THREE.Scene();
    setResizer(renderer, camera);

    camera.position.set(0,0,1000);
    document.body.appendChild( renderer.domElement );

    var background = new THREE.Mesh(new THREE.PlaneGeometry(1,1),
        new THREE.MeshBasicMaterial(
            {
                map: THREE.ImageUtils.loadTexture('img/toproom.jpeg'),
            }
        )
    );
    background.position.set(0,0,-300);
    background.geometry.scale(800,600,1);
    scene.add(background);


    var platforms = new THREE.Mesh(new THREE.PlaneGeometry(1,1),
        new THREE.MeshBasicMaterial(
            {
                map: THREE.ImageUtils.loadTexture('img/toproom-platform.png'),
                transparent: true,
            }
        )
    );
    platforms.position.set(0,0,-300);
    platforms.geometry.scale(800,600,1);
    scene.add(platforms);


    var backgroundOverlay = new THREE.Mesh(new THREE.PlaneGeometry(1,1),
        new THREE.MeshBasicMaterial(
            {
                map: THREE.ImageUtils.loadTexture('img/toproom-overlay.png'),
                transparent: true,
            }
        )
    );
    backgroundOverlay.position.set(0,0,500);
    backgroundOverlay.geometry.scale(800,600,1);
    scene.add(backgroundOverlay);

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
    lupin.geometry.scale(150,120,1);
    lupin.dx = 0;
    lupin.dy = 0;
    scene.add(lupin);
    window.l = lupin;




    var keyboard = setupKeyboard();
//    window.k = keyboard;

    addStairs(
        [{ x: -384, y: 136 }, { x: -327, y: 14 }]
    );
    addStairs(
        [{x: -105, y: 258}, {x: -168, y: 136}]
    );
    addStairs(
        [{x: 87, y: 258}, {x: 144, y: 136}]
    );
    addStairs(
        [{ x: 318, y: 136 }, { x: 381, y: 14 }]
    );
    addPlatform(
        { x:[-80, -1000], y:10 }
    );
    addPlatform(
        { x:[70, 1000], y:10 }
    );
    addPlatform(
        { x:[-80, -1000], y:136 }
    );
    addPlatform(
        { x:[70, 1000], y:136 }
    );
    addPlatform(
        { x:[-200, 185], y:260 }
    );

    setCheckPosition(function (lupin) {
        if(lupin.position.y < -172) {
            loadScene('crossroads', { x: 30, y: 80, dx: lupin.lastDx }, lupin);
        }
    });

    var mats = getLycoMat();
    var lycos = [];
    for(var i=0;i<1;i++) {
        var lyco = new THREE.Mesh(
            new THREE.PlaneGeometry( 1, 1), null
        );
        lyco.position.set(
            0,
            270,
            0
        );
        lyco.offset = {x:0,y:10};
        updatePosition(lyco);
        var s = .9;//Math.random()<.5?-1:1;
        lyco.dx = -1;
        lyco.geometry.scale(150*s,120*Math.abs(s),1);
        lyco.dy = 0;
        lyco.color = (Math.random()*2|0);
        scene.add(lyco);
        lycos.push(lyco);
    }

    var beeMat = getBeeMat();
    var bees = [];
    for(var i=0;i<3;i++) {
        var bee = new THREE.Mesh(
            new THREE.PlaneGeometry( 1, 1), null
        );
        bee.position.set(
            0 + (Math.random()-.5) * 300,
            150 - (i%4)*50,
            0
        );
        bee.offset = {x:0,y:10};
        updatePosition(bee);
        var s = (i%3)+2;
        bee.dx = i%2==0 ? s : -s;
        bee.geometry.scale(100 * (bee.dx/Math.abs(bee.dx)),80,1);
        bee.dy = 0;
        bee.orgY = bee.position.y;
        scene.add(bee);
        bees.push(bee);
    }
    waitRelease[38] = true;

    setWaitForJump(true);
    setGravity(true);

    var ah = new Audio("snd/ah.ogg");

    function loop(time) {
        var index = (time/100|0);
        moveLupin(lupin, keyboard, 1.2);
        updateLupin(lupin, index, lupinMat);

        for(var i=0;i<lycos.length;i++) {
            var lyco = lycos[i];
            if(lyco.recruit) continue;
            lyco.position.x += lyco.dx * (lyco.jump?2:1);
            if(lyco.position.x < -450) {
                lyco.position.x += 900;
            } else if(lyco.position.x > 450) {
                lyco.position.x -= 900;
            }
            var newY = lyco.position.y + -10+lyco.dy;
            var platform = crossedPlatform(lyco.position, newY);
            if(platform) {
                lyco.position.y = platform.y+10;
                lyco.dy = 0;
                lyco.jump = false;
                if(Math.abs(lyco.position.x-platform.x[0])<10 || Math.abs(lyco.position.x-platform.x[1])<10) {
                    lyco.dx = -lyco.dx;
                    lyco.scale.x = -lyco.scale.x;
                }


            } else {
                lyco.dy--;
            }
            lyco.position.y += lyco.dy;
            lyco.material = mats[lyco.color%2]['move'][(index+i*23)%mats[lyco.color%2]['move'].length];

            if(dist2d(lupin.position, lyco.position) < 50) {
                lyco.position.x += (lyco.position.x - lupin.position.x)/5;
            }
            if(lyco.position.y < -172) {
                lyco.recruit = true;
                var id = 'recruit_' + lyco.color;
                var count = localStorage.getItem(id);
                localStorage.setItem(id,parseInt(count||0) + 1);
                lyco.material = noMat;
                localStorage.setItem("last_recruit", Date.now());
            }
        }

        var speedFrame = time/10|0;
        for(i=0; i<bees.length; i++) {
            var bee = bees[i];
            bee.material = beeMat[speedFrame%beeMat.length];
            bee.position.x += bee.dx;
            bee.position.y = bee.orgY + Math.sin(time/100)*10;
            if(bee.position.x < -450) {
                bee.position.x += 900;
            } else if(bee.position.x > 450) {
                bee.position.x -= 900;
            }

            if(!lupin.ko) {
                if(dist2d(lupin.position, bee.position) < 50) {
                    lupin.ko = true;
                    lupin.dx = (Math.random()-.5)*5;
                    if(lupin.scale.x * lupin.dx<0) {
                        lupin.scale.x = -lupin.scale.x;
                    }
                    lupin.dy = 10;
                    ah.play();
                }
            }
        }

        requestAnimationFrame( loop );
        renderer.render(scene,camera);
    }
    loop(0);
};