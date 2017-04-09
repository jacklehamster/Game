(function (global, factory) {
 	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
 	typeof define === 'function' && define.amd ? define(['exports'], factory) :
 	(factory((global.DOK = global.DOK || {})));
 }(this, (function (core) { 'use strict';
    
    var canvases = {};
    var cuts = {};
    var textures = [null];
    var slots = {};
    var SPRITE_SHEET_SIZE = 2048;
    
    /**
     *  HEADER
     */   
    core.requireScripts([
        'setup.js',
        'threejs',
        'packer.js',
    ]);
    core.logScript();

    /**
     *  FUNCTION DEFINITIONS
     */
    function getCanvas(url) {
        if(!canvases[url]) {
            var canvas = canvases[url] = document.createElement('canvas');
            canvas.url = url;
            if(url.indexOf("tex-")===0) {
            console.log("here");
                canvas.width = canvas.height = SPRITE_SHEET_SIZE;
                var index = parseInt(url.split("-").pop());
                var tex = new THREE.Texture(canvas);
                tex.magFilter = THREE.NearestFilter;
                tex.minFilter = THREE.LinearMipMapLinearFilter;
                canvas.addEventListener("update", updateTextureEvent);
                canvas.id = "tex";
                textures[index] = tex;
                canvas.tex = index;
                document.body.appendChild(canvas);
                canvas.style.position = "absolute";
                canvas.style.left = 0;
                canvas.style.top = 0;
            } else {
                canvas.width = canvas.height = 1;
            }
            initCanvas(canvas);
        }
        return canvases[url];
    }
    
    function initCanvas(canvas) {
        var context = canvas.getContext("2d");
        context.webkitImageSmoothingEnabled = false;
        context.mozImageSmoothingEnabled = false;
        context.imageSmoothingEnabled = false;
        context.msImageSmoothingEnabled = false;
    }
    
    function fetchCanvas(urlpipe) {
        if(canvases[urlpipe.join("|")]) {
            var canvas = getCanvas(urlpipe.join("|"));
            return canvas;
        }
        
        if(urlpipe.length > 1) {
            var subpipe = urlpipe.slice(0,urlpipe.length-1);
            var canvas = getCanvas(urlpipe.join("|"));
            var processString = urlpipe[urlpipe.length-1];
            var subCanvas = fetchCanvas(subpipe);
            processCanvas(subCanvas, processString,canvas);
            subCanvas.addEventListener("update", function(event) {
                var subCanvas = event.currentTarget;
                processCanvas(subCanvas, processString, canvas);
                canvas.dispatchEvent(new Event("update"));
                console.log("!!!!!!!!!)))");
            });
            return canvas;
        } else {
            var url = urlpipe[0];
            var canvas = getCanvas(url);
            var image = new Image();
            image.onload = function() {
                canvas.width = image.naturalWidth;
                canvas.height = image.naturalHeight;
                canvas.style.display = "absolute";
                initCanvas(canvas);
                document.body.appendChild(canvas);
                image.style.position = "absolute";
                document.body.appendChild(image);
                
                canvas.getContext("2d").drawImage(image,0,0);
                console.log("!!!!!");
                canvas.dispatchEvent(new Event("update"));
                image = null;
            }
            image.crossOrigin = '';
            image.src = url;
            return canvas;
        }
    }
    
    function processCanvas(canvas, processString, outputCanvas) {
        //  check size split
        var splits = processString.split(",");
        if(splits.length===4 && splits.every(num=>!isNaN(num))) {
            splits = splits.map(o => parseInt(o));
        console.log("THIS",splits);
            outputCanvas.width = splits[2];
            outputCanvas.height = splits[3];
            initCanvas(outputCanvas);
            window.ooo = outputCanvas;
            
            outputCanvas.getContext("2d").drawImage(canvas,
                splits[0], splits[1], splits[2], splits[3],
                0,0,outputCanvas.width,outputCanvas.height
            );
        } else if(processString.indexOf("scale:")===0) {
            if(canvas.width>1 && canvas.height>1) {
        console.log("THIS2");
                var scale = parseFloat(processString.split(":")[1]);
                outputCanvas.width = Math.ceil(canvas.width * scale);
                outputCanvas.height = Math.ceil(canvas.height * scale);
                initCanvas(outputCanvas);
                outputCanvas.getContext("2d").drawImage(canvas,
                    0,0,canvas.width,canvas.height,
                    0,0,outputCanvas.width,outputCanvas.height
                );
            }
        }
    }
    
    function getCut(url) {
        if(cuts[url]) {
            return cuts[url];
        }
        var canvas = fetchCanvas(url.split("|"));
        var slot = core.getSlot(canvas);
        if(slot) {
            canvas.url = url;
            slots[url] = slot;
//            canvas.slot = slot;
            canvas.addEventListener("update", updateSpritesheetEvent);
            canvas.dispatchEvent(new Event("update"));
            var cut = null;
            
            var lastProcess = url.split("|").pop();
            var uvX = slot.x / SPRITE_SHEET_SIZE;
            var uvY = slot.y / SPRITE_SHEET_SIZE;
            var uvW = canvas.width / SPRITE_SHEET_SIZE;
            var uvH = canvas.height / SPRITE_SHEET_SIZE;
            cut = {
                tex:slot.tex, 
                uv:[
                    uvX,        1-uvY,
                    uvX,        1-uvY-uvH,
                    uvX+uvW,    1-uvY,
                    uvX+uvW,    1-uvY-uvH,
                ],
                size: [ canvas.width, canvas.height ],
            };
            return cuts[url] = cut;
        } else {
            return null;
        }
    }
    
    function updateSpritesheetEvent(event) {
        var canvas = event.currentTarget;
        var slot = slots[canvas.url];
        var spritesheet = getCanvas("tex-"+slot.tex);
        spritesheet.getContext("2d").drawImage(canvas,slot.x,slot.y);
        spritesheet.dispatchEvent(new Event("update"));
    }
    
    function updateTextureEvent(event) {
        console.log("!!!<<<");
        var canvas = event.currentTarget;
        textures[canvas.tex].needsUpdate = true;
    }
    
    function destroyEverything() {
        textures.forEach(tex => { if(tex)tex.dispose() });
    }
    
    function getTextures() {
        return textures;
    }
   
    /**
     *  PUBLIC DECLARATIONS
     */
    core.getCut = getCut;
    core.getTextures = getTextures;
    core.destroyEverything = core.combineMethods(destroyEverything, core.destroyEverything);

    /**
     *   PROCESSES
     */
    
     
 })));