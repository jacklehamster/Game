(function (global, factory) {
 	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
 	typeof define === 'function' && define.amd ? define(['exports'], factory) :
 	(factory((global.DOBUKI = global.DOBUKI || {})));
 }(this, (function (core) { 'use strict';
    
    /**
     *  HEADER
     */   
    core.requireScripts([
        'setup.js',
        'utils.js',
        'objectdecoder.js',
        'loop.js',
    ]);
    core.logScript();
    
    var modelWatches = [];

    /**
     *  FUNCTION DEFINITIONS
     */   
    function watchModel(property, callback, parent) {
        core.expectParams(arguments, "string", "function", "object|undefined", "string|undefined");
        var path = dismantle(property);
        var watcher = {
            parent: parent,
            property: property,
            path : dismantle(property),
            callback: callback,
            value: path.map(a => null),
        };
        modelWatches.push(watcher);
    }
    
    function dismantle(property) {  // a.b,c.d =>  [[a,b],[c,d]]
        return property.split("|").map(path => path.split("."));
    }
    
    function stopWatch(property, callback, parent) {
        for(var i=modelWatches.length-1; i>=0; i--) {
            var watcher = modelWatches[i];
            if(watcher.property===property) {
                if((!callback || watcher.callback === callback)
                    && (!parent || watcher.parent === parent)) {
                    modelWatches[i] = modelWatches[modelWatches.length-1];
                    modelWatches.pop();
                }
            }
        }
    }
    
    function detectModelChanges() {
        var model = core.getModel();
        modelWatches.forEach(
            function(watcher) {
                var parent = watcher.parent || model;
                var value = core.fetchValues(parent, watcher.path);
                if(!equalValue(value, watcher.value)) {
                    var oldValue = watcher.value;
                    watcher.value = copy(value);
                    watcher.callback.apply(null,oldValue);
                }
            }
        );
    }
    
    function copy(value) {
        if(Array.isArray(value)) {
            var array = [];
            value.forEach(function(val, index) {
                array[index] = val;
            });
            return array;
        }
        return value;
    }
    
    function equalValue(value1, value2) {
        if(value1 === value2) {
            return true;
        }
        if(Array.isArray(value1) && Array.isArray(value2) && value1.length===value2.length) {
            for(var i=0; i< value1.length; i++) {
                if(!equalValue(value1[i],value2[i])) {
                    return false;
                }
            }
            return true;
        }
        return false;
    }
    
    function destroyEverything() {
        core.removeLoop(detectModelChanges);
        modelWatches = null;
    }
   
    /**
     *  PUBLIC DECLARATIONS
     */
    core.watchModel = watchModel;
    core.stopWatch = stopWatch;
    core.destroyEverything = core.combineMethods(destroyEverything, core.destroyEverything);

    /**
     *   PROCESSES
     */
    core.addLoop(1000, detectModelChanges);     
     
 })));