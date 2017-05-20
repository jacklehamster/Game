window.onload = function() {
    var renderer = new THREE.WebGLRenderer();
    renderer.setSize( innerWidth, innerHeight );
    var camera = new THREE.OrthographicCamera(-innerWidth/2, innerWidth/2, innerHeight/2, -innerHeight/2, 0.1, THREE.Infinity );
    var scene = new THREE.Scene();
    window.addEventListener("resize",
        function(e) {
            camera.left = -innerWidth/2;
            camera.right = innerWidth/2;
            camera.top = innerHeight/2;
            camera.bottom = -innerHeight/2;
            camera.updateProjectionMatrix();
            renderer.setSize( innerWidth, innerHeight );
            ground.scale.set(innerWidth*10, 100, 1);
//            cat.position.set(-200,-100,0);
        }
    );

    var maps = [
        THREE.ImageUtils.loadTexture('beecage0000.png'),
        THREE.ImageUtils.loadTexture('beecage0001.png'),
        THREE.ImageUtils.loadTexture('beecage0002.png'),
        THREE.ImageUtils.loadTexture('beecage0003.png'),
    ];
    var mats = maps.map(
        function(map) {
            return new THREE.MeshBasicMaterial({
                map:map,
                transparent: true,
            });
        }
    );

    var cat = new THREE.Mesh(
        new THREE.PlaneGeometry( 100, 100), mats[0]
    );
    cat.position.set(-200,-100,0);
    var dy = 0;

    scene.add(cat);
    camera.position.set(0,0,400);
    document.body.appendChild( renderer.domElement );

    var mons = [
        "flowercage0000.png",
        "flowercage0001.png",
        "flowercage0002.png",
    ];
    mons = mons.map(
        function(img) {
            return THREE.ImageUtils.loadTexture(img);
        }
    ).map(function(tex) {
            return new THREE.MeshBasicMaterial({map:tex, transparent:true});
        }
    );

    var flo = [
        "flower.png",
        "flower.png",
        "flower.png",
    ];
    flo = flo.map(
        function(img) {
            return THREE.ImageUtils.loadTexture(img);
        }
    ).map(function(tex) {
            return new THREE.MeshBasicMaterial({map:tex, transparent:true});
        }
    );


    var blocks = [
        new THREE.MeshBasicMaterial( {color: 0x774444, side: THREE.DoubleSide}),
        new THREE.MeshBasicMaterial( {color: 0x774444, side: THREE.DoubleSide}),
        new THREE.MeshBasicMaterial( {color: 0x774444, side: THREE.DoubleSide}),
    ];
    blocks = blocks.map(
        function(mat) {
            return new THREE.Mesh(
                new THREE.PlaneGeometry(50,50),
                mat
            )
        }
    );
    blocks.forEach(function(block) {
        scene.add(block);
    });

    var bg = new THREE.Mesh(
        new THREE.PlaneGeometry( 1, 1),
        new THREE.MeshBasicMaterial({
            map: new THREE.ImageUtils.loadTexture('cage.jpeg'),
        })
    );
    bg.position.set(0,0,0);
    bg.scale.set(innerWidth, 1000, 1);
    scene.add(bg);
    bg.visible = false;


    var ground = new THREE.Mesh(
        new THREE.PlaneGeometry( 1, 1),
        new THREE.MeshBasicMaterial( {color: 0x772244})
    );
    ground.position.set(0,-175,0);
    ground.scale.set(innerWidth*10, 100, 1);
    scene.add(ground);


    var ground2 = new THREE.Mesh(
        new THREE.PlaneGeometry( 1, 1),
        new THREE.MeshBasicMaterial( {color: 0x2233ff})
    );
    ground2.position.set(0,300,0);
    ground2.scale.set(innerWidth*10, 100, 1);
    scene.add(ground2);

    function restart() {
        blocks.forEach(
            function(block, index) {
                block.position.set(innerWidth/2+index*500,-100,0);
            }
        );
        cathit = 0;
        s = previousTime;
        paused = 0;
        camera.position.x = 0;
        camera.position.y = 0;
        audio.pause();
        song.play();
        bg.visible = false;
    }

    var keydown = false;
    var doubleJump = 2;
    document.addEventListener("keydown",
        function(e) {
            keydown = true;
            action();
            e.preventDefault();
        });
    document.addEventListener("touchstart",
        function(e) {
            keydown = true;
            action();
            e.preventDefault();
        }
    );

    document.addEventListener("keyup",
        function(e) {
            keydown = false;
        }
    );
    document.addEventListener("touchend",
        function(e) {
            keydown = false;
        }
    );

    function action() {
        if(paused && previousTime-paused > 500) {
            restart();
            return;
        }
//        if(cat.position.y<=-100 || doubleJump) {
  ///          doubleJump --;
//            dy = 10;
  //          pok.play();
     //   }
    }

//    Object3D.rotateOnAxis( axis, angle );
    var axis = new THREE.Vector3(0,0,-1);
    var paused = 1;

    var audio = new Audio('notthebees.ogg');
    audio.loop = true;
    var pok = new Audio("pok.ogg");

    var song = new Audio('song.mp3');
    song.play();
    song.loop = true;


    var s = 0;
    var previousTime = 0;
    var sco = 0;
    function loop(time) {
        requestAnimationFrame( loop );

        if(!paused) {
            var dt = time-previousTime;
            if(keydown) {
                dy+=dt/20;
            }


            var frame = Math.floor(time/50);
            cat.material = mats[frame%mats.length];
            cat.position.y += dy;
            cat.setRotationFromAxisAngle(axis, -dy/30);
            dy -= dt/50;
            if(cat.position.y<=-100) {
                cat.position.y = -100;
                dy = 0;
                doubleJump = 2;
            }
            var maxpos = 200;
            if(cat.position.y>=200) {
                cat.position.y = 200;
            }

            var speed = 3;// (cat.position.y<=-100 ? 1 : 2) + (time-s)/10000;
            blocks.forEach(
                function(block) {
                    block.material = mons[frame%3];
                    block.position.x -= (dt)/3 * speed;
                    if(block.position.x < -innerWidth/2) {
                        block.position.x += innerWidth + 500*Math.random();
                        block.scale.y = 3;//.5 + Math.random();
                        block.scale.x = 3;//.5 + Math.random();
                        block.position.y = Math.random()<.5? Math.random()*200 : cat.position.y;
                    }
                    var dx = cat.position.x - block.position.x;
                    var dy = cat.position.y - block.position.y;
                    var dist = dx*dx+dy*dy;
                    if(dist<2000) {
                        paused = time;
                        cathit = time;
                        audio.play();
                        song.pause();
                        bg.visible = true;
                    }
                }
            );
            var ss =Math.floor((time-s)/100)*10;
            if (sco!=ss) {
                sco = ss;
                bs = Math.max(ss,bs);
                //best
                score.textContent = "SCORE: " + ss;
                best.innerText = "BEST: "+bs;
            }
        } else {
            var shake = time-cathit;
            if(cathit) {
                cat.rotateZ(-shake/10000);
                camera.position.x = (time-s)/shake/5 * (Math.random()-.5);
                camera.position.y = (time-s)/shake/5 * (Math.random()-.5);
            }
        }

        renderer.render(scene,camera);
        previousTime = time;
    }


    renderer.setClearColor (0x99CCFF, 1);

    var cathit = 0;

    var bs = 0;

    var score = document.createElement("span");
    score.style.color = "white";
    score.style.position = "absolute";
    score.style.left = "40px";
    score.style.top = "40px";
    score.textContent = "SPACE to fly";
    document.body.appendChild(score);

    var best = document.createElement("span");
    best.style.color = "white";
    best.style.position = "absolute";
    best.style.left = "340px";
    best.style.top = "40px";
    best.textContent = "";
    document.body.appendChild(best);
    loop(0);
};