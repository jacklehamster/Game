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
                map: THREE.ImageUtils.loadTexture('img/gatherroom.jpeg'),
            }
        )
    );
    background.position.set(0,0,-201);
    background.geometry.scale(800,600,1);
    scene.add(background);

    var backgroundOverlay = new THREE.Mesh(new THREE.PlaneGeometry(1,1),
        new THREE.MeshBasicMaterial(
            {
                map: THREE.ImageUtils.loadTexture('img/gatherroom-overlay.png'),
                transparent: true,
            }
        )
    );
    backgroundOverlay.position.set(0,0,-199);
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
    lupin.geometry.scale(180,150,1);
    lupin.dx = 0;
    lupin.dy = 0;
    lupin.jumpHeight = 16;
    scene.add(lupin);
    window.l = lupin;

    var yellowCount = parseInt(localStorage.getItem('recruit_0')||0);
    var pinkCount = parseInt(localStorage.getItem('recruit_1')||0);
    var array = reshuffle(yellowCount, pinkCount, true);
    yellowCount = array[0];
    pinkCount = array[1];


    var mats = getLycoMat();
    var lycos = [];
    for(var i=0;i<yellowCount + pinkCount;i++) {
        var lyco = new THREE.Mesh(
            new THREE.PlaneGeometry( 1, 1), null
        );
        lyco.position.set(
            (Math.random()-.5)*480,
            -140,
            0
        );
        lyco.offset = {x:0,y:10};
        updatePosition(lyco);
        var s = Math.random()<.5?-1:1;
        s += (Math.random()-.5)*.2;
        lyco.dx = -s;
        lyco.color = i<yellowCount ? 0 : 1;
        lyco.geometry.scale(150*s,120*Math.abs(s),1);
        scene.add(lyco);
        lycos.push(lyco);
    }

    var keyboard = setupKeyboard();
//    window.k = keyboard;

    addPlatform(
        { x:[-1000, 1000], y:-145 }
    );

    var fruitMat = new THREE.MeshBasicMaterial({
        map:new THREE.ImageUtils.loadTexture('img/tomato-fruit.png'),
        transparent:true,
        side: THREE.DoubleSide,
    });;
    var fruits = [];
    for(var i=0;i<10;i++) {
        var fruit = new THREE.Mesh(
            new THREE.PlaneGeometry( 1, 1), fruitMat
        );
        fruit.position.set(
            0 + (Math.random()-.5) * 400,
            100 + Math.random()*80,
            0
        );
        fruit.rotateZ(Math.random()/2);
        fruit.offset = {x:0,y:10};
        updatePosition(fruit);
        var s = (i%3)+2;
        fruit.dx = 0;
        fruit.geometry.scale(50,40,1);
        fruit.dy = 0;
        fruit.material = fruitMat;
        scene.add(fruit);
        fruits.push(fruit);
    }

    var dropMat =         [
        0,1,2,3,4
    ].map(function(num) {
        return 'img/drop-000'+num+'.png';
    }).map(function(file) {
        return THREE.ImageUtils.loadTexture(file);
    }).map(function(map) {
        return new THREE.MeshBasicMaterial({
            map:map,
            transparent:true,
            side: THREE.DoubleSide,
        });
    });

    var drops = [];
    for(var i=0;i<3;i++) {
        var drop = new THREE.Mesh(
            new THREE.PlaneGeometry( 1, 1), noMat
        );
        drop.position.set(
            0 + (Math.random()-.5) * 400,
            200 + Math.random()*80,
            0
        );
        drop.offset = {x:0,y:10};
        updatePosition(drop);
        var s = (i%3)+2;
        drop.dx = 0;
        drop.geometry.scale(100,80,1);
        drop.dy = 0;
        drop.create = i * 3000;
        scene.add(drop);
        drops.push(drop);
    }


    setCheckPosition(function (lupin) {
        if(lupin.position.x < -420 || lupin.position.y < -400) {
            loadScene('crossroads', { x: 130, y: 80, dx: -1 }, lupin);
        }
    });
//    setWaitForJump(true);
    setGravity(true);
    var jumpSound = new Audio("snd/jump.ogg");
    var ah = new Audio("snd/ah.ogg");
    var collectedFruitCount = 0;

    function loop(time) {
        var index = (time/100|0);
        moveLupin(lupin, keyboard, 1);
        updateLupin(lupin, index, lupinMat);

        for(var i=0;i<lycos.length;i++) {
            var lyco = lycos[i];
            if(time - lyco.knocked < 1000) {
                lyco.material = mats[lyco.color]['squish'][(index+i*23)%mats[lyco.color]['squish'].length];
            } else {
                lyco.position.x += lyco.dx;
                if(lyco.position.x < -450) {
                    lyco.position.x += 900;
                } else if(lyco.position.x > 450) {
                    lyco.position.x -= 900;
                }
                lyco.material = mats[lyco.color]['move'][(index+i*23)%mats[lyco.color]['move'].length];
            }

            if(!lupin.doubleJumped && lupin.dy<0 && lupin.position.y > -150 && lupin.position.y < -120) {
                if(lupin.position.x > lyco.position.x-30 && lupin.position.x < lyco.position.x+30) {
                    lupin.dy = 23;
                    lupin.inAir = true;
                    lupin.doubleJumped = true;
                    lyco.knocked = time;
                    jumpSound.play();
                }
            }
        }

        for(i=0; i<fruits.length; i++) {
            var fruit = fruits[i];
            if(fruit.collected) {
                fruit.position.y += fruit.dy;
                fruit.position.x += fruit.dx;
                fruit.dy--;
                fruit.position.z = -200;
                if(fruit.position.y < -150) {
                    fruit.material = noMat;
                }
            } else if(dist2d(lupin.position, fruit.position) < 70) {
                fruit.collected = true;
                fruit.dy = 5;
                fruit.dx = -fruit.position.x/50;
                fruit.position.z = -200;

                new Audio("snd/pick.ogg").play();
                collectedFruitCount++;
                if(collectedFruitCount >= fruits.length) {
                    localStorage.setItem("fruit", Date.now());
                }
            }
        }


        for(i=0; i<drops.length; i++) {
            var drop = drops[i];
            if(drop.create > time) {
                drop.material = noMat;
            } else {
                var state = Math.min(((time-drop.create)/300) | 0,4);
                drop.material = dropMat[state];
                if(state >= 4) {
                    drop.dy--;
                    drop.position.y += drop.dy;
                    if (dist2d(lupin.position, drop.position) < 40 && !lupin.ko) {
                        ah.play();
                        lupin.ko = true;
                    } else if(drop.position.y <-400) {
                        drop.create = time + 3000;
                        drop.position.set(
                            i%2===1 ? lupin.position.x :
                            0 + (Math.random()-.5) * 400,
                            200 + Math.random()*80,
                            0
                        );
                        drop.material = noMat;
                    }
                }
            }
        }


        requestAnimationFrame( loop );
        renderer.render(scene,camera);
    }
    loop(0);
};