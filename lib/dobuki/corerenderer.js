(function (global, factory) {
 	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
 	typeof define === 'function' && define.amd ? define(['exports'], factory) :
 	(factory((global.DOBUKI = global.DOBUKI || {})));
 }(this, (function (core) { 'use strict';

    core.requireScripts([
        'threejs', 
        'setup.js', 
        'utils.js', 
        'processor.js', 
        'loop.js',
        'spritesheet.js',
        'coremodel.js',
    ]);


    var coreMesh, coreMaterial, wireframeMaterial, uniforms;
    var scene, camera;
    var spriteCount = 0;

    function getCoreMesh() {
        if(!coreMesh) {
            var geometry =  new THREE.BufferGeometry();
            var material =  new THREE.MeshBasicMaterial( { transparent: true, opacity: 0 } );
            coreMesh = new THREE.Mesh( geometry, material );
            coreMesh.frustumCulled = false;
        }
        return coreMesh;
    }
    
    function getCoreGeometry() {
        return getCoreMesh().geometry;
    }
    
    function getCoreMaterial() {
        return getCoreMesh().material;
    }
    
    function setCoreGeometry(geometry) {
        getCoreMesh().geometry.dispose();
        getCoreMesh().geometry = geometry;
    }
    
    function setCoreMaterial(material) {
        coreMaterial = material;
        getCoreMesh().material.dispose();
        getCoreMesh().material = material;
    }
    
    function getPlaneBufferGeometry() {
        if (!getPlaneBufferGeometry.planeBufferGeometry) {
            getPlaneBufferGeometry.planeBufferGeometry = new THREE.BufferGeometry().fromGeometry(new THREE.PlaneGeometry( 1, 1 ));
        }
        return getPlaneBufferGeometry.planeBufferGeometry;
    }
    
    function onResizeWindow() {
        if(core.model.window) {
            camera.aspect = core.model.window.width / core.model.window.height;
            camera.updateProjectionMatrix();
        }
    }
    
    function initScene() {
        scene = new THREE.Scene();
    }
    
    function initCamera() {
        camera = new THREE.PerspectiveCamera( 75, innerWidth / innerHeight, 0.1, 1000 );
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
        geometry.dispose();
        planeGeometry.dispose();
        
        var planeBufferGeometry = getPlaneBufferGeometry();
        var verticesPerShape = planeBufferGeometry.attributes.position.array.length/3;
        var cuts = new THREE.BufferAttribute(new Float32Array( 4 * count * verticesPerShape ), 4);
        coreGeometry.addAttribute('cut', cuts);
        var textures = new THREE.BufferAttribute(new Float32Array( count * verticesPerShape), 1);
        coreGeometry.addAttribute('tex', textures);
        
        setCoreGeometry(coreGeometry);
        spriteCount = count;
    }
    
    function showWireframe(value) {
        if(typeof(value)==='undefined') {
            value = true;
        }
        if(!coreMaterial) {
            handleError("Core material not initialized");
            return;
        }
        if(value) {
            if(!wireframeMaterial) {
                wireframeMaterial = new THREE.MeshBasicMaterial({
                   color: new THREE.Color(0xFFFFFF),
                   side: THREE.DoubleSide,
                   wireframe: true
                });
            }
            getCoreMesh().material = wireframeMaterial;
        } else {
            getCoreMesh().material = coreMaterial;
        }
    }
    
    function toggleWireframe() {
        showWireframe(getCoreMesh().material !== wireframeMaterial);
    }
    
    function updateFromModel() {
        var model = core.getModel();
        
        if(model && model.camera) {
            if (model.camera.rotation) {
                camera.rotation.x = model.camera.rotation.x||0;
                camera.rotation.y = model.camera.rotation.y||0;
                camera.rotation.z = model.camera.rotation.z||0;
            }
            
            if (model.camera.position) {
                camera.position.x = model.camera.position.x||0;
                camera.position.y = model.camera.position.y||0;
                camera.position.z = model.camera.position.z||0;
            }
        }
        
        var count = model && model.objects ? model.objects.length : 0;
        
        var geometry = getCoreGeometry();
        if (geometry && geometry.attributes.cut && count) {
            var planeGeometry = getPlaneBufferGeometry();
            var slotsSize = planeGeometry.attributes.position.array.length;
            var nullCut = [0,0,0,0];
            var verticesPerShape = planeGeometry.attributes.position.array.length/3;
            var cuts = geometry.attributes.cut.array;
            var textures = geometry.attributes.tex.array;

            for(var i=0;i<count;i++) {
                projectObject(model.objects[i], i);
                if(!core.checkOnTime()) {
                    core.skipCallbacks();
                    break;
                }
            }
            
            cleanGeometry(count, geometry);
            
            geometry.attributes.position.needsUpdate = true;
            geometry.attributes.cut.needsUpdate = true;
            geometry.attributes.tex.needsUpdate = true;
        }
        
        function projectObject(object, index) {
            var positions = [object.position.x||0, object.position.y||0, object.position.z||0];
            
            var rotation = null;
            if(object.rotation) {
                rotation = {
                    x:object.rotation.x||0,
                    y:object.rotation.y||0,
                    z:object.rotation.z||0,
                };
                planeGeometry.rotateX(rotation.x);
                planeGeometry.rotateY(rotation.y);
                planeGeometry.rotateZ(rotation.z);
            }
            
            var size = null;
            if(object.size) {
                size = [
                    object.size[0]||1,
                    object.size[1]||1,
                    object.size[2]||1,
                ];
                planeGeometry.scale(size[0], size[1], size[2]);
            }
            
            var scale = object.scale;
            if(scale) {
                scale = object.scale;
                planeGeometry.scale(scale, scale, scale);
            }
            for(var i=0; i<planeGeometry.attributes.position.array.length; i++) {
                geometry.attributes.position.array[i + slotsSize*index] = 
                    planeGeometry.attributes.position.array[i] + positions[i % positions.length];
            }
            if(scale) {
                planeGeometry.scale(1/scale,1/scale,1/scale);
            }
            if(size) {
                planeGeometry.scale(1/size[0], 1/size[1], 1/size[2]);
            }
            if(rotation) {
                planeGeometry.rotateX(-rotation.x);
                planeGeometry.rotateY(-rotation.y);
                planeGeometry.rotateZ(-rotation.z);
            }
            
            var objectCut = object.frame ? core.getCut(object.frame) : { cut:nullCut, texture:0 };
            
            for(var j=0;j<verticesPerShape;j++) {
                for(var i=0;i<objectCut.cut.length;i++) {
                    cuts[(index*verticesPerShape + j)*4 + i] = objectCut.cut[i];
                }
                textures[index*verticesPerShape + j] = objectCut.texture;
            }
            
            if(uniforms && uniforms.texture.value.length <= objectCut.texture) {
                uniforms.texture.value.push(core.getTexture(objectCut.texture));
                uniforms.texture.needsUpdate = true;
            }
        }        
    }

    function cleanGeometry(index, geometry) {
        var planeGeometry = getPlaneBufferGeometry();
        var slotsSize = planeGeometry.attributes.position.array.length;
        for(var i=slotsSize*index;i<geometry.attributes.position.array.length;i++) {
            geometry.attributes.position.array[i] = 0;
        }
    }

    function getScene() {
        return scene;
    }
    
    function initialize() {
        scene.add( getCoreMesh() );
        
        core.addRenderComponent(1, scene, camera, updateFromModel);

        //  update sprite count
        core.watchModel("objects.length",
            function() {
                var count = core.model.objects.length;
                if(spriteCount < count) {
                    for(var c = Math.max(spriteCount,1); c<count; c*=2) {
                    }
                    setSpriteCount(c);
                }
            }
        );
        
        
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
    
    function destroyEverything() {
        if(coreMesh) {
            if(coreMesh.material) {
                coreMesh.material.dispose();
            }
            if(coreMesh.geometry) {
                coreMesh.geometry.dispose();
            }
            scene.remove(coreMesh);
            coreMesh = null;
        }
        if(wireframeMaterial) {
            wireframeMaterial.dispose();
            wireframeMaterial = null;
        }
        core.stopWatch("window.width|window.height");
    }
    
    /**
     *  PUBLIC DECLARATIONS
     */
    core.getScene = getScene;
    core.showWireframe = showWireframe;
    core.destroyEverything = core.combineMethods(destroyEverything, core.destroyEverything);

   /**
    *   PROCESSES
    */
    var currentScript = core.getCurrentScript();
    core.logScript();

    initScene();
    initCamera();
    onResizeWindow();
//    core.watchModel("window.width|window.height", onResizeWindow);
    core.watchModel("window.width", onResizeWindow);
    core.watchModel("window.height", onResizeWindow);

    core.makeProcess("load-vertex-shader", 
        function() {
            core.loadAsync(currentScript.path + "shaders/vertex-shader.glsl", this.complete);
        }
    ).start();
    core.makeProcess("load-fragment-shader", 
        function() {
            core.loadAsync(currentScript.path + "shaders/fragment-shader.glsl", this.complete);
        }
    ).start();
    
    core.makeProcess("initialize-core-renderer", initialize).waitFor("initialize-renderer").ignoreParameters(true);

    core.makeProcess("apply-shaders",function(vertexShader, fragmentShader) {
    
        uniforms = {
           texture:  { 
               type: 'tv', 
               value: [core.getTexture(0)]
           },
        };
    
        var material = new THREE.ShaderMaterial( {
            uniforms: uniforms,
            vertexShader: vertexShader,
            fragmentShader: fragmentShader,
            transparent:true,
        } );
        setCoreMaterial(material);
    }).startAfter("initialize-core-renderer", "load-vertex-shader", "load-fragment-shader");
    
    //  update background color
    core.watchModel("window.color", 
        function() {
            var newColor = core.model.window.color;
            var scene = getScene();
            if(newColor) {
                if(scene.background) {
                    scene.background.set(newColor);
                } else {
                    scene.background = new THREE.Color(newColor);
                }
            } else {
                scene.background = null;
            }
        }
    );
    
   
 })));
