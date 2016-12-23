(function (global, factory) {
 	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
 	typeof define === 'function' && define.amd ? define(['exports'], factory) :
 	(factory((global.DOBUKI = global.DOBUKI || {})));
 }(this, (function (core) { 'use strict';
 
   var coreLoops = [];
   
    /**
     *  FUNCTION DEFINITIONS
     */
    function loop(time) {
        core.time = time;
        for(var i=0; i<coreLoops.length; i++) {
            var process = coreLoops[i];
            if(process.time < core.time) {
                process.time = Math.ceil(core.time/process.period) * process.period;
                process.callback.call(this);
            }
        }
        requestAnimationFrame( loop );
    }
    
    function addLoop(period, callback) {
        period = !period || period<0 ? 1 : period;
        core.removeLoop(callback);
        coreLoops.push(
            {
                time: 0,
                period: period,
                callback: callback,
            }
        );
    }
    
    function removeLoop(callback) {
        for(var i=0; i<coreLoops.length; i++) {
            if(callback == coreLoops[i].callback) {
                coreLoops.splice(i, 1);
                break;
            }
        }
    }
    
    /**
     *  PUBLIC DECLARATIONS
     */
   core.addLoop = addLoop;
   core.removeLoop = removeLoop;
   
   /**
    *   PROCESSES
    */
    core.requireScripts(['setup.js']);
    core.logScript();
    loop();

 })));