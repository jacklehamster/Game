(function (global, factory) {
 	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
 	typeof define === 'function' && define.amd ? define(['exports'], factory) :
 	(factory((global.DOK = global.DOK || {})));
 }(this, (function (core) { 'use strict';
    
    var keyboard = {};
    /**
     *  HEADER
     */   
    core.requireScripts([
        'setup.js',
    ]);
    core.logScript();

    /**
     *  FUNCTION DEFINITIONS
     */   
    function destroyEverything() {
        clearListeners();
    }
    
    function clearListeners() {
        document.removeEventListener("keydown", handleKey);
        document.removeEventListener("keyup", handleKey);
    }
    
    function addListeners() {
        document.addEventListener("keydown", handleKey);
        document.addEventListener("keyup", handleKey);
    }
    
    function handleKey(e) {
        if(e.type === "keydown") {
            if(!keyboard[e.keyCode]) {
                keyboard[e.keyCode] = core.time;
                document.dispatchEvent(new CustomEvent("firstPress",{
                    detail: {
                        keyCode: e.keyCode
                    }
                }))
            }
        } else {
            delete keyboard[e.keyCode];
        }
        e.preventDefault();
    }
    
    function keyDown(key) {
        return keyboard[key];
    }
    
    function anyKeyPressed(keys) {
        for(var i=0;i<arguments.length;i++) {
            if(keyDown(arguments[i])) {
                return true;
            }
        }
        return false;
    }

    /**
     *  PUBLIC DECLARATIONS
     */
    core.keyDown = keyDown;
    core.anyKeyPressed = anyKeyPressed;
    core.destroyEverything = core.combineMethods(destroyEverything, core.destroyEverything);

    /**
     *   PROCESSES
     */
    addListeners();
 })));