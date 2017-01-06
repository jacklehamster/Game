(function (global, factory) {
 	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
 	typeof define === 'function' && define.amd ? define(['exports'], factory) :
 	(factory((global.DOBUKI = global.DOBUKI || {})));
 }(this, (function (core) { 'use strict';
 
    /**
     *  FUNCTION DEFINITIONS
     */
   var processes = {};
   var childrenProcesses = {};
   var doneProcesses = {};
   
   function processStarter(id) {
        return function() {
            startProcess(id);
        };
   }
   
   function makeProcess(id, callback) {
        if(processes[id]) {
            core.handleError("A process called " + id + " already exists.");
            return;
        }
        var params = [];
        for(var i=2; i<arguments.length;i++) {
            params.push(arguments[i]);
        }
        
        return new Process(id, callback, params);
   }
   
   function startProcess(id) {
        var process = processes[id];
        if(!process) {
            core.handleError("No process called " + id + ".");
            return;
        }
        var params = [];
        for(var i=1; i<arguments.length; i++) {
            params.push(arguments[i]);
        }
        process.start.apply(process, params);
   }
   
   function Process(id, callback, defaultArguments) {
        var self = this;
        callback = callback.bind(self);
        var paramsFromParents = [];
        var parentProcesses = [];
        var delay = Date.now();
        var processStopped = false;

        processes[id] = self;

        var synchronous = true;
        
        //  wait for processes to start
        self.waitFor = function() {
            for(var i=0; i<arguments.length; i++) {
                var processId = arguments[i];
                var duration = core.parseDuration(processId);
                if(duration !== null) {
                    delay += duration;
                } else {
                    parentProcesses.push(processId);
                    if(!childrenProcesses[processId]) {
                        childrenProcesses[processId] = [];
                    }
                    childrenProcesses[processId].push(self);
                    if(doneProcesses[processId]) {
                        self.setParam(processId, doneProcesses[processId]);
                    }
                }
            }
            return self;
        }
        
        //  begin process
        self.start = function() {
            var now = Date.now();
            if(now < delay) {
                var timeToWait = now - delay;
                setTimeout(self.start, timeToWait, arguments);
                return;
            }
            if(!parentProcesses.length) {
                callback.apply(null, arguments);
            } else {
                var params = [];
                for(var i=0;i<defaultArguments.length;i++) {
                    params.push(defaultArguments[i]);
                }
                
                for(var i=0;i<parentProcesses.length;i++) {
                    if(!paramsFromParents[i]) {
                        return;
                    }
                    params = params.concat(paramsFromParents[i]);
                }
                callback.apply(null, params);
                self.complete.apply(null, params);
            }
            return self;
        }
        
        //  start after processes
        self.startAfter = function () {
            self.waitFor.apply(null, arguments);
            self.start();
        }      
        
        self.setParam = function(parentId, params) {
            for(var i=0;i<parentProcesses.length;i++) {
                if(parentProcesses[i]==parentId) {
                    paramsFromParents[i] = params;
                }
            }
        }
        
        self.ignoreParameters = function(value) {
            _ignoreParameters = value;
        }
        
        self.cancel = function() {
            processStopped = true;
        }
        
        //  function to call when the process is complete
        var completeFunction  = function () {
            if(processStopped) {
                return;
            }
            var subProcesses = childrenProcesses[id];
            delete processes[id];
            delete childrenProcesses[id];
            
            var paramsForNext = [];
            if (!_ignoreParameters) {
                for(var i=0; i<arguments.length; i++) {
                    paramsForNext.push(arguments[i]);
                }
            }
            doneProcesses[id] = paramsForNext;
            
            if(subProcesses) {
                for(var i=0; i<subProcesses.length;i++) {
                    subProcesses[i].setParam(id, paramsForNext);
                    subProcesses[i].start();
                }
            }
        }
        
        var _ignoreParameters = false;
        Object.defineProperty(self, "complete", {
            get: function () {
                _ignoreParameters = false;
                var completeCallback = completeFunction ? completeFunction : function(){};
                completeFunction = null;
                return completeCallback; 
            }
        });
        
        Object.defineProperty(self, "completeWithoutParameters", {
            get: function () {
                _ignoreParameters = true;
                var completeCallback = completeFunction ? completeFunction : function(){};
                completeFunction = null;
                return completeCallback; 
            }
        });
   }
   
   function cancelProcess(processId) {
        var process = processes[processId];
        if(process) {
            process.cancel();
        }
   }
   
    function destroyEverything() {
        for(var id in processes) {
            processes[id].cancel();
        }
        processes = {};
        childrenProcesses = {};
        doneProcesses = {};
    }

    /**
     *  PUBLIC DECLARATIONS
     */

    core.makeProcess = makeProcess;
    core.startProcess = startProcess;
    core.cancelProcess = cancelProcess;
    core.destroyEverything = core.combineMethods(destroyEverything, core.destroyEverything);

    /**
    *   PROCESSES
    */
    core.requireScripts(['setup.js', 'utils.js']);
    core.logScript();
    
    core.makeProcess("waitPageLoaded", function() {
        document.addEventListener("DOMContentLoaded", this.completeWithoutParameters);
    }).start();

    
    /*  USAGE:
        core.makeProcess("apply-shaders", function(vertexShader, fragmentShader) {
                var uniforms = {
                    texture:  { type: 'tv', value:
                        [texture,
                        texture
                    ]},
                };
        
                var newMaterial = new THREE.ShaderMaterial( {
                        uniforms: uniforms,
                        vertexShader: vertexShader,
                        fragmentShader: fragmentShader,
                        transparent:true,
                } );            
                sprite.material = newMaterial;
        }).startAfter('3 sec', "initialize", "load-vertex-shader", "load-fragment-shader");
    */

 })));