(function (global, factory) {
 	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
 	typeof define === 'function' && define.amd ? define(['exports'], factory) :
 	(factory((global.DOBUKI = global.DOBUKI || {})));
 }(this, (function (core) { 'use strict';
 
    /**
     *  FUNCTION DEFINITIONS
     */
    var model = { objects: [ 
        { id:"default", x:0, y:0, z:0, visible: true, dirty:true },
        { id:"default2", x:-2, y:0, z:0, visible: true, dirty:true },
     ] };

    function getProjectionModel() {
        return model;
    }
    
    function getObjectCount() {
        return 1000;//model.objects.length;
    }
    
    function getObjectAt(i) {
        if(!model.objects[i%2].dirty) {
            model.objects[i%2].x = 2* Math.sin(i + core.time/1000);
            model.objects[i%2].y = 2* Math.cos(i + core.time/10000);
            model.objects[i%2].z = i/1000;
            model.objects[i%2].dirty = true;
        }
        return model.objects[i%2];
    }

    function projectModel() {
        var geometry = core.getCoreGeometry();
        if (geometry) {
            var count = getObjectCount();
            for(var i=0;i<count;i++) {
                projectObject(getObjectAt(i), i, geometry);
            }
            geometry.attributes.position.needsUpdate = true;
        }
    }

    var planeGeometry = core.getPlaneBufferGeometry();
    function projectObject(object, index, geometry) {
        var slotsSize = planeGeometry.attributes.position.array.length;
        var positions = [object.x, object.y, object.z];
        for(var i=0; i<planeGeometry.attributes.position.array.length; i++) {
            geometry.attributes.position.array[i + slotsSize*index] = 
                planeGeometry.attributes.position.array[i] + positions[i % positions.length];
        }
        object.dirty = false;
    }
   
    /**
     *  PUBLIC DECLARATIONS
     */
    core.getProjectionModel = getProjectionModel;
   
   /**
    *   PROCESSES
    */
    core.requireScripts(['setup.js', 'renderer.js']);
    core.logScript();
    core.makeProcess("start-core-loop", function() {
        core.addLoop(1, projectModel);
    }).startAfter("initialize");

 })));