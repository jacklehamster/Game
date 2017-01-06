(function (global, factory) {
 	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
 	typeof define === 'function' && define.amd ? define(['exports'], factory) :
 	(factory((global.DOBUKI = global.DOBUKI || {})));
 }(this, (function (core) { 'use strict';
    
    /**
     *  HEADER
     */   
    core.requireScripts([
        'threejs', 
        'setup.js', 
        'utils.js',
    ]);
    core.logScript();

    var renderer = null, currentDevicePixelRatio = null;
    var renderComponents = [];
    var renderCount = 0;
    var frameTime = Math.floor(1000/60);

    /**
     *  FUNCTION DEFINITIONS
     */   
    function getRenderer() {
        if(!renderer) {
            renderer = new THREE.WebGLRenderer();
            renderer.setSize( innerWidth, innerHeight );
            renderer.autoClear = false;
            checkDevicePixelRatio.currentDevicePixelRatio = null;
            checkDevicePixelRatio();
            core.addLoop(1000, checkDevicePixelRatio);
        }
        return renderer;
    }
    
    function checkDevicePixelRatio() {
        if(window.devicePixelRatio === currentDevicePixelRatio) {
            return;
        }
        currentDevicePixelRatio = window.devicePixelRatio;
        getRenderer().setPixelRatio(currentDevicePixelRatio);
    }
    
    function initialize() {
        document.body.appendChild( getRenderer().domElement );
        onResizeWindow();
        core.watchModel("window.width|window.height", onResizeWindow);
        
        core.addLoop(frameTime, [calculateFPS, renderScene, updateFromModel]);
        addFPSCounter();
    }
    
    function renderScene() {
        var renderer = core.getRenderer();
        renderComponents.forEach(
            component => renderer.render(component.scene, component.camera)
        );
    }
    
    function updateFromModel() {
        renderComponents.forEach(
            component => component.preRenderCallback.call()
        );
    }
    
    function onResizeWindow() {
        if(core.model.window) {
            getRenderer().setSize( core.model.window.width, core.model.window.height );
        }
    }
    
    function addRenderComponent(order, scene, camera, preRenderCallback) {
        renderComponents.push({
            scene: scene,
            camera: camera,
            preRenderCallback: preRenderCallback,
            order: order,
        });
        renderComponents.sort((componentA, componentB) => componentA.order - componentB.order);
    }
         
    function calculateFPS() {
        renderCount++;
    }
    
    function setFPS(fps) {
        var div = document.getElementById('fps');
        if(!div) {
            div = document.createElement('div');
            div.id = 'fps';
            div.style.position = "absolute";
            div.style.left = '5px';
            div.style.top = '5px';
            document.body.appendChild(div);
        }
        div.style.color = fps > 55 ? '#009944' : fps > 30 ? '#CCAA00' : '#DD0000';
        div.textContent = fps;
        return div;
    }
    
    function addFPSCounter() {
        if (location.search.indexOf('fps=1')>=0) {
            core.makeProcess("start-fps-counter", 
                function() {
                    core.addLoop(1000, function() {
                        setFPS(renderCount);
                        renderCount = 0;
                    });
                }
            ).start();
        }
    }
    
    function checkOnTime() {
        return core.loopTime()<frameTime;
    }
                 
    function destroyEverything() {
        core.stopWatch("window.width|window.height");
        if(renderer) {
            renderer.dispose();
            renderer = null;
        }
        renderComponents = null;
    }
    
    function renderImmediately() {
        core.rush(renderScene);
    }
   
    /**
     *  PUBLIC DECLARATIONS
     */
    core.getRenderer = getRenderer;
    core.addRenderComponent = addRenderComponent;
    core.checkOnTime = checkOnTime;
    core.renderImmediately = renderImmediately;
    core.destroyEverything = core.combineMethods(destroyEverything, core.destroyEverything);

    /**
     *   PROCESSES
     */
    core.makeProcess("initialize-renderer", initialize).waitFor("waitPageLoaded").ignoreParameters(true);
    
 })));