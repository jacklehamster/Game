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
    ]);
    core.logScript();

    /**
     *  FUNCTION DEFINITIONS
     */   
     
    function handleMapModel(object, prop, parent, objectName) {
        if(!object.template) {
            return;
        }
        core.decodeObject(object[prop], object, prop);
        var savedObject = object;
                  
        var objCounts = {};
        var storage = [];
        var objectMap = {
            get length() {
                return savedObject[prop].length;
            },
            at: function(index) {
                if(!storage[index]) {
                    storage[index] = JSON.parse(JSON.stringify(object.template));   //  deep copy
                    storage[index].index = index;
                    storage[index].reference = savedObject[prop].at(index);
                    core.decodeObject(storage[index]);
                }
                storage[index].reference = savedObject[prop].at(index);
                return storage[index];
            },
            a: function(x,y) {
                var index = savedObject[prop].indexOf(savedObject[prop].a(x,y));
                return this.at(index);
            },
            get objectCount() {
                var count = 0;
                for(var i=0;i<this.length;i++) {
                    var obj = this.at(i);
                    if(obj.destroyed) {
                        return;
                    }
                    if(obj.objects && typeof obj.objects.objectCount !== 'undefined') {
                        count += obj.objects.objectCount;
                    } else {
                        count++;
                    }
                }
                return count;
            }
        };
        
        parent[objectName] = null;
        delete parent[objectName];
        parent[objectName] = objectMap;
        
        return objectMap;            
    }
    
    /**
     *  PUBLIC DECLARATIONS
     */

    /**
     *   PROCESSES
     */
     
    core.registerModel("map-array", handleMapModel);
     
 })));