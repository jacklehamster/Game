(function (global, factory) {
 	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
 	typeof define === 'function' && define.amd ? define(['exports'], factory) :
 	(factory((global.DOBUKI = global.DOBUKI || {})));
 }(this, (function (core) { 'use strict';
    
    var canvas;
    
    /**
     *  HEADER
     */   
    core.requireScripts([
        'setup.js',
        'renderer.js',
        'spritesheet.js',
    ]);
    core.logScript();

    /**
     *  FUNCTION DEFINITIONS
     */   
     
    function resizeCanvas(canvas, width, height) {
        canvas.width = width;
        canvas.height = height;
    }
    
    function getCanvas() {
        if(!canvas) {
            canvas = document.createElement('canvas');
            var ctx = canvas.getContext("2d");
            ctx.webkitImageSmoothingEnabled = false;
            ctx.mozImageSmoothingEnabled = false;
            ctx.imageSmoothingEnabled = false;

            canvas.style.top = "0px";
            canvas.style.left = "0px";
            canvas.style.position = "absolute";
            document.body.appendChild(canvas);
            
            resizeCanvas(canvas, innerWidth, innerHeight);            
        }
        return canvas;
    }
    
    function onResizeWindow(oldValues) {
        if(core.model.window) {
            var width = core.model.window.width, height = core.model.window.height;
            var canvas = getCanvas();
            resizeCanvas(canvas, width, height);
            var hudBitmap = getCanvas().getContext('2d');
            hudBitmap.font = "Normal 40px Arial";
            hudBitmap.textAlign = 'center';
            hudBitmap.fillStyle = "rgba(245,245,245,0.75)";
            hudBitmap.fillText('Initializing...', canvas.innerWidth / 2, canvas.innerHeight / 2);
        }
    }
     
    function initialize() {        
        core.addLoop(0,updateFromModel);
        onResizeWindow();
        core.watchModel("window.width|window.height", onResizeWindow);
    }
    
    function updateFromModel() {
        var model = core.getModel();
        if(!model.overlay || !model.overlay.objects || !core.checkOnTime()) {
            return;
        }
        
        var canvas = getCanvas();        
        var ctx = canvas.getContext("2d");
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        drawObjects(ctx,model.overlay.objects);
    }
    
    function drawObjects(ctx, objects) {
        var skip = false;
        for(var i=0;i<objects.length;i++) {
            var object = objects.at(i);
            if(object.destroyed) {
                continue;
            }
            if(typeof object.active !== 'undefined' && !object.active) {
                continue;
            }
            if (object.rect) {
                drawRect(ctx, object);
            }
            if (object.frame) {
                drawObject(ctx, object);
            }
            if(object.text) {
                drawText(ctx, object);
            }
            if(object.polygon) {
                drawPolygon(ctx, object);
            }
            if(object.objects && object.objects.length) {
                if(drawObjects(ctx, object.objects)) {
                    return true;
                }
            }
            if(!core.checkOnTime()) {
                core.skipCallbacks();
                return true;
            }
        }
        return skip;
    }
    
    function drawPolygon(ctx, object) {
        if(!object.polygon.path || !object.polygon.path.length) {
            return;
        }
        ctx.beginPath();
        ctx.moveTo(
            object.position.x + object.polygon.path[0][0], 
            object.position.y + object.polygon.path[0][1]
        );
        object.polygon.path.forEach(
            p => ctx.lineTo(object.position.x + p[0], object.position.y + p[1])
        );
        ctx.closePath();
        if(object.polygon.color) {
            ctx.fillStyle = object.polygon.color;
        }
        ctx.fill();
    }
    
    function drawRect(ctx, object) {
        var rect = object.rect;
        if(rect.color) {
            ctx.fillStyle = rect.color;
        }
        ctx.fillRect(object.position.x, object.position.y, object.size[0], object.size[1]);
    }

    function drawText(ctx, object) {
        var text = object.text;
        if(!text.text || !text.text.length || !object.position) {
            return;
        }
        var textArray = text.text.split("\n");
        for(var i=0; i<textArray.length; i++) {
            var string = textArray[i];
            if (text.size || text.font) {
                ctx.font = [ (text.size||""), '"'+(text.font||"")+'"' ].join(" ");
            }
            if (text.align) {
                ctx.textAlign = text.align;
            }
            if (text.color) {
                ctx.fillStyle = text.color;
            }
            ctx.fillText(string, object.position.x, object.position.y + i*40);
        }
    }
    
    function isMouseOver(object) {
        if(!object || !object.position) return false;
        var x = object.position.x;
        var y = object.position.y;
        var size = object.size ? object.size : objectCut.cut.slice(2);
        var w = size[0];
        var h = size[1];
        if(object.frame.offset) {
            x -= object.frame.offset.x;
            y -= object.frame.offset.y; 
        }
        var mousePosition = DOBUKI.model.input.mouse.position;
        return mousePosition && mousePosition.x >= x && mousePosition.x <= x+w
            && mousePosition.y >= y && mousePosition.y <= y+h;
    }
    
    function drawObject(ctx, object) {
        var objectCut = object.frame ? core.getCut(object.frame, true) : { cut:null, canvas:null };
        if(objectCut.canvas && typeof object.position.x !== 'undefined' && typeof object.position.y !== 'undefined') {
            var x = object.position.x;
            var y = object.position.y;
            var size = object.size ? object.size : objectCut.cut.slice(2);
            var w = size[0];
            var h = size[1];
            if(object.frame.offset) {
                x -= object.frame.offset.x;
                y -= object.frame.offset.y; 
            }
            
            var margin = objectCut.scale9margin;
            if(!margin) {
                ctx.drawImage(
                    objectCut.canvas, objectCut.cut[0], objectCut.cut[1], objectCut.cut[2], objectCut.cut[3],
                    x,y,w,h);
            } else {
                var srcX = [
                    objectCut.cut[0],   //  left
                    objectCut.cut[0] + objectCut.cut[2]*margin.left,    //  mid
                    objectCut.cut[0] + objectCut.cut[2]*(1-margin.right),   //  right
                ];
                var srcW = [
                    objectCut.cut[2]*margin.left,
                    objectCut.cut[2]*(1-margin.left-margin.right),
                    objectCut.cut[2]*margin.right,
                ];
                var dstX = [
                    x,
                    Math.floor(x + objectCut.cut[2]*margin.left),
                    Math.floor(x + w - objectCut.cut[2]*margin.right),
                ];
                var dstW = [
                    objectCut.cut[2]*margin.left,
                    w - (margin.left + margin.right) * objectCut.cut[2],
                    objectCut.cut[2]*margin.right,
                ];
                var srcY = [
                    objectCut.cut[1],   //  top
                    objectCut.cut[1] + objectCut.cut[3]*margin.top, //  center
                    objectCut.cut[1] + objectCut.cut[3]*(1-margin.bottom),  //  bottom
                ];
                var srcH = [
                    objectCut.cut[3]*margin.top,
                    objectCut.cut[3]*(1-margin.top-margin.bottom),
                    objectCut.cut[3]*margin.bottom,
                ];
                var dstY = [
                    y,
                    Math.floor(y + objectCut.cut[3]*margin.top),
                    Math.floor(y + h - objectCut.cut[3]*margin.bottom),
                ];
                var dstH = [
                    objectCut.cut[3]*margin.top,
                    h - (margin.top + margin.bottom) * objectCut.cut[3],
                    objectCut.cut[3]*margin.bottom,
                ];
            
                for(var cellY=0;cellY<3;cellY++) {
                    for(var cellX=0;cellX<3;cellX++) {
                        ctx.drawImage(
                            objectCut.canvas, 
                            srcX[cellX], srcY[cellY],
                            srcW[cellX], srcH[cellY],
                            dstX[cellX], dstY[cellY],
                            dstW[cellX], dstH[cellY]
                        );
                    }
                }
            }
        }
    }    
    
    function destroyEverything() {
    }
   
    /**
     *  PUBLIC DECLARATIONS
     */
    core.isMouseOver = isMouseOver;
    core.destroyEverything = core.combineMethods(destroyEverything, core.destroyEverything);

    /**
     *   PROCESSES
     */
     
    core.makeProcess("initialize-overlay", initialize).waitFor("page-loaded").ignoreParameters(true);
     
 })));