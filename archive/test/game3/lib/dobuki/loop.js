(function (global, factory) {
 	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
 	typeof define === 'function' && define.amd ? define(['exports'], factory) :
 	(factory((global.DOK = global.DOK || {})));
 }(this, (function (core) { 'use strict';
 
   var coreLoops = [];
   var frame = 0;
   var fps = 0;
   var period = Math.floor(1000/60);
   var nextTime = 0;
   var lastCount = 0;
   
   var frameCount = 0;
   
   /**
    *  FUNCTION DEFINITIONS
    */
   function loop(time) {
        if(coreLoops) {
            requestAnimationFrame( loop );
            if(time<=core.time + period) {
                return;
            }
            core.time = Math.floor(time/period)*period;
            coreLoops.forEach(callback => {
                callback.call();
            });
            frameCount ++;
            if(time-lastCount>1000) {
                fps = frameCount;
                frameCount = 0;
                lastCount = time;
            }
        }
   }
   
   function addLoop(callback) {
        coreLoops.push(callback);
   }
    
   function beginLoop() {
        loop();
   }
    
   function loopTime() {
        return performance.now() - core.time;
   }
   
   function destroyEverything() {
        coreLoops = null;
   }
        
   /**
    *  PUBLIC DECLARATIONS
    */
   core.addLoop = addLoop;
   core.destroyEverything = core.combineMethods(destroyEverything, core.destroyEverything);
   
    Object.defineProperty(core, "fps", {
        enumerable: false,
        configurable: false,
        get: function () {
            return fps;
        },
        set: function(value) {
            period = Math.floor(1000/value);
        }
    });
   

   /**
    *   PROCESSES
    */
   core.requireScripts(['setup.js']);
   core.logScript();
   beginLoop();

 })));