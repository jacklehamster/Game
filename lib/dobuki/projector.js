(function (global, factory) {
 	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
 	typeof define === 'function' && define.amd ? define(['exports'], factory) :
 	(factory((global.DOBUKI = global.DOBUKI || {})));
 }(this, (function (core) { 'use strict';
 
    /**
     *  FUNCTION DEFINITIONS
     */
    var model = { objects: [ 
        { id:"default", x:0, y:0, z:0, visible: true },
        { id:"default2", x:-2, y:0, z:0, visible: true },
     ] };

    function getProjectionModel() {
        return model;
    }
    
    function getObjectCount() {
        return model.objects.length;
    }
    
    function getObjectAt(i) {
        model.objects[i].x = Math.sin(i + core.time/1000);
        return model.objects[i];
    }

    function projectModel() {
        var geometry = core.getGeometry();
        if (geometry) {
            var count = getObjectCount();
            for(var i=0;i<count;i++) {
                projectObject(getObjectAt(i), i, geometry);
            }
            geometry.attributes.position.needsUpdate = true;
        }
    }

    var planeGeometry = new THREE.BufferGeometry().fromGeometry(new THREE.PlaneGeometry( 1, 1 ));
    function projectObject(object, index, geometry) {
        var slotsSize = planeGeometry.attributes.position.array.length;
        var positions = [object.x, object.y, object.z];
        for(var i=0; i<planeGeometry.attributes.position.array.length; i++) {
            geometry.attributes.position.array[i + slotsSize*index] = 
                planeGeometry.attributes.position.array[i] + positions[i % positions.length];
        }
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
        core.addLoop(16, projectModel);
    }).startAfter("initialize");

 })));