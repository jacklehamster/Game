(function (global, factory) {
 	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
 	typeof define === 'function' && define.amd ? define(['exports'], factory) :
 	(factory((global.DOBUKI = global.DOBUKI || {})));
 }(this, (function (core) { 'use strict';
 
    /**
     *  FUNCTION DEFINITIONS
     */
     function createModelObjects(start, count, objectCallback) {
        var objects = new Proxy([], {
            get: (original, key) => {
                if(key==='length') {
                    return Math.max(start + count, original.length);
                } else if(!Number.isNaN(key)) {
                    return original[key] ? original[key] : objectCallback(start + parseInt(key));
                }
            },
            set: (original, key, value, receiver) => {
                original[key] = value;
                return true;
            }
        });
        return objects;
     }
   
    /**
     *  PUBLIC DECLARATIONS
     */
     core.createModelObjects = createModelObjects;
   
   /**
    *   PROCESSES
    */
    core.requireScripts(['setup.js']);
    core.logScript();
 })));