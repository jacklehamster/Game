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
        return core.waitForContent(object, prop, parent, objectName,
            function(content) {
                return typeof(content)=="string" || Array.isArray(content);
            },
            function(content) {
                content = Array.isArray(content) ? content.join("\n") : content;
                console.warn("The following js code is about to be run:");
                console.groupCollapsed(content);
                console.groupEnd();
                var value = eval(content);
                if(parent) {
                    parent[objectName] = value;
                }
                return value;
            }
        );
    }

    function handleFunction(object, prop, parent, objectName) {
        core.assert(parent, "Top level object cannot be a getter function.");
        return core.waitForContent(object, prop, parent, objectName,
            function(content) {
                return typeof(content)=="string" || Array.isArray(content);
            },
            function(content) {
                parent[objectName] = null;
                delete parent[objectName];
                var func = parseJavascriptFunction(content, parent);
                Object.defineProperty(parent, objectName, { get: func, enumerable: true } );
                return func();
            }
        );
    }
    
    function parseJavascriptFunction(code, context) {
        core.expectParams(arguments, "string|array");
        code = Array.isArray(code) ? code.join(";\n") : code;
        console.warn("The following js code is getting compiled:");
        console.groupCollapsed(code);
        console.groupEnd();
        return new Function(code).bind(context);
    }
    
    function handleLoop(object, prop, parent, objectName) {
        if(object.looping) {
            return;
        }
        return core.waitForContent(object, prop, parent, objectName,
            function(content) {
                return typeof(content)==="string" || Array.isArray(content);
            },
            function(content) {
                object.looping = true;
                var func = parseJavascriptFunction(content, object);
                core.addLoop(object["js-period"]||0, func);
            }
        );
    }
           
    /**
     *  PUBLIC DECLARATIONS
     */

    /**
     *   PROCESSES
     */
     
    core.registerModel("js-loop", handleLoop);
    core.registerModel("js-code", handleCode);
    core.registerModel("js-function", handleFunction);
     
 })));