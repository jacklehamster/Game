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
        'objectdecoder.js',
        'loop.js',
    ]);
    core.logScript();
    
    var modelWatches = [];

    /**
     *  FUNCTION DEFINITIONS
     */   
    function watchModel(property, callback, parent, separator) {
        core.expectParams(arguments, "string", "function", "object|undefined", "string|undefined");
        if(!separator) separator = ".";
        var watcher = {
            parent: parent,
            path : property.split(separator),
            callback: callback,
        };
        modelWatches.push(watcher);
    }
    
    function stopWatch(property, callback, parent, separator) {
        if(!separator) separator = ".";
        for(var i=modelWatches.length-1; i>=0; i--) {
            var watcher = modelWatches[i];
            if(watcher.path.join(separator)===property) {
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
        for(var i=0;i<modelWatches.length;i++) {
            var watcher = modelWatches[i];
            var parent = watcher.parent || model;
            var value = core.fetchValue(parent, watcher.path);
            if(!equalValue(value, watcher.value)) {
                var oldValue = watcher.value;
                watcher.value = copy(value);
                watcher.callback(value, oldValue);
            }
        }
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
        if(Array.isArray(value1) && Array.isArray(value2)) {
            return value1.length === value2.length && value1.every(
                function(val, index) { return val === value2[index]; }
            );
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
    core.addLoop(0, detectModelChanges);     
     
 })));