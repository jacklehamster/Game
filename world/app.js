requirejs.config({
    // enforceDefine: true,
    baseUrl: 'dist/lib',
    paths: {
        threejs: 'https://cdnjs.cloudflare.com/ajax/libs/three.js/85/three.min',
        jsgif: 'jsgif/gif',
//        dobuki: 'https://jacklehamster.github.io/dok/out/dok.min',
        dobuki: 'dok/dobuki',
    },
    urlArgs: (location.search.match(/\bdebug\b/g)) ? "bust=" + Date.now() : '',
    catchError:false,
});

define(function() {
    requirejs(['dist/main.js']);
});