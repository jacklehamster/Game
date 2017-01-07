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
     
    function getCut(frame, forCanvas) {
        core.expectParams(arguments, "object");
        var src = frame.src;
        var cut = frame.cut;
        if(!cut) {
            cut = [0,0,0,0];
        }
        var scale = frame.scale ? frame.scale : 1;
        var scale9 = frame.scale9 ? frame.scale9 : null;
        
        var imageData = getImageDataObject(
            src,
            cut[0],cut[1],cut[2],cut[3],
            scale,
            scale9);
        return forCanvas ? imageData.canvasData: imageData.data;
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
        core.expectParams(arguments, "number","number","number","number","number");
        if(!width || !height) {
             cacheCut[0] = 0;
             cacheCut[1] = 0;
             cacheCut[2] = 0;
             cacheCut[3] = 0;
       } else {
            var cols = Math.floor(width / tilewidth);
            var x = (index % cols) * tilewidth;
            var y = Math.floor(index / cols) * tileheight;
            cacheCut[0] = x;
            cacheCut[1] = y;
            cacheCut[2] = tilewidth;
            cacheCut[3] = tileheight;
        }
        return cacheCut;
    }
     
    function getImageDataObject(src, x, y, width, height, scale, scale9) {
        core.expectParams(arguments, "string","number","number","number","number","number","array|null");

        var img = getImage(src);
        var frameIndex = img.multiFrame ? img.getFrame() : 0;

        var tag = [src,x,y,width,height,frameIndex,scale,scale9?scale9.join("|"):""].join(",");
        if(!cachedImageData[tag]) {
            var imageData = new ImageData(src,x,y,width,height,frameIndex,scale,scale9);
            
            cachedImageData[tag] = imageData;            
            var shortTag = [shorty(src),x,y,width,height,frameIndex,scale,scale9?scale9.join("|"):""].join(",");
            cachedImageData[shortTag] = imageData;
            var tallTag = [biggy(src),x,y,width,height,frameIndex,scale,scale9?scale9.join("|"):""].join(",");
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
                        return {x:x*CHUNKSIZES,y:y*CHUNKSIZES,texture:i};
                    }
                }
            }
        }
        return null;
    }
    
    function canFit(texture,xpos,ypos,chunkCols,chunkRows) {
        for(var y=0;y<chunkRows;y++) {
            for(var x=0;x<chunkCols;x++) {
                if(chunks[texture][ypos+y][xpos+x]) {
                    return false;
                }
            }
        }
        return true;
    }
    
    function fillSlot(texture,xpos,ypos,chunkCols,chunkRows, imgData) {
        for(var y=0;y<chunkRows;y++) {
            for(var x=0;x<chunkCols;x++) {
                chunks[texture][ypos+y][xpos+x] = imgData;
            }
        }
    }
    
    function placeImageData(self, img, src, x, y, width, height, frameIndex, scale, scale9) {
        var slot = findSlot(width*scale,height*scale,self);
        if (!slot) {
            core.handleError("No slot available to fit image "+(width*scale)+"x"+(height*scale));
            return;
        }
        self.data.texture = slot.texture;
        self.data.cut = [
            slot.x / SPRITE_SHEET_SIZE,
            1 - (slot.y + height*scale) / SPRITE_SHEET_SIZE,
            width*scale / SPRITE_SHEET_SIZE,
            height*scale / SPRITE_SHEET_SIZE,
        ];
        self.canvasData.canvas = canvases[slot.texture];
        self.canvasData.cut = [
            slot.x,
            slot.y,
            width*scale,
            height*scale,
        ];
        if(scale9) {
            var scale9x1 = (scale9[0]*scale - x) / (width*scale),
                scale9y1 = (scale9[1]*scale - y) / (height*scale),
                scale9x2 = (scale9[0]*scale+scale9[2]*scale) / (width*scale),
                scale9y2 = (scale9[1]*scale+scale9[3]*scale) / (height*scale);
                
            self.canvasData.scale9margin = {
                left: scale9x1,
                right: 1-scale9x2,
                top: scale9y1,
                bottom: 1-scale9y2,
            };
        }
        
        function finishingTouch() {
            var tags = src.split("|");
            if(tags.length>1) {
                var imgData = ctx[self.data.texture].getImageData(slot.x,slot.y,width*scale, height*scale);
                for(var i=1; i<tags.length;i++) {
                    var tag = tags[i];
                    var fun = core.getPixelProcessor(tag);
                    var color = [0,0,0,0];
                    for(var i=0; i<imgData.data.length; i+= 4) {
                        color[0] = imgData.data[i];
                        color[1] = imgData.data[i+1];
                        color[2] = imgData.data[i+2];
                        color[3] = imgData.data[i+3];
                        fun(color, 
                            i/4 % width,
                            Math.floor(i/4 / width)
                        );
                        imgData.data[i]   = color[0];
                        imgData.data[i+1] = color[1];
                        imgData.data[i+2] = color[2];
                        imgData.data[i+3] = color[3];
                    }
                }
                ctx[self.data.texture].putImageData(imgData,slot.x,slot.y);
            }
            getTexture(self.data.texture).needsUpdate = true;
            self.data.ready = true;
        }
                
        function copyToSpritesheet() {
            ctx[self.data.texture].clearRect(slot.x, slot.y, width*scale, height*scale);
            if(img.putOnCanvas) {
                img.putOnCanvas(
                    ctx[self.data.texture], 
                    x, y, width, height, 
                    slot.x, slot.y, width*scale, height*scale, 
                    frameIndex,
                    finishingTouch);
            } else {
                ctx[self.data.texture].drawImage(img, x, y, width, height, slot.x, slot.y, width*scale, height*scale);
                finishingTouch();
            }
        }
        
        if(!isImageLoaded(img, frameIndex)) {
            if(img.multiFrame) {
                img.addFrameReadyCallback(frameIndex,copyToSpritesheet);
            } else {
                img.addEventListener("load",copyToSpritesheet);
            }
        } else {
            copyToSpritesheet();
        }
    }
    
    function ImageData(src, x, y, width, height, frameIndex, scale, scale9) {
        var self = this;
        var img = getImage(src);
        self.data = {
            cut: [0,0,0,0],
            texture: 0,
        };
        self.canvasData = {
            cut: [0,0,0,0],
            canvas: null,
        };
        
        if((width||img.naturalWidth) && (height||img.naturalHeight)) {
            placeImageData(self, img, src, x, y, width || img.naturalWidth, height || img.naturalHeight, frameIndex, scale, scale9);
        } else if(img.multiFrame) {
            img.addEventListener("sizeLoaded",
                function() {
                    placeImageData(self, img, src, x, y, width || img.naturalWidth, height || img.naturalHeight, frameIndex, scale, scale9);
                }
            );
        } else {
            img.addEventListener("load",
                function() {
                    placeImageData(self, img, src, x, y, width || img.naturalWidth, height || img.naturalHeight, frameIndex, scale, scale9);
                }
            );
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
            img = createImage(src);
            cachedImage[src] = img;
            cachedImage[shorty(src)] = img;
        }
        return img;
    }
    
    function createImage(src) {
        var imageSrc = biggy(src).split("|")[0];
        if(src.split(".").pop().toLowerCase() == "gif") {
            return core.createGif(imageSrc);
        }
        var img = new Image();
        img.crossOrigin = '';
        img.src = imageSrc;
        return img;
    }
    
    function isImageLoaded(img, frameIndex) {
        if(img.multiFrame) {
            return img.isFrameLoaded(frameIndex);
        }
    
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
        ctx[i].webkitImageSmoothingEnabled = false;
        ctx[i].mozImageSmoothingEnabled = false;
        ctx[i].imageSmoothingEnabled = false;
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
    
    function removeSpriteSheet(i) {
        delete chunks[i];
        delete canvases[i];
        delete ctx[i];
        coreTextures[i].dispose();
        delete coreTextures[i];
    }
    
    function destroyEverything() {
        for(var i=0;i<coreTextures.length;i++) {
            removeSpriteSheet(i);
        }
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
    core.requireScripts(['setup.js','md5','utils.js','gifhandler.js','jsgif']);
    core.logScript();

 })));