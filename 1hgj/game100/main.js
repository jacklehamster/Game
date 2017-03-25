window.onload = function() {
    var renderer = new THREE.WebGLRenderer({antiAlias:true});
    renderer.setSize( innerWidth, innerHeight );
    var camera = new THREE.OrthographicCamera(-innerWidth/2, innerWidth/2, innerHeight/2, -innerHeight/2, 0.1, THREE.Infinity );
    var scene = new THREE.Scene();

    var geometry = new THREE.SphereGeometry(3, 50, 50, 0, Math.PI * 2, 0, Math.PI * 2);
    var material = new THREE.MeshNormalMaterial();
    var ball = new THREE.Mesh(geometry, material);
    ball.scale.set(15,15,15);
    scene.add(ball);

    var geometry2 = new THREE.SphereGeometry(3, 50, 50, 0, Math.PI * 2, 0, Math.PI * 2);
    ball2 = new THREE.Mesh(geometry2, material);
    ball2.scale.set(15,15,15);
    ball2.position.set(-40,0,0);
    scene.add(ball2);

/*    var singleGeometry = new THREE.Geometry();

    ball.updateMatrix();
    singleGeometry.merge(ball.geometry, ball.matrix);

    ball2.updateMatrix();
    ball.geometry.merge(ball2.geometry, ball2.matrix);
*/
    camera.position.set(0,0,400);
    document.body.appendChild( renderer.domElement );

    var lastSpot = {x:0,y:0};
    document.addEventListener("mousedown",
        function(e) {
//            lastSpot.x = e.pageX;
  //          lastSpot.y = e.pageY;
            createBallDown();
        }
    );

    document.addEventListener("mousemove",
        function(e) {
//            if(e.buttons) {
//                var dx = e.pageX - lastSpot.x;
//                var dy = e.pageY - lastSpot.y;
//                camera.rotation.z += dx/100;
//
//             camera.rotation.x += dy/100;

            ballDown.position.x = -(window.innerWidth/2- e.pageX);
            ballDown.position.y = window.innerHeight/2 -e.pageY;
  //              lastSpot.x = e.pageX;
   //             lastSpot.y = e.pageY;
//            }
            if(e.buttons && t-lastBallDown>100) {
                createBallDown();
            }
        }
    );
    var lastBallDown = 0;

    var ballDown;
    function createBallDown() {
        var geometry3 = new THREE.SphereGeometry(3, 50, 50, 0, Math.PI * 2, 0, Math.PI * 2);
        ballDown = new THREE.Mesh(geometry2, material);
        ballDown.scale.set(10,10,10);
        ballDown.position.set(0,150,0);
        scene.add(ballDown);
        array.push([ballDown,t]);
        lastBallDown = t;
    }

    var array = [

    ];
    createBallDown();



    var t =0;

    var render = function (time) {
        t = time;
        requestAnimationFrame(render);

  //      var size = Math.sin(time/500)*10;
//        ballDown.scale.set(size,size,size);

        for(var i=0;i<array.length;i++) {
            size = Math.sin((time-array[i][1])/1000*10)+5;
            array[i][0].scale.set(
                size,size,size
            );
        }

/*        ballDown.position.y--;
        if(ballDown.position.y < -150) {
            ballDown.position.y = 150;
        }
*/


        renderer.render(scene, camera);
    };

    render(0);

};