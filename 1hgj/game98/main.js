window.onload = function() {
    var renderer = new THREE.WebGLRenderer();
    renderer.setSize( innerWidth, innerHeight );
    var camera = new THREE.OrthographicCamera(-innerWidth/2, innerWidth/2, innerHeight/2, -innerHeight/2, 0.1, THREE.Infinity );
    var scene = new THREE.Scene();

    var maps = [
        THREE.ImageUtils.loadTexture('ceo.png'),
        THREE.ImageUtils.loadTexture('ceo3.png'),
        THREE.ImageUtils.loadTexture('ceo2.png'),
        THREE.ImageUtils.loadTexture('ceo-egg.png'),
    ];
    var mats = maps.map(
        function(map) {
            return new THREE.MeshBasicMaterial({
                map:map,
                transparent:true,
            });
        }
    );

    var ceo = new THREE.Mesh(
        new THREE.PlaneGeometry( 100, 100), mats[0]
    );
    ceo.position.set(0,0,0);
    ceo.geometry.scale(5,4,1);

    scene.add(ceo);
    camera.position.set(0,0,400);
    document.body.appendChild( renderer.domElement );

/*    var bg = new Image();
    bg.style.width = "100%";
    bg.style.position = "absolute";
    bg.src ="ng.jpeg";
    document.body.appendChild(bg);
*/
    var crowd = new THREE.Mesh(new THREE.PlaneGeometry(100,100),
        new THREE.MeshBasicMaterial(
            {
                map: THREE.ImageUtils.loadTexture('ng.jpeg'),
            }
        )
    );
    crowd.position.set(0,90,0);
    crowd.geometry.scale(5,3,1);

    scene.add(crowd);


    var eggInTheAir = true;
    var pressed = 0;
    document.addEventListener("keydown",
        function(e) {
            tap();
            e.preventDefault();
        }
    );
    document.addEventListener("touchstart",
        function(e) {
            tap();
                    e.preventDefault();
        }
    );
    document.addEventListener("keyup", function(e) {
            clearKey();
        }
    );
    document.addEventListener("touchend", function(e) {
        clearKey();
    });

    function log(msg) {
        document.getElementById("info").innerText = msg;
    }

    log("Press [SPACE] at the right moment to catch the egg.\nMake screen taller if you cannot see the egg.");

    var canPress = true;
    function clearKey() {
        canPress = true;
    }

    function tap() {
        if(!canPress) {
            return;
        }
        if(egged && t-egged>500) {
            log("Press [SPACE] at the right moment to catch the egg.\nMake screen taller if you cannot see the egg.");
            score = 0;
            gameStarted = false;
            eggInTheAir = true;
            egged = false;
            egg.visible = true;
            egg.position.set(0,300,0);
            dy = 0;
            meo.play();
            return;
        }

        if(!eggInTheAir && !egged) {
            pik.play();

            egg.position.y = 5;
            dy = 20+Math.random()*10;
            eggInTheAir = true;
            egg.visible = true;
        }
        pressed = t;
        gameStarted = true;
        canPress = false;
    }

    var axis = new THREE.Vector3(0,0,-1);
    var paused = 1;

    var score = 0;
    var geometry = new THREE.SphereGeometry(3, 50, 50, 0, Math.PI * 2, 0, Math.PI * 2);
//    var material = new THREE.MeshNormalMaterial();
    var material = new THREE.MeshLambertMaterial();
    var egg = new THREE.Mesh(geometry, material);
    egg.position.set(0,300,0);
    egg.geometry.scale(8,10,8);
    scene.add(egg);
    var light = new THREE.AmbientLight( 0xeeeeee ); // soft white light
    scene.add( light );
    var light2 = new THREE.PointLight( 0xdddddd, 20, 100,2 );
    light2.position.set( 50, 50, 50 );
    scene.add( light2 );

    var pik = new Audio('pik.ogg');
    var pok = new Audio("pok.ogg");
    var meo = new Audio('assets/1_hour_game_jam_splash.ogg');
    meo.play();

    function mouthO() {
        return t - pressed<100;
    }

    var gameStarted = 0;
    var t = 0;
    var dy = 0;
    var egged = false;
    function loop(time) {
        t = time;
        if(eggInTheAir) {
            egg.rotateZ(.2);
            egg.rotateX(.1);
            if(gameStarted) {
                egg.position.y += dy;
                dy--;
            }
            if(egg.position.y < 5) {
                eggInTheAir = false;
                egg.visible = false;
                if(!mouthO()) {
                    pok.play();
                    egged = t;
                    log("EGGED! Ohh you let us down. Final score: "+score);
                } else {
                    pik.play();
                    score++;
                    log("SCORE: "+score +"\n"+ (score>2500?"That's it, i'll let you play with your egg.":score>1280?"There's more to life than flipping eggs u know":score>640?"Oh wow, we got an egg nut here.":score>320?"No really? You're still flipping eggs?":score>160?"You'll be flipping eggs forever my friend":score>80?"Oh, we've got a egg pro here!":score>40?"You flip eggs like a champion!": score>20?"Look at that egg go! That's the way you do it.": score>10?"You're an egg warrior!":score>5?"You're doing great!":""));
                }
            }
        }
        requestAnimationFrame( loop );
        if(eggInTheAir) {
            if(mouthO()) {
                ceo.material = mats[1];
            } else {
                ceo.material = mats[0];
            }
        } else {
            if(!egged) {
                ceo.material = mats[2];
            } else {
                ceo.material = mats[3];
            }
        }
       renderer.render(scene,camera);
    }
    loop(0);
};