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
    window.aaa = modelWatches;
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
            values: path.map(a => null),
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
                var values = core.fetchValues(parent, watcher.path);
                if(!equalValue(values, watcher.values)) {
                    var oldValues = watcher.values;
                    watcher.values = copy(values);
                    watcher.callback.apply(null,oldValues);
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
   
    function handleWatch(object, prop, parent, objectName) {
        if(object.watching) {
            return;
        }
        object.watching = true;
        var watch = object.watch;
        core.decodeObject(object.watch, object, 'watch');
        
        core.watchModel(object.watch.property, 
            function() {
                var act = object.watch.action;
            }
        , object);
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
    core.addLoop(0, detectModelChanges);     
    
    core.registerModel("watch", handleWatch);
     
 })));