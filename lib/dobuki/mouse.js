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

    var mouseActive = false;

    /**
     *  FUNCTION DEFINITIONS
     */   
    function destroyEverything() {
        clearListeners();
    }
    
    function clearListeners() {
        var model = core.getModel();
        document.removeEventListener("mousedown", handleMousePress);
        document.removeEventListener("mouseup", handleMousePress);
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseout", handleMouseExit);
    }
    
    function addListeners() {
        core.model.input.mouse.pressed = [0,0,0,0];
        core.model.input.mouse.position = {};
        document.addEventListener("mousedown", handleMousePress);
        document.addEventListener("mouseup", handleMousePress);
        document.addEventListener("mousemove", handleMouseMove);
        document.addEventListener("mouseout", handleMouseExit);
    }
    
    function handleMouseExit(e) {
        var model = core.getModel();
        if(model.input.mouse && model.input.mouse.active) {
            e = e ? e : window.event;
            var from = e.relatedTarget || e.toElement;
            if (!from || from.nodeName == "HTML") {
                delete model.input.mouse.position.x;
                delete model.input.mouse.position.y;
            }            
        }
        e.preventDefault();
    }
    
    function handleMousePress(e) {
        var model = core.getModel();
        if(model.input.mouse && model.input.mouse.active) {
            for(var b=0; b<4; b++) {
                if(model.input.mouse.pressed[b] && !e.buttons[b]) {
                    model.input.mouse.pressed[b] = 0;
                }
            }
            if(e.type == "mousedown") {
                model.input.mouse.pressed[e.button] = core.time;
            }
        }
        e.preventDefault();
    }
    
    function handleMouseMove(e) {
        var model = core.getModel();
        if(model.input.mouse && model.input.mouse.active) {
            model.input.mouse.position.x = e.pageX;
            model.input.mouse.position.y = e.pageY;
            var immediateRefresh = model.input.mouse.lastMoved < model.input.keyboard.lastPressed;
            model.input.mouse.lastMoved = core.time;
            if(immediateRefresh) {
                core.renderImmediately();
            }
        }
        e.preventDefault();
    }

    function activateMouse() {    
        var model = core.getModel();
        if(model.input.mouse) {
            if(mouseActive != (model.input.mouse.active || model.input.mouse.trap)) {
                mouseActive = (model.input.mouse.active || model.input.mouse.trap);
                if(mouseActive) {
                    addListeners();
                } else {
                    removeListeners();
                }
            }
        }
    }
    
    function getMouseCursorReplacement() {
        var cursor = document.getElementById("cursor");
        if(!cursor) {
            cursor = document.createElement("img");
            cursor.id = "cursor";
            cursor.style.display = "none";
            cursor.style.position = "absolute";
            cursor.src = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";
            document.body.appendChild(cursor);
            var x=0,y=0;
            document.addEventListener("mousemove",
                function(e) {
                    x = e.pageX; y = e.pageY;
                    cursor.style.display="none";
                },
                true
            );
            document.addEventListener("keydown",
                function(e) {
                    cursor.style.left = x+"px";
                    cursor.style.top = y+"px";
                    cursor.style.display="";
                },
                true
            );
        }
        return cursor;
    }
    
    /**
     *  PUBLIC DECLARATIONS
     */
    core.destroyEverything = core.combineMethods(destroyEverything, core.destroyEverything);

    /**
     *   PROCESSES
     */
    core.watchModel("input.mouse.active", activateMouse);
    core.watchModel("input.mouse.trap", activateMouse);
    
    
    //  update mouse cursor
    core.watchModel("input.mouse.cursor",
        function() {
            var newCursor = core.model.input.mouse.cursor;
            var cursorReplacement = getMouseCursorReplacement();
            if(newCursor && newCursor.src) {
                var customCursor = "url(" + newCursor.src + ") " 
                   + (newCursor.offset ? newCursor.offset.join(" ") : "")
                   + "  , auto";
                document.body.style.cursor = customCursor;
                document.documentElement.style.cursor = customCursor;
                cursorReplacement.src = newCursor.src;
                cursorReplacement.style.marginLeft = (newCursor.offset ? -newCursor.offset[0] : 0) + "px";
                cursorReplacement.style.marginTop = (newCursor.offset ? -newCursor.offset[1] : 0) + "px";
            } else {
                document.body.style.cursor = "auto";
                cursorReplacement.src = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";
            }
        }
    );
    
    
 })));