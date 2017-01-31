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
    ]);
    core.logScript();

    /**
     *  FUNCTION DEFINITIONS
     */
    function destroyEverything() {
    }
   
    /**
     *  PUBLIC DECLARATIONS
     */
    core.destroyEverything = core.combineMethods(destroyEverything, core.destroyEverything);

    /**
     *   PROCESSES
     */
     
    //  update document title
    core.watchModel("window.title",
        function() {
            if(core.model.window.title) {
                document.title = core.model.window.title;
            }
        }
    );

    //  update background color
    core.watchModel("window.color", 
        function() {
            var newColor = core.model.window.color;
            if(newColor) {
                document.body.backgroundColor = newColor;
            } else {
                document.body.backgroundColor = null;
            }
        }
    );
 })));