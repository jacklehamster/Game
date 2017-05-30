"use strict";

function bitsToNum(b) {
  return b.reduce(function (g, e) {
    return g * 2 + e;
  }, 0);
}Array.prototype.shiftN = function (b) {
  return b == undefined ? this.shift() : this.splice(0, b);
};function byteToBitArr(b) {
  for (var g = [], e = 7; e >= 0; e--) {
    g.push(!!(b & 1 << e));
  }return g;
}
function lzwDecode(b, g) {
  function e(i) {
    for (var k = 0, o = 0; o < i; o++) {
      if (g.charCodeAt(m >> 3) & 1 << m % 8) k |= 1 << o;m++;
    }return k;
  }function l() {
    d = [];j = b + 1;for (var i = 0; i < a; i++) {
      d[i] = [i];
    }d[a] = [];d[h] = null;
  }for (var m = 0, n = [], a = 1 << b, h = a + 1, j = b + 1, d = [], f, c;;) {
    c = f;f = e(j);if (f == a) l();else {
      if (f == h) break;if (f < d.length) c != a && d.push(d[c].concat(d[f][0]));else {
        console.assert(f == d.length);d.push(d[c].concat(d[c][0]));
      }n.push.apply(n, d[f]);d.length == 1 << j && j < 12 && j++;
    }
  }console.assert((m >> 3) + !!(m % 8) == g.length);return n;
}
var Stream = function Stream(b) {
  this.data = b;this.len = this.data.length;this.pos = 0;this.readByte = function () {
    if (this.pos >= this.data.length) throw Error("Attempted to read past end of stream.");return b.charCodeAt(this.pos++) & 255;
  };this.readBytes = function (g) {
    for (var e = [], l = 0; l < g; l++) {
      e.push(this.readByte());
    }return e;
  };this.read = function (g) {
    for (var e = "", l = 0; l < g; l++) {
      e += String.fromCharCode(this.readByte());
    }return e;
  };this.readUnsigned = function () {
    var g = this.readBytes(2);return (g[1] << 8) + g[0];
  };
};
function parseGIF(b, g) {
  function e() {
    return function () {};
  }function l(a) {
    for (var h = [], j = 0; j < a; j++) {
      h.push(b.readBytes(3));
    }return h;
  }function m(a) {
    function h(c) {
      var i = b.readByte();f("blockSize: %d", i);i = byteToBitArr(b.readByte());c.reserved = i.shiftN(3);c.disposalMethod = bitsToNum(i.shiftN(3));c.userInput = i.shift();c.transparencyGiven = i.shift();f("reserved: %d, disposalMethod: %d, userInput: %d, transparencyGiven: %d", c.reserved, c.disposalMethod, c.userInput, c.transparencyGiven);c.delayTime = b.readUnsigned();
      f("delayTime: %d", c.delayTime);c.transparencyIndex = b.readByte();f("transparencyIndex: %d", c.transparencyIndex);c.terminator = b.readByte();f("terminator: %d", c.terminator);g.ext.gce(c);
    }function j(c) {
      c.comment = "";do {
        var i = b.readByte();c.comment += b.read(i);
      } while (i != 0);g.ext.com(c);
    }function d(c) {
      function i(k) {
        f("NETSCAPE");b.readByte();k.unknown = b.readByte();k.iterations = b.readUnsigned();k.terminator = b.readByte();f("iterations: %d, terminator: %d", k.iterations, k.terminator);g.ext.app.NETSCAPE(k);
      }b.readByte();
      c.identifier = b.read(8);c.authCode = b.read(3);f("identifier: %s, authCode: %s", c.identifier, c.authCode);switch (c.identifier) {case "NETSCAPE":
          i(c);break;default:
          throw Error("Unknown Application Extension: " + c.identifier);}
    }var f = e("  ");a.label = b.readByte();switch (a.label) {case 249:
        f("Graphics Control Extension");a.extType = "gce";h(a);break;case 254:
        f("Comment Extension");a.extType = "com";j(a);break;case 255:
        f("Application Extension");d(a);break;case 1:
        throw Error("Plain Text extension (0x01) unsupported");
      default:
        throw Error("Unknown extension: 0x" + label.toString(16));}
  }function n() {
    var a = {};a.sentinel = b.readByte();switch (String.fromCharCode(a.sentinel)) {case "!":
        a.type = "ext";m(a);break;case ",":
        var h = e("  ");a.leftPos = b.readUnsigned();a.topPos = b.readUnsigned();a.width = b.readUnsigned();a.height = b.readUnsigned();h("left: %d, top: %d, width: %d, height: %d", a.leftPos, a.topPos, a.width, a.height);var j = byteToBitArr(b.readByte());a.lctFlag = j.shift();a.interlace = j.shift();a.sorted = j.shift();a.reserved = j.shiftN(2);
        a.lctSize = j.shiftN(3);h("lct? %d, interlace? %d, sorted? %d, reserved: %d, lctSize: %d", a.lctFlag, a.interlace, a.sorted, a.reserved, a.lctSize);if (a.lctFlag) {
          a.lct = l(1 << a.lctSize + 1);h("lct read; %d entries", a.lct.length);
        }a.lzwMinCodeSize = b.readByte();h = "";do {
          j = b.readByte();h += b.read(j);
        } while (j);a.pixels = lzwDecode(a.lzwMinCodeSize, h);g.img(a);break;case ";":
        a.type = "eof";g.eof(a);break;default:
        throw Error("Unknown block: 0x" + a.sentinel.toString(16));}g.progress(b.pos, b.data.length);a.type != "eof" && setTimeout(n, 0);
  }(function () {
    var a = {};a.sig = b.read(3);a.ver = b.read(3);if (a.sig != "GIF") throw Error("Not a GIF file.");a.width = b.readUnsigned();a.height = b.readUnsigned();var h = byteToBitArr(b.readByte());a.gctFlag = h.shift();a.colorRes = bitsToNum(h.shiftN(3));a.sorted = h.shift();a.gctSize = bitsToNum(h.shiftN(3));a.bgColor = b.readByte();a.pixelAspectRatio = b.readByte();if (a.gctFlag) a.gct = l(1 << a.gctSize + 1);g.hdr(a);
  })();n();
}if (typeof exports != "undefined") {
  exports.Stream = Stream;exports.parseGIF = parseGIF;
};function binGetURL(b, g) {
  var e = new XMLHttpRequest();e.overrideMimeType("text/plain; charset=x-user-defined");e.onload = function () {
    g(e.responseText);
  };e.open("GET", b, true);e.send();
}
function done(b) {
  function g() {
    h.push([n, a.getImageData(0, 0, e.width, e.height)]);
  }b = new Stream(b);var e,
      l = document.createElement("canvas"),
      m = null,
      n = null,
      a = null,
      h = [],
      j = function () {
    var d = -1;return function () {
      d = (d + 1) % h.length;var f = document.getElementById("c");f.width = e.width;f.height = e.height;f.getContext("2d").putImageData(h[d][1], 0, 0);setTimeout(j, h[d][0] * 10);
    };
  }();parseGIF(b, { hdr: function hdr(d) {
      e = d;l.width = e.width;l.height = e.height;
    }, ext: { gce: function gce(d) {
        a && g();n = m = null;a = l.getContext("2d");if (d.transparencyGiven) m = d.transparencyIndex;n = d.delayTime;
      }, app: { NETSCAPE: function NETSCAPE() {} } }, img: function img(d) {
      var f = d.lctFlag ? d.lct : e.gct,
          c = a.createImageData(d.width, d.height);d.pixels.forEach(function (i, k) {
        if (m == null || m != i) {
          c.data[k * 4 + 0] = f[i][0];c.data[k * 4 + 1] = f[i][1];c.data[k * 4 + 2] = f[i][2];c.data[k * 4 + 3] = 255;
        }
      });a.putImageData(c, d.leftPos, d.topPos);
    }, eof: function eof() {
      g();j();
    }, progress: function progress(d, f) {
      document.getElementById("p").innerHTML = Math.floor(d / f * 100) + "%";
    } });
}
function run() {
  var b = document.getElementById("url").value;binGetURL(b, done);
};
//# sourceMappingURL=out.js.map