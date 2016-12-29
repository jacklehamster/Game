(function (global, factory) {
 	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
 	typeof define === 'function' && define.amd ? define(['exports'], factory) :
 	(factory((global.DOBUKI = global.DOBUKI || {})));
 }(this, (function (core) { 'use strict';
 
    var MAX_TEXTURES = 16;
    var SPRITE_SHEET_SIZE = 2048;
    var CHUNKSIZES = 32;
 
    var canvases = [];
    var ctx = [], coreTextures = [];
    var chunks = [];
    var cachedImage = {};
    var cachedImageData = {};
    var shortName = {}, tallName = {};
    
    /**
     *  FUNCTION DEFINITIONS
     */
     function getTexture(i) {
        if(!coreTextures[i]) {
            initSpriteSheet(i);
        }     
        return coreTextures[i];
     }
     
    function getCut(frame) {
        core.expectParams(arguments, "object");
        var src = frame.src;
        var cut = frame.cut;
        var imageData = getImageData(src,cut[0],cut[1],cut[2],cut[3]);
        return imageData.data;
    }
    
    function shorty(src) {
        if(!shortName[src]) {
            var short = src.length>32 ? md5(src) : src;
            shortName[src] = short;
            shortName[short] = short;
            tallName[short] = src;
        }
        return shortName[src];
    }
    
    function biggy(src) {
        return tallName[src] ? tallName[src] : src;
    }
    
    var cacheCut = [];
    function animationCutFromGrid(width,height,tilewidth,tileheight,index) {
        var cols = Math.floor(width / tilewidth);
        var x = (index % cols) * tilewidth;
        var y = Math.floor(index / cols) * tileheight;
        cacheCut[0] = x;
        cacheCut[1] = y;
        cacheCut[2] = tilewidth;
        cacheCut[3] = tileheight;
        return cacheCut;
    }
     
    function getImageData(src, x, y, width, height) {
        var tag = [src,x,y,width,height].join(",");
        if(!cachedImageData[tag]) {
            var imageData = new ImageData(src,x,y,width,height);
            
            cachedImageData[tag] = imageData;            
            var shortTag = [shorty(src),x,y,width,height].join(",");
            cachedImageData[shortTag] = imageData;
            var tallTag = [biggy(src),x,y,width,height].join(",");
            cachedImageData[tallTag] = imageData;
        }
        return cachedImageData[tag];
    }
    
    function findSlot(width, height, imageData) {
        for(var i=0; i<MAX_TEXTURES; i++) {
            getTexture(i);        
            var chunkCols = Math.ceil(width / CHUNKSIZES);
            var chunkRows = Math.ceil(height / CHUNKSIZES);
            var chunkSide = SPRITE_SHEET_SIZE / CHUNKSIZES;
            for(var y=0;y<=chunkSide-chunkRows;y++) {
                for(var x=0;x<=chunkSide-chunkCols;x++) {
                    if(canFit(i,x,y,chunkCols,chunkRows)) {
                        fillSlot(i,x,y,chunkCols,chunkRows,imageData);
                        return {x:x*CHUNKSIZES,y:y*CHUNKSIZES,iTexture:i};
                    }
                }
            }
        }
        return null;
    }
    
    function canFit(iTexture,xpos,ypos,chunkCols,chunkRows) {
        for(var y=0;y<chunkRows;y++) {
            for(var x=0;x<chunkCols;x++) {
                if(chunks[iTexture][ypos+y][xpos+x]) {
                    return false;
                }
            }
        }
        return true;
    }
    
    function fillSlot(iTexture,xpos,ypos,chunkCols,chunkRows, imgData) {
        for(var y=0;y<chunkRows;y++) {
            for(var x=0;x<chunkCols;x++) {
                chunks[iTexture][ypos+y][xpos+x] = imgData;
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
        self.iTexture = slot.iTexture;
        self.cut = [
            slot.x / SPRITE_SHEET_SIZE,
            1 - (slot.y + height) / SPRITE_SHEET_SIZE,
            width / SPRITE_SHEET_SIZE,
            height / SPRITE_SHEET_SIZE,
        ];
        self.data = {
            cut: self.cut,
            texture: self.iTexture,
        };
        
        function copyToSpritesheet() {
            img.removeEventListener("load",copyToSpritesheet);
            ctx[self.iTexture].clearRect(slot.x, slot.y, width, height);
            ctx[self.iTexture].drawImage(img, x, y, width, height, slot.x, slot.y, width, height);
            
            var tag = src.split("|")[1];
            if(tag) {
                var fun = core.getPixelProcessor(tag);
                var imageData = ctx[self.iTexture].getImageData(slot.x,slot.y,width, height);
                
                for(var i=0; i<imageData.data.length; i+= 4) {
                    var color = fun(
                        [
                            imageData.data[i],
                            imageData.data[i+1],
                            imageData.data[i+2],
                            imageData.data[i+3],
                        ], 
                        Math.floor(i/4) % width,
                        Math.floor(Math.floor(i/4) / width)
                    );
                    imageData.data[i] = color[0];
                    imageData.data[i+1] = color[1];
                    imageData.data[i+2] = color[2];
                    imageData.data[i+3] = color[3];
                }
                ctx[self.iTexture].putImageData(imageData,slot.x,slot.y);
            }
            
            getTexture(self.iTexture).needsUpdate = true;
            self.ready = true;
            img = null;
        }
        
        if(!isImageLoaded(img)) {
            img.addEventListener("load",copyToSpritesheet);
        } else {
            copyToSpritesheet();
        }
    }
    
    function initChunks(i) {
        if(!chunks[i]) {
            chunks[i] = [];
        }
        for(var y=0; y < SPRITE_SHEET_SIZE / CHUNKSIZES; y++) {
            chunks[i][y] = [];
            for(var x=0; x< SPRITE_SHEET_SIZE / CHUNKSIZES; x++) {
                chunks[i][y][x] = null;
            }
        }
    }
    
    function getImage(src) {
        var img = cachedImage[shorty(src)];
        if(!img) {
            img = new Image();
            img.crossOrigin = '';
            img.src = biggy(src).split("|")[0];
            cachedImage[src] = img;
            cachedImage[shorty(src)] = img;
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
     
    function initSpriteSheet(i) {
        initChunks(i);
    
        var canvas = document.createElement('canvas');
        canvas.width = SPRITE_SHEET_SIZE;
        canvas.height = SPRITE_SHEET_SIZE;
        ctx[i] = canvas.getContext('2d');
        coreTextures[i] = new THREE.Texture(canvas);        
        coreTextures[i].wrapS = THREE.RepeatWrapping;
        coreTextures[i].wrapT = THREE.RepeatWrapping;
        coreTextures[i].repeat.set(.5,.5);
        coreTextures[i].magFilter = THREE.NearestFilter;
        coreTextures[i].minFilter = THREE.LinearMipMapLinearFilter;
        coreTextures[i].needsUpdate = true;
        canvases[i] = canvas;
        console.log("Spritesheet " + i + " initialized.");
    }
    
    function destroyEverything() {
        canvases = [];
        ctx = [];
        coreTextures = [];
        chunks = [];
        cachedImage = {};
        cachedImageData = {};
        shortName = {};
        tallName = {};
    }
        
    /**
     *  PUBLIC DECLARATIONS
     */
   core.getCut = getCut;
   core.getTexture = getTexture;
   core.animationCutFromGrid = animationCutFromGrid;
   core.shorty = shorty;
   core.destroyEverything = core.combineMethods(destroyEverything, core.destroyEverything);
   
   /**
    *   PROCESSES
    */
    core.requireScripts(['setup.js','md5.js','utils.js']);
    core.logScript();
    
    initSpriteSheet(0);
    initSpriteSheet(1);

 })));