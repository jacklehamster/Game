#!/usr/bin/env node
'use strict';

var util = require('util');
var Stream = require('./gif').Stream;
var parseGIF = require('./gif').parseGIF;

var log = console.log;

var showBool = function showBool(b) {
  return b ? 'yes' : 'no';
};

var showColor = function showColor(rgb) {
  // FIXME When I have an Internet connection.
  var showHex = function showHex(n) {
    // Two-digit code.
    var hexChars = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'A', 'B', 'C', 'D', 'E', 'F'];
    return hexChars[n >>> 4 & 0xF] + hexChars[n & 0xF];
  };
  return '#' + showHex(rgb[0]) + showHex(rgb[1]) + showHex(rgb[2]);
};

var showDisposalMethod = function showDisposalMethod(dm) {
  var map = {
    0: 'None',
    1: 'Do not dispose',
    2: 'Restore to background',
    3: 'Restore to previous'
  };
  return map[dm] || 'Unknown';
};

var doHdr = function doHdr(hdr) {
  log('Header:');
  log('  Version: %s', hdr.ver);
  log('  Size: %dx%d', hdr.width, hdr.height);
  log('  GCT? %s%s', showBool(hdr.gctFlag), hdr.gctFlag ? ' (' + hdr.gct.length + ' entries)' : '');
  log('  Color resolution: %d', hdr.colorRes);
  log('  Sorted? %s', showBool(hdr.sorted));
  log('  Background color: %s (%d)', hdr.gctFlag ? showColor(hdr.bgColor) : 'no GCT', hdr.bgColor);
  log('  Pixel aspect ratio: %d FIXME', hdr.pixelAspectRatio);
};

var doGCE = function doGCE(gce) {
  log('GCE:');
  log('  Disposal method: %d (%s)', gce.disposalMethod, showDisposalMethod(gce.disposalMethod));
  log('  User input expected? %s', showBool(gce.userInput));
  log('  Transparency given? %s%s', showBool(gce.transparencyGiven), gce.transparencyGiven ? ' (index: ' + gce.transparencyIndex + ')' : '');
  log('  Delay time: %d', gce.delayTime);
};

var doImg = function doImg(img) {
  log('Image descriptor:');
  log('  Geometry: %dx%d+%d+%d', img.width, img.height, img.leftPos, img.topPos);
  log('  LCT? %s%s', showBool(img.lctFlag), img.lctFlag ? ' (' + img.lct.length + ' entries)' : '');
  log('  Interlaced? %s', showBool(img.interlaced));
  log('  %d pixels', img.pixels.length);
};

var doNetscape = function doNetscape(block) {
  log('Netscape application extension:');
  log('  Iterations: %d%s', block.iterations, block.iterations === 0 ? ' (infinite)' : '');
};

var doCom = function doCom(com) {
  log('Comment extension:');
  log('  Comment: [31m%s[0m', com.comment);
};

var doEOF = function doEOF(eof) {
  log('EOF');
};

var doUnknownApp = function doUnknownApp(block) {};

var doUnknownExt = function doUnknownExt(block) {};

var handler = {
  hdr: doHdr,
  img: doImg,
  gce: doGCE,
  com: doCom,
  app: {
    NETSCAPE: doNetscape,
    unknown: doUnknownApp
  },
  eof: doEOF
};

process.argv.forEach(function (arg, i) {
  // Not an array?!
  if (i > 1) {
    util.puts(arg);
    util.puts(function (n) {
      var s = '';for (var i = 0; i < n; i++) {
        s += '-';
      };return s;
    }(arg.length)); // XXX
    var data = require('fs').readFileSync(arg).toString('binary');
    var stream = new Stream(data);
    parseGIF(stream, handler);
  }
});
//# sourceMappingURL=h.js.map