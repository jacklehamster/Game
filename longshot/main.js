window.onload = function() {
    var renderer = new THREE.WebGLRenderer({antiAlias:true});
    renderer.setSize( WIDTH, HEIGHT );
    renderer.setPixelRatio(window.devicePixelRatio);
    var camera = new THREE.OrthographicCamera(-WIDTH/2, WIDTH/2, 144/2, -144/2, 0.1, THREE.Infinity );
//    var camera = new THREE.PerspectiveCamera(75, innerWidth / innerHeight, 0.1, 1000000);
    var scene = new THREE.Scene();
    setResizer(renderer, camera);

    function loop(time) {
        coreTime = time;
        requestAnimationFrame( loop );
        renderer.render(scene,camera);
    }
    loop(0);
};