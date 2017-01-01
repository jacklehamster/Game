(function (global, factory) {
 	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
 	typeof define === 'function' && define.amd ? define(['exports'], factory) :
 	(factory((global.DOBUKI = global.DOBUKI || {})));
 }(this, (function (core) { 'use strict';
 
    var currentScript = core.getCurrentScript();

    var MAX_TEXTURES = 16;
    var SPRITE_SHEET_SIZE = 2048;
    var CHUNKSIZES = 32;
 
    var canvases = [];
    var ctx = [], coreTextures = [];
    var chunks = [];
    var cachedImage = {};
    var cachedImageData = {};
    var shortName = {}, tallName = {};
    
    var gifWorker;
    var gifWorkerCallbacks = {};
    
    
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
        if(!cut) {
            cut = [0,0,0,0];
        }
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
     
    function getImageData(src, x, y, width, height) {
        core.expectParams(arguments, "string","number","number","number","number");

        var img = getImage(src);
        var frameIndex = img.multiFrame ? img.getFrame() : 0;

        var tag = [src,x,y,width,height,frameIndex].join(",");
        if(!cachedImageData[tag]) {
            var imageData = new ImageData(src,x,y,width,height,frameIndex);
            
            cachedImageData[tag] = imageData;            
            var shortTag = [shorty(src),x,y,width,height,frameIndex].join(",");
            cachedImageData[shortTag] = imageData;
            var tallTag = [biggy(src),x,y,width,height,frameIndex].join(",");
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
    
    function placeImageData(self, img, src, x, y, width, height, frameIndex) {
        var slot = findSlot(width,height,self);
        if (!slot) {
            core.handleError("Not slot available to fit image "+width+"x"+height);
            return;
        }
        self.data.texture = slot.texture;
        self.data.cut = [
            slot.x / SPRITE_SHEET_SIZE,
            1 - (slot.y + height) / SPRITE_SHEET_SIZE,
            width / SPRITE_SHEET_SIZE,
            height / SPRITE_SHEET_SIZE,
        ];
        
        function finishingTouch() {
            var tags = src.split("|");
            if(tags.length>1) {
                var imgData = ctx[self.data.texture].getImageData(slot.x,slot.y,width, height);
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
            ctx[self.data.texture].clearRect(slot.x, slot.y, width, height);
            if(img.putOnCanvas) {
                img.putOnCanvas(
                    ctx[self.data.texture], 
                    x, y, width, height, 
                    slot.x, slot.y, width, height, 
                    frameIndex,
                    finishingTouch);
            } else {
                ctx[self.data.texture].drawImage(img, x, y, width, height, slot.x, slot.y, width, height);
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
    
    function ImageData(src, x, y, width, height, frameIndex) {
        var self = this;
        var img = getImage(src);
        self.data = {
            cut: [0,0,0,0],
            texture: 0,
        };
        
        if((width||img.naturalWidth) && (height||img.naturalHeight)) {
            placeImageData(self, img, src, x, y, width || img.naturalWidth, height || img.naturalHeight, frameIndex);
        } else if(img.multiFrame) {
            img.addEventListener("sizeLoaded",
                function() {
                    placeImageData(self, img, src, x, y, width || img.naturalWidth, height || img.naturalHeight, frameIndex);
                }
            );
        } else {
            img.addEventListener("load",
                function() {
                    placeImageData(self, img, src, x, y, width || img.naturalWidth, height || img.naturalHeight, frameIndex);
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
            img = src.split(".").pop() == "gif" ? createGif(src) : createImage(src);
            cachedImage[src] = img;
            cachedImage[shorty(src)] = img;
        }
        return img;
    }
    
    function createGif(src) {
        var completeCallbacks = [];
        var sizeLoadedCallbacks = [];
        var frameReadyCallbacks = [];
        var header;
        var frameInfos = [];
        var totalDuration = 0;
        
        var gifImage = {
            complete:false, 
            addFrameReadyCallback: function(frameIndex, callback) {
                if(!frameReadyCallbacks[frameIndex]) {
                    frameReadyCallbacks[frameIndex] = [];
                }
                frameReadyCallbacks[frameIndex].push(callback);
            },
            addEventListener:function(type, callback) {
                if(type=="load") {
                    completeCallbacks.push(callback);
                } else if(type=="sizeLoaded") {
                    sizeLoadedCallbacks.push(callback);
                }
            },
            removeEventListener:function(type, callback) {
                var array = type=="load" ? completeCallbacks : type=="sizeLoaded" ? sizeLoadedCallbacks : null;
                if(array) {
                    var index = array.indexOf(callback);
                    array.splice(index,1);
                }
            },
            naturalWidth: 0,
            naturalHeight: 0,
            multiFrame: true,
            getFrame: function() {
                if(!gifImage.complete) return 0;
                var time = core.time % totalDuration;
                for(var i=0; i<frameInfos.length; i++) {
                    if(time > frameInfos[i].gce.delayTime*10) {
                        time -= frameInfos[i].gce.delayTime*10;
                    } else {
                        return i;
                    }
                }
                return 0;
            },
            putOnCanvas: function(
                    ctx, 
                    srcX, srcY, srcWidth, srcHeight, 
                    destX, destY, destWidth, destHeight,
                    frameIndex,
                    completedCallback
                    ) {
                core.assert(srcWidth==destWidth && srcHeight==destHeight, "source and dest must match dimensions");
                
                function plasterPixels(
                        srcX, srcY, srcWidth, srcHeight,
                        destX, destY, destWidth, destHeight,
                        frameIndex,
                        maxFrameIndex) {
                     var frameInfo = frameInfos[frameIndex];
                     var img = frameInfos[frameIndex%frameInfos.length].img;
                     var cData = ctx.getImageData(destX + img.leftPos, destY + img.topPos, img.width, img.height);
                     
                     sendToGifWorker(
                         frameInfo, 
                         cData,
                         header,
                         function(cData) {
                             ctx.putImageData(cData, destX + img.leftPos, destY + img.topPos);            
                             if(frameIndex<maxFrameIndex) {
                                plasterPixels(
                                    srcX,srcY,srcWidth,srcHeight,
                                    destX,destY,destWidth,destHeight,
                                    frameIndex+1,
                                    maxFrameIndex
                                );
                             } else {
                                completedCallback();
                             }
                         }
                     );
                }
               
                plasterPixels(
                    srcX,srcY,srcWidth,srcHeight,
                    destX,destY,destWidth,destHeight,
                    0,
                    frameIndex
                );
            },
            isFrameLoaded: function(frameIndex) {
                return frameInfos[frameIndex] && frameInfos[frameIndex].img && frameInfos[frameIndex].gce;
            }
        };
        
        function checkComplete(frameIndex) {
            if(gifImage.isFrameLoaded(frameIndex) && frameReadyCallbacks[frameIndex]) {
                frameReadyCallbacks[frameIndex].forEach(
                   function(callback) { callback.call(); }
                );
            }
        }
        
        var handler = {
          hdr: function (hdr) {
            header = hdr;
            gifImage.naturalWidth = header.width;
            gifImage.naturalHeight = header.height;
            sizeLoadedCallbacks.forEach(
                function(callback) { callback.call(); }
            );
          },
          gce: function (gce) {
            totalDuration += gce.delayTime*10;
            if(frameInfos.length==0 || frameInfos[frameInfos.length-1].gce) {
                frameInfos.push({});            
            }
            frameInfos[frameInfos.length-1].gce = gce;
            if(!gce.delayTime) {
                gce.delayTime = 1;
            }
            checkComplete(frameInfos.length-1);
          },
          img: function(img) {
            if(frameInfos.length==0 || frameInfos[frameInfos.length-1].img) {
                frameInfos.push({});            
            }
            frameInfos[frameInfos.length-1].img = img;
            checkComplete(frameInfos.length-1);
          },
          eof: function(block) {
            gifImage.complete = true;
            completeCallbacks.forEach(
                function(callback) { callback.call(); }
            );
          }
        };
        
        core.loadAsync(src, 
            function(content) {
                var stream = new Stream(content);
                parseGIF(stream, handler);
            },
            true
        );
        return gifImage;
    }
    
    function createImage(src) {
        var img = new Image();
        img.crossOrigin = '';
        img.src = biggy(src).split("|")[0];
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
        gifWorker = null;
    }
    
    function initializeGifWorker() {
        gifWorker = new Worker(currentScript.path + "workers/gifworker.js");
        gifWorker.onmessage = function(e) {
           gifWorkerCallbacks[e.data.id] (e.data.response);
           delete gifWorkerCallbacks[e.data.id];
        }
    }
    
    function sendToGifWorker(frameInfo, cData, header, callback) {
        if(!gifWorker) {
            initializeGifWorker();
        }
        var id = md5(Math.random()+""+core.time);
        gifWorkerCallbacks[id] = callback;
        gifWorker.postMessage({
            frameInfo: frameInfo,
            cData: cData,
            header: header,
            id: id
        });
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
    core.requireScripts(['setup.js','md5','utils.js','jsgif']);
    core.logScript();

 })));