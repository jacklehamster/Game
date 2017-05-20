var core = {
    get width() {
        return innerWidth;
    },
    get height() {
        return innerHeight;
    },
    setResizer: function (renderer, camera) {
        window.addEventListener("resize",function() {
            var gameWidth = core.width;
            var gameHeight = core.height;
            renderer.setSize( gameWidth, gameHeight );
            camera.left = -gameWidth / 2;
            camera.right = gameWidth / 2;
            camera.top = gameHeight / 2;
            camera.bottom = -gameHeight / 2;
            camera.aspect = gameWidth / gameHeight;
            camera.updateProjectionMatrix();
        });
    },
};

window.onload = function() {
    var renderer = new THREE.WebGLRenderer({antiAlias:false});
    renderer.setSize( core.width, core.height );
    renderer.setPixelRatio(window.devicePixelRatio);
//    var camera = new THREE.OrthographicCamera(-WIDTH/2, WIDTH/2, 144/2, -144/2, 0.1, THREE.Infinity );
    var camera = new THREE.PerspectiveCamera(75, core.width / core.height, 0.1, 1000000);
    camera.rotateX(.80);
    var scene = new THREE.Scene();
    core.setResizer(renderer, camera);
    camera.position.set(0,-1000,600);
    document.getElementById("game").appendChild( renderer.domElement );

    var mat = new THREE.MeshBasicMaterial(
        {
            vertexColors: THREE.FaceColors,
            transparent: true,
            opacity: 1,
            overdraw: 0.5,
        }
    );



    for(var y=-20;y<=20;y++) {
        for(var x=-20;x<=20;x++) {
            var geometry = new THREE.BoxGeometry( 1, 1, 1 );
            for ( var i = 0; i < geometry.faces.length; i += 2 ) {
                var r = Math.floor(Math.sin(y/4) * 128+128);
                var g = Math.floor(Math.sin(x/4) * 128+128);
                var b = 0;

                var hex = r * 256 * 256 + g * 256 + b;
                geometry.faces[ i ].color.setHex( hex );
                geometry.faces[ i + 1 ].color.setHex( hex );
            }
            geometry.scale(50,50,50);
            var cube = new THREE.Mesh(geometry, mat);

            cube.position.set(x*50,y*50,-100);
            scene.add(cube);
        }
    }


    var lastDown = {x:0,x:0};
    function setCursor(x,y,buttonDown) {
        if(buttonDown) {
            var dx = lastDown.x - x;
            var dy = lastDown.y - y;
//            camera.rotateY(-dx/100);
//            camera.rotateX(-dy/100);
            camera.position.x += dx*5;
            camera.position.y -= dy*5;
        }
        lastDown.x = x;
        lastDown.y = y;
    }

    document.addEventListener("mousedown",function(e) {
        setCursor(e.pageX,e.pageY,true);
    });
    document.addEventListener("mousemove",function(e) {
        setCursor(e.pageX,e.pageY,e.buttons&1);
    });
    document.addEventListener("mouseup",function(e) {
        setCursor(e.pageX,e.pageY,false);
    });


    var coreTime;
    function loop(time) {
        coreTime = time;

        requestAnimationFrame( loop );
        renderer.render(scene,camera);
    }
    loop(0);
};