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
    
    var textDiv;

    /**
     *  FUNCTION DEFINITIONS
     */   
    
    function initialize() {
        textDiv = document.createElement('div');
        textDiv.style.position = 'absolute';
        textDiv.style.zIndex = 1;
        textDiv.style.backgroundColor = "rgba(0, 0, 0, 0.5)";
        textDiv.style.color = "silver";
        textDiv.style.fontSize = 30;
        textDiv.innerHTML = "";
        textDiv.style.top = (window.innerHeight-60) + 'px';
        textDiv.style.left = 0 + 'px';
        textDiv.style.height = 60;
        textDiv.style.width = window.innerWidth;
        textDiv.style.textAlign="left";
        textDiv.style.padding = 20;
        textDiv.style.display = "none";
        document.body.appendChild(textDiv);
        
        function onResizeWindow() {
            textDiv.style.top = (window.innerHeight-60) + 'px';
            textDiv.style.left = 0 + 'px';
            textDiv.style.height = 60;
            textDiv.style.width = window.innerWidth;
        }
        window.addEventListener("resize",onResizeWindow);
        
        function updateWithText(texts) {
            var textValid = typeof(texts)==="string" || Array.isArray(texts);
            
            textDiv.style.display = textValid ? "" : "none";
            if(textValid) {
                textDiv.innerHTML = "";
                if(!Array.isArray(texts)) {
                    texts = [texts];
                }
                for(var i=0;i<texts.length;i++) {
                    var p = document.createElement('div');
                    p.textContent = texts[i];
                    textDiv.appendChild(p);
                }
                window.tdd = textDiv;
            }
        }
        
        //  update text
        core.watchModel("overlay.text", updateWithText);
    }
    
    function destroyEverything() {
        core.stopWatch("overlay.text");
        document.body.removeChild(textDiv);
        textDiv = null;
    }
   
    /**
     *  PUBLIC DECLARATIONS
     */
    core.destroyEverything = core.combineMethods(destroyEverything, core.destroyEverything);

    /**
     *   PROCESSES
     */
    core.makeProcess("initialize-text", initialize).startAfter("initialize-renderer");
     
 })));