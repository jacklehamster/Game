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

    var defaultMathScope = {
        'π' : Math.PI,
        get time()  {
            return core.time;
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
        value = math.eval(value, defaultMathScope);
        if(parent) {
            parent[objectName] = value;
        }
        return value;
    }
    
    function handleFormula(object, prop, parent, objectName) {
    console.error("FORMULA", prop, objectName);
        core.assert(parent, "Top level object cannot be a formula.");
        var content = core.decodeObject(object[prop], object, prop);
        if (typeof(content)=="string" || Array.isArray(content)) {
            parent[objectName] = null;
            delete parent[objectName];
            var func = parseFormula(content, parent);
            Object.defineProperty(parent, objectName, { get: func } );
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
        formula = Array.isArray(formula) ? formula.join("\n") : formula;
        return function() {
            return math.eval(formula, defaultMathScope);
        };
    }
    
    /**
     *  PUBLIC DECLARATIONS
     */

    /**
     *   PROCESSES
     */
     
    core.registerModel("calculate", handleCalculate);
    core.registerModel("formula", handleFormula);
     
 })));