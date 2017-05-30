#!/usr/bin/env node
'use strict';

var assert = require('assert');

// Generic functions
function sum(a) {
  a.reduce(function (x, y) {
    return x + y;
  }, 0);
}

function bitsToNum(ba) {
  return ba.reduce(function (s, n) {
    return s * 2 + n;
  }, 0);
}

Array.prototype.shiftN = function (n) {
  if (n == undefined) {
    return this.shift(); // Will return the element, not a singleton array.
  } else {
    return this.splice(0, n);
  }
};

function byteToBitArr(byte) {
  var a = [];
  for (var i = 7; i >= 0; i--) {
    a.push(!!(byte & 1 << i));
  }
  return a;
}

// Stream
var Stream = function Stream(data) {
  this.data = data;
  this.len = this.data.length;
  this.pos = 0;

  this.read = function (n) {
    if (this.pos + n > this.data.length) throw new Error("Attempted to read past end of stream.");
    return this.data.substring(this.pos, this.pos += n);
  };

  this.readToEnd = function () {
    return this.read(this.data.length - this.pos);
  };

  this.readToNull = function () {
    // Can also use indexOf('\0')
    var a = [];
    var byte;
    while (val = this.readByte()) {
      a.push(byte);
    }
    a.push(byte); // Sigh...
    return a;
  }; // Shouldn't use this anyway. Data sub-blocks often have \0s.

  this.readBytes = function (n) {
    var s = this.read(n);
    var a = [];
    for (var i = 0; i < s.length; i++) {
      a.push(s.charCodeAt(i));
    }
    return a;
  };

  this.readByte = function () {
    return this.readBytes(1)[0];
  };

  this.readUnsigned = function () {
    // Little-endian.
    var a = this.readBytes(2);
    return (a[1] << 8) + a[0];
  };
};

