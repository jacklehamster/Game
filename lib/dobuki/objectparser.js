(function (global, factory) {
 	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
 	typeof define === 'function' && define.amd ? define(['exports'], factory) :
 	(factory((global.DOBUKI = global.DOBUKI || {})));
 }(this, (function (core) { 'use strict';
 
    /**
     *  FUNCTION DEFINITIONS
     */
    function parseObject(object) {
        return decodeObject(object, null, null);
    }
    
    function fetchContent(url, parent, objectName, object, raw) {
        core.expectParams(arguments, "string", "object|null", "string|null", "object|null", "boolean");
        core.loadAsync(url,
            function(content) {
                content = raw ? content : JSON.parse(content);
                if(object) {
                    delete object[raw ? 'fetch-raw' : 'fetch-content'];
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
                decodeObject(content, parent, objectName);
            }
        );
    }
    
    function decodeObject(object, parent, objectName) {
        if(typeof(object) != 'object') {
            return object;
        }
        for(var prop in object) {
            switch(prop) {
                case "___":
                    delete object[prop];
                    break;
                case "fetch-content":
                    if(object[prop] && !object.loading) {
                        var url = decodeObject(object[prop], object, prop);
                        object.loading = true;
                        fetchContent(url, parent, objectName, object, false);
                    }
                    break;
                case "fetch-raw":
                    if(object[prop] && !object.loading) {
                        var url = decodeObject(object[prop], object, prop);
                        object.loading = true;
                        fetchContent(url, parent, objectName, object, true);
                    }
                    break;
                case "js-code":
                    var value = decodeObject(object[prop], object, prop);
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
                case "js-function":
                    core.assert(parent, "Top level object cannot be a getter function.");
                    var content = decodeObject(object[prop], object, prop);
                    if (typeof(content)=="string" || Array.isArray(content)) {
                        parent[objectName] = null;
                        delete parent[objectName];
                        var func = parseJavascriptFunction(content, parent);
                        Object.defineProperty(parent, objectName, { get: func } );
                        return func();
                    } else {
                        function checkValue() {
                            var content = decodeObject(object[prop], object, prop);
                            if (typeof(content)=="string" || Array.isArray(content)) {
                                core.removeLoop(checkValue);
                                decodeObject(object, parent, objectName);
                            }
                        }
                        core.addLoop(0, checkValue);
                        return null;
                    }
                default:
                    decodeObject(object[prop], object, prop);
            }
        }
        return object;
    }

    function parseJavascriptFunction(code, context) {
        core.expectParams(arguments, "string|array");
        code = Array.isArray(code) ? code.join("\n") : code;
        console.warn("The following js code is getting compiled:");
        console.groupCollapsed(code);
        console.groupEnd();
        return new Function(code).bind(context);
    }
   
    function destroyEverything() {
    }
   
    /**
     *  PUBLIC DECLARATIONS
     */
    core.parseObject = parseObject;
    core.destroyEverything = core.combineMethods(destroyEverything, core.destroyEverything);

   
    
   /**
    *   PROCESSES
    */
    core.requireScripts(['setup.js','utils.js']);
    core.logScript();
 })));