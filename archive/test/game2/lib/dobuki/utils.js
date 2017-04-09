(function (global, factory) {
 	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
 	typeof define === 'function' && define.amd ? define(['exports'], factory) :
 	(factory((global.DOK = global.DOK || {})));
 }(this, (function (core) { 'use strict';
 
    /**
     *  FUNCTION DEFINITIONS
     */
   function definePrototypes() {
        if(typeof(String.prototype.trim) === "undefined")
        {
            String.prototype.trim = function() {
                return String(this).replace(/^\s+|\s+$/g, '');
            };
        }    
        
        if(typeof(Array.prototype.at) === 'undefined') {
            Array.prototype.at = function(index) {
                return this[index];
            };
        }
   }
   
    /**
     *  PUBLIC DECLARATIONS
     */
   
   /**
    *   PROCESSES
    */
    core.requireScripts(['setup.js']);
    core.logScript();
    definePrototypes();

 })));
