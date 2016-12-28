(function (global, factory) {
 	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
 	typeof define === 'function' && define.amd ? define(['exports'], factory) :
 	(factory((global.DOBUKI = global.DOBUKI || {})));
 }(this, (function (core) { 'use strict';
 
    var audios = {};
 
    /**
     *  FUNCTION DEFINITIONS
     */
     function playMusic(mp3, count) {
        var audio = new Audio(mp3);
        audio.play();
        audio.addEventListener('ended', function() {
            if(count>0) {
                count--;
                if(!count) {
                    stopMusic(mp3);
                    return;
                }
            }
            this.currentTime = 0;
            this.play();
        }, false);
        audios[mp3] = audio;
     }
     
     function isPlaying(mp3) {
        return audios[mp3];
     }
     
     function stopMusic(mp3) {
        audios[mp3].pause();
        delete audios[mp3];
     }
     
     function setVolume(mp3,value) {
        if(audios[mp3]) {
            audios[mp3].volume = value;
        }
     }
      
    /**
     *  PUBLIC DECLARATIONS
     */
     core.playMusic = playMusic;
     core.stopMusic = stopMusic;
     core.isPlaying = isPlaying;
     core.setVolume = setVolume;
   
   /**
    *   PROCESSES
    */
    core.requireScripts(['setup.js']);
    core.logScript();

 })));
