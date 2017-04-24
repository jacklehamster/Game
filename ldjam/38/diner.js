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
                map: THREE.ImageUtils.loadTexture('img/diner.jpeg'),
            }
        )
    );
    background.position.set(0,0,0);
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
    lupin.geometry.scale(150,120,1);
    lupin.dx = 0;
    lupin.dy = 0;
    scene.add(lupin);
    window.l = lupin;

    var keyboard = setupKeyboard();
//    window.k = keyboard;

    setCheckPosition(function (lupin) {
        if(lupin.position.x < -400) {
            loadScene('crossroads', { x: 160, y: -90, dx: -1 }, lupin);
        }
    });





    var yellowCount = parseInt(localStorage.getItem('recruit_0')||0);
    var pinkCount = parseInt(localStorage.getItem('recruit_1')||0);

    var array = reshuffle(yellowCount, pinkCount, true);
    yellowCount = array[0];
    pinkCount = array[1];

    var mats = getLycoMat();
    var hasFruits = localStorage.getItem("fruit") && parseInt(localStorage.getItem("fruit")) >0 ;
    var count = hasFruits ? yellowCount+pinkCount : 0;

    var lycos = [];
    for(var i=0;i<count;i++) {
        var lyco = new THREE.Mesh(
            new THREE.PlaneGeometry( 1, 1), null
        );
        lyco.position.set(
            (Math.random()-.5)*500+10,
            (Math.random()-.5)*120+30,
            0
        );
        lyco.offset = {x:0,y:-14};
        updatePosition(lyco);
        var s = Math.random()<.5?-1:1;
        s += (Math.random()-.5)*.2;
        lyco.geometry.scale(150*s,120*Math.abs(s),1);
        lyco.color = i<yellowCount ? 0 : 1;
        scene.add(lyco);
        lycos.push(lyco);
    }

    var dispMat = [
        [ 0 ].map(function(num) {
            return 'img/dispenser-000'+num+'.png';
        }).map(function(file) {
            return THREE.ImageUtils.loadTexture(file);
        }).map(function(map) {
            return new THREE.MeshBasicMaterial({
                map:map,
                transparent:true,
                side: THREE.DoubleSide,
            });
        }),

        [ 1,2,3 ].map(function(num) {
            return 'img/dispenser-000'+num+'.png';
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


    var dispensers = [];
    for(var i=0;i<3;i++) {
        var disp = new THREE.Mesh(
            new THREE.PlaneGeometry( 1, 1), null
        );
        disp.position.set(
            (i % 3) * 300 - 280,
            -190,
            0
        );
        disp.offset = {x:0,y:-14};
        updatePosition(disp);
        disp.geometry.scale(150 * (i%2===1?-1:1),120,1);
        scene.add(disp);
        dispensers.push(disp);
    }



    function loop(time) {
        var index = (time/100|0);
        for(var i=0;i<lycos.length;i++) {
            var lyco = lycos[i];
            lyco.material = mats[lyco.color].drink[(index+i*23)%mats[lyco.color].drink.length];
        }

        lupin.drink = false;
        for(var i=0;i<dispensers.length;i++) {
            var disp = dispensers[i];
            disp.material = dispMat[!hasFruits?0:1][index%dispMat[!hasFruits?0:1].length];

            if(lupin.dx ===0 && lupin.dy===0) {
                var pos = {x:disp.position.x + disp.scale.x*30, y:disp.position.y};
                if (dist2d(lupin.position, pos) < 50) {
                    lupin.drink = true;
                    var px = disp.position.x - lupin.position.x;
                    if(px * lupin.lastDx< 0) {
                        lupin.lastDx *=-1;
                    }
                    if(Math.random()<.01) {
                        lupin.color = 1-lupin.color;
                    }
                }
            }
        }

        moveLupin(lupin, keyboard, 1);
        updateLupin(lupin, index, lupinMat);

        requestAnimationFrame( loop );
        renderer.render(scene,camera);
    }
    loop(0);
};