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
        'coremodel.js',
    ]);
    core.logScript();

    var keyboardActive = false;

    /**
     *  FUNCTION DEFINITIONS
     */   
    function destroyEverything() {
    }
    
    function handleKey(e) {
        var model = core.getModel();
        if(model.keyboard && model.keyboard.active) {
            if(e.type == "keydown") {
                model.keyboard.pressed[e.keyCode] = core.time;
            } else {
                delete model.keyboard.pressed[e.keyCode];
            }
        }
        e.preventDefault();
    }

    function activateKeyboard() {
    
        var model = core.getModel();
        if(model.keyboard) {
            if(keyboardActive != (model.keyboard.active || mmodel.keyboard.trap)) {
                keyboardActive = (model.keyboard.active || mmodel.keyboard.trap);
                if(keyboardActive) {
                    model.keyboard.pressed = {};
                    document.addEventListener("keydown", handleKey);
                    document.addEventListener("keyup", handleKey);
                } else {
                    delete model.keyboard.pressed;
                    document.removeEventListener("keydown", handleKey);
                    document.removeEventListener("keyup", handleKey);
                }
            }
        }
    }
    
   
    /**
     *  PUBLIC DECLARATIONS
     */
    core.destroyEverything = core.combineMethods(destroyEverything, core.destroyEverything);

    /**
     *   PROCESSES
     */
    core.watchModel("keyboard.active", activateKeyboard);
    core.watchModel("keyboard.trap", activateKeyboard);
     
 })));