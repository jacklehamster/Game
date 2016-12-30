(function (global, factory) {
 	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
 	typeof define === 'function' && define.amd ? define(['exports'], factory) :
 	(factory((global.DOBUKI = global.DOBUKI || {})));
 }(this, (function (core) { 'use strict';
    core.logScript();
    core.requireScripts([
        'setup.js',
        'objectparser.js',
        'loop.js',
    ]);
 
    var currentScript = core.getCurrentScript();
    var defaultModel = {
        o: {
             x:0, z:-3,
             rotation:{},
             frame:{
                 src: currentScript.path + "images/squid.png",
                 cut:[0,0,32,32],
             },
        },
        objects: createModelObjects(1, 4,
            function(i) {
                 defaultModel.o.x = Math.sin(i + core.time/1000);
                 defaultModel.o.rotation.z = i*Math.PI/4+core.time/1000;
                 defaultModel.o.frame.cut[0] = (Math.floor(i+core.time/100)%2)*32;
                 defaultModel.o.frame.cut[1] = (Math.floor((i+core.time/100)/2)%2)*32;
                 return defaultModel.o;
            }
        ),
    };
     
    var model = defaultModel;
    var modelWatches = [];
    
 
    /**
     *  FUNCTION DEFINITIONS
     */
    function setModel(value) {
        model = !value ? {} : core.parseObject(value);
    }
    
    function getModel(value) {
        return model;
    }
    
    function createModelObjects(start, count, objectCallback) {
        var objects = new Proxy([], {
            get: (original, key) => {
                if(key==='length') {
                    return Math.max(start + count, original.length);
                } else if(!Number.isNaN(key)) {
                    return original[key] ? original[key] : objectCallback.call(objects,start + parseInt(key));
                }
            },
            set: (original, key, value, receiver) => {
                original[key] = value;
                return true;
            },
            get isGraphicModel() {
                return true;
            },
        });
        return objects;
    }
    
    function detectModelChanges() {
        var model = getModel();
        for(var i=0;i<modelWatches.length;i++) {
            var watcher = modelWatches[i];
            var value = fetchValue(model, watcher.path, 0);
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
        
    function fetchValue(model, path, index) {
        return index==path.length 
                ? model 
                : !model
                ? null
                : fetchValue(model[path[index]], path, index+1)
    }
    
    function watchModel(property, callback, separator) {
        core.expectParams(arguments, "string", "function", "string|undefined");
        if(!separator) separator = ".";
        var watcher = {
            path : property.split(separator),
            callback: callback,
        };
        modelWatches.push(watcher);
    }
    
    function stopWatch(property, callback, separator) {
        if(!separator) separator = ".";
        for(var i=modelWatches.length-1; i>=0; i--) {
            var watcher = modelWatches[i];
            if(watcher.path.join(separator)===property) {
                if(!callback || watcher.callback === callback) {
                    modelWatches[i] = modelWatches[modelWatches.length-1];
                    modelWatches.pop();
                }
            }
        }
    }
    
    function destroyEverything() {
        core.removeLoop(detectModelChanges);
        modelWatches = null;
        setModel(null);
    }

    /**
     *  PUBLIC DECLARATIONS
     */
    core.setModel = setModel;
    core.getModel = getModel;
    core.createModelObjects = createModelObjects;
    core.watchModel = watchModel;
    core.stopWatch = stopWatch;
    core.destroyEverything = core.combineMethods(destroyEverything, core.destroyEverything);
    
    /**
     *   PROCESSES
     */
    core.addLoop(0, detectModelChanges);
    
 })));