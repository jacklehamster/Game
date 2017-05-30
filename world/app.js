requirejs.config({
    // enforceDefine: true,
    baseUrl: 'dist/lib',
    paths: {
        threejs: 'https://cdnjs.cloudflare.com/ajax/libs/three.js/85/three.min',
        jsgif: 'jsgif/gif',
        dobuki: 'dok/dobuki',
    },
    urlArgs: "bust=" + Date.now(),
    catchError:false,
});

define(function() {
    requirejs(['dist/main.js']);
});