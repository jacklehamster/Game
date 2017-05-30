'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

(function (global, factory) {
    (typeof exports === 'undefined' ? 'undefined' : _typeof(exports)) === 'object' && typeof module !== 'undefined' ? factory(exports) : typeof define === 'function' && define.amd ? define(['exports'], factory) : factory(global.DOK = global.DOK || {});
})(undefined, function (core) {
    'use strict';

    var audios = {};

    /**
     *  HEADER
     */
    core.requireScripts(['setup.js']);
    core.logScript();

    /**
     *  FUNCTION DEFINITIONS
     */
    function stopAllMusic() {
        for (var i in audios) {
            if (audios.hasOwnProperty(i) && isPlaying(i)) {
                stopMusic(i);
            }
        }
    }

    function playMusic(mp3, count) {
        var audio = new Audio(mp3);
        audio.volume = 1;
        audio.play();

        audio.addEventListener('ended', function () {
            if (count) {
                count--;
                if (!count) {
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
        if (isPlaying(mp3)) {
            audios[mp3].pause();
            delete audios[mp3];
        }
    }

    function destroyEverything() {
        stopAllMusic();
    }

    /**
     *  PUBLIC DECLARATIONS
     */
    core.playMusic = playMusic;
    core.stopAllMusic = stopAllMusic;
    core.destroyEverything = core.combineMethods(destroyEverything, core.destroyEverything);

    /**
     *   PROCESSES
     */
});
//# sourceMappingURL=audio.js.map