(function (global, factory) {
 	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
 	typeof define === 'function' && define.amd ? define(['exports'], factory) :
 	(factory((global.DOBUKI = global.DOBUKI || {})));
 }(this, (function (core) { 'use strict';
 
    /**
     *  FUNCTION DEFINITIONS
     */
     function createModel(objectCallback, count = 0) {
        var objects = [];
        var model;
        
        objects = new Proxy(objects, {
            get: (original, key) => {
                if(key==='length') {
                    return model.count;
                } else if(!Number.isNaN(key)) {
                    return original[key] ? original[key] : objectCallback(parseInt(key));
                }
            }
        });
        
        model = {
            type: 'model',
            objects: objects,
            count: count,
        };       
        
        return model;
     }
   
    /**
     *  PUBLIC DECLARATIONS
     */
     core.createModel = createModel;
   
   /**
    *   PROCESSES
    */
    core.requireScripts(['setup.js']);
    core.logScript();
 })));