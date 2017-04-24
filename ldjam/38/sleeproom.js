window.onload = function() {
    var renderer = new THREE.WebGLRenderer({antiAlias:true});
    renderer.setSize( innerWidth, innerHeight );
    var camera = new THREE.OrthographicCamera(-innerWidth/2, innerWidth/2, innerHeight/2, -innerHeight/2, 0.1, THREE.Infinity );
    var scene = new THREE.Scene();

    setResizer(renderer, camera);

    camera.position.set(0,0,400);
    document.body.appendChild( renderer.domElement );

    var background = new THREE.Mesh(new THREE.PlaneGeometry(1,1),
        new THREE.MeshBasicMaterial(
            {
                map: THREE.ImageUtils.loadTexture('img/sleeproom.jpeg'),
            }
        )
    );
    background.position.set(0,0,0);
    background.geometry.scale(800,600,1);
    scene.add(background);


    var mats = [
        [
            0,1,2,3,
            4,4,4,4,4,4,4,4,4,4,
            3,2,1,0,
            0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
        ].map(function(num) {
            return 'img/lyco-yellow-sleep-000'+num+'.png';
        }).map(function(file) {
            return THREE.ImageUtils.loadTexture(file);
        }).map(function(map) {
            return new THREE.MeshBasicMaterial({
                map:map,
                transparent:true,
                side: THREE.DoubleSide,
            });
        }),

        [
            0,1,2,3,
            4,4,4,4,4,4,4,4,4,4,
            3,2,1,0,
            0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
        ].map(function(num) {
            return 'img/lyco-pink-sleep-000'+num+'.png';
        }).map(function(file) {
            return THREE.ImageUtils.loadTexture(file);
        }).map(function(map) {
            return new THREE.MeshBasicMaterial({
                map:map,
                transparent:true,
                side: THREE.DoubleSide,
            });
        }),
    ];

    var sleepBagMat = new THREE.MeshBasicMaterial({
        map:new THREE.ImageUtils.loadTexture('img/sleepbag.png'),
        transparent:true,
        side: THREE.DoubleSide,
    });

    var yellowCount = parseInt(localStorage.getItem('recruit_0')||0);
    var pinkCount = parseInt(localStorage.getItem('recruit_1')||0);
    var array = reshuffle(yellowCount, pinkCount);
    yellowCount = array[0];
    pinkCount = array[1];


    var lycos = [];
    for(var i=0;i<yellowCount+pinkCount;i++) {
        var lyco = new THREE.Mesh(
            new THREE.PlaneGeometry( 1, 1), null
        );
        lyco.position.set(
            (Math.random()-.5)*460+10,
            (Math.random()-.5)*120+30,
            0
        );
        lyco.offset = {x:0,y:10};
        updatePosition(lyco);
        var s = Math.random()<.5?-1:1;
        s += (Math.random()-.5)*.2;
        lyco.geometry.scale(100*s,80*Math.abs(s),1);
        lyco.color = i<yellowCount ? 0 : 1;
        scene.add(lyco);
        lycos.push(lyco);
    }


    var sleepbag = new THREE.Mesh(
        new THREE.PlaneGeometry( 1, 1), null
    );
    sleepbag.position.set(
        10,
        30,
        0
    );
    sleepbag.offset = {x:0,y:30};
    updatePosition(sleepbag);
    sleepbag.geometry.scale(100,80,1);
    sleepbag.material = sleepBagMat;
    scene.add(sleepbag);

    var sleepLocation = {x:10,y:50};
    var sleeping = false;
    setCheckPosition(function (lupin) {
        if(lupin.position.y < -180) {
            loadScene('crossroads', { x: -80, y: 40, dx: 1 }, lupin);
        }
        if(dist2d(lupin.position, sleepLocation)<15 && !lupin.dx && !lupin.dy) {
            if(!sleeping) {
                sleeping = true;
                lupin.hidden = true;
                sleepbag.offset = {x:0,y:-20};
                updatePosition(sleepbag);
            }
        } else {
            if(sleeping) {
                sleeping = false;
                lupin.hidden = false;
                sleepbag.offset = {x:0,y:30};
                updatePosition(sleepbag);
            }
        }
    });


    var lupinMat = getLupinMat();

    //  lupin
    var lupin = new THREE.Mesh(
        new THREE.PlaneGeometry( 1, 1), null
    );
    lupin.position.set(
        0,
        120,
        0
    );
    setInitialPosition(lupin);
//    lupin.offset = {x:0,y:50};
    updatePosition(lupin);
    lupin.geometry.scale(100,80,1);
    lupin.dx = 0;
    lupin.dy = 0;
    scene.add(lupin);
    window.l = lupin;

    var keyboard = setupKeyboard();
//    window.k = keyboard;

    function loop(time) {
        var index = (time/100|0);
        for(var i=0;i<lycos.length;i++) {
            var lyco = lycos[i];
            lyco.material = mats[lyco.color][(index+i*23)%mats[lyco.color].length];
        }
        sleepbag.material = !sleeping ? sleepBagMat:
            mats[lupin.color||0][(index)%mats[lupin.color||0].length]
        ;
        if(sleeping) {
            if(sleepbag.scale.x * lupin.scale.x<0) {
                sleepbag.scale.x = -sleepbag.scale.x;
            }
        }

        moveLupin(lupin, keyboard, .5);
        updateLupin(lupin, index, lupinMat);

        requestAnimationFrame( loop );
        renderer.render(scene,camera);
    }
    loop(0);
};