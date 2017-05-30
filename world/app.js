requirejs.config({
    // enforceDefine: true,
    baseUrl: 'dist/lib/dok',
    paths: {
        threejs: 'https://cdnjs.cloudflare.com/ajax/libs/three.js/85/three.min',
        jsgif: 'https://jacklehamster.github.io/jsgif/gif',
        dobuki: 'dobuki',
    },
    urlArgs: "bust=" + Date.now(),
    catchError:false,
});

define(function() {
    requirejs(['dist/main.js']);
});