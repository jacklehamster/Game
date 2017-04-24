window.onload = function() {
    var renderer = new THREE.WebGLRenderer({antiAlias:true});
    renderer.setSize( innerWidth, innerHeight );
    var camera = new THREE.OrthographicCamera(-innerWidth/2, innerWidth/2, innerHeight/2, -innerHeight/2, 0.1, THREE.Infinity );
    var scene = new THREE.Scene();
    setResizer(renderer, camera);

    camera.position.set(0,0,1000);
    document.body.appendChild( renderer.domElement );


    var windowMat = [
        0,1,2,3,
    ].map(function(num) {
        return 'img/window-000'+num+'.jpeg';
    }).map(function(file) {
        return THREE.ImageUtils.loadTexture(file);
    }).map(function(map) {
        return new THREE.MeshBasicMaterial({
            map:map,
            transparent:true,
            side: THREE.DoubleSide,
        });
    });

    var background = new THREE.Mesh(new THREE.PlaneGeometry(1,1),
        windowMat[0]
    );
    background.position.set(0,0,0);
    background.geometry.scale(800,600,1);
    scene.add(background);


    var step = 0;
    var hasFlower = localStorage.getItem("flower") && parseInt(localStorage.getItem("flower")) >0 ;
    var wait = Date.now();
    document.addEventListener("keyup", function() {
        if(Date.now()-wait > 1000) {
            if(hasFlower) {
                step = Math.min(3,step+1);
            } else {
                loadScene('alley', { x: -160, y: -100, dx: 1 }, null);
            }
        }
    });


    function loop(time) {
        var index = (time/100|0);

        background.material = windowMat[step];

        requestAnimationFrame( loop );
        renderer.render(scene,camera);
    }
    loop(0);
};