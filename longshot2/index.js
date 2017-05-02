window.onload = function() {
    var renderer = new THREE.WebGLRenderer({antiAlias:true});
    renderer.setSize( innerWidth, innerHeight );
    renderer.setPixelRatio(window.devicePixelRatio);
    var camera = new THREE.OrthographicCamera(-innerWidth/2, innerWidth/2, innerHeight/2, -innerHeight/2, 0.1, THREE.Infinity );
    var scene = new THREE.Scene();
    setResizer(renderer, camera);

    camera.position.set(0,0,600);
    document.body.appendChild( renderer.domElement );

    var background = new THREE.Mesh(new THREE.PlaneGeometry(1,1),
        new THREE.MeshBasicMaterial(
            {color: 0x005500, transparent: false, opacity: 1}
        )
    );
    background.position.set(0,0,0);
    background.geometry.scale(960,144,1);
    scene.add(background);

    var leftPlayer =  new THREE.Mesh(new THREE.PlaneGeometry(1,1),
        new THREE.MeshBasicMaterial(
            {color: 0x338899, transparent: false, opacity: 1}
        )
    );
    leftPlayer.position.set(-400,0,0);
    leftPlayer.geometry.scale(30,30,1);
    leftPlayer.radius = 15;
    window.l = leftPlayer;
    scene.add(leftPlayer);

    var rightPlayer = new THREE.Mesh(new THREE.PlaneGeometry(1,1),
        new THREE.MeshBasicMaterial(
            {color: 0x889933, transparent: false, opacity: 1}
        )
    );
    rightPlayer.position.set(400,0,0);
    rightPlayer.geometry.scale(30,30,1);
    rightPlayer.radius = 15;
    window.r = rightPlayer;
    scene.add(rightPlayer);


    var geometry = new THREE.SphereGeometry(1, 50, 50, 0, Math.PI * 2, 0, Math.PI * 2);
//    var material = new THREE.MeshNormalMaterial();
    var tex = THREE.ImageUtils.loadTexture('img.jpeg');
    tex.repeat.x = 1/3;
    tex.repeat.y = 1/3;
    var material = new THREE.MeshLambertMaterial({
        map: tex,
    });
    var ball = new THREE.Mesh(geometry, material);
    ball.position.set(0,0,0);
    ball.geometry.scale(10,10,10);
    ball.radius = 10;
    scene.add(ball);
    ball.bounce = .7;
    ball.canRotate = true;
    var light = new THREE.AmbientLight( 0xcccccc ); // soft white light
    scene.add( light );
    var light2 = new THREE.PointLight( 0xffffff, 1, 0, 5 );
    light2.position.set( -50, 250, 50 );
    scene.add( light2 );
    window.b = ball;

    var speed = 5, brake = .8;
    setCheckKeyboard(function(keyboard) {
        if(leftPlayer.grounded) {
            if(keyboard[37]) {
                leftPlayer.dx = Math.max(-speed,leftPlayer.dx-1);
            } else {
                leftPlayer.dx *= brake;
                if(Math.abs(leftPlayer.dx)<.1) {
                    leftPlayer.dx = 0;
                }
            }
            if(keyboard[39]) {
                leftPlayer.dx = Math.min(speed,leftPlayer.dx+1);
            } else {
                leftPlayer.dx *= brake;
                if(Math.abs(leftPlayer.dx)<.1) {
                    leftPlayer.dx = 0;
                }
            }
        }
        if(keyboard[38]) {
            if(leftPlayer.grounded) {
                leftPlayer.dy = 11;
                leftPlayer.grounded = false;
            }
        }
    });

    function checkShots() {
        if(dist2d(leftPlayer.position, ball.position)<11) {
            ball.dx = 10;
            ball.dy = 10;
        }
        if(dist2d(rightPlayer.position, ball.position)<11) {
            ball.dx = -10;
            ball.dy = 10;
        }
    }

    function moveToBall(rightPlayer) {
        var goalX;
        if(ball.position.x > 0) {
            goalX = ball.position.x;
        } else {
            goalX = 400;
        }
        var dx = goalX - rightPlayer.position.x;
        rightPlayer.dx = Math.max(-5, Math.min(5, dx/3));
    }


    var keyboard = setupKeyboard();
    window.k = keyboard;
    function loop(time) {
        var index = (time/200|0);
        checkKeyboard(keyboard);
        leftPlayer.move();
        moveToBall(rightPlayer);
        rightPlayer.move();
        ball.move();
        checkShots();
        requestAnimationFrame( loop );
        renderer.render(scene,camera);
    }
    loop(0);
};