(function (global, factory) {
 	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
 	typeof define === 'function' && define.amd ? define(['exports'], factory) :
 	(factory((global.DOBUKI = global.DOBUKI || {})));
 }(this, (function (core) { 'use strict';

    core.requireScripts(['setup.js', 'coremodel.js']);
    core.logScript();

    var audios = {};
 
    /**
     *  FUNCTION DEFINITIONS
     */
     function playMusic(mp3, count) {
        if(!isPlaying(mp3)) {
            stopMusic(mp3);
        }
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
        if(isPlaying(mp3)) {
            audios[mp3].pause();
            delete audios[mp3];
        }
     }
     
     function setVolume(mp3,value) {
        if(audios[mp3]) {
            audios[mp3].volume = value;
        }
     }
     
     function destroyEverything() {
        for(var mp3 in audios) {
            stopMusic(mp3);
        }
        audios = null;
     }
      
    /**
     *  PUBLIC DECLARATIONS
     */
    core.playMusic = playMusic;
    core.stopMusic = stopMusic;
    core.isPlaying = isPlaying;
    core.setVolume = setVolume;
    core.destroyEverything = core.combineMethods(destroyEverything, core.destroyEverything);
   
    /**
     *   PROCESSES
     */
     
    core.watchModel("music.path", 
        function(newMusic, oldMusic) {
            if(oldMusic) {
                stopMusic(oldMusic);
            }
            if(newMusic && !isPlaying(newMusic)) {
                playMusic(newMusic);
                var model = core.getModel();
                if(model.music.volume) {
                    setVolume(newMusic, model.music.volume);
                }
            }
        }
    );

    core.watchModel("music.volume", 
        function(newVolume) {
            if(typeof(newVolume) !== 'undefined') {
                var model = core.getModel();
                if(model.music && isPlaying(model.music.path)) {
                    setVolume(model.music.path, newVolume);
                }
            }
        }
    );
 })));
