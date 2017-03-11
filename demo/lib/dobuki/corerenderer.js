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
    var planeBufferGeometry;
    var processingIndex;

    function getCoreMesh() {
        if(!coreMesh) {
            var geometry =  new THREE.BufferGeometry();
            var material =  new THREE.MeshBasicMaterial( { transparent: true, opacity: 0 } );
            coreMesh = new THREE.Mesh( geometry, material );
            coreMesh.frustumCulled = false;
            window.cm = coreMesh;
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
        if (!planeBufferGeometry) {
            planeBufferGeometry = new THREE.BufferGeometry().fromGeometry(new THREE.PlaneGeometry( 1, 1 ));
        }
        return planeBufferGeometry;
    }
    
    function onResizeWindow() {
        if(core.model.window && camera) {
            var width = core.model.window.width;
            var height = core.model.window.height;
            if(camera.isPerspectiveCamera) {
                camera.aspect = width / height;
            } else if(camera.isOrthographicCamera) {
                camera.left = -width/2;
                camera.right = width/2;
                camera.top = height/2;
                camera.bottom = -height/2;
            }
            camera.updateProjectionMatrix();
       }
    }
    
    function initScene() {
        scene = new THREE.Scene();
    }
    
    function updateCamera(type) {
        switch(type) {
            case "perspective":
                if(!camera || !camera.isPerspectiveCamera) {
                    camera = new THREE.PerspectiveCamera( 75, innerWidth / innerHeight, 0.1, 1000 )
                    onResizeWindow();
                }
                break;
            case "orthographic":
                if(!camera || !camera.isOrthographicCamera) {
                    camera = new THREE.OrthographicCamera(-innerWidth/2, innerWidth/2, innerHeight/2, -innerHeight/2, 1, 1000 );
                    window.cam = camera;
                    onResizeWindow();
                }
                break;
        }
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
        
        var verticesPerShape = getPlaneBufferGeometry().attributes.position.array.length/3;
        var cuts = new THREE.BufferAttribute(new Float32Array( 4 * count * verticesPerShape ), 4);
        coreGeometry.addAttribute('cut', cuts);
        var textures = new THREE.BufferAttribute(new Float32Array( count * verticesPerShape), 1);
        coreGeometry.addAttribute('tex', textures);
        var tiles = new THREE.BufferAttribute(new Float32Array( 2 * count * verticesPerShape ), 2);
        coreGeometry.addAttribute('tile', tiles);
        
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
    
    function compare(a,b) {
        return a.cachedZ - b.cachedZ;
    }
    
    function updateFromModel() {
        var model = core.getModel();
        var view = model.view;
        
        if(view && view.camera) {
            updateCamera(view.camera.type);        
            if (view.camera.rotation) {
                camera.rotation.x = view.camera.rotation.x||0;
                camera.rotation.y = view.camera.rotation.y||0;
                camera.rotation.z = view.camera.rotation.z||0;
            }
            
            if (view.camera.position) {
                camera.position.x = view.camera.position.x||0;
                camera.position.y = view.camera.position.y||0;
                camera.position.z = view.camera.position.z||0;
            }
        }
        
        var coreGeometry = getCoreGeometry();
        if (coreGeometry && coreGeometry.attributes.cut && view && view.objects) {
            processingIndex = 0;

            var objects = [];
            getObjectsToProject(view.objects, objects);
            
            objects.sort(compare);

            projectObjects(objects);
            
            if(uniforms && uniforms.texture.value.length < core.getTextureCount()) {
                while (uniforms.texture.value.length < core.getTextureCount()) {
                    uniforms.texture.value.push(core.getTexture(uniforms.texture.value.length));
                }
                uniforms.texture.needsUpdate = true;
            }
            cleanGeometry(processingIndex, coreGeometry);
            
            coreGeometry.attributes.position.needsUpdate = true;
            coreGeometry.attributes.cut.needsUpdate = true;
            coreGeometry.attributes.tex.needsUpdate = true;
            coreGeometry.attributes.tile.needsUpdate = true;
        }
    }
    
    function getObjectsToProject(objects, array) {
        for(var i=0;i<objects.length;i++) {
            var object = objects.at(i);
            if(object.destroyed) {
                continue;
            }
            if(object.frame && object.position) {
                object.cachedZ = object.position.z
                array.push(object);
            }
            if(object.objects) {
                getObjectsToProject(object.objects, array);
            }
        }
    }
    
    function projectObjects(objects) {
        var skip = false;
        for(var i=0;i<objects.length;i++) {
            var object = objects[i];
            if(object.destroyed) {
                continue;
            }
            if(typeof object.active !== 'undefined' && !object.active) {
                continue;
            }            
            if(object.frame) {
                var objectCut = core.getCut(object.frame);
                projectSprite(object, objectCut);
                if(!core.checkOnTime()) {
                    core.skipCallbacks();
                    skip = true;
                    break;
                }
            }
            if(object.objects) {
                if(projectObjects(object.objects)) {
                    skip = true;
                    break;
                }
            }
        }
        return skip;
    }
    
    function projectSprite(object, objectCut) {
        if(!objectCut.cut[2] || !objectCut.cut[3]) {
            return;
        }
        var index = processingIndex;
                
        var planeGeometry = getPlaneBufferGeometry();

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
        } else {
            size = [
                objectCut.cut[2]*2048,
                objectCut.cut[3]*2048,
                objectCut.cut[2]*2048,
            ];
        }
        planeGeometry.scale(size[0], size[1], size[2]);
        
        var scale = object.scale;
        if(scale) {
            scale = object.scale;
            planeGeometry.scale(scale, scale, scale);
        }
        
        var slotsSize = planeGeometry.attributes.position.array.length;
        var coreGeometry = getCoreGeometry();
        var positions = [
            (object.position.x||0), 
            (object.position.y||0), 
            (object.position.z||0),
        ];
        if(object.frame.offset) {
            positions[0] += object.frame.offset.x||0;
            positions[1] += object.frame.offset.y||0;
            positions[2] += object.frame.offset.z||0;
        }
        window.p = positions;
        for(var i=0; i<planeGeometry.attributes.position.array.length; i++) {
            coreGeometry.attributes.position.array[i + slotsSize*index] = 
                planeGeometry.attributes.position.array[i] + positions[i % positions.length];
        }
        
        if(scale) {
            planeGeometry.scale(1/scale,1/scale,1/scale);
        }
        planeGeometry.scale(1/size[0], 1/size[1], 1/size[2]);
        if(rotation) {
            planeGeometry.rotateX(-rotation.x);
            planeGeometry.rotateY(-rotation.y);
            planeGeometry.rotateZ(-rotation.z);
        }
        
        var verticesPerShape = slotsSize/3;
        var cuts = coreGeometry.attributes.cut.array;
        var textures = coreGeometry.attributes.tex.array;
        for(var j=0;j<verticesPerShape;j++) {
            var baseIndex = (index*verticesPerShape + j);
            for(var i=0;i<objectCut.cut.length;i++) {
                cuts[baseIndex*4 + i] = objectCut.cut[i];
            }
            textures[baseIndex] = objectCut.texture;
        }
        processingIndex++;
    } 
    
    function cleanGeometry(index, geometry) {
        var slotsSize = getPlaneBufferGeometry().attributes.position.array.length;
        for(var i=slotsSize*index;i<geometry.attributes.position.array.length;i++) {
            geometry.attributes.position.array[i] = 0;
        }
    }

    function initialize() {
        scene.add( getCoreMesh() );
        
        core.addRenderComponent(
            1, 
            {
                get scene() { return scene },
                get camera() { return camera },
            }, 
            updateFromModel
        );
        
/*        var projector = new THREE.Projector();
        
        document.addEventListener("mousedown",
            function(e) {
                var vector = new THREE.Vector3( core.model.input.mouse.x, core.model.input.mouse.y, 1 );
                projector.unprojectVector( vector, camera );
                var ray = new THREE.Raycaster( camera.position, vector.sub( camera.position ).normalize() );
                console.log(ray.intersectObject(getCoreMesh()));
            }
        );
*/
        //  update sprite count
        core.watchModel("view.objects.objectCount",
            function() {
                var count = core.model.view.objects.objectCount;
                if(spriteCount < count) {
                    for(var c = Math.max(spriteCount,1); c<count; c*=2) {
                    }
                    setSpriteCount(c);
                }
            }
        );
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
        if (planeBufferGeometry) {
            planeBufferGeometry.dispose();
            planeBufferGeometry = null;
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
    core.showWireframe = showWireframe;
    core.destroyEverything = core.combineMethods(destroyEverything, core.destroyEverything);

   /**
    *   PROCESSES
    */
    var currentScript = core.getCurrentScript();
    core.logScript();

    initScene();
    core.watchModel("window.width|window.height", onResizeWindow);

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
