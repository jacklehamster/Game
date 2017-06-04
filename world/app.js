requirejs.config({
    // enforceDefine: true,
    baseUrl: 'dist/lib',
    paths: {
        threejs: 'https://cdnjs.cloudflare.com/ajax/libs/three.js/85/three.min',
        jsgif: 'jsgif/gif',
//        dobuki: 'https://jacklehamster.github.io/dok/out/dok.min',
        dobuki: 'http://localhost/~vincent/dok/out/dok.min',
    },
    urlArgs: (location.search.match(/\bdebug\b|\bdisable_cache\b/g)) ? "time=" + Date.now() : '',
    catchError:false,
});

define(function() {
    requirejs(['dist/main.js']);
});