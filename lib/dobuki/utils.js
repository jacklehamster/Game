(function (global, factory) {
 	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
 	typeof define === 'function' && define.amd ? define(['exports'], factory) :
 	(factory((global.DOBUKI = global.DOBUKI || {})));
 }(this, (function (core) { 'use strict';
 
    /**
     *  FUNCTION DEFINITIONS
     */
   function loadAsync(src, callback) {
        var xhr = new XMLHttpRequest();
        xhr.overrideMimeType("text/plain; charset=x-user-defined");
        xhr.open("GET", src, true);
        xhr.addEventListener('load',
            function (e) {
              if (xhr.readyState === 4) {
                if (xhr.status === 200) {
                    callback(xhr.responseText);
                } else {
                    core.handleError(xhr.responseText);
                }
              }
            }
        );
        xhr.addEventListener('error',
            function (e) {
                core.handleError(xhr.statusText);
            }
        );
        xhr.send(null);
   }
   
   function parseDuration(dur) {
        var match = 
            /^(\d+(\.\d+)?)\s?(|(m(illi)?)?s(ec(onds?)?)?|m(in(utes?)?)?)$/g.exec(dur);
        if(!match) {
            return null;
        }
        var value = parseFloat(match[1]);
        switch(match[3]) {
            case 's': case 'sec': case 'second': case 'seconds':
                value *= 1000;
                break;
            case 'm': case 'min': case 'minute': case 'minutes':
                value *= 1000*60;
                break;
        }
        return value;
   }
   
   function expectParams(args) {
        if(typeof(args) != 'object') {
            core.handleError("Pass 'arguments' to expectParams");
        }
        if(args.length != arguments.length-1) {
            core.handleError("Expected #arguments "+(arguments.length-1)+" NOT "+args.length);
        }
        for(var i=1; i<arguments.length; i++) {
            var type = typeof(args[i-1]);
            if(arguments[i].split("|").indexOf(type)<0) {
                core.handleError("Expected argument "+(i-1)+" "+arguments[i]+" NOT "+type);
            }
        }
   }
   
   function closeEnough(value, goal, margin=0.001) {
        return Math.abs(value-goal) < margin ? goal : value; 
   }
   
   var pixelProcessors = {};
   function getPixelProcessor(id) {
        return pixelProcessors[id];
   }
   
   function processPixels(src, fun) {
        var tag = md5(fun.toString());
        pixelProcessors[tag] = fun;
        return src+"|"+tag;
   }
   
   function flatten(objects) {
        var array = [];
        for(var i=0; i<objects.length;i++) {
            if(Array.isArray(objects[i]) || objects[i].isGraphicModel) {
                array = array.concat(flatten(objects[i]));
            } else {
                array.push(objects[i]);
            }
        }
        return array;
   }
   
   function distance(pos1, pos2) {
        var dx = pos1.x-pos2.x;
        var dy = pos1.y-pos2.y;
        var dz = pos1.z-pos2.z;
        return Math.sqrt(dx*dx+dy*dy+dz*dz);
   }
   
   function combineMethods(firstMethod, secondMethod) {
        return function() {
            if(firstMethod)
                firstMethod();
            if(secondMethod)
                secondMethod();
        };
   }
      
    /**
     *  PUBLIC DECLARATIONS
     */
   core.loadAsync = loadAsync;
   core.parseDuration = parseDuration;
   core.expectParams = expectParams;
   core.closeEnough = closeEnough;
   core.processPixels = processPixels;
   core.getPixelProcessor = getPixelProcessor;
   core.flatten = flatten;
   core.distance = distance;
   core.combineMethods = combineMethods;
   
   /**
    *   PROCESSES
    */
    core.requireScripts(['setup.js', 'md5.js']);
    core.logScript();

 })));
