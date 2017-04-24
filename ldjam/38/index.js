window.onload = function() {
    var renderer = new THREE.WebGLRenderer({antiAlias:true});
    renderer.setSize( innerWidth, innerHeight );
    var camera = new THREE.OrthographicCamera(-innerWidth/2, innerWidth/2, innerHeight/2, -innerHeight/2, 0.1, THREE.Infinity );
    var scene = new THREE.Scene();
    setResizer(renderer, camera);

    camera.position.set(0,0,600);
    document.body.appendChild( renderer.domElement );

    var background = new THREE.Mesh(new THREE.PlaneGeometry(1,1),
        new THREE.MeshBasicMaterial(
            {
                map: THREE.ImageUtils.loadTexture('img/intro.jpeg'),
            }
        )
    );
    background.position.set(0,0,-200);
    background.geometry.scale(800,600,1);
    scene.add(background);


    var flasherMat = new THREE.MeshBasicMaterial(
        {
            map: THREE.ImageUtils.loadTexture('img/gameflasher.png'),
            transparent: true,
        }
    );
    var flasherCycleMat = [
        flasherMat, flasherMat,flasherMat,
        noMat
    ];

    var backgroundOverlay = new THREE.Mesh(new THREE.PlaneGeometry(1,1),
        null
    );
    backgroundOverlay.position.set(0,0,-199);
    backgroundOverlay.geometry.scale(800,600,1);
    scene.add(backgroundOverlay);


    function loop(time) {
        var index = (time/200|0);

        backgroundOverlay.material = flasherCycleMat[index%flasherCycleMat.length];

        requestAnimationFrame( loop );
        renderer.render(scene,camera);
    }
    loop(0);
};