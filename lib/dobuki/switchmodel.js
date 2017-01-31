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
     
    function handleSwitchModel(object, prop, parent, objectName) {
        core.assert(parent, "Top level object cannot be a switcher.");
        core.decodeObject(object[prop], object, prop);
        var control = object;
        
        var func = function() {
            var obj = control.case[control.switch] || control.case.default;
            if(!obj.decoded) {
                obj.decoded = true;
                core.decodeObject(obj);
            }
            return obj;
        };
        parent[objectName] = null;
        delete parent[objectName];
        Object.defineProperty(parent, objectName, { get: func, enumerable: true } );
        return func();
        
    }

    /**
     *  PUBLIC DECLARATIONS
     */

    /**
     *   PROCESSES
     */
     
    core.registerModel("switch", handleSwitchModel);
     
 })));