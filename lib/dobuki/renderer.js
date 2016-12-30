(function (global, factory) {
 	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
 	typeof define === 'function' && define.amd ? define(['exports'], factory) :
 	(factory((global.DOBUKI = global.DOBUKI || {})));
 }(this, (function (core) { 'use strict';

    core.requireScripts([
        'three.js', 
        'setup.js', 
        'utils.js', 
        'processor.js', 
        'loop.js',
        'spritesheet.js',
        'coremodel.js',
    ]);


    var coreMesh, coreMaterial, wireframeMaterial, uniforms;
    var scene, camera, renderer;
    var frameTime = Math.floor(1000/60);
    
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
        if(renderer) {
            renderer.dispose();
            renderer = null;
        }
        if(wireframeMaterial) {
            wireframeMaterial.dispose();
            wireframeMaterial = null;
        }
        window.removeEventListener("resize", onResizeWindow);

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
          getRenderer().setSize( window.innerWidth, window.innerHeight );
          camera.aspect = window.innerWidth / window.innerHeight;
          camera.updateProjectionMatrix();
    }
    
    function getRenderer() {
        if(!renderer) {
            renderer = new THREE.WebGLRenderer();
            checkDevicePixelRatio.currentDevicePixelRatio = null;
            checkDevicePixelRatio();
            core.addLoop(10000, checkDevicePixelRatio);
        }
        return renderer;
    }
    
    function initRenderer() {
        scene = new THREE.Scene();
        camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
        window.cam = camera;
        onResizeWindow();
    }
    
    function checkDevicePixelRatio() {
        if(window.devicePixelRatio === checkDevicePixelRatio.currentDevicePixelRatio) {
            return;
        }
        checkDevicePixelRatio.currentDevicePixelRatio = window.devicePixelRatio;
        getRenderer().setPixelRatio(checkDevicePixelRatio.currentDevicePixelRatio);
    }
    
    function renderScene() {
        getRenderer().render(scene, camera);
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
        var textures = new THREE.BufferAttribute(new Float32Array( count * verticesPerShape), 1);
        coreGeometry.addAttribute('tex', textures);
        
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
    
    function updateFromModel() {
        var model = core.getModel();
        var count = model && model.objects ? model.objects.length : 0;
        
        var geometry = getCoreGeometry();
        if (geometry && count) {
            var behind = false;
            var objects = [];
            for(var i=0;i<count;i++) {
                projectObject(model.objects[i], i, geometry);
                if(i%10==0 && !checkOnTime()) {
                    core.skipCallbacks();
                    behind = true;
                    break;
                }
            }
            
            cleanGeometry(count, geometry);
            
            geometry.attributes.position.needsUpdate = true;
            geometry.attributes.cut.needsUpdate = true;
            geometry.attributes.tex.needsUpdate = true;
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
        
        var verticesPerShape = planeGeometry.attributes.position.array.length/3;
        var objectCut = core.getCut(object.frame);
        var cuts = geometry.attributes.cut.array;
        var textures = geometry.attributes.tex.array;
        
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
    
    function checkOnTime() {
        return core.loopTime()<frameTime;
    }
    
    function initialize() {
        document.body.appendChild( getRenderer().domElement );
        window.addEventListener("resize", onResizeWindow);

        core.addLoop(frameTime, [renderScene, updateFromModel, calculateFPS]);
        addFPSCounter();

        scene.add( getCoreMesh() );
  
        //  update background color
        core.watchModel("background.color", 
            function(newColor) {
                if(newColor) {
                    if(scene.background) {
                        scene.background.set(newColor);
                    } else {
                        scene.background = new THREE.Color(newColor);
                    }
                    document.body.backgroundColor = newColor;
                } else {
                    scene.background = null;
                    document.body.backgroundColor = null;
                }
            }
        );
        
        //  update sprite count
        core.watchModel("objects.length",
            function(count) {
                if(spriteCount < count) {
                    setSpriteCount(count);
                }
            }
        );
        
        //  update browser tab's theme color
        core.watchModel("background.theme-color",
            function(newColor) {
                var metaThemeColor = document.querySelector("meta[name=theme-color]");
                metaThemeColor.setAttribute("content", newColor);
            }
        )
    
        //  update document title
        core.watchModel("window.title",
            function(title) {
                if(title) {
                    document.title = title;
                }
            }
        );
        
        
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
//    core.spheres = [];
    
    /**
     *  PUBLIC DECLARATIONS
     */
    core.showWireframe = showWireframe;
    core.strobe = strobeWireframe;
    core.destroyEverything = core.combineMethods(destroyEverything, core.destroyEverything);

   /**
    *   PROCESSES
    */
    var currentScript = core.getCurrentScript();
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
    
    core.makeProcess("initialize-renderer", initialize).waitFor("waitPageLoaded").ignoreParameters(true);

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
    }).startAfter("initialize-renderer", "load-vertex-shader", "load-fragment-shader");

    core.startProcess("waitPageLoaded");

   
   
 })));
