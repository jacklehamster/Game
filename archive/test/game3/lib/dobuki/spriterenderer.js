(function (global, factory) {
 	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
 	typeof define === 'function' && define.amd ? define(['exports'], factory) :
 	(factory((global.DOK = global.DOK || {})));
 }(this, (function (core) { 'use strict';

    var mesh;
    
    var vertices = new Float32Array([
         0, 1, 0,
         0, 0, 0,
         1, 1, 0,
         1, 0, 0,
    ]);
    
    var uvs = new Float32Array([
        0, 1, 
        0, 0,
        1, 1,
        1, 0,
    ]);    
    
    var indices = new Uint16Array([
        0, 1, 2, 
        1, 3, 2,
    ]);

    function getMesh() {
        if(!mesh) {
            var geometry = new THREE.BufferGeometry();
            var material = new THREE.ShaderMaterial( {
                uniforms: {
                    texture:  { 
                        type: 'tv',
                        get value() { return DOK.getTextures() }
                    },
                },
                vertexShader: document.getElementById('vertex-shader').textContent,
                fragmentShader: document.getElementById('fragment-shader').textContent,
                transparent:true,
            } );
            
            mesh = new THREE.Mesh(geometry, material);
            mesh.scale.set(64,64,1.0);
//            mesh.scale.set(6.4,6.4,1.0);
            //mesh.frustumCulled = false;
            window.mm = mesh;
        }
        return mesh;
    }
    
    function displaySprites(spriteContainer) {
        var geometry = getMesh().geometry;    
        var numSprites = spriteContainer.length;
        
        if(!geometry.attributes.position || geometry.attributes.position.count < numSprites*4) {
            geometry.attributes.position = 
                new THREE.BufferAttribute(new Float32Array(numSprites * vertices.length), 3);
        }
        if(!geometry.attributes.uv || geometry.attributes.uv.count < numSprites*4) {
            geometry.attributes.uv =
                new THREE.BufferAttribute(new Float32Array(numSprites * uvs.length), 2)
        }
        if(!geometry.attributes.tex || geometry.attributes.tex.count < numSprites*4) {
            geometry.attributes.tex =
                new THREE.BufferAttribute(new Float32Array(numSprites * 4), 1)
        }
        if(!geometry.index || geometry.index.count < numSprites*indices.length) {
            geometry.index = new THREE.BufferAttribute(new Uint16Array(numSprites * indices.length), 1);
            for(var i=0; i<geometry.index.array.length; i++) {
                var index = Math.floor(i/indices.length);
                geometry.index.array[i] = indices[i%indices.length] + index*4;
            }
            geometry.index.needsUpdate = true;
        }
        
        for(var i=0;i<numSprites;i++) {
            var sprite = spriteContainer.at(i);
            var cut = core.getCut(sprite.url);
            var pos = sprite.pos;
            var offset = sprite.offset;
            var size = cut ? cut.size : [1,1];
            
            for(var v=0;v<vertices.length;v++) {
                var vertex = vertices[v] * (v%3<2?size[v%3]/64:1) + pos[v%pos.length];
                if(sprite.offset) {
                    vertex += offset[v%offset.length]/64;
                }
                geometry.attributes.position.array[i*vertices.length+v] = vertex;                    
            }
            
            if(cut) {
                for(var t=0; t<4; t++) {
                    geometry.attributes.tex.array[i*4 + t] = cut.tex;
                }
                
                for(var u=0; u<cut.uv.length; u++) {
                    geometry.attributes.uv.array[u + i*cut.uv.length] = cut.uv[u];
                }
            }            
        }
        
        //  clear remaining sprites
        for(var i=numSprites*vertices.length; i<geometry.attributes.position.array.length; i++) {
            geometry.attributes.position.array[i] = 0;
        }
        
        geometry.attributes.position.needsUpdate = true;
        geometry.attributes.tex.needsUpdate = true;
        geometry.attributes.uv.needsUpdate = true;
    }

    /**
     *  HEADER
     */   
    core.requireScripts([
        'setup.js',
        'spritesheet.js',
        'utils.js',
    ]);
    core.logScript();

    /**
     *  FUNCTION DEFINITIONS
     */   
    function destroyEverything() {
        if(mesh) {
            mesh.geometry.dispose();
            mesh.material.dispose();
        }
        mesh = null;
    }
   
    /**
     *  PUBLIC DECLARATIONS
     */
    core.getMesh = getMesh;
    core.displaySprites = displaySprites;
    core.destroyEverything = core.combineMethods(destroyEverything, core.destroyEverything);

    /**
     *   PROCESSES
     */
    
     
 })));