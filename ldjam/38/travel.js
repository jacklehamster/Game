window.onload = function() {
    var renderer = new THREE.WebGLRenderer({antiAlias:true});
    renderer.setSize( innerWidth, innerHeight );
    var camera = new THREE.OrthographicCamera(-innerWidth/2, innerWidth/2, innerHeight/2, -innerHeight/2, 0.1, THREE.Infinity );
    var scene = new THREE.Scene();
    setResizer(renderer, camera);

    camera.position.set(0,0,1000);
    document.body.appendChild( renderer.domElement );

    var background = new THREE.Mesh(new THREE.PlaneGeometry(1,1),
        noMat
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
//    lupin.geometry.scale(150,120,1);
    lupin.geometry.scale(250,200,1);
    lupin.dx = 0;
    lupin.dy = 0;
    scene.add(lupin);

    var shadow = new THREE.Mesh(
        new THREE.PlaneGeometry( 1, 1), null
    );
    shadow.position.set(
        0,
        0,
        0
    );
    updatePosition(shadow);
    shadow.geometry.scale(250,200,1);
    scene.add(shadow);


    window.l = lupin;

    var keyboard = setupKeyboard();
//    window.k = keyboard;

    setCheckPosition(function (lupin) {
        if(lupin.position.x < -430) {
            loadScene('alley', { x: -160, y: -100, dx: 1 }, lupin);
        }
    });


    var mats = [
        0,1,2,3,4,5,
    ].map(function(num) {
        return 'img/travel-000'+num+'.jpeg';
    }).map(function(file) {
        return THREE.ImageUtils.loadTexture(file);
    }).map(function(map) {
        return new THREE.MeshBasicMaterial({
            map:map,
            transparent:true,
            side: THREE.DoubleSide,
        });
    });

    var shadowMats = [
        0,1,2,
    ].map(function(num) {
        return 'img/shadow-000'+num+'.png';
    }).map(function(file) {
        return THREE.ImageUtils.loadTexture(file);
    }).map(function(map) {
        return new THREE.MeshBasicMaterial({
            map:map,
            transparent:true,
            side: THREE.DoubleSide,
        });
    });

    var cactusMat = [
        0,1,
    ].map(function(num) {
        return 'img/cactus-000'+num+'.png';
    }).map(function(file) {
        return THREE.ImageUtils.loadTexture(file);
    }).map(function(map) {
        return new THREE.MeshBasicMaterial({
            map:map,
            transparent:true,
            side: THREE.DoubleSide,
        });
    });

    var cactuses = [];
    for(var i=0;i<3;i++) {
        var cactus = new THREE.Mesh(
            new THREE.PlaneGeometry( 1, 1), cactusMat[i%2]
        );
        cactus.color = i%2;
        cactus.position.set(
            900 + i * 300,
            -50-Math.random()*150,
            0
        );
        updatePosition(cactus);
        cactus.geometry.scale(300,250,1);
        scene.add(cactus);
        cactuses.push(cactus);
    }

    var flowerMat = [
        [ 0,1 ].map(function(num) {
            return 'img/flower-pink-000'+num+'.png';
        }).map(function(file) {
            return THREE.ImageUtils.loadTexture(file);
        }).map(function(map) {
            return new THREE.MeshBasicMaterial({
                map:map,
                transparent:true,
                side: THREE.DoubleSide,
            });
        }),
        [ 0,1 ].map(function(num) {
            return 'img/flower-blue-000'+num+'.png';
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

    var pickSound = new Audio("snd/pick.ogg");


    var flowers = [];
    for(var i=0;i<1;i++) {
        var flower = new THREE.Mesh(
            new THREE.PlaneGeometry( 1, 1), flowerMat[i%2]
        );
        flower.color = i%2;
        flower.position.set(
            3900 + i * 300,
            -50-Math.random()*150,
            0
        );
        updatePosition(flower);
        flower.geometry.scale(150,120,1);
        scene.add(flower);
        flowers.push(flower);
    }

    var flowerCollect = [false,false];

    var ah = new Audio("snd/ah.ogg");

    setRuningLevel(true);

    function loop(time) {
        var index = (time/100|0);
        if(lupin.ko) {
            lupin.dx = -15;
            lupin.dy = 0;
        }
        moveLupin(lupin, keyboard, 2);
        if(lupin.position.y > -50) {
            lupin.position.y = -50;
        } else if(lupin.position.y<-250) {
            lupin.position.y = -250;
        }
        updateLupin(lupin, index, lupinMat);

        for(var i=0;i<cactuses.length;i++) {
            var cactus = cactuses[i];
            cactus.position.x -= 15;
            if(cactus.position.x<-450) {
                cactus.position.x += 900+Math.random()*1000;
                cactus.position.y = cactus.color===1?lupin.position.y-10:-Math.random()*150-50;
                updatePosition(cactus);
            }
            var pos = {x:cactus.position.x, y:cactus.position.y-10};
            if(dist2d(lupin.position,pos) < 25 && !lupin.ko) {
                lupin.ko = true;
                ah.play();
            }
        }

        for(var i=0;i<flowers.length;i++) {
            var flower = flowers[i];
            flower.position.x -= 15;
            if(flower.position.x<-450) {
                flower.position.x += 3900+Math.random()*1000;
                flower.position.y = -Math.random()*150-50;
                updatePosition(flower);
                flower.collected = false;
                flower.color = (Math.random()*flowerMat.length)|0;
                flower.material = flowerMat[flower.color];
            }
            var pos = {x:flower.position.x, y:flower.position.y};
            if(!flower.collected  && dist2d(lupin.position,pos) < 25) {
                flower.collected = true;
                flower.material = noMat;
                pickSound.play();
                flowerCollect[flower.color] = true;
                if(flowerCollect[0] && flowerCollect[1]) {
                    localStorage.setItem("flower", Date.now());
                }
            }
        }

        shadow.position.x = lupin.position.x;
        shadow.position.y = lupin.position.y;
        shadow.position.z = lupin.position.z-1;
        shadow.material =shadowMats[(index)%shadowMats.length];

        background.material = mats[(index)%mats.length];

        requestAnimationFrame( loop );
        renderer.render(scene,camera);
    }
    loop(0);
};