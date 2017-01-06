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
        'mathmodel.js',
    ]);
    core.logScript();

    var keyboardActive = false;

    /**
     *  FUNCTION DEFINITIONS
     */   
    function destroyEverything() {
        clearListeners();
        core.removeModelProperty("anyKeyPressed");
        core.removeModelProperty("allKeyPressed");
    }
    
    function clearListeners() {
        var model = core.getModel();
        document.removeEventListener("keydown", handleKey);
        document.removeEventListener("keyup", handleKey);
    }
    
    function addListeners() {
        core.model.input.keyboard.pressed = {};
        document.addEventListener("keydown", handleKey);
        document.addEventListener("keyup", handleKey);
    }
    
    function handleKey(e) {
        var model = core.getModel();
        if(model.input.keyboard && model.input.keyboard.active) {
            if(e.type === "keydown") {
                model.input.keyboard.pressed[e.keyCode] = core.time;
                model.input.keyboard.lastPressed = core.time;
                var immediateRefresh = model.input.mouse.lastMoved > model.input.keyboard.lastPressed;
                if(immediateRefresh) {
                    core.renderImmediately();
                }
                
            } else {
                delete model.input.keyboard.pressed[e.keyCode];
            }
        }
        e.preventDefault();
    }

    function activateKeyboard() {    
        var model = core.getModel();
        if(model.input.keyboard) {
            if(keyboardActive != (model.input.keyboard.active || model.input.keyboard.trap)) {
                keyboardActive = (model.input.keyboard.active || model.input.keyboard.trap);
                if(keyboardActive) {
                    addListeners();
                } else {
                    removeListeners();
                }
            }
        }
    }
    
    function anyKeyPressed(keyCode) {
        return core.model.input.keyboard && core.model.input.keyboard.pressed ? Array.prototype.some.call(arguments, 
            keyCode => core.model.input.keyboard.pressed[keyCode]
        ) : 0;
    }    
    
    function allKeyPressed(keyCode) {
        return core.model.input.keyboard && core.model.input.keyboard.pressed ? Array.prototype.every.call(arguments, 
            keyCode => core.model.input.keyboard.pressed[keyCode]
        ) : 0;
    }    
   
    /**
     *  PUBLIC DECLARATIONS
     */
    core.addModelProperty("anyKeyPressed", anyKeyPressed);
    core.addModelProperty("allKeyPressed", allKeyPressed);
    core.destroyEverything = core.combineMethods(destroyEverything, core.destroyEverything);

    /**
     *   PROCESSES
     */
    core.watchModel("input.keyboard.active", activateKeyboard);
    core.watchModel("input.keyboard.trap", activateKeyboard);
 })));