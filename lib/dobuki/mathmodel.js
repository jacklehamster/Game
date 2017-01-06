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
        var content = core.decodeObject(object[prop], object, prop);
        if (typeof(content)=="string" || Array.isArray(content)) {
            parent[objectName] = null;
            delete parent[objectName];
            var func = parseFormula(content, parent);
            Object.defineProperty(parent, objectName, { get: func, enumerable: true } );
            return func();
        } else {
            function checkValue() {
                var content = core.decodeObject(object[prop], object, prop);
                if (typeof(content)=="string" || Array.isArray(content)) {
                    core.removeLoop(checkValue);
                    core.decodeObject(object, parent, objectName);
                }
            }
            core.addLoop(0, checkValue);
            return null;
        }
    }
    
    function parseFormula(formula, context) {
        core.expectParams(arguments, "string|array");
        var formulas = Array.isArray(formula) ? formula : [formula];
        var codes = formulas.map(formula => math.compile(formula));
        return function() {
            var result;
            for(var i=0; i<codes.length; i++) {
                scope.this = context;
                scope._ = result = codes[i].eval(scope);
            }
            delete scope._;
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
                var func = parseFormula(content, parent);
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