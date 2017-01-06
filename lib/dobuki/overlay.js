(function (global, factory) {
 	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
 	typeof define === 'function' && define.amd ? define(['exports'], factory) :
 	(factory((global.DOBUKI = global.DOBUKI || {})));
 }(this, (function (core) { 'use strict';
    
    var camFactor = 2;
    var corePlane;
    var scene, camera, canvas, texture;
    
    /**
     *  HEADER
     */   
    core.requireScripts([
        'setup.js',
        'renderer.js',
        'spritesheet.js',
    ]);
    core.logScript();

    /**
     *  FUNCTION DEFINITIONS
     */   
     
    function getCorePlane() {
        if(!corePlane) {
            var canvas = getCanvas();
            texture = new THREE.Texture(canvas) 
            texture.needsUpdate = true;
            
        var hudBitmap = getCanvas().getContext('2d');
        hudBitmap.font = "Normal 40px Arial";
        hudBitmap.textAlign = 'center';
        hudBitmap.fillStyle = "rgba(245,245,245,0.75)";
        hudBitmap.fillText('Initializing...', window.innerWidth / 2, window.innerHeight / 2);
        texture.needsUpdate = true;
            
            // Create HUD material.
            var material = new THREE.MeshBasicMaterial( {map: texture, transparent: true } );
            
            // Create plane to render the HUD. This plane fill the whole screen.
            var planeGeometry = new THREE.PlaneGeometry( 1, 1 );
            corePlane = new THREE.Mesh( planeGeometry, material );
            scene.add( corePlane );
            
        }
        return corePlane;
    }
    
    function resizeCanvas(canvas) {
        var w = 1, h = 1;
        while(w<window.innerWidth) {
            w *= 2;
        }
        while(h<window.innerHeight) {
            h *= 2;
        }
        canvas.width = w;
        canvas.height = h;
    }
    
    function getCanvas() {
        if(!canvas) {
            canvas = document.createElement('canvas');
            resizeCanvas(canvas);
        }
        return canvas;
    }
         
    function initScene() {
        scene = new THREE.Scene();
    }
    
    function initCamera() {
        camera = new THREE.OrthographicCamera(-window.innerWidth/camFactor, window.innerWidth/camFactor, window.innerHeight/camFactor, -window.innerHeight/camFactor, 0, 30 );
    }
         
    function onResizeWindow(oldValues) {
        if(core.model.window) {
            var width = core.model.window.width, height = core.model.window.height;
            camera.left = -width / camFactor;
            camera.right = width / camFactor;
            camera.top = height / camFactor;
            camera.bottom = -height / camFactor;
            camera.updateProjectionMatrix();
            
            var canvas = getCanvas();
            resizeCanvas(canvas);
        var hudBitmap = getCanvas().getContext('2d');
        hudBitmap.font = "Normal 40px Arial";
        hudBitmap.textAlign = 'center';
        hudBitmap.fillStyle = "rgba(245,245,245,0.75)";
        hudBitmap.fillText('Initializing...', canvas.innerWidth / 2, canvas.innerHeight / 2);
        texture.needsUpdate = true;
            
            var plane = getCorePlane();
            plane.scale.set( canvas.width, canvas.height, 1 );
        }
    }
     
    function initialize() {        
        scene.add( getCorePlane() );
        core.addRenderComponent(2, scene, camera, updateFromModel);
        onResizeWindow();
        core.watchModel("window.width|window.height", onResizeWindow);

        

/*        
        // We will use 2D canvas element to render our HUD.  
        var hudCanvas = document.createElement('canvas');
        
        // Again, set dimensions to fit the screen.
        hudCanvas.width = window.innerWidth;
        hudCanvas.height = window.innerHeight;
        
        // Get 2D context and draw something supercool.
        var hudBitmap = hudCanvas.getContext('2d');
        hudBitmap.font = "Normal 40px Arial";
        hudBitmap.textAlign = 'center';
        hudBitmap.fillStyle = "rgba(245,245,245,0.75)";
        hudBitmap.fillText('Initializing...', window.innerWidth / 2, window.innerHeight / 2);
        
        // Create the camera and set the viewport to match the screen dimensions.
        cameraHUD = new THREE.OrthographicCamera(-window.innerWidth/2, window.innerWidth/2, window.innerHeight/2, -window.innerHeight/2, 0, 30 );
        
        // Create also a custom scene for HUD.
        sceneHUD = new THREE.Scene();
        
        // Create texture from rendered graphics.
        var hudTexture = new THREE.Texture(hudCanvas) 
        hudTexture.needsUpdate = true;
        
        // Create HUD material.
        var material = new THREE.MeshBasicMaterial( {map: hudTexture, opacity: 1} );
        material.transparent = true;
        
        // Create plane to render the HUD. This plane fill the whole screen.
        var planeGeometry = new THREE.PlaneGeometry( window.innerWidth, window.innerHeight );
        var plane = new THREE.Mesh( planeGeometry, material );
        sceneHUD.add( plane );
        */
        
/*        var geometry = new THREE.SphereBufferGeometry( 50, 32, 16 );
		var material = new THREE.MeshBasicMaterial( { color: 0xffffff, wireframe:true } );

        for ( var i = 0; i < 500; i ++ ) {

            var mesh = new THREE.Mesh( geometry, material );

            mesh.position.x = Math.random() * 5000 - 2500;
            mesh.position.y = Math.random() * 5000 - 2500;
            mesh.position.z = Math.random() * 5000 - 2500;

            mesh.scale.x = mesh.scale.y = mesh.scale.z = Math.random() * 3 + 1;

            scene.add( mesh );
            core.spheres.push(mesh);
        }               */
    }
    
    function updateFromModel() {
        var model = core.getModel();
        var count = model && model.overlay && model.overlay.objects ? model.overlay.objects.length : 0;
        var canvas = getCanvas();
        var ctx = canvas.getContext("2d");
        var canvasScaleFactor = [canvas.width / innerWidth, canvas.height / innerHeight];
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        for(var i=0;i<count;i++) {
            drawObject(model.overlay.objects[i], i);
            if(!core.checkOnTime()) {
                core.skipCallbacks();
                break;
            }
        }
        
        if(texture) {
            texture.needsUpdate = true;
        }
        
        function drawObject(object, index) {
            if(typeof object.visible !== 'undefined' && !object.visible) {
                return;
            }
            var objectCut = object.frame ? core.getCut(object.frame, true) : { cut:nullCut, canvas:null };
            if(objectCut.canvas && typeof object.position.x !== 'undefined' && typeof object.position.y !== 'undefined') {
                var x = object.position.x;
                var y = object.position.y;
                var size = object.size ? object.size : objectCut.cut.slice(2);
                var w = size[0];
                var h = size[1];
                if(object.frame.offset) {
                    x += object.frame.offset[0];
                    y += object.frame.offset[1]; 
                }
                if(object['absolute']) {
                    x *= canvasScaleFactor[0];
                    y *= canvasScaleFactor[1];
                    w *= canvasScaleFactor[0];
                    h *= canvasScaleFactor[1];
                }
                ctx.drawImage(
                    objectCut.canvas, objectCut.cut[0], objectCut.cut[1], objectCut.cut[2], objectCut.cut[3],
                    x,y,w,h);
            }
        }
    }
    
    function destroyEverything() {
    }
   
    /**
     *  PUBLIC DECLARATIONS
     */
    core.destroyEverything = core.combineMethods(destroyEverything, core.destroyEverything);

    /**
     *   PROCESSES
     */
     
    initScene();
    initCamera();
    core.makeProcess("initialize-overlay", initialize).waitFor("initialize-renderer").ignoreParameters(true);
     
 })));