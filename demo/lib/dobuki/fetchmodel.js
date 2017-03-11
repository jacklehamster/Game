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
        'stripJsonComments',
    ]);
    core.logScript();

    /**
     *  FUNCTION DEFINITIONS
     */   
     
    function handleFetchContent(object, prop, parent, objectName) {
        if(object[prop] && !object.loading) {
            object.loading = true;
            var url = core.decodeObject(object[prop], object, prop);
            fetchContent(url, parent, objectName, object, prop, object.refresh);
        }
        return object;
    }
    
    function fetchContent(url, parent, objectName, object, prop, refresh) {
        core.expectParams(arguments, "string", "object|undefined", "string|undefined", "object|null", "string");
        core.loadAsync(url + (refresh?"?timestamp="+Date.now():""),
            function(content) {
                var raw = prop == 'fetch-raw';
                content = raw ? content : JSON.parse(stripJsonComments(content));
                if(object) {
                    delete object[prop];
                    delete object.loading;
                    if(typeof(content) === "object") {
                        for(var i in content) {
                            object[i] = content[i];
                        }
                        content = object;
                    }
                }
                if(parent) {
                    parent[objectName] = content;
                }
                core.decodeObject(content, parent, objectName);
            }
        );
    }
        
    /**
     *  PUBLIC DECLARATIONS
     */

    /**
     *   PROCESSES
     */
     
    core.registerModel("fetch-content", handleFetchContent);
    core.registerModel("fetch-raw", handleFetchContent);
     
 })));