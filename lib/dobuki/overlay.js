(function (global, factory) {
 	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
 	typeof define === 'function' && define.amd ? define(['exports'], factory) :
 	(factory((global.DOBUKI = global.DOBUKI || {})));
 }(this, (function (core) { 'use strict';
    
    var canvas;
    
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
     
    function resizeCanvas(canvas, width, height) {
        canvas.width = width;
        canvas.height = height;
    }
    
    function getCanvas() {
        if(!canvas) {
            canvas = document.createElement('canvas');
            var ctx = canvas.getContext("2d");
            ctx.webkitImageSmoothingEnabled = false;
            ctx.mozImageSmoothingEnabled = false;
            ctx.imageSmoothingEnabled = false;

            canvas.style.top = "0px";
            canvas.style.left = "0px";
            canvas.style.position = "absolute";
            document.body.appendChild(canvas);
            
            resizeCanvas(canvas, innerWidth, innerHeight);            
        }
        return canvas;
    }
    
    function onResizeWindow(oldValues) {
        if(core.model.window) {
            var width = core.model.window.width, height = core.model.window.height;
            var canvas = getCanvas();
            resizeCanvas(canvas, width, height);
            var hudBitmap = getCanvas().getContext('2d');
            hudBitmap.font = "Normal 40px Arial";
            hudBitmap.textAlign = 'center';
            hudBitmap.fillStyle = "rgba(245,245,245,0.75)";
            hudBitmap.fillText('Initializing...', canvas.innerWidth / 2, canvas.innerHeight / 2);
        }
    }
     
    function initialize() {        
        core.addLoop(0,updateFromModel);
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
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        for(var i=0;i<count;i++) {
            drawObject(model.overlay.objects[i], i);
            if(!core.checkOnTime()) {
                core.skipCallbacks();
                break;
            }
        }
        
                var hudBitmap = canvas.getContext('2d');
                hudBitmap.font         = '48px "8-bit"';
                hudBitmap.textAlign = 'center';
                hudBitmap.fillStyle = "rgba(245,245,245,0.75)";
                hudBitmap.fillText('Initializing...', window.innerWidth / 2, window.innerHeight / 2);

        
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
                
                var margin = objectCut.scale9margin;
                if(!margin) {
                    ctx.drawImage(
                        objectCut.canvas, objectCut.cut[0], objectCut.cut[1], objectCut.cut[2], objectCut.cut[3],
                        x,y,w,h);
                } else {
                    var srcX = [
                        objectCut.cut[0],   //  left
                        objectCut.cut[0] + objectCut.cut[2]*margin.left,    //  mid
                        objectCut.cut[0] + objectCut.cut[2]*(1-margin.right),   //  right
                    ];
                    var srcW = [
                        objectCut.cut[2]*margin.left,
                        objectCut.cut[2]*(1-margin.left-margin.right),
                        objectCut.cut[2]*margin.right,
                    ];
                    var dstX = [
                        x,
                        Math.floor(x + objectCut.cut[2]*margin.left),
                        Math.floor(x + w - objectCut.cut[2]*margin.right),
                    ];
                    var dstW = [
                        objectCut.cut[2]*margin.left,
                        w - (margin.left + margin.right) * objectCut.cut[2],
                        objectCut.cut[2]*margin.right,
                    ];
                    var srcY = [
                        objectCut.cut[1],   //  top
                        objectCut.cut[1] + objectCut.cut[3]*margin.top, //  center
                        objectCut.cut[1] + objectCut.cut[3]*(1-margin.bottom),  //  bottom
                    ];
                    var srcH = [
                        objectCut.cut[3]*margin.top,
                        objectCut.cut[3]*(1-margin.top-margin.bottom),
                        objectCut.cut[3]*margin.bottom,
                    ];
                    var dstY = [
                        y,
                        Math.floor(y + objectCut.cut[3]*margin.top),
                        Math.floor(y + h - objectCut.cut[3]*margin.bottom),
                    ];
                    var dstH = [
                        objectCut.cut[3]*margin.top,
                        h - (margin.top + margin.bottom) * objectCut.cut[3],
                        objectCut.cut[3]*margin.bottom,
                    ];
                
                    for(var cellY=0;cellY<3;cellY++) {
                        for(var cellX=0;cellX<3;cellX++) {
                            ctx.drawImage(
                                objectCut.canvas, 
                                srcX[cellX],
                                srcY[cellY],
                                srcW[cellX],
                                srcH[cellY],
                                dstX[cellX],
                                dstY[cellY],
                                dstW[cellX],
                                dstH[cellY]
                            );
                        }
                    }
                }
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
     
    core.makeProcess("initialize-overlay", initialize).waitFor("page-loaded").ignoreParameters(true);
     
 })));