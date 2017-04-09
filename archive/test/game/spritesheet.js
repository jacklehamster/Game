(function (global, factory) {
 	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
 	typeof define === 'function' && define.amd ? define(['exports'], factory) :
 	(factory((global.dok = global.dok || {})));
 }(this, (function (core) { 'use strict';
    
    var canvases = {};
    var textures = {};
    
    
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
    function getCanvas(url) {
        if(!canvases[url]) {
            canvases[url] = document.createElement('canvas');
            canvases[url].url = url;
            var context = canvases[url].getContext("2d");
            context.webkitImageSmoothingEnabled = false;
            context.mozImageSmoothingEnabled = false;
            context.imageSmoothingEnabled = false;
            canvases[url].width = canvases[url].height = 1;
        }
        return canvases[url];
    }
    
    function fetchCanvas(urlpipe, callback) {
        if(canvases[urlpipe.join("|")]) {
            var canvas = getCanvas(urlpipe.join("|"));
            if(callback) {
                callback(canvas);
            }
            return canvas;
        }
        
        if(urlpipe.length > 1) {
            var subpipe = urlpipe.slice(0,urlpipe.length-1);
            var canvas = getCanvas(urlpipe.join("|"));
            var processString = urlpipe[urlpipe.length-1];
            var subCanvas = fetchCanvas(subpipe, function(subCanvas) {
                processCanvas(subCanvas, processString, canvas);
                canvas.dispatchEvent(new Event("update"));
                if(callback) {
                    callback(canvas);
                }
            });
            subCanvas.addEventListener("update", function(event) {
                var subCanvas = event.currentTarget;
                processCanvas(subCanvas, processString, canvas);
                canvas.dispatchEvent(new Event("update"));
            });
            return canvas;
        } else {
            var url = urlpipe[0];
            var canvas = getCanvas(url);
            var image = new Image();
            image.onload = function() {
                canvas.width = image.naturalWidth;
                canvas.height = image.naturalHeight;
                canvas.getContext("2d").drawImage(image,0,0);
                canvas.dispatchEvent(new Event("update"));
                image = null;
                if(callback) {
                    callback(canvas);
                }
            }
            image.crossOrigin = '';
            image.src = url;
            return canvas;
        }
    }
    
    function processCanvas(canvas, processString, outputCanvas) {
        //  check size split
        var splits = processString.split(",");
        if(splits.length===4) {
            splits = splits.map(o => parseInt(o));
            outputCanvas.width = splits[2];
            outputCanvas.height = splits[3];
            outputCanvas.getContext("2d").drawImage(canvas, splits[0], splits[1], splits[2], splits[3], 0,0,outputCanvas.width,outputCanvas.height);
        }    
    }
    
    function getTexture(url) {
        if(textures[url]) {
            return textures[url];
        }
        var canvas = fetchCanvas(url.split("|"));
        textures[url] = new THREE.Texture(canvas);
        canvas.addEventListener("update", updateTextureEvent);
        return textures[url];
    }
    
    function updateTextureEvent(event) {
        var canvas = event.currentTarget;
        textures[canvas.url].needsUpdate = true;
    }
    
    function destroyEverything() {
    }
   
    /**
     *  PUBLIC DECLARATIONS
     */
    core.getTexture = getTexture;
    core.destroyEverything = core.combineMethods(destroyEverything, core.destroyEverything);

    /**
     *   PROCESSES
     */
    
     
 })));