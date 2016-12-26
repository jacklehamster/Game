(function (global, factory) {
 	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
 	typeof define === 'function' && define.amd ? define(['exports'], factory) :
 	(factory((global.DOBUKI = global.DOBUKI || {})));
 }(this, (function (core) { 'use strict';
 
    var SPRITE_SHEET_SIZE = 2048;
    var CHUNKSIZES = 32;
 
    var canvas, ctx, coreTexture;
    var chunks = [];;
    var cachedImage = {};
    var cachedImageData = {};
    
    /**
     *  FUNCTION DEFINITIONS
     */
     function getTexture() {
        return coreTexture;
     }
     
    function getCut(frame) {
        core.expectParams(arguments, "object");
        if(frame.imageData) {
            return frame.imageData;
        }
        var src = frame.src;
        var cut = frame.cut;
        var imageData = getImageData(src,cut[0],cut[1],cut[2],cut[3]);
        frame.imageData = imageData;
        return imageData.cut;
    }
     
     
    function getImageData(src, x, y, width, height) {
        var tag = [src,x,y,width,height].join(",");
        if(!cachedImageData[tag]) {
            cachedImageData[tag] = new ImageData(src,x,y,width,height);
        }
        return cachedImageData[tag];
    }
    
    function findSlot(width, height, imageData) {
        var chunkCols = Math.ceil(width / CHUNKSIZES);
        var chunkRows = Math.ceil(height / CHUNKSIZES);
        var chunkSide = SPRITE_SHEET_SIZE / CHUNKSIZES;
        for(var y=0;y<chunkSide;y++) {
            for(var x=0;x<chunkSide;x++) {
                if(canFit(x,y,chunkCols,chunkRows)) {
                    fillSlot(x,y,chunkCols,chunkRows,imageData);
                    return {x:x*CHUNKSIZES,y:y*CHUNKSIZES};
                }
            }
        }
        return null;
    }
    
    function canFit(xpos,ypos,chunkCols,chunkRows) {
        for(var y=0;y<chunkRows;y++) {
            for(var x=0;x<chunkCols;x++) {
                if(chunks[ypos+y][xpos+x]) {
                    return false;
                }
            }
        }
        return true;
    }
    
    function fillSlot(xpos,ypos,chunkCols,chunkRows, imgData) {
        for(var y=0;y<chunkRows;y++) {
            for(var x=0;x<chunkCols;x++) {
                chunks[ypos+y][xpos+x] = imgData;
            }
        }
    }
     
    function ImageData(src, x, y, width, height) {
        var self = this;
        var img = getImage(src);
        
        var slot = findSlot(width,height,self);
        if (!slot) {
            core.handleError("Not slot available to fit image "+width+"x"+height);
            self.cut = [0,0,0,0];
            return;
        }
        self.cut = [
            slot.x / SPRITE_SHEET_SIZE,
            1 - (slot.y + height) / SPRITE_SHEET_SIZE,
            width / SPRITE_SHEET_SIZE,
            height / SPRITE_SHEET_SIZE,
        ];
        
        function copyToSpritesheet() {
            ctx.drawImage(img, x, y, width, height, slot.x, slot.y, width, height);
            coreTexture.needsUpdate = true;
            self.ready = true;
        }
        
        if(!isImageLoaded(img)) {
            img.addEventListener("load",copyToSpritesheet);
        } else {
            copyToSpritesheet();
        }
    }
    
    function initChunks() {
        for(var y=0; y < SPRITE_SHEET_SIZE / CHUNKSIZES; y++) {
            chunks[y] = [];
            for(var x=0; x< SPRITE_SHEET_SIZE / CHUNKSIZES; x++) {
                chunks[y][x] = null;
            }
        }
    }
    
    function getImage(src) {
        var img = cachedImage[src];
        if(!img) {
            img = new Image();
            img.crossOrigin = '';
            img.src = src;
            cachedImage[src] = img;
        }
        return img;
    }
    
    function isImageLoaded(img) {
        if (!img.complete) {
            return false;
        }
        if (typeof img.naturalWidth !== "undefined" && img.naturalWidth === 0) {
            return false;
        }
        return true;
    }    
     
    function initSpriteSheet() {
        initChunks();
    
        canvas = document.createElement('canvas');
        canvas.width = SPRITE_SHEET_SIZE;
        canvas.height = SPRITE_SHEET_SIZE;
        ctx = canvas.getContext('2d');
        coreTexture = new THREE.Texture(canvas);
        
        coreTexture.wrapS = THREE.RepeatWrapping;
        coreTexture.wrapT = THREE.RepeatWrapping;
        coreTexture.repeat.set(.5,.5);
        coreTexture.magFilter = THREE.NearestFilter;
        coreTexture.minFilter = THREE.LinearMipMapLinearFilter;
        coreTexture.needsUpdate = true;
        window.c = canvas;
    }
    
    /**
     *  PUBLIC DECLARATIONS
     */
   core.getCut = getCut;
   core.getTexture = getTexture;
   
   /**
    *   PROCESSES
    */
    core.requireScripts(['setup.js']);
    core.logScript();
    
    initSpriteSheet();

 })));