var parseGIF = function parseGIF(data) {
  var gif = {};

  var log = function log() {
    //var args = Array.prototype.slice.call(arguments);
    //var str = args.shift();
    console.log.apply(this, arguments);
  };

  function logWithPrefix(prefix) {
    return function () {
      var args = Array.prototype.slice.call(arguments);
      var str = args.shift();
      console.log.apply(this, [prefix + str].concat(args));
    };
  }

  var st = new Stream(data);
  gif.blocks = [];

  function parseCT(entries) {
    // Each entry is 3 bytes, for RGB.
    var ct = [];
    for (var i = 0; i < entries; i++) {
      ct.push(st.readBytes(3));
    }
    return ct;
  }

  function parseHeader() {
    gif.sig = st.read(3);
    gif.ver = st.read(3);
    assert.equal(gif.sig, 'GIF');
    log('sig: %s, ver: %s', gif.sig, gif.ver);

    gif.width = st.readUnsigned();
    gif.height = st.readUnsigned();
    log("w×h: %d×%d", gif.width, gif.height);

    var bits = byteToBitArr(st.readByte());
    gif.gctFlag = bits.shift();
    gif.colorRes = bitsToNum(bits.shiftN(3));
    gif.sorted = bits.shift();
    gif.gctSize = bitsToNum(bits.shiftN(3));
    log("gct? %d, colorRes: %d, sorted? %d, gctSize: %d", gif.gctFlag, gif.colorRes, gif.sorted, gif.gctSize);

    gif.bgColor = st.readByte();
    gif.pixelAspectRatio = st.readByte(); // if not 0, aspectRatio = (pixelAspectRatio + 15) / 64
    log('bgColor: %d, pixelAspectRatio: %d', gif.bgColor, gif.pixelAspectRatio);

    if (gif.gctFlag) {
      gif.gct = parseCT(1 << gif.gctSize + 1);
      log('gct read; %d entries', gif.gct.length);
    }
  }

  function parseExt(block) {
    var log = logWithPrefix('  ');

    function parseGCExt(block) {
      var blockSize = st.readByte();
      log('blockSize: %d', blockSize);

      var bits = byteToBitArr(st.readByte());
      block.reserved = bits.shiftN(3); // Reserved; should be 000.
      block.disposalMethod = bitsToNum(bits.shiftN(3));
      block.userInput = bits.shift();
      block.transparencyGiven = bits.shift();
      log('reserved: %d, disposalMethod: %d, userInput: %d, transparencyGiven: %d', block.reserved, block.disposalMethod, block.userInput, block.transparencyGiven);

      block.delayTime = st.readUnsigned();
      log('delayTime: %d', block.delayTime);

      //if (block.transparencyGiven) { // TODO verify this needs to be an if
      var transparencyIndex = st.readByte();
      log('transparencyIndex: %d', transparencyIndex);
      //}
      block.terminator = st.readByte();
      log('terminator: %d', block.terminator);
    }

    function parseCommExt(block) {
      block.comBlocks = [];
      while (true) {
        var comBlock = {};
        comBlock.size = st.readByte();
        lzwBlock.data = st.read(comBlock.size);
        block.lzwBlocks.push(comBLock);
        if (comBlock.size == 0) return;
      }
    }

    function parseAppExt(block) {
      function parseNetscapeExt(block) {
        var blockSize = st.readByte(); // Always 3
        block.unknown = st.readByte(); // ??? Always 1? What is this?
        block.iterations = st.readUnsigned();
        block.terminator = st.readByte();
        log('iterations: %d, terminator: %d', block.iterations, block.terminator);
      }
      var blockSize = st.readByte(); // Always 11
      block.identifier = st.read(8);
      block.authCode = st.read(3);
      log('identifier: %s, authCode: %s', block.identifier, block.authCode);
      switch (block.identifier + block.authCode) {
        case 'NETSCAPE2.0':
          log('NETSCAPE');
          parseNetscapeExt(block);
          break;
        default:
          throw new Error("Unknown Application Extension: " + block.identifier);
          break;
      }
    }

    block.label = st.readByte();
    switch (block.label) {
      case 0xF9:
        block.extType = 'gce';
        log('Graphics Control Extension');
        parseGCExt(block);
        break;
      case 0xFE:
        block.extType = 'com';
        log('Comment Extension');
        parseCommExt(block);
        break;
      case 0xFF:
        block.extType = 'app';
        log('Application Extension');
        parseAppExt(block);
        break;
      case 0x01:
        throw new Error("Plain Text extension (0x01) unsupported");
        break;
      default:
        throw new Error("Unknown extension: 0x" + label.toString(16));
        break;
    }
  }

  function parseImg(block) {
    var log = logWithPrefix('  ');

    block.leftPos = st.readUnsigned();
    block.topPos = st.readUnsigned();
    block.width = st.readUnsigned();
    block.height = st.readUnsigned();
    log('left: %d, top: %d, width: %d, height: %d', block.leftPos, block.topPos, block.width, block.height);

    var bits = byteToBitArr(st.readByte());
    block.lctFlag = bits.shift();
    block.interlace = bits.shift();
    block.sorted = bits.shift();
    block.reserved = bits.shiftN(2);
    block.lctSize = bits.shiftN(3);
    log('lct? %d, interlace? %d, sorted? %d, reserved: %d, lctSize: %d', block.lctFlag, block.interlace, block.sorted, block.reserved, block.lctSize);

    if (block.lctFlag) {
      block.lct = parseCT(1 << block.lctSize + 1);
      log('lct read; %d entries', block.lct.length);
    }

    block.data = st.readToNull();
    c(block.data);
    return;
    block.lzwMinCodeSize = st.readByte();
    block.lzwBlocks = [];
    while (true) {
      var lzwBlock = {};
      lzwBlock.size = st.readByte();
      lzwBlock.data = st.read(lzwBlock.size);
      block.lzwBlocks.push(lzwBlock);
      if (lzwBlock.size == 0) return;
    }
  }

  function parseBlocks() {
    while (true) {
      var block = {};
      block.sentinel = st.readByte();
      switch (String.fromCharCode(block.sentinel)) {// For ease of matching
        case '!':
          block.type = 'ext';
          log('Extension block:');
          parseExt(block);
          break;
        case ',':
          log('Image block:');
          block.type = 'img';
          parseImg(block);
          break;
        case ';':
          block.type = 'trailer';
          log('Trailer (;) reached!');
          return;
          break; //
        default:
          throw new Error("Unknown block: 0x" + block.sentinel.toString(16));
      }
      gif.blocks.push(block);
    }
  }

  function parse() {
    parseHeader();
    parseBlocks();
  }

  parse();
  return gif;
};

// runish

//var tiny_gif = "GIF89a\x01\x00\x01\x00\x80\x00\x00\xFF\xFF\xFF\x00\x00\x00!\xF9\x04\x01\x00\x00\x00\x00,\x00\x00\x00\x00\x01\x00\x01\x00\x00\x02\x02D\x01\x00;";
//var wiki_gif = fs.readFileSync('GifSample.gif').toString();


c = console.log;

process.argv.forEach(function (arg, i) {
  // Not an array?!
  if (i > 1) {
    c('%s', arg);
    c('%s', function (n) {
      var s = '';for (var i = 0; i < n; i++) {
        s += '-';
      };return s;
    }(arg.length));
    var data = require('fs').readFileSync(arg).toString('binary');
    var gif = parseGIF(data);
    console.log('%s', require('sys').inspect(gif));
  }
});

//doGif('tiny.gif');
//doGif('wiki.gif');
//doGif('bouncing_ball.gif');
//# sourceMappingURL=h.js.map