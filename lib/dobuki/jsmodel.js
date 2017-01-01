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
    ]);
    core.logScript();

    /**
     *  FUNCTION DEFINITIONS
     */   
     
    function handleCode(object, prop, parent, objectName) {
        var value = core.decodeObject(object[prop], object, prop);
        if(Array.isArray(value)) {
            value = value.join("\n");
        }
        console.warn("The following js code is about to be run:");
        console.groupCollapsed(value);
        console.groupEnd();
        value = eval(value);
        if(parent) {
            parent[objectName] = value;
        }
        return value;
    }

    function handleFunction(object, prop, parent, objectName) {
        core.assert(parent, "Top level object cannot be a getter function.");
        var content = core.decodeObject(object[prop], object, prop);
        if (typeof(content)=="string" || Array.isArray(content)) {
            parent[objectName] = null;
            delete parent[objectName];
            var func = parseJavascriptFunction(content, parent);
            Object.defineProperty(parent, objectName, { get: func } );
            return func();
        } else {
            function checkValue() {
                var content = core.decodeObject(object[prop], object, prop);
                if (typeof(content)=="string" || Array.isArray(content)) {
                    core.removeLoop(checkValue);
                    core.decodeObject(object, parent, objectName);
                }
            }
            core.addLoop(0, checkValue);
            return null;
        }
    }
    
    function parseJavascriptFunction(code, context) {
        core.expectParams(arguments, "string|array");
        code = Array.isArray(code) ? code.join("\n") : code;
        console.warn("The following js code is getting compiled:");
        console.groupCollapsed(code);
        console.groupEnd();
        return new Function(code).bind(context);
    }
           
    /**
     *  PUBLIC DECLARATIONS
     */

    /**
     *   PROCESSES
     */
     
    core.registerModel("js-code", handleCode);
    core.registerModel("js-function", handleFunction);
     
 })));