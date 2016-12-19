(function (global, factory) {
 	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
 	typeof define === 'function' && define.amd ? define(['exports'], factory) :
 	(factory((global.DOBUKI = global.DOBUKI || {})));
 }(this, (function (core) { 'use strict';

   console.log("setup.js");
   var coreLoops = [];


   if(location.pathname.charAt(location.pathname.length-1)!="/") {
        location.replace(location.pathname+"/"+location.search+location.hash);
   }

   document.addEventListener("DOMContentLoaded", initialize);
   function initialize() {
        var scene = new THREE.Scene();
        var camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
        var renderer = new THREE.WebGLRenderer();
        renderer.setSize( window.innerWidth, window.innerHeight );
        document.body.appendChild( renderer.domElement );

        function loop(time) {
            for(var i=0; i<coreLoops.length; i++) {
                var process = coreLoops[i];
                if(process.time < time) {
                    process.time = Math.ceil(time/process.period) * process.period;
                    process.callback.apply(time);
                }
            }

            requestAnimationFrame( loop );
        }
        loop();

        window.addEventListener("resize", function() {
          renderer.setSize( window.innerWidth, window.innerHeight );
          camera.aspect = window.innerWidth / window.innerHeight;
          camera.updateProjectionMatrix();
        });

        function checkDevicePixelRatio(time) {
            if(window.devicePixelRatio == checkDevicePixelRatio.currentDevicePixelRatio) {
                return;
            }
            checkDevicePixelRatio.currentDevicePixelRatio = window.devicePixelRatio;
            renderer.setPixelRatio(checkDevicePixelRatio.currentDevicePixelRatio);
        }


        AddLoop(1000, checkDevicePixelRatio);
        AddLoop(null, function() {
            renderer.render(scene, camera);
        });


            var texture = new THREE.ImageUtils.loadTexture( "squid.png" );
            texture.wrapS = THREE.RepeatWrapping;
            texture.wrapT = THREE.RepeatWrapping;
            texture.repeat.set(.5,.5);// 4, 4 );

texture.magFilter = THREE.NearestFilter;
texture.minFilter = THREE.LinearMipMapLinearFilter;

//               texture.offset.x = 10;
//               texture.offset.y = 10;
window.texture = texture;

            var material = new THREE.MeshBasicMaterial({map: texture, transparent:true});

            var geometry = new THREE.BoxGeometry( 1, 1, 1 );
//            var material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
            var cube = new THREE.Mesh( geometry, material );
            cube.position.z = -3;
            scene.add( cube );

   }

   function AddLoop(period, callback) {
        period = !period || period<0 ? 1 : period;
        RemoveLoop(callback);
        coreLoops.push(
            {
                time: 0,
                period: period,
                callback: callback,
            }
        );
   }

   function RemoveLoop(callback) {
        for(var i=0; i<coreLoops.length; i++) {
            if(callback == coreLoops[i].callback) {
                coreLoops.splice(i, 1);
                break;
            }
        }
   }
   window.loops = coreLoops;

   core.AddLoop = AddLoop;
   core.RemoveLoop = RemoveLoop;

 })));
