'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

(function (global, factory) {
  (typeof exports === 'undefined' ? 'undefined' : _typeof(exports)) === 'object' && typeof module !== 'undefined' ? factory(exports) : typeof define === 'function' && define.amd ? define(['exports'], factory) : factory(global.DOK = global.DOK || {}, global);
})(window, function (core, global) {
  'use strict';

  /**
   *  HEADER
   */

  core.requireScripts(['setup.js']);
  core.logScript();

  /**
   *  CLASS DEFINITIONS
   */

  /**
   *  FUNCTION DEFINITIONS
   */
  function destroyEverything() {}

  /**
   *  PUBLIC DECLARATIONS
   */
  core.destroyEverything = core.combineMethods(destroyEverything, core.destroyEverything);

  /**
   *   PROCESSES
   */
});
//# sourceMappingURL=template.js.map