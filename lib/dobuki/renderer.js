(function (global, factory) {
 	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
 	typeof define === 'function' && define.amd ? define(['exports'], factory) :
 	(factory((global.DOBUKI = global.DOBUKI || {})));
 }(this, (function (core) { 'use strict';

    var coreMesh, coreTexture;
    var scene, camera, renderer;
    var frameTime = Math.floor(1000/60);
    var defaultModel = core.createModel(
        function(i) {
            return {x: Math.sin(i + core.time/1000), y:0, z:0};
        }, 1000);
    var model = defaultModel;
    
    function setModel(value) {
        model = value ? value : defaultModel;
    }
    
    function getCoreMesh() {
        if(!coreMesh) {
            var geometry = new THREE.Geometry();
            var material =  new THREE.MeshBasicMaterial( { transparent: true, opacity: 0 } );
            coreMesh = new THREE.Mesh( geometry, material );
        }
        return coreMesh;
    }
    
    function getCoreGeometry() {
        return getCoreMesh().geometry;
    }
    
    function getCoreMaterial() {
        return getCoreMesh().material;
    }
    
    function getPlaneBufferGeometry() {
        if (!getPlaneBufferGeometry.planeBufferGeometry) {
            getPlaneBufferGeometry.planeBufferGeometry = new THREE.BufferGeometry().fromGeometry(new THREE.PlaneGeometry( 1, 1 ));
        }
        return getPlaneBufferGeometry.planeBufferGeometry;
    }
    
    function onResizeWindow() {
          renderer.setSize( window.innerWidth, window.innerHeight );
          camera.aspect = window.innerWidth / window.innerHeight;
          camera.updateProjectionMatrix();
    }
    
    function initRenderer() {
        scene = new THREE.Scene();
        camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
        renderer = new THREE.WebGLRenderer();
        renderer.setSize( window.innerWidth, window.innerHeight );
        renderer.setPixelRatio(window.devicePixelRatio);
    }
    
    function checkDevicePixelRatio() {
        if(window.devicePixelRatio === checkDevicePixelRatio.currentDevicePixelRatio) {
            return;
        }
        checkDevicePixelRatio.currentDevicePixelRatio = window.devicePixelRatio;
        renderer.setPixelRatio(checkDevicePixelRatio.currentDevicePixelRatio);
    }
    
    function renderScene() {
        renderer.render(scene, camera);
    }
    
    var renderCount = 0;
    function calculateFPS() {
        renderCount++;
    }
    
    function setSpriteCount(count) {
        var planeGeometry = new THREE.PlaneGeometry( 1, 1 );
        var matrix = new THREE.Matrix4();
        matrix.makeTranslation(0,0,3);
        var geometry = new THREE.Geometry();
        for(var i=0; i<count; i++) {
            geometry.merge(planeGeometry, matrix);
        }
        var coreGeometry = new THREE.BufferGeometry().fromGeometry(geometry);
        var planeBufferGeometry = getPlaneBufferGeometry();
        var verticesPerShape = planeBufferGeometry.attributes.position.array.length/3;
        var cuts = new THREE.BufferAttribute(new Float32Array( 4 * count * verticesPerShape ), 4);
        coreGeometry.addAttribute('cut', cuts);
        
        var myfloat = 64.0;
        var cuts = coreGeometry.attributes.cut.array;
        for(var i=0;i<count; i++) {
            for(var j=0;j<verticesPerShape;j++) {
                cuts[i*verticesPerShape*4+j*4] = (i%2)* 1/myfloat;
                cuts[i*verticesPerShape*4+j*4+1] = 1.0 - 1/myfloat;
                cuts[i*verticesPerShape*4+j*4+2] = 1.0/myfloat;
                cuts[i*verticesPerShape*4+j*4+3] = 1.0/myfloat;
            }
        }
        coreGeometry.attributes.cut.needsUpdate = true;
        
        getCoreMesh().geometry = coreGeometry;
    }
    
    function setFPS(fps) {
        var div = document.getElementById('fps');
        if(!div) {
            div = document.createElement('div');
            div.id = 'fps';
            div.style.position = "absolute";
            div.style.left = '5px';
            div.style.top = '5px';
            document.body.appendChild(div);
        }
        div.style.color = fps > 55 ? '#009944' : fps > 30 ? '#CCAA00' : '#DD0000';
        div.textContent = fps;
        return div;
    }
    
    var countFrom = 0;
    function fetchModel() {
        var geometry = getCoreGeometry();
        if (geometry) {
            var count = model.objects.length, behind = false;
            for(var i=countFrom;i<count+countFrom;i++) {
                projectObject(model.objects[i%count], i%count, geometry);
                if(i%10==0 && !checkOnTime()) {
                    core.skipCallbacks();
                    behind = true;
                    break;
                }
            }
            if(!behind) {
                countFrom = 0;
            }
            geometry.attributes.position.needsUpdate = true;
        }
    }

    function projectObject(object, index, geometry) {
        var planeGeometry = getPlaneBufferGeometry();
        var slotsSize = planeGeometry.attributes.position.array.length;
        var positions = [object.x, object.y, object.z];
        for(var i=0; i<planeGeometry.attributes.position.array.length; i++) {
            geometry.attributes.position.array[i + slotsSize*index] = 
                planeGeometry.attributes.position.array[i] + positions[i % positions.length];
        }
    }
    
    function addFPSCounter() {
        if (location.search.indexOf('fps=1')>=0) {
            core.makeProcess("start-fps-counter", 
                function() {
                    core.addLoop(1000, function() {
                        setFPS(renderCount);
                        renderCount = 0;
                    });
                }
            ).start();
        }
    }
    
    function wasteTime(n) {
        return function() {
            var time = performance.now() + (n?n:1000);
            while(performance.now()<time) {
            }
        }
    }
    
    function checkOnTime() {
        return core.loopTime()<frameTime;
    }
    
    function initialize() {
        document.body.appendChild( renderer.domElement );
        
        window.addEventListener("resize", onResizeWindow);

        core.addLoop(1000, checkDevicePixelRatio);
        core.addLoop(frameTime, [renderScene, fetchModel, calculateFPS]);
        addFPSCounter();



/*ctx.beginPath();
ctx.lineWidth="6";
ctx.strokeStyle="blue";
for(var y=0;y<2048;y+=64) {
    for(var x=0;x<2048;x+=64) {
        ctx.rect(x,y,63,63);
    }
}
ctx.stroke();*/



        var canvas = document.createElement('canvas');
        canvas.width = 2048;
        canvas.height = 2048;
        var ctx = canvas.getContext('2d');
        coreTexture = new THREE.Texture(canvas);
        var image = new Image();
        image.src = "squid.png";
        image.addEventListener("load", function() {
            ctx.drawImage(image, 0, 0);
            coreTexture.needsUpdate = true;
          // execute drawImage statements here
        }, false);
            coreTexture.needsUpdate = true;
//            var texture = new THREE.ImageUtils.loadTexture( "squid.png" );
            coreTexture.wrapS = THREE.RepeatWrapping;
            coreTexture.wrapT = THREE.RepeatWrapping;
            coreTexture.repeat.set(.5,.5);// 4, 4 );
//            texture.repeat.set(4,4);// 4, 4 );

coreTexture.magFilter = THREE.NearestFilter;
coreTexture.minFilter = THREE.LinearMipMapLinearFilter;

//               texture.offset.x = 10;
//               texture.offset.y = 10;
//window.texture = texture;

            var material = new THREE.MeshBasicMaterial({map: coreTexture, transparent:true});
//            var material = new THREE.MeshBasicMaterial( { opacity: 0, transparent: true } );            
//            var material = newMaterial;
            var geometry = new THREE.PlaneGeometry( 1, 1 ); //new THREE.BoxGeometry( 1, 1, 1 );
            var geometry2 = new THREE.PlaneGeometry( 1, 1 ); //new THREE.BoxGeometry( 1, 1, 1 );

            var mesh = new THREE.Mesh( geometry2, material);
//            mesh.position.x = -1;
//            mesh.updateMatrix();
//            mesh.position.z = -3;

//            var positions = geometry2.getAttribute("position");
  //          for(var i=0;i<positions.array.length;i++) {
    //            positions.array[i] += .1;
      //      }
//            geometry2.getAttribute("position").needsUpdate = true;
            geometry.merge(mesh.geometry, mesh.matrix);
//            geometry.
//            geometry.merge(geometry2);
window.geo2 = geometry2;
            var geometry = new THREE.BufferGeometry().fromGeometry(geometry);


//var geometry = new THREE.BufferGeometry();
// create a simple square shape. We duplicate the top left and bottom right
// vertices because each vertex needs to appear once per triangle.
/*var vertices = new Float32Array( [
	-1.0, -1.0,  1.0,
	 1.0, -1.0,  1.0,
	 1.0,  1.0,  1.0,

	 1.0,  1.0,  1.0,
	-1.0,  1.0,  1.0,
	-1.0, -1.0,  1.0
] );
*/
// itemSize = 3 because there are 3 values (components) per vertex
//geometry.addAttribute( 'position', new THREE.BufferAttribute( vertices, 3 ) );
//var material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
//var mesh = new THREE.Mesh( geometry, material );


            setSpriteCount(1000);
			var coreMesh = getCoreMesh();
            coreMesh.position.z = -3;
            scene.add( coreMesh );
    }
    
    /**
     *  PUBLIC DECLARATIONS
     */
//    core.getCoreGeometry = getCoreGeometry;
//    core.getPlaneBufferGeometry = getPlaneBufferGeometry;
//    core.setSpriteCount = setSpriteCount;
    core.setModel = setModel;

   /**
    *   PROCESSES
    */
    var currentScript = core.getCurrentScript();
    core.requireScripts([
        'three.js', 
        'setup.js', 
        'utils.js', 
        'processor.js', 
        'loop.js',
        'graphicmodel.js'
    ]);
    core.logScript();

    initRenderer();
    core.makeProcess("waitPageLoaded", function() {
        document.addEventListener("DOMContentLoaded", this.completeWithoutParameters);
    }).start();
    core.makeProcess("load-vertex-shader", 
        function() {
            core.loadAsync(currentScript.path + "vertex-shader.glsl", this.complete);
        }
    ).start();
    core.makeProcess("load-fragment-shader", 
        function() {
            core.loadAsync(currentScript.path + "fragment-shader.glsl", this.complete);
        }
    ).start();
    
    core.makeProcess("initialize", initialize).waitFor("waitPageLoaded").ignoreParameters(true);

    core.makeProcess("apply-shaders",function(vertexShader, fragmentShader) {
        getCoreMesh().material = new THREE.ShaderMaterial( {
            uniforms: {
                texture:  { 
                    type: 'tv', 
                    value: [coreTexture,coreTexture]
                },
            },
            vertexShader: vertexShader,
            fragmentShader: fragmentShader,
            transparent:true,
        } );
    }).startAfter("initialize", "load-vertex-shader", "load-fragment-shader");

    core.startProcess("waitPageLoaded");

   
   
 })));
