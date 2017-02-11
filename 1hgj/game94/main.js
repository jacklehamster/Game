window.onload = function() {

//    setTimeout(3000,
  //  );

//    var



    var renderer = new THREE.WebGLRenderer();
    renderer.setSize( innerWidth, innerHeight );

    var camera = new THREE.PerspectiveCamera( 75, innerWidth / innerHeight, 0.1, 1000 );
    var scene = new THREE.Scene();

    var img = new THREE.MeshBasicMaterial({ //CHANGED to MeshBasicMaterial
        map:THREE.ImageUtils.loadTexture('cloud-08.jpeg')
    });
    var basic =     new THREE.MeshBasicMaterial( {color: 0xffff00, side: THREE.DoubleSide
    });

    img.map.needsUpdate = true; //ADDED

    var cloud = new THREE.Mesh(
//    new THREE.CubeGeometry(150, 200, 150, 2, 2, 2),
        new THREE.PlaneGeometry( innerWidth*10, innerHeight*10),
        img
    );

    scene.add(cloud);

    camera.position.set(0,0,400);
    document.body.appendChild( renderer.domElement );
//    renderer.render(scene,camera);

    var mats = []; var imgs = ["cloud.png","cloud2.png","cloud3.png","mariocloud.png","choco.png","Arale.png"];
    for(var i=0;i<imgs.length;i++) {
        var tex = THREE.ImageUtils.loadTexture(imgs[i]);
        var mat = new THREE.MeshBasicMaterial({
            map: tex, transparent: true
        });
        mats[i] = mat;
    }

    var plane = new THREE.PlaneGeometry( 150, 100);
    var clouds = [];
    for(var i=0; i<1000; i++) {
        var cloudMesh = new THREE.Mesh(plane, mats[i<950?i%3:i%(mats.length+1)]);
        resetCloud(cloudMesh);
        scene.add(cloudMesh);
        clouds.push(cloudMesh);
    }


    function resetCloud(cloudMesh) {
        cloudMesh.position.set((Math.random()-.5)*2000, (Math.random()-.5)*2000, Math.random()*500-250);
    }

    var mouseX=0, mouseY=0;
    document.addEventListener("mousemove",
        function(e) {
            mouseX = e.pageX/innerWidth - .5;
            mouseY = e.pageY/innerHeight - .5;
//            console.log(mouseX, mouseY);
        }
    );


    function loop(time) {
        requestAnimationFrame( loop );

        for(var i=0; i<clouds.length;i++) {
            var mesh = clouds[i];
            mesh.position.set(mesh.position.x - mouseX*5, mesh.position.y + mouseY*5, mesh.position.z + 1);
            if(mesh.position.z>500) {
                resetCloud(mesh);
            }
        }
        camera.rotateZ(mouseX/300);

        renderer.render(scene,camera);
    }
    loop();

};
