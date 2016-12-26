(function (global, factory) {
 	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
 	typeof define === 'function' && define.amd ? define(['exports'], factory) :
 	(factory((global.DOBUKI = global.DOBUKI || {})));
 }(this, (function (core) { 'use strict';
 
    /**
     *  FUNCTION DEFINITIONS
     */
   function logScript() {
       var currentScript = getCurrentScript();
       loadedScripts[currentScript.filename] = true;
       console.log(currentScript.filename);
   }
   
   function fixPath() {
       var regex = /\/$|index\.html$/g;
       if (!regex.exec(location.pathname)) {
           window.history.pushState(null,"", location.pathname+"/"+location.search+location.hash);
       }
   }

   function getCurrentScript() {
        var currentScript = document.currentScript.src;
        var regex = /[a-zA-Z-]*:\/\/[^/]+(\/([^/]+\/)+)(.+)/g;
        var match = regex.exec(currentScript);
        return {
            filename: match[3],
            path: match[1],
            src: match[0],
        };
   }
   
   function handleError(error) {
        throw new Error(error);
   }
   
   function checkScriptLoaded(script) {
        var loaded = false;
        switch(script) {
            case 'three.js':
                loaded = window.THREE;
                break;
            default:
                loaded = loadedScripts[script];
        }
        if(!loaded) {
            core.handleError("Script required: " + script);
        }
   }
   
   var loadedScripts = {};
   function requireScripts(scripts) {
        scripts.forEach(checkScriptLoaded);
   }
   
    /**
     *  PUBLIC DECLARATIONS
     */
   core.getCurrentScript = getCurrentScript;
   core.logScript = logScript;
   core.handleError = handleError;
   core.requireScripts = requireScripts;
   
   /**
    *   PROCESSES
    */
    fixPath();
    core.logScript();

 })));
