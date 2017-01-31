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
        'utils.js',
        'mathjs',
        'objectdecoder.js',
    ]);
    core.logScript();

    var scope = {
        this: null,
        'π' : Math.PI,
        get time()  {
            return core.time;
        },
        get model() {
            return core.model;
        },
        getObject: core.getObject,
    };
    
    /**
     *  FUNCTION DEFINITIONS
     */   
     
    function handleCalculate(object, prop, parent, objectName) {
        var value = core.decodeObject(object[prop], object, prop);
        if(Array.isArray(value)) {
            value = value.join("\n");
        }
        scope.this = parent;
        value = math.eval(value, scope);
        if(parent) {
            parent[objectName] = value;
        }
        return value;
    }
    
    function handleFormula(object, prop, parent, objectName) {
        core.assert(parent, "Top level object cannot be a formula.");
        return core.waitForContent(object, prop, parent, objectName,
            function(content) {
                return typeof(content)=="string" || Array.isArray(content);
            },
            function(content) {
                parent[objectName] = null;
                delete parent[objectName];
                var func = parseFormula(content, parent, object);
                Object.defineProperty(parent, objectName, { get: func, enumerable: true } );
                return func();
            }
        );
    }
    
    function parseFormula(formula, context, control) {
        core.expectParams(arguments, "string|array");
        var formulas = Array.isArray(formula) ? formula : [formula];
        var codes = formulas.map(formula => math.compile(formula));
        return function() {
            var result = null;
            if(typeof(control.active)==='undefined' || control.active) {
                for(var i=0; i<codes.length; i++) {
                    scope.this = context;
                    try {
                        scope._ = result = codes[i].eval(scope);
                    } catch(e) {
                        console.error("Formula failed:","\n", formulas[i],"\n", scope);
                        throw e;
                    }
                }
                delete scope._;
            }
            return result;
        };
    }
    
    function addModelProperty(name, callback) {
        core.assert(typeof (scope[name]) === 'undefined', [name + " already exists in math scope. Set to ", scope[name]]);
        scope[name] = callback;
    }
    
    function removeModelProperty(name) {
        if(scope) {
            delete scope[name];
        }
    }
    
    function handleLoop(object, prop, parent, objectName) {
        if(object.looping) {
            return;
        }
        return core.waitForContent(object, prop, parent, objectName,
            function(content) {
                return typeof(content)==="string" || Array.isArray(content);
            },
            function(content) {
                object.looping = true;
                var func = parseFormula(content, object, object);
                core.addLoop(object["period"]||0, func);
            }
        );
    }
    
    /**
     *  PUBLIC DECLARATIONS
     */
    core.addModelProperty = addModelProperty;
    core.removeModelProperty = removeModelProperty;

    /**
     *   PROCESSES
     */
     
    core.registerModel("calculate", handleCalculate);
    core.registerModel("formula", handleFormula);
    core.registerModel("update-loop", handleLoop);
     
 })));