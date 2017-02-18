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
        }
    );

    var maps = [
        THREE.ImageUtils.loadTexture('cat_0.png'),
        THREE.ImageUtils.loadTexture('cat_1.png'),
        THREE.ImageUtils.loadTexture('cat_2.png'),
        THREE.ImageUtils.loadTexture('cat_3.png'),
    ];
    var mats = maps.map(
        function(map) {
            return new THREE.MeshBasicMaterial({
                map:map,
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
        "sprite_0.png",
        "sprite_1.png",
        "sprite_2.png",
        "sprite_3.png",
    ];
    mons = mons.map(
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

    var ground = new THREE.Mesh(
        new THREE.PlaneGeometry( innerWidth*10, 100),
        new THREE.MeshBasicMaterial( {color: 0x777777, side: THREE.DoubleSide})
    );
    ground.position.set(0,-175,0);
    scene.add(ground);

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
    }

    var doubleJump = 2;
    document.addEventListener("keydown",
        function(e) {
            if(paused && previousTime-paused > 500) {
                restart();
                return;
            }
            if(cat.position.y<=-100 || doubleJump) {
                doubleJump --;
                dy = 15;
                pok.play();
            }
            e.preventDefault();
    });
//    Object3D.rotateOnAxis( axis, angle );
    var axis = new THREE.Vector3(0,0,-1);
    var paused = 1;

    var audio = new Audio('meow.mp3');
    var pok = new Audio("pok.ogg");

    var s = 0;
    var previousTime = 0;
    function loop(time) {
        requestAnimationFrame( loop );

        if(!paused) {
            var frame = Math.floor(time/50);
            cat.material = mats[frame%mats.length];
            cat.position.y += dy;
            cat.setRotationFromAxisAngle(axis, -dy/30);
            dy --;
            if(cat.position.y<=-100) {
                cat.position.y = -100;
                dy = 0;
                doubleJump = 2;
            }

            var speed = (cat.position.y<=-100 ? 1 : 2) + (time-s)/10000;
            blocks.forEach(
                function(block) {
                    block.material = mons[frame%3];
                    block.position.x -= (time-previousTime)/3 * speed;
                    if(block.position.x < -innerWidth/2) {
                        block.position.x += innerWidth + 500*Math.random();
                        block.scale.y = .5 + Math.random();
                    }
                    var dx = cat.position.x - block.position.x;
                    var dy = cat.position.y - block.position.y;
                    var dist = dx*dx+dy*dy;
                    if(dist<50) {
                        paused = time;
                        cathit = time;
                        audio.play();

                    }
                }
            );
            var ss =Math.floor((time-s)/100)*10;
            bs = Math.max(ss,bs);
                //best
            score.textContent = "SCORE: " + ss;
            best.innerText = "BEST: "+bs;
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


    var cathit = 0;

    var bs = 0;

    var score = document.createElement("span");
    score.style.color = "white";
    score.style.position = "absolute";
    score.style.left = "40px";
    score.style.top = "40px";
    score.textContent = "SPACE to Jump/double-jump";
    document.body.appendChild(score);

    var best = document.createElement("span");
    best.style.color = "white";
    best.style.position = "absolute";
    best.style.left = "340px";
    best.style.top = "40px";
    best.textContent = "-";
    document.body.appendChild(best);
    loop(0);
};