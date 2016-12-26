(function (global, factory) {
 	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
 	typeof define === 'function' && define.amd ? define(['exports'], factory) :
 	(factory((global.DOBUKI = global.DOBUKI || {})));
 }(this, (function (core) { 'use strict';

    var coreMesh, coreMaterial, wireframeMaterial;
    var scene, camera, renderer;
    var frameTime = Math.floor(1000/60);
    var defaultModel = {
         objects: core.createModelObjects(1, 4,
            function(i) {
                return {
                    x: Math.sin(i + core.time/1000), z: -3,
                    rotation: {
                        z: i*Math.PI/4+core.time/1000,
                    },
                    frame: {
                        src: 'squid.png',
                        cut: [
                            (Math.floor(i+core.time/100)%2)*32,
                            (Math.floor((i+core.time/100)/2)%2)*32,
                            32,
                            32,
                        ]
                    }
                };
            }),
    };
    var model = defaultModel;
    
    function setModel(value) {
        model = value ? value : defaultModel;
    }
    
    function getModel(value) {
        return model;
    }
    
    function getCoreMesh() {
        if(!coreMesh) {
            var geometry =  new THREE.BufferGeometry();
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
          renderer.setSize( window.innerWidth, window.innerHeight );
          camera.aspect = window.innerWidth / window.innerHeight;
          camera.updateProjectionMatrix();
    }
    
    function initRenderer() {
        scene = new THREE.Scene();
        camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
        window.cam = camera;
        renderer = new THREE.WebGLRenderer();
        renderer.setPixelRatio(window.devicePixelRatio);
        onResizeWindow();
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
    
    var spriteCount = 0;
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
        
        setCoreGeometry(coreGeometry);
        spriteCount = count;
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
    
    function strobeWireframe(value) {
        if(typeof(value)==='undefined') {
            value = true;
        }
        if(value) {
            core.removeLoop(toggleWireframe);
            core.addLoop(0,toggleWireframe);
        } else {
            core.removeLoop(toggleWireframe);
            showWireframe(false);
        }
    }
    
    var countFrom = 0;
    function fetchModel() {
        var count = model ? model.objects.length : 0;
        
        if(spriteCount < count) {
            setSpriteCount(count);
        }
        
        var geometry = getCoreGeometry();
        if (geometry && count) {
            var behind = false;
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
            
            cleanGeometry(count, geometry);
            
            geometry.attributes.position.needsUpdate = true;
            geometry.attributes.cut.needsUpdate = true;
        }
        
        if (model && model.background && (!scene.background || scene.background.getHex() != scene.background)) {
            scene.background = new THREE.Color( model.background );
        } else if(!model.background && scene.background) {
            scene.background = null;
        }
        
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
    }

    function cleanGeometry(index, geometry) {
        var planeGeometry = getPlaneBufferGeometry();
        var slotsSize = planeGeometry.attributes.position.array.length;
        for(var i=slotsSize*index;i<geometry.attributes.position.array.length;i++) {
            geometry.attributes.position.array[i] = 0;
        }
    }

    function projectObject(object, index, geometry) {
        var planeGeometry = getPlaneBufferGeometry();
        var slotsSize = planeGeometry.attributes.position.array.length;
        var positions = [object.x||0, object.y||0, object.z||0];
        if(object.rotation) {
            planeGeometry.rotateX(object.rotation.x||0);
            planeGeometry.rotateY(object.rotation.y||0);
            planeGeometry.rotateZ(object.rotation.z||0);
        }
        if(object.size) {
            planeGeometry.scale(object.size[0]||1, object.size[1]||1, object.size[2]||1);
        }
        if(object.scale) {
            planeGeometry.scale(object.scale, object.scale, object.scale);
        }
        for(var i=0; i<planeGeometry.attributes.position.array.length; i++) {
            geometry.attributes.position.array[i + slotsSize*index] = 
                planeGeometry.attributes.position.array[i] + positions[i % positions.length];
        }
        if(object.scale) {
            planeGeometry.scale(1/object.scale,1/object.scale,1/object.scale);
        }
        if(object.size) {
            planeGeometry.scale(1/(object.size[0]||1), 1/(object.size[1]||1), 1/(object.size[2]||1));
        }
        if(object.rotation) {
            planeGeometry.rotateX(-(object.rotation.x||0));
            planeGeometry.rotateY(-(object.rotation.y||0));
            planeGeometry.rotateZ(-(object.rotation.z||0));
        }
        
        var verticesPerShape = planeGeometry.attributes.position.array.length/3;
        var objectCut = core.getCut(object.frame);
        var cuts = geometry.attributes.cut.array;
        
        for(var j=0;j<verticesPerShape;j++) {
            for(var i=0;i<objectCut.length;i++) {
                cuts[(index*verticesPerShape + j)*4 + i] = objectCut[i];
            }
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

        scene.add( getCoreMesh() );
    }
    
    /**
     *  PUBLIC DECLARATIONS
     */
    core.setModel = setModel;
    core.getModel = getModel;
    core.showWireframe = showWireframe;
    core.strobe = strobeWireframe;

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
        'graphicmodel.js',
        'spritesheet.js',
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
    
        var material = new THREE.ShaderMaterial( {
            uniforms: {
                texture:  { 
                    type: 'tv', 
                    value: [core.getTexture(),core.getTexture()]
                },
            },
            vertexShader: vertexShader,
            fragmentShader: fragmentShader,
            transparent:true,
        } );
        setCoreMaterial(material);
    }).startAfter("initialize", "load-vertex-shader", "load-fragment-shader");

    core.startProcess("waitPageLoaded");

   
   
 })));
