(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var Circle = /*#__PURE__*/function () {
  function Circle(x, y, radius) {
    var color = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : "#000";
    (0, _classCallCheck2.default)(this, Circle);
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.color = color;
    this.opacity = 1;
  }

  (0, _createClass2.default)(Circle, [{
    key: "increaseSize",
    value: function increaseSize(amount) {
      this.radius += 2 + this.radius * amount;
    }
  }, {
    key: "decreaseOpacity",
    value: function decreaseOpacity(amount) {
      this.opacity -= amount;
    }
  }, {
    key: "removable",
    value: function removable(canvas) {
      return this.radius > canvas.width || this.opacity < 0;
    }
  }]);
  return Circle;
}();

var _default = Circle;
exports.default = _default;

},{"@babel/runtime/helpers/classCallCheck":9,"@babel/runtime/helpers/createClass":10,"@babel/runtime/helpers/interopRequireDefault":11}],2:[function(require,module,exports){
"use strict";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _circle = _interopRequireDefault(require("./circle"));

var _square = _interopRequireDefault(require("./square"));

var _triangle = _interopRequireDefault(require("./triangle"));

var PATTERNS = _interopRequireWildcard(require("./patterns"));

var _midi = _interopRequireDefault(require("./midi"));

var _opzjs = _interopRequireDefault(require("opzjs"));

var _settings = _interopRequireDefault(require("./settings"));

function _createForOfIteratorHelper(o, allowArrayLike) { var it; if (typeof Symbol === "undefined" || o[Symbol.iterator] == null) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = o[Symbol.iterator](); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it.return != null) it.return(); } finally { if (didErr) throw err; } } }; }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

var settings = window.settings = new _settings.default();
settings.buildSettings();
var circles = [];
var shapes = [];
var midi = new _midi.default();
var canvas = document.getElementById('canvas');
var scratch = document.createElement('canvas');
var ctxM = canvas.getContext('2d'); // Main

var ctxS = scratch.getContext('2d'); // Scratch

var setupCanvas = function setupCanvas(c) {
  c.width = window.innerWidth;
  c.height = window.innerHeight;
}; // Add a new shape to the canvas
//
// @param track [String || Integer]


var addNewShape = function addNewShape(track) {
  var coordinates = PATTERNS[settings.pattern];
  var height = window.innerHeight;
  var width = window.innerWidth;
  var color = settings.getColor(track);
  var shape; // Get coordinates for corresponding track

  var c = coordinates[settings.getId(track)];
  var c_x = c.x;
  var c_y = c.y; // Octogon requires special handling since
  // height and width are not guaranteed to be the same

  if (settings.pattern === "octogon") {
    var min = Math.min(height, width);
    c_x = min / width * c_x + 0.5;
    c_y = min / height * c_y + 0.5;
  }

  switch (settings.getShape(track)) {
    case "circle":
      shape = new _circle.default(width * c_x, height * c_y, 1, color);
      break;

    case "square":
      shape = new _square.default(width * c_x, height * c_y, 1, color);
      break;

    case "triangle":
      shape = new _triangle.default(width * c_x, height * c_y, 1, color);
      break;
  }

  shapes.push(shape);
};

var opzMidiHandler = function opzMidiHandler(event) {
  var data = _opzjs.default.decode(event.data);

  if (data.velocity > 0 && data.action === "keys") {
    var track = data.track; // Return if an unsupported track (fx, tape, etc)

    if (!settings.getId(track)) return;
    addNewShape(track);
  }

  if (data.action === "dial" && data.track === "motion") {
    switch (data.value.dialColor) {
      case "green":
        // 0 - 15
        settings.setOpacityRate(data.velocity * 15 / 128);
        break;

      case "blue":
        // 0 - 100
        settings.setGrowRate(data.velocity * 100 / 128);
        break;

      case "yellow":
        // 0 - 3
        settings.setPattern(Math.floor(data.velocity * 4 / 128));
        break;

      case "red":
        // 0 - 3
        settings.setShapes(Math.floor(data.velocity * 4 / 128));
        break;
    }
  }
};

var midiHandler = function midiHandler(event) {// TODO
};

var drawCircle = function drawCircle(ctx, c) {
  ctx.beginPath();
  ctx.globalAlpha = c.opacity;
  ctx.arc(c.x, c.y, c.radius, 0, 2 * Math.PI, false);
  ctx.closePath();
  ctx.strokeStyle = c.color;
  ctx.stroke();
};

var drawSquare = function drawSquare(ctx, s) {
  ctx.beginPath();
  ctx.globalAlpha = s.opacity;
  ctx.strokeStyle = s.color;
  ctx.strokeRect(s.x(), s.y(), s.width, s.height);
  ctx.closePath();
  ctx.stroke();
};

var drawTriangle = function drawTriangle(ctx, t) {
  ctx.beginPath();
  ctx.globalAlpha = t.opacity;
  ctx.strokeStyle = t.color;
  ctx.moveTo(t.X1(), t.Y1());
  ctx.lineTo(t.X2(), t.Y2());
  ctx.lineTo(t.X3(), t.Y3());
  ctx.lineTo(t.X1(), t.Y1());
  ctx.closePath();
  ctx.stroke();
};

var clearCanvas = function clearCanvas(ctx, c) {
  ctx.clearRect(0, 0, c.width, c.height);
};

var setBackgroundColor = function setBackgroundColor() {
  var body = document.getElementsByTagName("body")[0];
  var currentBg = body.style.backgroundColor;

  if (currentBg != settings.backgroundColor) {
    body.style.backgroundColor = settings.backgroundColor;
  }
};

var draw = function draw() {
  setupCanvas(canvas);
  setupCanvas(scratch);
  clearCanvas(ctxS, scratch);
  clearCanvas(ctxM, canvas);
  setBackgroundColor();

  for (var i = shapes.length - 1; i >= 0; --i) {
    switch (shapes[i].constructor.name) {
      case "Circle":
        drawCircle(ctxS, shapes[i]);
        break;

      case "Square":
        drawSquare(ctxS, shapes[i]);
        break;

      case "Triangle":
        drawTriangle(ctxS, shapes[i]);
        break;
    }

    shapes[i].increaseSize(settings.growRate);
    shapes[i].decreaseOpacity(settings.opacityRate);
    if (shapes[i].removable(canvas)) shapes.splice(i, 1);
  }

  ctxM.drawImage(scratch, 0, 0);
  window.webkitRequestAnimationFrame(draw);
};

window.webkitRequestAnimationFrame(draw); // Midi connect handler

var midiConnect = function midiConnect(e) {
  midi.setup();
  setTimeout(function () {
    var type = e.target.getAttribute("data-type");

    if (midi.devices.length > 0) {
      for (var deviceId in midi.devices) {
        var handler = type === "midi" ? midiHandler : opzMidiHandler;
        midi.selectDevice(deviceId, handler);
      }

      var menu = document.getElementById("menu");
      menu.classList.add("hide");
    } else {
      var error = document.getElementById("".concat(type, "-connect-error"));
      error.innerHTML = "Couldn't detect any midi devices (check browser support)";
    }
  }, 200);
};

document.getElementById("opz-connect").addEventListener("click", midiConnect);
document.getElementById("midi-connect").addEventListener("click", midiConnect);
document.getElementById("midi-setup").addEventListener("click", function (e) {
  var menu = document.getElementById("menu");

  var _iterator = _createForOfIteratorHelper(menu.children),
      _step;

  try {
    for (_iterator.s(); !(_step = _iterator.n()).done;) {
      var node = _step.value;
      node.classList.add("hide");
    }
  } catch (err) {
    _iterator.e(err);
  } finally {
    _iterator.f();
  }

  document.getElementById("midi-setup-menu").classList.remove("hide");
});

},{"./circle":1,"./midi":3,"./patterns":4,"./settings":5,"./square":6,"./triangle":7,"@babel/runtime/helpers/interopRequireDefault":11,"@babel/runtime/helpers/interopRequireWildcard":12,"opzjs":14}],3:[function(require,module,exports){
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

function _createForOfIteratorHelper(o, allowArrayLike) { var it; if (typeof Symbol === "undefined" || o[Symbol.iterator] == null) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = o[Symbol.iterator](); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it.return != null) it.return(); } finally { if (didErr) throw err; } } }; }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

var Midi = /*#__PURE__*/function () {
  function Midi() {
    (0, _classCallCheck2.default)(this, Midi);
    this.self = this;
    this.devices = [];
    this.supported = this.checkMidiSupport();
  }

  (0, _createClass2.default)(Midi, [{
    key: "setup",
    value: function setup() {
      navigator.requestMIDIAccess().then(this.onMIDISuccess.bind(this), this.onMIDIFailure.bind(this));
    }
  }, {
    key: "onMIDISuccess",
    value: function onMIDISuccess(midiAccess) {
      var inputs = midiAccess.inputs.values();

      var _iterator = _createForOfIteratorHelper(midiAccess.inputs.values()),
          _step;

      try {
        for (_iterator.s(); !(_step = _iterator.n()).done;) {
          var input = _step.value;
          this.devices.push(input);
        }
      } catch (err) {
        _iterator.e(err);
      } finally {
        _iterator.f();
      }
    }
  }, {
    key: "onMIDIFailure",
    value: function onMIDIFailure() {
      console.log('Could not access your MIDI devices.');
    }
  }, {
    key: "checkMidiSupport",
    value: function checkMidiSupport() {
      if (navigator.requestMIDIAccess) {
        console.log('This browser supports WebMIDI!');
        return true;
      } else {
        console.log('WebMIDI is not supported in this browser.');
        return false;
      }
    }
  }, {
    key: "selectDevice",
    value: function selectDevice(deviceIndex, handler) {
      var device = this.devices[deviceIndex];
      device.onmidimessage = handler;
      console.log("Connected to \"".concat(device.name, "\""));
    }
  }]);
  return Midi;
}();

var _default = Midi;
exports.default = _default;

},{"@babel/runtime/helpers/classCallCheck":9,"@babel/runtime/helpers/createClass":10,"@babel/runtime/helpers/interopRequireDefault":11}],4:[function(require,module,exports){
"use strict";

/*
 * Patterns
 *
 * Requirement:
 * - have 8 points
 * - each point has an x and y
 * - points are percentages (0 to 1)
 */
// First and last points are on boundary, so
// skip them (and divide by n+2 = 10)
var eighth = function eighth(i) {
  return (i + 1) / 9;
};

var point = function point(x, y) {
  return {
    x: x,
    y: y
  };
};

var octogonPoint = function octogonPoint(i, a) {
  var angle = Math.PI / 4;
  var phase = Math.PI / 2;
  return point(a * Math.cos(i * angle + phase), a * Math.sin(i * angle + phase));
};

var dot = [];
var vertical = [];
var horizontal = [];
var octogon = [];

for (var i = 0; i < 8; i++) {
  dot.push(point(0.5, 0.5));
  vertical.push(point(0.5, eighth(i)));
  horizontal.push(point(eighth(i), 0.5));
  octogon.push(octogonPoint(i, 0.25));
}

module.exports = {
  dot: dot,
  vertical: vertical,
  horizontal: horizontal,
  octogon: octogon
};

},{}],5:[function(require,module,exports){
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _jscolor = _interopRequireDefault(require("./utils/jscolor"));

function _createForOfIteratorHelper(o, allowArrayLike) { var it; if (typeof Symbol === "undefined" || o[Symbol.iterator] == null) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = o[Symbol.iterator](); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it.return != null) it.return(); } finally { if (didErr) throw err; } } }; }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

var DEFAULT_COLORS = ['#CA281D', '#F4AE01', '#0071BB', '#11A159', '#F56C46', '#008080', '#5BB5F2', '#7832B4'];
var PATTERNS = ['vertical', 'horizontal', 'octogon', 'dot'];
var TRACKS = ['kick', 'snare', 'perc', 'sample', 'bass', 'lead', 'arp', 'chord'];
var SHAPES = ['circle', 'square', 'triangle'];

var toggle = function toggle(element, klass) {
  if (element.classList.contains(klass)) {
    element.classList.remove(klass);
  } else {
    element.classList.add(klass);
  }
};

var createEl = function createEl(tag) {
  return document.createElement(tag);
};

var createRadio = function createRadio(name, value, checked, click) {
  var radio = createEl("input");
  radio.setAttribute('id', "".concat(name, "-").concat(value));
  radio.setAttribute('type', 'radio');
  radio.setAttribute('name', name);
  radio.setAttribute('value', value);
  radio.checked = checked;
  radio.onclick = click;
  return radio;
};

var createRange = function createRange(id, min, max, value, click) {
  var range = createEl("input");
  range.setAttribute('id', id);
  range.setAttribute('type', 'range');
  range.setAttribute('min', min);
  range.setAttribute('max', max);
  range.setAttribute('value', value);
  range.onclick = click;
  return range;
};

var createTableRow = function createTableRow(title, content) {
  var row = createEl("tr");
  var col1 = createEl("td");
  col1.innerHTML = title;
  row.appendChild(col1);
  var col2 = createEl("td");
  col2.appendChild(content);
  row.appendChild(col2);
  return row;
};

var Settings = /*#__PURE__*/function () {
  function Settings() {
    (0, _classCallCheck2.default)(this, Settings);
    this.pattern = 'vertical';
    this.opacity = true;
    this.opacityRate = 0.005;
    this.growRate = 0.007;
    this.backgroundColor = '#000';
    this.trackSettings = this.setupTracks();
  }

  (0, _createClass2.default)(Settings, [{
    key: "setupTracks",
    value: function setupTracks() {
      var tracks = {};

      for (var i in TRACKS) {
        tracks[TRACKS[i]] = {
          id: i,
          color: DEFAULT_COLORS[i],
          shape: SHAPES[0]
        };
      }

      return tracks;
    } // Handles Int OR string input

  }, {
    key: "getTrack",
    value: function getTrack(track) {
      if (Number.isInteger(track)) {
        return TRACKS[track % (TRACKS.length - 1)];
      } else {
        return track;
      }
    }
  }, {
    key: "getId",
    value: function getId(track) {
      var setting = this.trackSettings[this.getTrack(track)];

      if (setting) {
        return setting["id"];
      } else {
        return undefined;
      }
    }
  }, {
    key: "getShape",
    value: function getShape(track) {
      return this.trackSettings[this.getTrack(track)]["shape"];
    }
  }, {
    key: "getColor",
    value: function getColor(track) {
      return this.trackSettings[this.getTrack(track)]["color"];
    }
  }, {
    key: "setOpacityRate",
    value: function setOpacityRate(value) {
      this.opacityRate = value * 0.001;
      document.getElementById("opacity").value = value;
    }
  }, {
    key: "setGrowRate",
    value: function setGrowRate(value) {
      this.growRate = value * 0.00025;
      document.getElementById("grow").value = value;
    }
  }, {
    key: "setPattern",
    value: function setPattern(value) {
      var p = PATTERNS[value];
      this.pattern = p;
      document.getElementById("pattern-".concat(p)).checked = true;
    }
  }, {
    key: "setShapes",
    value: function setShapes(value) {
      var _iterator = _createForOfIteratorHelper(TRACKS),
          _step;

      try {
        for (_iterator.s(); !(_step = _iterator.n()).done;) {
          var t = _step.value;
          var s = SHAPES[value]; // Random shapes

          if (value == 3) {
            var random = Math.floor(SHAPES.length * Math.random());
            s = SHAPES[random];
          }

          this.trackSettings[t]["shape"] = s;
          document.getElementById("".concat(t, "-").concat(s)).checked = true;
        }
      } catch (err) {
        _iterator.e(err);
      } finally {
        _iterator.f();
      }

      ;
    }
    /*
     Builds the settings page via Javascript.
      Not using any frameworks, so this is a monster sized query.
     */

  }, {
    key: "buildSettings",
    value: function buildSettings() {
      var _this = this;

      var tracks = document.getElementById("tracks");

      var _iterator2 = _createForOfIteratorHelper(TRACKS),
          _step2;

      try {
        for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
          var t = _step2.value;
          var row = createEl("tr");

          var _title = createEl("td");

          _title.innerHTML = t;
          row.appendChild(_title); // TRACK Shapes pickers

          var shapes = createEl("td");

          var _iterator4 = _createForOfIteratorHelper(SHAPES),
              _step4;

          try {
            for (_iterator4.s(); !(_step4 = _iterator4.n()).done;) {
              var s = _step4.value;
              var c = s === this.getShape(t);

              var click = function click(e) {
                var _v = e.target.getAttribute("value");

                var _t = e.target.getAttribute("name");

                _this.trackSettings[_t]["shape"] = _v;
              };

              var radio = createRadio(t, s, c, click);
              var label = createEl("label");
              var shape = createEl("div");

              switch (s) {
                case "circle":
                  shape.classList.add("circle");
                  break;

                case "square":
                  shape.classList.add("square");
                  break;

                case "triangle":
                  shape.classList.add("triangle");
                  break;
              }

              label.appendChild(radio);
              label.appendChild(shape);
              shapes.appendChild(label);
            }
          } catch (err) {
            _iterator4.e(err);
          } finally {
            _iterator4.f();
          }

          row.appendChild(shapes);
          /* TRACK Color pickers */

          var colorPicker = createEl("td");
          var colorPickerInput = createEl("input");
          colorPickerInput.setAttribute("data-jscolor", "{value: '".concat(this.getColor(t), "'}"));
          colorPickerInput.setAttribute("data-track", t);

          colorPickerInput.oninput = function (e, c) {
            var _c = e.target.value;

            var _t = e.target.getAttribute("data-track");

            _this.trackSettings[_t]["color"] = _c;
          };

          colorPicker.appendChild(colorPickerInput);
          row.appendChild(colorPicker);
          tracks.appendChild(row);
        }
      } catch (err) {
        _iterator2.e(err);
      } finally {
        _iterator2.f();
      }

      var global = document.getElementById("global");
      var patterns = createEl("ul");

      var _iterator3 = _createForOfIteratorHelper(PATTERNS),
          _step3;

      try {
        for (_iterator3.s(); !(_step3 = _iterator3.n()).done;) {
          var p = _step3.value;
          var item = createEl("li");

          var _c2 = p === this.pattern;

          var _click = function _click(e) {
            var _v = e.target.getAttribute("value");

            var _t = e.target.getAttribute("name");

            _this.pattern = _v;
          };

          var _radio = createRadio("pattern", p, _c2, _click);

          var _label = createEl("label");

          _label.innerHTML = p;
          item.appendChild(_radio);
          item.appendChild(_label);
          patterns.appendChild(item);
        } // Pattern row

      } catch (err) {
        _iterator3.e(err);
      } finally {
        _iterator3.f();
      }

      global.appendChild(createTableRow("Pattern", patterns));
      /* Background color picker */

      var bgColorPickerInput = createEl("input");
      bgColorPickerInput.setAttribute("data-jscolor", "{value: '".concat(this.backgroundColor, "'}"));

      bgColorPickerInput.oninput = function (e, c) {
        var _c = e.target.value;
        _this.backgroundColor = _c;
      };

      global.appendChild(createTableRow("Background Color", bgColorPickerInput));
      /* OPACITY */

      var opacityInput = createRange("opacity", 1, 15, 5, function (e) {
        var _c = parseInt(e.target.value);

        _this.setOpacityRate(_c);
      });
      global.appendChild(createTableRow("Fade", opacityInput));
      /* GROWTH */

      var growInput = createRange("grow", 1, 100, 28, function (e) {
        var _c = parseInt(e.target.value);

        _this.setGrowRate(_c);
      });
      global.appendChild(createTableRow("Grow Rate", growInput));

      _jscolor.default.install();

      var settings = document.getElementById("settings");
      var close = document.getElementById("settings-close");
      var title = document.getElementById("settings-title");

      close.onclick = function (e) {
        toggle(settings, "active");
      };

      title.onclick = function (e) {
        toggle(settings, "active");
      };
    }
  }]);
  return Settings;
}();

var _default = Settings;
exports.default = _default;

},{"./utils/jscolor":8,"@babel/runtime/helpers/classCallCheck":9,"@babel/runtime/helpers/createClass":10,"@babel/runtime/helpers/interopRequireDefault":11}],6:[function(require,module,exports){
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var Square = /*#__PURE__*/function () {
  function Square(x, y, size) {
    var color = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : "#000";
    (0, _classCallCheck2.default)(this, Square);
    this._x = x;
    this._y = y;
    this.width = size;
    this.height = size;
    this.color = color;
    this.opacity = 1;
  }

  (0, _createClass2.default)(Square, [{
    key: "x",
    value: function x() {
      return this._x - this.width / 2;
    }
  }, {
    key: "y",
    value: function y() {
      return this._y - this.height / 2;
    }
  }, {
    key: "increaseSize",
    value: function increaseSize(amount) {
      this.height += 10 * this.height * amount;
      this.width += 10 * this.width * amount;
    }
  }, {
    key: "decreaseOpacity",
    value: function decreaseOpacity(amount) {
      this.opacity -= amount;
    }
  }, {
    key: "removable",
    value: function removable(canvas) {
      return this.width > canvas.width || this.opacity < 0;
    }
  }]);
  return Square;
}();

var _default = Square;
exports.default = _default;

},{"@babel/runtime/helpers/classCallCheck":9,"@babel/runtime/helpers/createClass":10,"@babel/runtime/helpers/interopRequireDefault":11}],7:[function(require,module,exports){
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var TRI_H_RATIO = Math.pow(3, 1 / 2) / 2;

var Triangle = /*#__PURE__*/function () {
  function Triangle(x, y, size) {
    var color = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : "#000";
    (0, _classCallCheck2.default)(this, Triangle);
    this._x = x;
    this._y = y;
    this.width = size;
    this.height = TRI_H_RATIO * size;
    this.color = color;
    this.opacity = 1;
  }

  (0, _createClass2.default)(Triangle, [{
    key: "x",
    value: function x() {
      return this._x - this.width / 2;
    }
  }, {
    key: "y",
    value: function y() {
      return this._y - this.height / 2;
    }
  }, {
    key: "X1",
    value: function X1() {
      return this.x();
    }
  }, {
    key: "Y1",
    value: function Y1() {
      return this.y() + this.height;
    }
  }, {
    key: "X2",
    value: function X2() {
      return this.x() + this.width;
    }
  }, {
    key: "Y2",
    value: function Y2() {
      return this.y() + this.height;
    }
  }, {
    key: "X3",
    value: function X3() {
      return this.x() + this.width / 2;
    }
  }, {
    key: "Y3",
    value: function Y3() {
      return this.y();
    }
  }, {
    key: "increaseSize",
    value: function increaseSize(amount) {
      this.height += 10 * this.height * amount;
      this.width += 10 * this.width * amount;
    }
  }, {
    key: "decreaseOpacity",
    value: function decreaseOpacity(amount) {
      this.opacity -= amount;
    }
  }, {
    key: "removable",
    value: function removable(canvas) {
      // biggest square that fits in a equilateral
      // triangle has a width: a/(1 + 2/√3) = 0.0464.
      //
      // divide by 2 to account for triangles created near the
      // screen edge.
      return 0.464 / 2 * this.width > canvas.width || this.opacity < 0;
    }
  }]);
  return Triangle;
}();

var _default = Triangle;
exports.default = _default;

},{"@babel/runtime/helpers/classCallCheck":9,"@babel/runtime/helpers/createClass":10,"@babel/runtime/helpers/interopRequireDefault":11}],8:[function(require,module,exports){
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _typeof2 = _interopRequireDefault(require("@babel/runtime/helpers/typeof"));

/**
 * jscolor - JavaScript Color Picker
 *
 * @link    http://jscolor.com
 * @license For open source use: GPLv3
 *          For commercial use: JSColor Commercial License
 * @author  Jan Odvarko - East Desire
 * @version 2.4.0
 *
 * See usage examples at http://jscolor.com/examples/
 */
(function (global, factory) {
  'use strict';

  if ((typeof module === "undefined" ? "undefined" : (0, _typeof2.default)(module)) === 'object' && (0, _typeof2.default)(module.exports) === 'object') {
    // Export jscolor as a module
    module.exports = global.document ? factory(global) : function (win) {
      if (!win.document) {
        throw new Error('jscolor needs a window with document');
      }

      return factory(win);
    };
    return;
  } // Default use (no module export)


  factory(global);
})(typeof window !== 'undefined' ? window : void 0, function (window) {
  // BEGIN factory
  // BEGIN jscolor code
  'use strict';

  var jscolor = function () {
    // BEGIN jscolor
    var jsc = {
      initialized: false,
      instances: [],
      // created instances of jscolor
      triggerQueue: [],
      // events waiting to be triggered after init
      register: function register() {
        if (typeof window !== 'undefined' && window.document) {
          window.document.addEventListener('DOMContentLoaded', jsc.pub.init, false);
        }
      },
      installBySelector: function installBySelector(selector, rootNode) {
        rootNode = rootNode ? jsc.node(rootNode) : window.document;

        if (!rootNode) {
          throw new Error('Missing root node');
        }

        var elms = rootNode.querySelectorAll(selector); // for backward compatibility with DEPRECATED installation/configuration using className

        var matchClass = new RegExp('(^|\\s)(' + jsc.pub.lookupClass + ')(\\s*(\\{[^}]*\\})|\\s|$)', 'i');

        for (var i = 0; i < elms.length; i += 1) {
          if (elms[i].jscolor && elms[i].jscolor instanceof jsc.pub) {
            continue; // jscolor already installed on this element
          }

          if (elms[i].type !== undefined && elms[i].type.toLowerCase() == 'color' && jsc.isColorAttrSupported) {
            continue; // skips inputs of type 'color' if supported by the browser
          }

          var dataOpts, m;

          if ((dataOpts = jsc.getDataAttr(elms[i], 'jscolor')) !== null || elms[i].className && (m = elms[i].className.match(matchClass)) // installation using className (DEPRECATED)
          ) {
              var targetElm = elms[i];
              var optsStr = '';

              if (dataOpts !== null) {
                optsStr = dataOpts;
              } else if (m) {
                // installation using className (DEPRECATED)
                console.warn('Installation using class name is DEPRECATED. Use data-jscolor="" attribute instead.' + jsc.docsRef);

                if (m[4]) {
                  optsStr = m[4];
                }
              }

              var opts = null;

              if (optsStr.trim()) {
                try {
                  opts = jsc.parseOptionsStr(optsStr);
                } catch (e) {
                  console.warn(e + '\n' + optsStr);
                }
              }

              try {
                new jsc.pub(targetElm, opts);
              } catch (e) {
                console.warn(e);
              }
            }
        }
      },
      parseOptionsStr: function parseOptionsStr(str) {
        var opts = null;

        try {
          opts = JSON.parse(str);
        } catch (eParse) {
          if (!jsc.pub.looseJSON) {
            throw new Error('Could not parse jscolor options as JSON: ' + eParse);
          } else {
            // loose JSON syntax is enabled -> try to evaluate the options string as JavaScript object
            try {
              opts = new Function('var opts = (' + str + '); return typeof opts === "object" ? opts : {};')();
            } catch (eEval) {
              throw new Error('Could not evaluate jscolor options: ' + eEval);
            }
          }
        }

        return opts;
      },
      getInstances: function getInstances() {
        var inst = [];

        for (var i = 0; i < jsc.instances.length; i += 1) {
          // if the targetElement still exists, the instance is considered "alive"
          if (jsc.instances[i] && jsc.instances[i].targetElement) {
            inst.push(jsc.instances[i]);
          }
        }

        return inst;
      },
      createEl: function createEl(tagName) {
        var el = window.document.createElement(tagName);
        jsc.setData(el, 'gui', true);
        return el;
      },
      node: function node(nodeOrSelector) {
        if (!nodeOrSelector) {
          return null;
        }

        if (typeof nodeOrSelector === 'string') {
          // query selector
          var sel = nodeOrSelector;
          var el = null;

          try {
            el = window.document.querySelector(sel);
          } catch (e) {
            console.warn(e);
            return null;
          }

          if (!el) {
            console.warn('No element matches the selector: %s', sel);
          }

          return el;
        }

        if (jsc.isNode(nodeOrSelector)) {
          // DOM node
          return nodeOrSelector;
        }

        console.warn('Invalid node of type %s: %s', (0, _typeof2.default)(nodeOrSelector), nodeOrSelector);
        return null;
      },
      // See https://stackoverflow.com/questions/384286/
      isNode: function isNode(val) {
        if ((typeof Node === "undefined" ? "undefined" : (0, _typeof2.default)(Node)) === 'object') {
          return val instanceof Node;
        }

        return val && (0, _typeof2.default)(val) === 'object' && typeof val.nodeType === 'number' && typeof val.nodeName === 'string';
      },
      nodeName: function nodeName(node) {
        if (node && node.nodeName) {
          return node.nodeName.toLowerCase();
        }

        return false;
      },
      removeChildren: function removeChildren(node) {
        while (node.firstChild) {
          node.removeChild(node.firstChild);
        }
      },
      isTextInput: function isTextInput(el) {
        return el && jsc.nodeName(el) === 'input' && el.type.toLowerCase() === 'text';
      },
      isButton: function isButton(el) {
        if (!el) {
          return false;
        }

        var n = jsc.nodeName(el);
        return n === 'button' || n === 'input' && ['button', 'submit', 'reset'].indexOf(el.type.toLowerCase()) > -1;
      },
      isButtonEmpty: function isButtonEmpty(el) {
        switch (jsc.nodeName(el)) {
          case 'input':
            return !el.value || el.value.trim() === '';

          case 'button':
            return el.textContent.trim() === '';
        }

        return null; // could not determine element's text
      },
      // See https://github.com/WICG/EventListenerOptions/blob/gh-pages/explainer.md
      isPassiveEventSupported: function () {
        var supported = false;

        try {
          var opts = Object.defineProperty({}, 'passive', {
            get: function get() {
              supported = true;
            }
          });
          window.addEventListener('testPassive', null, opts);
          window.removeEventListener('testPassive', null, opts);
        } catch (e) {}

        return supported;
      }(),
      isColorAttrSupported: function () {
        var elm = window.document.createElement('input');

        if (elm.setAttribute) {
          elm.setAttribute('type', 'color');

          if (elm.type.toLowerCase() == 'color') {
            return true;
          }
        }

        return false;
      }(),
      dataProp: '_data_jscolor',
      // usage:
      //   setData(obj, prop, value)
      //   setData(obj, {prop:value, ...})
      //
      setData: function setData() {
        var obj = arguments[0];

        if (arguments.length === 3) {
          // setting a single property
          var data = obj.hasOwnProperty(jsc.dataProp) ? obj[jsc.dataProp] : obj[jsc.dataProp] = {};
          var prop = arguments[1];
          var value = arguments[2];
          data[prop] = value;
          return true;
        } else if (arguments.length === 2 && (0, _typeof2.default)(arguments[1]) === 'object') {
          // setting multiple properties
          var data = obj.hasOwnProperty(jsc.dataProp) ? obj[jsc.dataProp] : obj[jsc.dataProp] = {};
          var map = arguments[1];

          for (var prop in map) {
            if (map.hasOwnProperty(prop)) {
              data[prop] = map[prop];
            }
          }

          return true;
        }

        throw new Error('Invalid arguments');
      },
      // usage:
      //   removeData(obj, prop, [prop...])
      //
      removeData: function removeData() {
        var obj = arguments[0];

        if (!obj.hasOwnProperty(jsc.dataProp)) {
          return true; // data object does not exist
        }

        for (var i = 1; i < arguments.length; i += 1) {
          var prop = arguments[i];
          delete obj[jsc.dataProp][prop];
        }

        return true;
      },
      getData: function getData(obj, prop, setDefault) {
        if (!obj.hasOwnProperty(jsc.dataProp)) {
          // data object does not exist
          if (setDefault !== undefined) {
            obj[jsc.dataProp] = {}; // create data object
          } else {
            return undefined; // no value to return
          }
        }

        var data = obj[jsc.dataProp];

        if (!data.hasOwnProperty(prop) && setDefault !== undefined) {
          data[prop] = setDefault;
        }

        return data[prop];
      },
      getDataAttr: function getDataAttr(el, name) {
        var attrName = 'data-' + name;
        var attrValue = el.getAttribute(attrName);
        return attrValue;
      },
      _attachedGroupEvents: {},
      attachGroupEvent: function attachGroupEvent(groupName, el, evnt, func) {
        if (!jsc._attachedGroupEvents.hasOwnProperty(groupName)) {
          jsc._attachedGroupEvents[groupName] = [];
        }

        jsc._attachedGroupEvents[groupName].push([el, evnt, func]);

        el.addEventListener(evnt, func, false);
      },
      detachGroupEvents: function detachGroupEvents(groupName) {
        if (jsc._attachedGroupEvents.hasOwnProperty(groupName)) {
          for (var i = 0; i < jsc._attachedGroupEvents[groupName].length; i += 1) {
            var evt = jsc._attachedGroupEvents[groupName][i];
            evt[0].removeEventListener(evt[1], evt[2], false);
          }

          delete jsc._attachedGroupEvents[groupName];
        }
      },
      preventDefault: function preventDefault(e) {
        if (e.preventDefault) {
          e.preventDefault();
        }

        e.returnValue = false;
      },
      captureTarget: function captureTarget(target) {
        // IE
        if (target.setCapture) {
          jsc._capturedTarget = target;

          jsc._capturedTarget.setCapture();
        }
      },
      releaseTarget: function releaseTarget() {
        // IE
        if (jsc._capturedTarget) {
          jsc._capturedTarget.releaseCapture();

          jsc._capturedTarget = null;
        }
      },
      triggerEvent: function triggerEvent(el, eventName, bubbles, cancelable) {
        if (!el) {
          return;
        }

        var ev = null;

        if (typeof Event === 'function') {
          ev = new Event(eventName, {
            bubbles: bubbles,
            cancelable: cancelable
          });
        } else {
          // IE
          ev = window.document.createEvent('Event');
          ev.initEvent(eventName, bubbles, cancelable);
        }

        if (!ev) {
          return false;
        } // so that we know that the event was triggered internally


        jsc.setData(ev, 'internal', true);
        el.dispatchEvent(ev);
        return true;
      },
      triggerInputEvent: function triggerInputEvent(el, eventName, bubbles, cancelable) {
        if (!el) {
          return;
        }

        if (jsc.isTextInput(el)) {
          jsc.triggerEvent(el, eventName, bubbles, cancelable);
        }
      },
      eventKey: function eventKey(ev) {
        var keys = {
          9: 'Tab',
          13: 'Enter',
          27: 'Escape'
        };

        if (typeof ev.code === 'string') {
          return ev.code;
        } else if (ev.keyCode !== undefined && keys.hasOwnProperty(ev.keyCode)) {
          return keys[ev.keyCode];
        }

        return null;
      },
      strList: function strList(str) {
        if (!str) {
          return [];
        }

        return str.replace(/^\s+|\s+$/g, '').split(/\s+/);
      },
      // The className parameter (str) can only contain a single class name
      hasClass: function hasClass(elm, className) {
        if (!className) {
          return false;
        }

        if (elm.classList !== undefined) {
          return elm.classList.contains(className);
        } // polyfill


        return -1 != (' ' + elm.className.replace(/\s+/g, ' ') + ' ').indexOf(' ' + className + ' ');
      },
      // The className parameter (str) can contain multiple class names separated by whitespace
      addClass: function addClass(elm, className) {
        var classNames = jsc.strList(className);

        if (elm.classList !== undefined) {
          for (var i = 0; i < classNames.length; i += 1) {
            elm.classList.add(classNames[i]);
          }

          return;
        } // polyfill


        for (var i = 0; i < classNames.length; i += 1) {
          if (!jsc.hasClass(elm, classNames[i])) {
            elm.className += (elm.className ? ' ' : '') + classNames[i];
          }
        }
      },
      // The className parameter (str) can contain multiple class names separated by whitespace
      removeClass: function removeClass(elm, className) {
        var classNames = jsc.strList(className);

        if (elm.classList !== undefined) {
          for (var i = 0; i < classNames.length; i += 1) {
            elm.classList.remove(classNames[i]);
          }

          return;
        } // polyfill


        for (var i = 0; i < classNames.length; i += 1) {
          var repl = new RegExp('^\\s*' + classNames[i] + '\\s*|' + '\\s*' + classNames[i] + '\\s*$|' + '\\s+' + classNames[i] + '(\\s+)', 'g');
          elm.className = elm.className.replace(repl, '$1');
        }
      },
      getCompStyle: function getCompStyle(elm) {
        var compStyle = window.getComputedStyle ? window.getComputedStyle(elm) : elm.currentStyle; // Note: In Firefox, getComputedStyle returns null in a hidden iframe,
        // that's why we need to check if the returned value is non-empty

        if (!compStyle) {
          return {};
        }

        return compStyle;
      },
      // Note:
      //   Setting a property to NULL reverts it to the state before it was first set
      //   with the 'reversible' flag enabled
      //
      setStyle: function setStyle(elm, styles, important, reversible) {
        // using '' for standard priority (IE10 apparently doesn't like value undefined)
        var priority = important ? 'important' : '';
        var origStyle = null;

        for (var prop in styles) {
          if (styles.hasOwnProperty(prop)) {
            var setVal = null;

            if (styles[prop] === null) {
              // reverting a property value
              if (!origStyle) {
                // get the original style object, but dont't try to create it if it doesn't exist
                origStyle = jsc.getData(elm, 'origStyle');
              }

              if (origStyle && origStyle.hasOwnProperty(prop)) {
                // we have property's original value -> use it
                setVal = origStyle[prop];
              }
            } else {
              // setting a property value
              if (reversible) {
                if (!origStyle) {
                  // get the original style object and if it doesn't exist, create it
                  origStyle = jsc.getData(elm, 'origStyle', {});
                }

                if (!origStyle.hasOwnProperty(prop)) {
                  // original property value not yet stored -> store it
                  origStyle[prop] = elm.style[prop];
                }
              }

              setVal = styles[prop];
            }

            if (setVal !== null) {
              elm.style.setProperty(prop, setVal, priority);
            }
          }
        }
      },
      linearGradient: function () {
        function getFuncName() {
          var stdName = 'linear-gradient';
          var prefixes = ['', '-webkit-', '-moz-', '-o-', '-ms-'];
          var helper = window.document.createElement('div');

          for (var i = 0; i < prefixes.length; i += 1) {
            var tryFunc = prefixes[i] + stdName;
            var tryVal = tryFunc + '(to right, rgba(0,0,0,0), rgba(0,0,0,0))';
            helper.style.background = tryVal;

            if (helper.style.background) {
              // CSS background successfully set -> function name is supported
              return tryFunc;
            }
          }

          return stdName; // fallback to standard 'linear-gradient' without vendor prefix
        }

        var funcName = getFuncName();
        return function () {
          return funcName + '(' + Array.prototype.join.call(arguments, ', ') + ')';
        };
      }(),
      setBorderRadius: function setBorderRadius(elm, value) {
        jsc.setStyle(elm, {
          'border-radius': value || '0'
        });
      },
      setBoxShadow: function setBoxShadow(elm, value) {
        jsc.setStyle(elm, {
          'box-shadow': value || 'none'
        });
      },
      getElementPos: function getElementPos(e, relativeToViewport) {
        var x = 0,
            y = 0;
        var rect = e.getBoundingClientRect();
        x = rect.left;
        y = rect.top;

        if (!relativeToViewport) {
          var viewPos = jsc.getViewPos();
          x += viewPos[0];
          y += viewPos[1];
        }

        return [x, y];
      },
      getElementSize: function getElementSize(e) {
        return [e.offsetWidth, e.offsetHeight];
      },
      // get pointer's X/Y coordinates relative to viewport
      getAbsPointerPos: function getAbsPointerPos(e) {
        var x = 0,
            y = 0;

        if (typeof e.changedTouches !== 'undefined' && e.changedTouches.length) {
          // touch devices
          x = e.changedTouches[0].clientX;
          y = e.changedTouches[0].clientY;
        } else if (typeof e.clientX === 'number') {
          x = e.clientX;
          y = e.clientY;
        }

        return {
          x: x,
          y: y
        };
      },
      // get pointer's X/Y coordinates relative to target element
      getRelPointerPos: function getRelPointerPos(e) {
        var target = e.target || e.srcElement;
        var targetRect = target.getBoundingClientRect();
        var x = 0,
            y = 0;
        var clientX = 0,
            clientY = 0;

        if (typeof e.changedTouches !== 'undefined' && e.changedTouches.length) {
          // touch devices
          clientX = e.changedTouches[0].clientX;
          clientY = e.changedTouches[0].clientY;
        } else if (typeof e.clientX === 'number') {
          clientX = e.clientX;
          clientY = e.clientY;
        }

        x = clientX - targetRect.left;
        y = clientY - targetRect.top;
        return {
          x: x,
          y: y
        };
      },
      getViewPos: function getViewPos() {
        var doc = window.document.documentElement;
        return [(window.pageXOffset || doc.scrollLeft) - (doc.clientLeft || 0), (window.pageYOffset || doc.scrollTop) - (doc.clientTop || 0)];
      },
      getViewSize: function getViewSize() {
        var doc = window.document.documentElement;
        return [window.innerWidth || doc.clientWidth, window.innerHeight || doc.clientHeight];
      },
      // r: 0-255
      // g: 0-255
      // b: 0-255
      //
      // returns: [ 0-360, 0-100, 0-100 ]
      //
      RGB_HSV: function RGB_HSV(r, g, b) {
        r /= 255;
        g /= 255;
        b /= 255;
        var n = Math.min(Math.min(r, g), b);
        var v = Math.max(Math.max(r, g), b);
        var m = v - n;

        if (m === 0) {
          return [null, 0, 100 * v];
        }

        var h = r === n ? 3 + (b - g) / m : g === n ? 5 + (r - b) / m : 1 + (g - r) / m;
        return [60 * (h === 6 ? 0 : h), 100 * (m / v), 100 * v];
      },
      // h: 0-360
      // s: 0-100
      // v: 0-100
      //
      // returns: [ 0-255, 0-255, 0-255 ]
      //
      HSV_RGB: function HSV_RGB(h, s, v) {
        var u = 255 * (v / 100);

        if (h === null) {
          return [u, u, u];
        }

        h /= 60;
        s /= 100;
        var i = Math.floor(h);
        var f = i % 2 ? h - i : 1 - (h - i);
        var m = u * (1 - s);
        var n = u * (1 - s * f);

        switch (i) {
          case 6:
          case 0:
            return [u, n, m];

          case 1:
            return [n, u, m];

          case 2:
            return [m, u, n];

          case 3:
            return [m, n, u];

          case 4:
            return [n, m, u];

          case 5:
            return [u, m, n];
        }
      },
      parseColorString: function parseColorString(str) {
        var ret = {
          rgba: null,
          format: null // 'hex' | 'rgb' | 'rgba'

        };
        var m;

        if (m = str.match(/^\W*([0-9A-F]{3}([0-9A-F]{3})?)\W*$/i)) {
          // HEX notation
          ret.format = 'hex';

          if (m[1].length === 6) {
            // 6-char notation
            ret.rgba = [parseInt(m[1].substr(0, 2), 16), parseInt(m[1].substr(2, 2), 16), parseInt(m[1].substr(4, 2), 16), null];
          } else {
            // 3-char notation
            ret.rgba = [parseInt(m[1].charAt(0) + m[1].charAt(0), 16), parseInt(m[1].charAt(1) + m[1].charAt(1), 16), parseInt(m[1].charAt(2) + m[1].charAt(2), 16), null];
          }

          return ret;
        } else if (m = str.match(/^\W*rgba?\(([^)]*)\)\W*$/i)) {
          // rgb(...) or rgba(...) notation
          var params = m[1].split(',');
          var re = /^\s*(\d+|\d*\.\d+|\d+\.\d*)\s*$/;
          var mR, mG, mB, mA;

          if (params.length >= 3 && (mR = params[0].match(re)) && (mG = params[1].match(re)) && (mB = params[2].match(re))) {
            ret.format = 'rgb';
            ret.rgba = [parseFloat(mR[1]) || 0, parseFloat(mG[1]) || 0, parseFloat(mB[1]) || 0, null];

            if (params.length >= 4 && (mA = params[3].match(re))) {
              ret.format = 'rgba';
              ret.rgba[3] = parseFloat(mA[1]) || 0;
            }

            return ret;
          }
        }

        return false;
      },
      // Canvas scaling for retina displays
      //
      // adapted from https://www.html5rocks.com/en/tutorials/canvas/hidpi/
      //
      scaleCanvasForHighDPR: function scaleCanvasForHighDPR(canvas) {
        var dpr = window.devicePixelRatio || 1;
        canvas.width *= dpr;
        canvas.height *= dpr;
        var ctx = canvas.getContext('2d');
        ctx.scale(dpr, dpr);
      },
      genColorPreviewCanvas: function genColorPreviewCanvas(color, separatorPos, specWidth, scaleForHighDPR) {
        var sepW = Math.round(jsc.pub.previewSeparator.length);
        var sqSize = jsc.pub.chessboardSize;
        var sqColor1 = jsc.pub.chessboardColor1;
        var sqColor2 = jsc.pub.chessboardColor2;
        var cWidth = specWidth ? specWidth : sqSize * 2;
        var cHeight = sqSize * 2;
        var canvas = jsc.createEl('canvas');
        var ctx = canvas.getContext('2d');
        canvas.width = cWidth;
        canvas.height = cHeight;

        if (scaleForHighDPR) {
          jsc.scaleCanvasForHighDPR(canvas);
        } // transparency chessboard - background


        ctx.fillStyle = sqColor1;
        ctx.fillRect(0, 0, cWidth, cHeight); // transparency chessboard - squares

        ctx.fillStyle = sqColor2;

        for (var x = 0; x < cWidth; x += sqSize * 2) {
          ctx.fillRect(x, 0, sqSize, sqSize);
          ctx.fillRect(x + sqSize, sqSize, sqSize, sqSize);
        }

        if (color) {
          // actual color in foreground
          ctx.fillStyle = color;
          ctx.fillRect(0, 0, cWidth, cHeight);
        }

        var start = null;

        switch (separatorPos) {
          case 'left':
            start = 0;
            ctx.clearRect(0, 0, sepW / 2, cHeight);
            break;

          case 'right':
            start = cWidth - sepW;
            ctx.clearRect(cWidth - sepW / 2, 0, sepW / 2, cHeight);
            break;
        }

        if (start !== null) {
          ctx.lineWidth = 1;

          for (var i = 0; i < jsc.pub.previewSeparator.length; i += 1) {
            ctx.beginPath();
            ctx.strokeStyle = jsc.pub.previewSeparator[i];
            ctx.moveTo(0.5 + start + i, 0);
            ctx.lineTo(0.5 + start + i, cHeight);
            ctx.stroke();
          }
        }

        return {
          canvas: canvas,
          width: cWidth,
          height: cHeight
        };
      },
      // if position or width is not set => fill the entire element (0%-100%)
      genColorPreviewGradient: function genColorPreviewGradient(color, position, width) {
        var params = [];

        if (position && width) {
          params = ['to ' + {
            'left': 'right',
            'right': 'left'
          }[position], color + ' 0%', color + ' ' + width + 'px', 'rgba(0,0,0,0) ' + (width + 1) + 'px', 'rgba(0,0,0,0) 100%'];
        } else {
          params = ['to right', color + ' 0%', color + ' 100%'];
        }

        return jsc.linearGradient.apply(this, params);
      },
      redrawPosition: function redrawPosition() {
        if (jsc.picker && jsc.picker.owner) {
          var thisObj = jsc.picker.owner;
          var tp, vp;

          if (thisObj.fixed) {
            // Fixed elements are positioned relative to viewport,
            // therefore we can ignore the scroll offset
            tp = jsc.getElementPos(thisObj.targetElement, true); // target pos

            vp = [0, 0]; // view pos
          } else {
            tp = jsc.getElementPos(thisObj.targetElement); // target pos

            vp = jsc.getViewPos(); // view pos
          }

          var ts = jsc.getElementSize(thisObj.targetElement); // target size

          var vs = jsc.getViewSize(); // view size

          var ps = jsc.getPickerOuterDims(thisObj); // picker size

          var a, b, c;

          switch (thisObj.position.toLowerCase()) {
            case 'left':
              a = 1;
              b = 0;
              c = -1;
              break;

            case 'right':
              a = 1;
              b = 0;
              c = 1;
              break;

            case 'top':
              a = 0;
              b = 1;
              c = -1;
              break;

            default:
              a = 0;
              b = 1;
              c = 1;
              break;
          }

          var l = (ts[b] + ps[b]) / 2; // compute picker position

          if (!thisObj.smartPosition) {
            var pp = [tp[a], tp[b] + ts[b] - l + l * c];
          } else {
            var pp = [-vp[a] + tp[a] + ps[a] > vs[a] ? -vp[a] + tp[a] + ts[a] / 2 > vs[a] / 2 && tp[a] + ts[a] - ps[a] >= 0 ? tp[a] + ts[a] - ps[a] : tp[a] : tp[a], -vp[b] + tp[b] + ts[b] + ps[b] - l + l * c > vs[b] ? -vp[b] + tp[b] + ts[b] / 2 > vs[b] / 2 && tp[b] + ts[b] - l - l * c >= 0 ? tp[b] + ts[b] - l - l * c : tp[b] + ts[b] - l + l * c : tp[b] + ts[b] - l + l * c >= 0 ? tp[b] + ts[b] - l + l * c : tp[b] + ts[b] - l - l * c];
          }

          var x = pp[a];
          var y = pp[b];
          var positionValue = thisObj.fixed ? 'fixed' : 'absolute';
          var contractShadow = (pp[0] + ps[0] > tp[0] || pp[0] < tp[0] + ts[0]) && pp[1] + ps[1] < tp[1] + ts[1];

          jsc._drawPosition(thisObj, x, y, positionValue, contractShadow);
        }
      },
      _drawPosition: function _drawPosition(thisObj, x, y, positionValue, contractShadow) {
        var vShadow = contractShadow ? 0 : thisObj.shadowBlur; // px

        jsc.picker.wrap.style.position = positionValue;
        jsc.picker.wrap.style.left = x + 'px';
        jsc.picker.wrap.style.top = y + 'px';
        jsc.setBoxShadow(jsc.picker.boxS, thisObj.shadow ? new jsc.BoxShadow(0, vShadow, thisObj.shadowBlur, 0, thisObj.shadowColor) : null);
      },
      getPickerDims: function getPickerDims(thisObj) {
        var dims = [2 * thisObj.controlBorderWidth + 2 * thisObj.padding + thisObj.width, 2 * thisObj.controlBorderWidth + 2 * thisObj.padding + thisObj.height];
        var sliderSpace = 2 * thisObj.controlBorderWidth + 2 * jsc.getControlPadding(thisObj) + thisObj.sliderSize;

        if (jsc.getSliderChannel(thisObj)) {
          dims[0] += sliderSpace;
        }

        if (thisObj.hasAlphaChannel()) {
          dims[0] += sliderSpace;
        }

        if (thisObj.closeButton) {
          dims[1] += 2 * thisObj.controlBorderWidth + thisObj.padding + thisObj.buttonHeight;
        }

        return dims;
      },
      getPickerOuterDims: function getPickerOuterDims(thisObj) {
        var dims = jsc.getPickerDims(thisObj);
        return [dims[0] + 2 * thisObj.borderWidth, dims[1] + 2 * thisObj.borderWidth];
      },
      getControlPadding: function getControlPadding(thisObj) {
        return Math.max(thisObj.padding / 2, 2 * thisObj.pointerBorderWidth + thisObj.pointerThickness - thisObj.controlBorderWidth);
      },
      getPadYChannel: function getPadYChannel(thisObj) {
        switch (thisObj.mode.charAt(1).toLowerCase()) {
          case 'v':
            return 'v';
            break;
        }

        return 's';
      },
      getSliderChannel: function getSliderChannel(thisObj) {
        if (thisObj.mode.length > 2) {
          switch (thisObj.mode.charAt(2).toLowerCase()) {
            case 's':
              return 's';
              break;

            case 'v':
              return 'v';
              break;
          }
        }

        return null;
      },
      onDocumentMouseDown: function onDocumentMouseDown(e) {
        var target = e.target || e.srcElement;

        if (target.jscolor && target.jscolor instanceof jsc.pub) {
          // clicked targetElement -> show picker
          if (target.jscolor.showOnClick && !target.disabled) {
            target.jscolor.show();
          }
        } else if (jsc.getData(target, 'gui')) {
          // clicked jscolor's GUI element
          var control = jsc.getData(target, 'control');

          if (control) {
            // jscolor's control
            jsc.onControlPointerStart(e, target, jsc.getData(target, 'control'), 'mouse');
          }
        } else {
          // mouse is outside the picker's controls -> hide the color picker!
          if (jsc.picker && jsc.picker.owner) {
            jsc.picker.owner.tryHide();
          }
        }
      },
      onDocumentKeyUp: function onDocumentKeyUp(e) {
        if (['Tab', 'Escape'].indexOf(jsc.eventKey(e)) !== -1) {
          if (jsc.picker && jsc.picker.owner) {
            jsc.picker.owner.tryHide();
          }
        }
      },
      onWindowResize: function onWindowResize(e) {
        jsc.redrawPosition();
      },
      onParentScroll: function onParentScroll(e) {
        // hide the picker when one of the parent elements is scrolled
        if (jsc.picker && jsc.picker.owner) {
          jsc.picker.owner.tryHide();
        }
      },
      onPickerTouchStart: function onPickerTouchStart(e) {
        var target = e.target || e.srcElement;

        if (jsc.getData(target, 'control')) {
          jsc.onControlPointerStart(e, target, jsc.getData(target, 'control'), 'touch');
        }
      },
      // calls function specified in picker's property
      triggerCallback: function triggerCallback(thisObj, prop) {
        if (!thisObj[prop]) {
          return; // callback func not specified
        }

        var callback = null;

        if (typeof thisObj[prop] === 'string') {
          // string with code
          try {
            callback = new Function(thisObj[prop]);
          } catch (e) {
            console.error(e);
          }
        } else {
          // function
          callback = thisObj[prop];
        }

        if (callback) {
          callback.call(thisObj);
        }
      },
      // Triggers a color change related event(s) on all picker instances.
      // It is possible to specify multiple events separated with a space.
      triggerGlobal: function triggerGlobal(eventNames) {
        var inst = jsc.getInstances();

        for (var i = 0; i < inst.length; i += 1) {
          inst[i].trigger(eventNames);
        }
      },
      _pointerMoveEvent: {
        mouse: 'mousemove',
        touch: 'touchmove'
      },
      _pointerEndEvent: {
        mouse: 'mouseup',
        touch: 'touchend'
      },
      _pointerOrigin: null,
      _capturedTarget: null,
      onControlPointerStart: function onControlPointerStart(e, target, controlName, pointerType) {
        var thisObj = jsc.getData(target, 'instance');
        jsc.preventDefault(e);
        jsc.captureTarget(target);

        var registerDragEvents = function registerDragEvents(doc, offset) {
          jsc.attachGroupEvent('drag', doc, jsc._pointerMoveEvent[pointerType], jsc.onDocumentPointerMove(e, target, controlName, pointerType, offset));
          jsc.attachGroupEvent('drag', doc, jsc._pointerEndEvent[pointerType], jsc.onDocumentPointerEnd(e, target, controlName, pointerType));
        };

        registerDragEvents(window.document, [0, 0]);

        if (window.parent && window.frameElement) {
          var rect = window.frameElement.getBoundingClientRect();
          var ofs = [-rect.left, -rect.top];
          registerDragEvents(window.parent.window.document, ofs);
        }

        var abs = jsc.getAbsPointerPos(e);
        var rel = jsc.getRelPointerPos(e);
        jsc._pointerOrigin = {
          x: abs.x - rel.x,
          y: abs.y - rel.y
        };

        switch (controlName) {
          case 'pad':
            // if the value slider is at the bottom, move it up
            if (jsc.getSliderChannel(thisObj) === 'v' && thisObj.channels.v === 0) {
              thisObj.fromHSVA(null, null, 100, null);
            }

            jsc.setPad(thisObj, e, 0, 0);
            break;

          case 'sld':
            jsc.setSld(thisObj, e, 0);
            break;

          case 'asld':
            jsc.setASld(thisObj, e, 0);
            break;
        }

        thisObj.trigger('input');
      },
      onDocumentPointerMove: function onDocumentPointerMove(e, target, controlName, pointerType, offset) {
        return function (e) {
          var thisObj = jsc.getData(target, 'instance');

          switch (controlName) {
            case 'pad':
              jsc.setPad(thisObj, e, offset[0], offset[1]);
              break;

            case 'sld':
              jsc.setSld(thisObj, e, offset[1]);
              break;

            case 'asld':
              jsc.setASld(thisObj, e, offset[1]);
              break;
          }

          thisObj.trigger('input');
        };
      },
      onDocumentPointerEnd: function onDocumentPointerEnd(e, target, controlName, pointerType) {
        return function (e) {
          var thisObj = jsc.getData(target, 'instance');
          jsc.detachGroupEvents('drag');
          jsc.releaseTarget(); // Always trigger changes AFTER detaching outstanding mouse handlers,
          // in case some color change occured in user-defined onChange/onInput handler
          // would intrude into current mouse events

          thisObj.trigger('input');
          thisObj.trigger('change');
        };
      },
      setPad: function setPad(thisObj, e, ofsX, ofsY) {
        var pointerAbs = jsc.getAbsPointerPos(e);
        var x = ofsX + pointerAbs.x - jsc._pointerOrigin.x - thisObj.padding - thisObj.controlBorderWidth;
        var y = ofsY + pointerAbs.y - jsc._pointerOrigin.y - thisObj.padding - thisObj.controlBorderWidth;
        var xVal = x * (360 / (thisObj.width - 1));
        var yVal = 100 - y * (100 / (thisObj.height - 1));

        switch (jsc.getPadYChannel(thisObj)) {
          case 's':
            thisObj.fromHSVA(xVal, yVal, null, null);
            break;

          case 'v':
            thisObj.fromHSVA(xVal, null, yVal, null);
            break;
        }
      },
      setSld: function setSld(thisObj, e, ofsY) {
        var pointerAbs = jsc.getAbsPointerPos(e);
        var y = ofsY + pointerAbs.y - jsc._pointerOrigin.y - thisObj.padding - thisObj.controlBorderWidth;
        var yVal = 100 - y * (100 / (thisObj.height - 1));

        switch (jsc.getSliderChannel(thisObj)) {
          case 's':
            thisObj.fromHSVA(null, yVal, null, null);
            break;

          case 'v':
            thisObj.fromHSVA(null, null, yVal, null);
            break;
        }
      },
      setASld: function setASld(thisObj, e, ofsY) {
        var pointerAbs = jsc.getAbsPointerPos(e);
        var y = ofsY + pointerAbs.y - jsc._pointerOrigin.y - thisObj.padding - thisObj.controlBorderWidth;
        var yVal = 1.0 - y * (1.0 / (thisObj.height - 1));

        if (yVal < 1.0) {
          // if format is flexible and the current format doesn't support alpha, switch to a suitable one
          if (thisObj.format.toLowerCase() === 'any' && thisObj.getFormat() !== 'rgba') {
            thisObj._currentFormat = 'rgba';
          }
        }

        thisObj.fromHSVA(null, null, null, yVal);
      },
      createPalette: function createPalette() {
        var paletteObj = {
          elm: null,
          draw: null
        };
        var canvas = jsc.createEl('canvas');
        var ctx = canvas.getContext('2d');

        var drawFunc = function drawFunc(width, height, type) {
          canvas.width = width;
          canvas.height = height;
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          var hGrad = ctx.createLinearGradient(0, 0, canvas.width, 0);
          hGrad.addColorStop(0 / 6, '#F00');
          hGrad.addColorStop(1 / 6, '#FF0');
          hGrad.addColorStop(2 / 6, '#0F0');
          hGrad.addColorStop(3 / 6, '#0FF');
          hGrad.addColorStop(4 / 6, '#00F');
          hGrad.addColorStop(5 / 6, '#F0F');
          hGrad.addColorStop(6 / 6, '#F00');
          ctx.fillStyle = hGrad;
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          var vGrad = ctx.createLinearGradient(0, 0, 0, canvas.height);

          switch (type.toLowerCase()) {
            case 's':
              vGrad.addColorStop(0, 'rgba(255,255,255,0)');
              vGrad.addColorStop(1, 'rgba(255,255,255,1)');
              break;

            case 'v':
              vGrad.addColorStop(0, 'rgba(0,0,0,0)');
              vGrad.addColorStop(1, 'rgba(0,0,0,1)');
              break;
          }

          ctx.fillStyle = vGrad;
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        };

        paletteObj.elm = canvas;
        paletteObj.draw = drawFunc;
        return paletteObj;
      },
      createSliderGradient: function createSliderGradient() {
        var sliderObj = {
          elm: null,
          draw: null
        };
        var canvas = jsc.createEl('canvas');
        var ctx = canvas.getContext('2d');

        var drawFunc = function drawFunc(width, height, color1, color2) {
          canvas.width = width;
          canvas.height = height;
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          var grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
          grad.addColorStop(0, color1);
          grad.addColorStop(1, color2);
          ctx.fillStyle = grad;
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        };

        sliderObj.elm = canvas;
        sliderObj.draw = drawFunc;
        return sliderObj;
      },
      createASliderGradient: function createASliderGradient() {
        var sliderObj = {
          elm: null,
          draw: null
        };
        var canvas = jsc.createEl('canvas');
        var ctx = canvas.getContext('2d');

        var drawFunc = function drawFunc(width, height, color) {
          canvas.width = width;
          canvas.height = height;
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          var sqSize = canvas.width / 2;
          var sqColor1 = jsc.pub.chessboardColor1;
          var sqColor2 = jsc.pub.chessboardColor2; // dark gray background

          ctx.fillStyle = sqColor1;
          ctx.fillRect(0, 0, canvas.width, canvas.height);

          for (var y = 0; y < canvas.height; y += sqSize * 2) {
            // light gray squares
            ctx.fillStyle = sqColor2;
            ctx.fillRect(0, y, sqSize, sqSize);
            ctx.fillRect(sqSize, y + sqSize, sqSize, sqSize);
          }

          var grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
          grad.addColorStop(0, color);
          grad.addColorStop(1, 'rgba(0,0,0,0)');
          ctx.fillStyle = grad;
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        };

        sliderObj.elm = canvas;
        sliderObj.draw = drawFunc;
        return sliderObj;
      },
      BoxShadow: function () {
        var BoxShadow = function BoxShadow(hShadow, vShadow, blur, spread, color, inset) {
          this.hShadow = hShadow;
          this.vShadow = vShadow;
          this.blur = blur;
          this.spread = spread;
          this.color = color;
          this.inset = !!inset;
        };

        BoxShadow.prototype.toString = function () {
          var vals = [Math.round(this.hShadow) + 'px', Math.round(this.vShadow) + 'px', Math.round(this.blur) + 'px', Math.round(this.spread) + 'px', this.color];

          if (this.inset) {
            vals.push('inset');
          }

          return vals.join(' ');
        };

        return BoxShadow;
      }(),
      flags: {
        leaveValue: 1 << 0,
        leaveAlpha: 1 << 1,
        leavePreview: 1 << 2
      },
      enumOpts: {
        format: ['auto', 'any', 'hex', 'rgb', 'rgba'],
        previewPosition: ['left', 'right'],
        mode: ['hsv', 'hvs', 'hs', 'hv'],
        position: ['left', 'right', 'top', 'bottom'],
        alphaChannel: ['auto', true, false]
      },
      deprecatedOpts: {
        // <old_option>: <new_option>  (<new_option> can be null)
        'styleElement': 'previewElement',
        'onFineChange': 'onInput',
        'overwriteImportant': 'forceStyle',
        'closable': 'closeButton',
        'insetWidth': 'controlBorderWidth',
        'insetColor': 'controlBorderColor',
        'refine': null
      },
      docsRef: ' ' + 'See https://jscolor.com/docs/',
      //
      // Usage:
      // var myPicker = new JSColor(<targetElement> [, <options>])
      //
      // (constructor is accessible via both 'jscolor' and 'JSColor' name)
      //
      pub: function pub(targetElement, opts) {
        var THIS = this;

        if (!opts) {
          opts = {};
        }

        this.channels = {
          r: 255,
          // red [0-255]
          g: 255,
          // green [0-255]
          b: 255,
          // blue [0-255]
          h: 0,
          // hue [0-360]
          s: 0,
          // saturation [0-100]
          v: 100,
          // value (brightness) [0-100]
          a: 1.0 // alpha (opacity) [0.0 - 1.0]

        }; // General options
        //

        this.format = 'auto'; // 'auto' | 'any' | 'hex' | 'rgb' | 'rgba' - Format of the input/output value

        this.value = undefined; // INITIAL color value in any supported format. To change it later, use method fromString(), fromHSVA(), fromRGBA() or channel()

        this.alpha = undefined; // INITIAL alpha value. To change it later, call method channel('A', <value>)

        this.onChange = undefined; // called when color changes. Value can be either a function or a string with JS code.

        this.onInput = undefined; // called repeatedly as the color is being changed, e.g. while dragging a slider. Value can be either a function or a string with JS code.

        this.valueElement = undefined; // element that will be used to display and input the color value

        this.alphaElement = undefined; // element that will be used to display and input the alpha (opacity) value

        this.previewElement = undefined; // element that will preview the picked color using CSS background

        this.previewPosition = 'left'; // 'left' | 'right' - position of the color preview in previewElement

        this.previewSize = 32; // (px) width of the color preview displayed in previewElement

        this.previewPadding = 8; // (px) space between color preview and content of the previewElement

        this.required = true; // whether the associated text input must always contain a color value. If false, the input can be left empty.

        this.hash = true; // whether to prefix the HEX color code with # symbol (only applicable for HEX format)

        this.uppercase = true; // whether to show the HEX color code in upper case (only applicable for HEX format)

        this.forceStyle = true; // whether to overwrite CSS style of the previewElement using !important flag
        // Color Picker options
        //

        this.width = 181; // width of color palette (in px)

        this.height = 101; // height of color palette (in px)

        this.mode = 'HSV'; // 'HSV' | 'HVS' | 'HS' | 'HV' - layout of the color picker controls

        this.alphaChannel = 'auto'; // 'auto' | true | false - if alpha channel is enabled, the alpha slider will be visible. If 'auto', it will be determined according to color format

        this.position = 'bottom'; // 'left' | 'right' | 'top' | 'bottom' - position relative to the target element

        this.smartPosition = true; // automatically change picker position when there is not enough space for it

        this.showOnClick = true; // whether to show the picker when user clicks its target element

        this.hideOnLeave = true; // whether to automatically hide the picker when user leaves its target element (e.g. upon clicking the document)

        this.sliderSize = 16; // px

        this.crossSize = 8; // px

        this.closeButton = false; // whether to display the Close button

        this.closeText = 'Close';
        this.buttonColor = 'rgba(0,0,0,1)'; // CSS color

        this.buttonHeight = 18; // px

        this.padding = 12; // px

        this.backgroundColor = 'rgba(255,255,255,1)'; // CSS color

        this.borderWidth = 1; // px

        this.borderColor = 'rgba(187,187,187,1)'; // CSS color

        this.borderRadius = 8; // px

        this.controlBorderWidth = 1; // px

        this.controlBorderColor = 'rgba(187,187,187,1)'; // CSS color

        this.shadow = true; // whether to display a shadow

        this.shadowBlur = 15; // px

        this.shadowColor = 'rgba(0,0,0,0.2)'; // CSS color

        this.pointerColor = 'rgba(76,76,76,1)'; // CSS color

        this.pointerBorderWidth = 1; // px

        this.pointerBorderColor = 'rgba(255,255,255,1)'; // CSS color

        this.pointerThickness = 2; // px

        this.zIndex = 5000;
        this.container = undefined; // where to append the color picker (BODY element by default)
        // Experimental
        //

        this.minS = 0; // min allowed saturation (0 - 100)

        this.maxS = 100; // max allowed saturation (0 - 100)

        this.minV = 0; // min allowed value (brightness) (0 - 100)

        this.maxV = 100; // max allowed value (brightness) (0 - 100)

        this.minA = 0.0; // min allowed alpha (opacity) (0.0 - 1.0)

        this.maxA = 1.0; // max allowed alpha (opacity) (0.0 - 1.0)
        // let's process the DEPRECATED 'options' property (this will be later removed)

        if (jsc.pub.options) {
          // let's set custom default options, if specified
          for (var opt in jsc.pub.options) {
            if (jsc.pub.options.hasOwnProperty(opt)) {
              try {
                setOption(opt, jsc.pub.options[opt]);
              } catch (e) {
                console.warn(e);
              }
            }
          }
        } // let's apply configuration presets
        //


        var presetsArr = [];

        if (opts.preset) {
          if (typeof opts.preset === 'string') {
            presetsArr = opts.preset.split(/\s+/);
          } else if (Array.isArray(opts.preset)) {
            presetsArr = opts.preset.slice(); // slice() to clone
          } else {
            console.warn('Unrecognized preset value');
          }
        } // always use the 'default' preset. If it's not listed, append it to the end.


        if (presetsArr.indexOf('default') === -1) {
          presetsArr.push('default');
        } // let's apply the presets in reverse order, so that should there be any overlapping options,
        // the formerly listed preset will override the latter


        for (var i = presetsArr.length - 1; i >= 0; i -= 1) {
          var pres = presetsArr[i];

          if (!pres) {
            continue; // preset is empty string
          }

          if (!jsc.pub.presets.hasOwnProperty(pres)) {
            console.warn('Unknown preset: %s', pres);
            continue;
          }

          for (var opt in jsc.pub.presets[pres]) {
            if (jsc.pub.presets[pres].hasOwnProperty(opt)) {
              try {
                setOption(opt, jsc.pub.presets[pres][opt]);
              } catch (e) {
                console.warn(e);
              }
            }
          }
        } // let's set specific options for this color picker


        var nonProperties = [// these options won't be set as instance properties
        'preset'];

        for (var opt in opts) {
          if (opts.hasOwnProperty(opt)) {
            if (nonProperties.indexOf(opt) === -1) {
              try {
                setOption(opt, opts[opt]);
              } catch (e) {
                console.warn(e);
              }
            }
          }
        } // Getter: option(name)
        // Setter: option(name, value)
        //         option({name:value, ...})
        //


        this.option = function () {
          if (!arguments.length) {
            throw new Error('No option specified');
          }

          if (arguments.length === 1 && typeof arguments[0] === 'string') {
            // getting a single option
            try {
              return getOption(arguments[0]);
            } catch (e) {
              console.warn(e);
            }

            return false;
          } else if (arguments.length >= 2 && typeof arguments[0] === 'string') {
            // setting a single option
            try {
              if (!setOption(arguments[0], arguments[1])) {
                return false;
              }
            } catch (e) {
              console.warn(e);
              return false;
            }

            this.redraw(); // immediately redraws the picker, if it's displayed

            this.exposeColor(); // in case some preview-related or format-related option was changed

            return true;
          } else if (arguments.length === 1 && (0, _typeof2.default)(arguments[0]) === 'object') {
            // setting multiple options
            var opts = arguments[0];
            var success = true;

            for (var opt in opts) {
              if (opts.hasOwnProperty(opt)) {
                try {
                  if (!setOption(opt, opts[opt])) {
                    success = false;
                  }
                } catch (e) {
                  console.warn(e);
                  success = false;
                }
              }
            }

            this.redraw(); // immediately redraws the picker, if it's displayed

            this.exposeColor(); // in case some preview-related or format-related option was changed

            return success;
          }

          throw new Error('Invalid arguments');
        }; // Getter: channel(name)
        // Setter: channel(name, value)
        //


        this.channel = function (name, value) {
          if (typeof name !== 'string') {
            throw new Error('Invalid value for channel name: ' + name);
          }

          if (value === undefined) {
            // getting channel value
            if (!this.channels.hasOwnProperty(name.toLowerCase())) {
              console.warn('Getting unknown channel: ' + name);
              return false;
            }

            return this.channels[name.toLowerCase()];
          } else {
            // setting channel value
            var res = false;

            switch (name.toLowerCase()) {
              case 'r':
                res = this.fromRGBA(value, null, null, null);
                break;

              case 'g':
                res = this.fromRGBA(null, value, null, null);
                break;

              case 'b':
                res = this.fromRGBA(null, null, value, null);
                break;

              case 'h':
                res = this.fromHSVA(value, null, null, null);
                break;

              case 's':
                res = this.fromHSVA(null, value, null, null);
                break;

              case 'v':
                res = this.fromHSVA(null, null, value, null);
                break;

              case 'a':
                res = this.fromHSVA(null, null, null, value);
                break;

              default:
                console.warn('Setting unknown channel: ' + name);
                return false;
            }

            if (res) {
              this.redraw(); // immediately redraws the picker, if it's displayed

              return true;
            }
          }

          return false;
        }; // Triggers given input event(s) by:
        // - executing on<Event> callback specified as picker's option
        // - triggering standard DOM event listeners attached to the value element
        //
        // It is possible to specify multiple events separated with a space.
        //


        this.trigger = function (eventNames) {
          var evs = jsc.strList(eventNames);

          for (var i = 0; i < evs.length; i += 1) {
            var ev = evs[i].toLowerCase(); // trigger a callback

            var callbackProp = null;

            switch (ev) {
              case 'input':
                callbackProp = 'onInput';
                break;

              case 'change':
                callbackProp = 'onChange';
                break;
            }

            if (callbackProp) {
              jsc.triggerCallback(this, callbackProp);
            } // trigger standard DOM event listeners on the value element


            jsc.triggerInputEvent(this.valueElement, ev, true, true);
          }
        }; // h: 0-360
        // s: 0-100
        // v: 0-100
        // a: 0.0-1.0
        //


        this.fromHSVA = function (h, s, v, a, flags) {
          // null = don't change
          if (h === undefined) {
            h = null;
          }

          if (s === undefined) {
            s = null;
          }

          if (v === undefined) {
            v = null;
          }

          if (a === undefined) {
            a = null;
          }

          if (h !== null) {
            if (isNaN(h)) {
              return false;
            }

            this.channels.h = Math.max(0, Math.min(360, h));
          }

          if (s !== null) {
            if (isNaN(s)) {
              return false;
            }

            this.channels.s = Math.max(0, Math.min(100, this.maxS, s), this.minS);
          }

          if (v !== null) {
            if (isNaN(v)) {
              return false;
            }

            this.channels.v = Math.max(0, Math.min(100, this.maxV, v), this.minV);
          }

          if (a !== null) {
            if (isNaN(a)) {
              return false;
            }

            this.channels.a = this.hasAlphaChannel() ? Math.max(0, Math.min(1, this.maxA, a), this.minA) : 1.0; // if alpha channel is disabled, the color should stay 100% opaque
          }

          var rgb = jsc.HSV_RGB(this.channels.h, this.channels.s, this.channels.v);
          this.channels.r = rgb[0];
          this.channels.g = rgb[1];
          this.channels.b = rgb[2];
          this.exposeColor(flags);
          return true;
        }; // r: 0-255
        // g: 0-255
        // b: 0-255
        // a: 0.0-1.0
        //


        this.fromRGBA = function (r, g, b, a, flags) {
          // null = don't change
          if (r === undefined) {
            r = null;
          }

          if (g === undefined) {
            g = null;
          }

          if (b === undefined) {
            b = null;
          }

          if (a === undefined) {
            a = null;
          }

          if (r !== null) {
            if (isNaN(r)) {
              return false;
            }

            r = Math.max(0, Math.min(255, r));
          }

          if (g !== null) {
            if (isNaN(g)) {
              return false;
            }

            g = Math.max(0, Math.min(255, g));
          }

          if (b !== null) {
            if (isNaN(b)) {
              return false;
            }

            b = Math.max(0, Math.min(255, b));
          }

          if (a !== null) {
            if (isNaN(a)) {
              return false;
            }

            this.channels.a = this.hasAlphaChannel() ? Math.max(0, Math.min(1, this.maxA, a), this.minA) : 1.0; // if alpha channel is disabled, the color should stay 100% opaque
          }

          var hsv = jsc.RGB_HSV(r === null ? this.channels.r : r, g === null ? this.channels.g : g, b === null ? this.channels.b : b);

          if (hsv[0] !== null) {
            this.channels.h = Math.max(0, Math.min(360, hsv[0]));
          }

          if (hsv[2] !== 0) {
            // fully black color stays black through entire saturation range, so let's not change saturation
            this.channels.s = Math.max(0, this.minS, Math.min(100, this.maxS, hsv[1]));
          }

          this.channels.v = Math.max(0, this.minV, Math.min(100, this.maxV, hsv[2])); // update RGB according to final HSV, as some values might be trimmed

          var rgb = jsc.HSV_RGB(this.channels.h, this.channels.s, this.channels.v);
          this.channels.r = rgb[0];
          this.channels.g = rgb[1];
          this.channels.b = rgb[2];
          this.exposeColor(flags);
          return true;
        }; // DEPRECATED. Use .fromHSVA() instead
        //


        this.fromHSV = function (h, s, v, flags) {
          console.warn('fromHSV() method is DEPRECATED. Using fromHSVA() instead.' + jsc.docsRef);
          return this.fromHSVA(h, s, v, null, flags);
        }; // DEPRECATED. Use .fromRGBA() instead
        //


        this.fromRGB = function (r, g, b, flags) {
          console.warn('fromRGB() method is DEPRECATED. Using fromRGBA() instead.' + jsc.docsRef);
          return this.fromRGBA(r, g, b, null, flags);
        };

        this.fromString = function (str, flags) {
          if (!this.required && str.trim() === '') {
            // setting empty string to an optional color input
            this.setPreviewElementBg(null);
            this.setValueElementValue('');
            return true;
          }

          var color = jsc.parseColorString(str);

          if (!color) {
            return false; // could not parse
          }

          if (this.format.toLowerCase() === 'any') {
            this._currentFormat = color.format; // adapt format

            if (this.getFormat() !== 'rgba') {
              color.rgba[3] = 1.0; // when switching to a format that doesn't support alpha, set full opacity
            }

            this.redraw(); // to show/hide the alpha slider according to current format
          }

          this.fromRGBA(color.rgba[0], color.rgba[1], color.rgba[2], color.rgba[3], flags);
          return true;
        };

        this.toString = function (format) {
          if (format === undefined) {
            format = this.getFormat(); // format not specified -> use the current format
          }

          switch (format.toLowerCase()) {
            case 'hex':
              return this.toHEXString();
              break;

            case 'rgb':
              return this.toRGBString();
              break;

            case 'rgba':
              return this.toRGBAString();
              break;
          }

          return false;
        };

        this.toHEXString = function () {
          return '#' + (('0' + Math.round(this.channels.r).toString(16)).substr(-2) + ('0' + Math.round(this.channels.g).toString(16)).substr(-2) + ('0' + Math.round(this.channels.b).toString(16)).substr(-2)).toUpperCase();
        };

        this.toRGBString = function () {
          return 'rgb(' + Math.round(this.channels.r) + ',' + Math.round(this.channels.g) + ',' + Math.round(this.channels.b) + ')';
        };

        this.toRGBAString = function () {
          return 'rgba(' + Math.round(this.channels.r) + ',' + Math.round(this.channels.g) + ',' + Math.round(this.channels.b) + ',' + Math.round(this.channels.a * 100) / 100 + ')';
        };

        this.toGrayscale = function () {
          return 0.213 * this.channels.r + 0.715 * this.channels.g + 0.072 * this.channels.b;
        };

        this.toCanvas = function () {
          return jsc.genColorPreviewCanvas(this.toRGBAString()).canvas;
        };

        this.toDataURL = function () {
          return this.toCanvas().toDataURL();
        };

        this.toBackground = function () {
          return jsc.pub.background(this.toRGBAString());
        };

        this.isLight = function () {
          return this.toGrayscale() > 255 / 2;
        };

        this.hide = function () {
          if (isPickerOwner()) {
            detachPicker();
          }
        };

        this.show = function () {
          drawPicker();
        };

        this.redraw = function () {
          if (isPickerOwner()) {
            drawPicker();
          }
        };

        this.getFormat = function () {
          return this._currentFormat;
        };

        this.hasAlphaChannel = function () {
          if (this.alphaChannel === 'auto') {
            return this.format.toLowerCase() === 'any' || // format can change on the fly (e.g. from hex to rgba), so let's consider the alpha channel enabled
            this.getFormat() === 'rgba' || // the current format supports alpha channel
            this.alpha !== undefined || // initial alpha value is set, so we're working with alpha channel
            this.alphaElement !== undefined // the alpha value is redirected, so we're working with alpha channel
            ;
          }

          return this.alphaChannel; // the alpha channel is explicitly set
        };

        this.processValueInput = function (str) {
          if (!this.fromString(str)) {
            // could not parse the color value - let's just expose the current color
            this.exposeColor();
          }
        };

        this.processAlphaInput = function (str) {
          if (!this.fromHSVA(null, null, null, parseFloat(str))) {
            // could not parse the alpha value - let's just expose the current color
            this.exposeColor();
          }
        };

        this.exposeColor = function (flags) {
          if (!(flags & jsc.flags.leaveValue) && this.valueElement) {
            var value = this.toString();

            if (this.getFormat() === 'hex') {
              if (!this.uppercase) {
                value = value.toLowerCase();
              }

              if (!this.hash) {
                value = value.replace(/^#/, '');
              }
            }

            this.setValueElementValue(value);
          }

          if (!(flags & jsc.flags.leaveAlpha) && this.alphaElement) {
            var value = Math.round(this.channels.a * 100) / 100;
            this.setAlphaElementValue(value);
          }

          if (!(flags & jsc.flags.leavePreview) && this.previewElement) {
            var previewPos = null; // 'left' | 'right' (null -> fill the entire element)

            if (jsc.isTextInput(this.previewElement) || // text input
            jsc.isButton(this.previewElement) && !jsc.isButtonEmpty(this.previewElement) // button with text
            ) {
                previewPos = this.previewPosition;
              }

            this.setPreviewElementBg(this.toRGBAString());
          }

          if (isPickerOwner()) {
            redrawPad();
            redrawSld();
            redrawASld();
          }
        };

        this.setPreviewElementBg = function (color) {
          if (!this.previewElement) {
            return;
          }

          var position = null; // color preview position:  null | 'left' | 'right'

          var width = null; // color preview width:  px | null = fill the entire element

          if (jsc.isTextInput(this.previewElement) || // text input
          jsc.isButton(this.previewElement) && !jsc.isButtonEmpty(this.previewElement) // button with text
          ) {
              position = this.previewPosition;
              width = this.previewSize;
            }

          var backgrounds = [];

          if (!color) {
            // there is no color preview to display -> let's remove any previous background image
            backgrounds.push({
              image: 'none',
              position: 'left top',
              size: 'auto',
              repeat: 'no-repeat',
              origin: 'padding-box'
            });
          } else {
            // CSS gradient for background color preview
            backgrounds.push({
              image: jsc.genColorPreviewGradient(color, position, width ? width - jsc.pub.previewSeparator.length : null),
              position: 'left top',
              size: 'auto',
              repeat: position ? 'repeat-y' : 'repeat',
              origin: 'padding-box'
            }); // data URL of generated PNG image with a gray transparency chessboard

            var preview = jsc.genColorPreviewCanvas('rgba(0,0,0,0)', position ? {
              'left': 'right',
              'right': 'left'
            }[position] : null, width, true);
            backgrounds.push({
              image: 'url(\'' + preview.canvas.toDataURL() + '\')',
              position: (position || 'left') + ' top',
              size: preview.width + 'px ' + preview.height + 'px',
              repeat: position ? 'repeat-y' : 'repeat',
              origin: 'padding-box'
            });
          }

          var bg = {
            image: [],
            position: [],
            size: [],
            repeat: [],
            origin: []
          };

          for (var i = 0; i < backgrounds.length; i += 1) {
            bg.image.push(backgrounds[i].image);
            bg.position.push(backgrounds[i].position);
            bg.size.push(backgrounds[i].size);
            bg.repeat.push(backgrounds[i].repeat);
            bg.origin.push(backgrounds[i].origin);
          } // set previewElement's background-images


          var sty = {
            'background-image': bg.image.join(', '),
            'background-position': bg.position.join(', '),
            'background-size': bg.size.join(', '),
            'background-repeat': bg.repeat.join(', '),
            'background-origin': bg.origin.join(', ')
          };
          jsc.setStyle(this.previewElement, sty, this.forceStyle); // set/restore previewElement's padding

          var padding = {
            left: null,
            right: null
          };

          if (position) {
            padding[position] = this.previewSize + this.previewPadding + 'px';
          }

          var sty = {
            'padding-left': padding.left,
            'padding-right': padding.right
          };
          jsc.setStyle(this.previewElement, sty, this.forceStyle, true);
        };

        this.setValueElementValue = function (str) {
          if (this.valueElement) {
            if (jsc.nodeName(this.valueElement) === 'input') {
              this.valueElement.value = str;
            } else {
              this.valueElement.innerHTML = str;
            }
          }
        };

        this.setAlphaElementValue = function (str) {
          if (this.alphaElement) {
            if (jsc.nodeName(this.alphaElement) === 'input') {
              this.alphaElement.value = str;
            } else {
              this.alphaElement.innerHTML = str;
            }
          }
        };

        this._processParentElementsInDOM = function () {
          if (this._linkedElementsProcessed) {
            return;
          }

          this._linkedElementsProcessed = true;
          var elm = this.targetElement;

          do {
            // If the target element or one of its parent nodes has fixed position,
            // then use fixed positioning instead
            var compStyle = jsc.getCompStyle(elm);

            if (compStyle.position && compStyle.position.toLowerCase() === 'fixed') {
              this.fixed = true;
            }

            if (elm !== this.targetElement) {
              // Ensure to attach onParentScroll only once to each parent element
              // (multiple targetElements can share the same parent nodes)
              //
              // Note: It's not just offsetParents that can be scrollable,
              // that's why we loop through all parent nodes
              if (!jsc.getData(elm, 'hasScrollListener')) {
                elm.addEventListener('scroll', jsc.onParentScroll, false);
                jsc.setData(elm, 'hasScrollListener', true);
              }
            }
          } while ((elm = elm.parentNode) && jsc.nodeName(elm) !== 'body');
        };

        this.tryHide = function () {
          if (this.hideOnLeave) {
            this.hide();
          }
        };

        function setOption(option, value) {
          if (typeof option !== 'string') {
            throw new Error('Invalid value for option name: ' + option);
          } // enum option


          if (jsc.enumOpts.hasOwnProperty(option)) {
            if (typeof value === 'string') {
              // enum string values are case insensitive
              value = value.toLowerCase();
            }

            if (jsc.enumOpts[option].indexOf(value) === -1) {
              throw new Error('Option \'' + option + '\' has invalid value: ' + value);
            }
          } // deprecated option


          if (jsc.deprecatedOpts.hasOwnProperty(option)) {
            var oldOpt = option;
            var newOpt = jsc.deprecatedOpts[option];

            if (newOpt) {
              // if we have a new name for this option, let's log a warning and use the new name
              console.warn('Option \'%s\' is DEPRECATED, using \'%s\' instead.' + jsc.docsRef, oldOpt, newOpt);
              option = newOpt;
            } else {
              // new name not available for the option
              throw new Error('Option \'' + option + '\' is DEPRECATED');
            }
          }

          if (!(option in THIS)) {
            throw new Error('Unrecognized configuration option: ' + option);
          }

          THIS[option] = value;
          return true;
        }

        function getOption(option) {
          // deprecated option
          if (jsc.deprecatedOpts.hasOwnProperty(option)) {
            var oldOpt = option;
            var newOpt = jsc.deprecatedOpts[option];

            if (newOpt) {
              // if we have a new name for this option, let's log a warning and use the new name
              console.warn('Option \'%s\' is DEPRECATED, using \'%s\' instead.' + jsc.docsRef, oldOpt, newOpt);
              option = newOpt;
            } else {
              // new name not available for the option
              throw new Error('Option \'' + option + '\' is DEPRECATED');
            }
          }

          if (!(option in THIS)) {
            throw new Error('Unrecognized configuration option: ' + option);
          }

          return THIS[option];
        }

        function detachPicker() {
          jsc.removeClass(THIS.targetElement, jsc.pub.activeClassName);
          jsc.picker.wrap.parentNode.removeChild(jsc.picker.wrap);
          delete jsc.picker.owner;
        }

        function drawPicker() {
          // At this point, when drawing the picker, we know what the parent elements are
          // and we can do all related DOM operations, such as registering events on them
          // or checking their positioning
          THIS._processParentElementsInDOM();

          if (!jsc.picker) {
            jsc.picker = {
              owner: null,
              // owner picker instance
              wrap: jsc.createEl('div'),
              box: jsc.createEl('div'),
              boxS: jsc.createEl('div'),
              // shadow area
              boxB: jsc.createEl('div'),
              // border
              pad: jsc.createEl('div'),
              padB: jsc.createEl('div'),
              // border
              padM: jsc.createEl('div'),
              // mouse/touch area
              padPal: jsc.createPalette(),
              cross: jsc.createEl('div'),
              crossBY: jsc.createEl('div'),
              // border Y
              crossBX: jsc.createEl('div'),
              // border X
              crossLY: jsc.createEl('div'),
              // line Y
              crossLX: jsc.createEl('div'),
              // line X
              sld: jsc.createEl('div'),
              // slider
              sldB: jsc.createEl('div'),
              // border
              sldM: jsc.createEl('div'),
              // mouse/touch area
              sldGrad: jsc.createSliderGradient(),
              sldPtrS: jsc.createEl('div'),
              // slider pointer spacer
              sldPtrIB: jsc.createEl('div'),
              // slider pointer inner border
              sldPtrMB: jsc.createEl('div'),
              // slider pointer middle border
              sldPtrOB: jsc.createEl('div'),
              // slider pointer outer border
              asld: jsc.createEl('div'),
              // alpha slider
              asldB: jsc.createEl('div'),
              // border
              asldM: jsc.createEl('div'),
              // mouse/touch area
              asldGrad: jsc.createASliderGradient(),
              asldPtrS: jsc.createEl('div'),
              // slider pointer spacer
              asldPtrIB: jsc.createEl('div'),
              // slider pointer inner border
              asldPtrMB: jsc.createEl('div'),
              // slider pointer middle border
              asldPtrOB: jsc.createEl('div'),
              // slider pointer outer border
              btn: jsc.createEl('div'),
              btnT: jsc.createEl('span') // text

            };
            jsc.picker.pad.appendChild(jsc.picker.padPal.elm);
            jsc.picker.padB.appendChild(jsc.picker.pad);
            jsc.picker.cross.appendChild(jsc.picker.crossBY);
            jsc.picker.cross.appendChild(jsc.picker.crossBX);
            jsc.picker.cross.appendChild(jsc.picker.crossLY);
            jsc.picker.cross.appendChild(jsc.picker.crossLX);
            jsc.picker.padB.appendChild(jsc.picker.cross);
            jsc.picker.box.appendChild(jsc.picker.padB);
            jsc.picker.box.appendChild(jsc.picker.padM);
            jsc.picker.sld.appendChild(jsc.picker.sldGrad.elm);
            jsc.picker.sldB.appendChild(jsc.picker.sld);
            jsc.picker.sldB.appendChild(jsc.picker.sldPtrOB);
            jsc.picker.sldPtrOB.appendChild(jsc.picker.sldPtrMB);
            jsc.picker.sldPtrMB.appendChild(jsc.picker.sldPtrIB);
            jsc.picker.sldPtrIB.appendChild(jsc.picker.sldPtrS);
            jsc.picker.box.appendChild(jsc.picker.sldB);
            jsc.picker.box.appendChild(jsc.picker.sldM);
            jsc.picker.asld.appendChild(jsc.picker.asldGrad.elm);
            jsc.picker.asldB.appendChild(jsc.picker.asld);
            jsc.picker.asldB.appendChild(jsc.picker.asldPtrOB);
            jsc.picker.asldPtrOB.appendChild(jsc.picker.asldPtrMB);
            jsc.picker.asldPtrMB.appendChild(jsc.picker.asldPtrIB);
            jsc.picker.asldPtrIB.appendChild(jsc.picker.asldPtrS);
            jsc.picker.box.appendChild(jsc.picker.asldB);
            jsc.picker.box.appendChild(jsc.picker.asldM);
            jsc.picker.btn.appendChild(jsc.picker.btnT);
            jsc.picker.box.appendChild(jsc.picker.btn);
            jsc.picker.boxB.appendChild(jsc.picker.box);
            jsc.picker.wrap.appendChild(jsc.picker.boxS);
            jsc.picker.wrap.appendChild(jsc.picker.boxB);
            jsc.picker.wrap.addEventListener('touchstart', jsc.onPickerTouchStart, jsc.isPassiveEventSupported ? {
              passive: false
            } : false);
          }

          var p = jsc.picker;
          var displaySlider = !!jsc.getSliderChannel(THIS);
          var displayAlphaSlider = THIS.hasAlphaChannel();
          var dims = jsc.getPickerDims(THIS);
          var crossOuterSize = 2 * THIS.pointerBorderWidth + THIS.pointerThickness + 2 * THIS.crossSize;
          var controlPadding = jsc.getControlPadding(THIS);
          var borderRadius = Math.min(THIS.borderRadius, Math.round(THIS.padding * Math.PI)); // px

          var padCursor = 'crosshair'; // wrap

          p.wrap.className = 'jscolor-picker-wrap';
          p.wrap.style.clear = 'both';
          p.wrap.style.width = dims[0] + 2 * THIS.borderWidth + 'px';
          p.wrap.style.height = dims[1] + 2 * THIS.borderWidth + 'px';
          p.wrap.style.zIndex = THIS.zIndex; // picker

          p.box.className = 'jscolor-picker';
          p.box.style.width = dims[0] + 'px';
          p.box.style.height = dims[1] + 'px';
          p.box.style.position = 'relative'; // picker shadow

          p.boxS.className = 'jscolor-picker-shadow';
          p.boxS.style.position = 'absolute';
          p.boxS.style.left = '0';
          p.boxS.style.top = '0';
          p.boxS.style.width = '100%';
          p.boxS.style.height = '100%';
          jsc.setBorderRadius(p.boxS, borderRadius + 'px'); // picker border

          p.boxB.className = 'jscolor-picker-border';
          p.boxB.style.position = 'relative';
          p.boxB.style.border = THIS.borderWidth + 'px solid';
          p.boxB.style.borderColor = THIS.borderColor;
          p.boxB.style.background = THIS.backgroundColor;
          jsc.setBorderRadius(p.boxB, borderRadius + 'px'); // IE hack:
          // If the element is transparent, IE will trigger the event on the elements under it,
          // e.g. on Canvas or on elements with border

          p.padM.style.background = 'rgba(255,0,0,.2)';
          p.sldM.style.background = 'rgba(0,255,0,.2)';
          p.asldM.style.background = 'rgba(0,0,255,.2)';
          p.padM.style.opacity = p.sldM.style.opacity = p.asldM.style.opacity = '0'; // pad

          p.pad.style.position = 'relative';
          p.pad.style.width = THIS.width + 'px';
          p.pad.style.height = THIS.height + 'px'; // pad palettes (HSV and HVS)

          p.padPal.draw(THIS.width, THIS.height, jsc.getPadYChannel(THIS)); // pad border

          p.padB.style.position = 'absolute';
          p.padB.style.left = THIS.padding + 'px';
          p.padB.style.top = THIS.padding + 'px';
          p.padB.style.border = THIS.controlBorderWidth + 'px solid';
          p.padB.style.borderColor = THIS.controlBorderColor; // pad mouse area

          p.padM.style.position = 'absolute';
          p.padM.style.left = 0 + 'px';
          p.padM.style.top = 0 + 'px';
          p.padM.style.width = THIS.padding + 2 * THIS.controlBorderWidth + THIS.width + controlPadding + 'px';
          p.padM.style.height = 2 * THIS.controlBorderWidth + 2 * THIS.padding + THIS.height + 'px';
          p.padM.style.cursor = padCursor;
          jsc.setData(p.padM, {
            instance: THIS,
            control: 'pad'
          }); // pad cross

          p.cross.style.position = 'absolute';
          p.cross.style.left = p.cross.style.top = '0';
          p.cross.style.width = p.cross.style.height = crossOuterSize + 'px'; // pad cross border Y and X

          p.crossBY.style.position = p.crossBX.style.position = 'absolute';
          p.crossBY.style.background = p.crossBX.style.background = THIS.pointerBorderColor;
          p.crossBY.style.width = p.crossBX.style.height = 2 * THIS.pointerBorderWidth + THIS.pointerThickness + 'px';
          p.crossBY.style.height = p.crossBX.style.width = crossOuterSize + 'px';
          p.crossBY.style.left = p.crossBX.style.top = Math.floor(crossOuterSize / 2) - Math.floor(THIS.pointerThickness / 2) - THIS.pointerBorderWidth + 'px';
          p.crossBY.style.top = p.crossBX.style.left = '0'; // pad cross line Y and X

          p.crossLY.style.position = p.crossLX.style.position = 'absolute';
          p.crossLY.style.background = p.crossLX.style.background = THIS.pointerColor;
          p.crossLY.style.height = p.crossLX.style.width = crossOuterSize - 2 * THIS.pointerBorderWidth + 'px';
          p.crossLY.style.width = p.crossLX.style.height = THIS.pointerThickness + 'px';
          p.crossLY.style.left = p.crossLX.style.top = Math.floor(crossOuterSize / 2) - Math.floor(THIS.pointerThickness / 2) + 'px';
          p.crossLY.style.top = p.crossLX.style.left = THIS.pointerBorderWidth + 'px'; // slider

          p.sld.style.overflow = 'hidden';
          p.sld.style.width = THIS.sliderSize + 'px';
          p.sld.style.height = THIS.height + 'px'; // slider gradient

          p.sldGrad.draw(THIS.sliderSize, THIS.height, '#000', '#000'); // slider border

          p.sldB.style.display = displaySlider ? 'block' : 'none';
          p.sldB.style.position = 'absolute';
          p.sldB.style.left = THIS.padding + THIS.width + 2 * THIS.controlBorderWidth + 2 * controlPadding + 'px';
          p.sldB.style.top = THIS.padding + 'px';
          p.sldB.style.border = THIS.controlBorderWidth + 'px solid';
          p.sldB.style.borderColor = THIS.controlBorderColor; // slider mouse area

          p.sldM.style.display = displaySlider ? 'block' : 'none';
          p.sldM.style.position = 'absolute';
          p.sldM.style.left = THIS.padding + THIS.width + 2 * THIS.controlBorderWidth + controlPadding + 'px';
          p.sldM.style.top = 0 + 'px';
          p.sldM.style.width = THIS.sliderSize + 2 * controlPadding + 2 * THIS.controlBorderWidth + (displayAlphaSlider ? 0 : Math.max(0, THIS.padding - controlPadding)) // remaining padding to the right edge
          + 'px';
          p.sldM.style.height = 2 * THIS.controlBorderWidth + 2 * THIS.padding + THIS.height + 'px';
          p.sldM.style.cursor = 'default';
          jsc.setData(p.sldM, {
            instance: THIS,
            control: 'sld'
          }); // slider pointer inner and outer border

          p.sldPtrIB.style.border = p.sldPtrOB.style.border = THIS.pointerBorderWidth + 'px solid ' + THIS.pointerBorderColor; // slider pointer outer border

          p.sldPtrOB.style.position = 'absolute';
          p.sldPtrOB.style.left = -(2 * THIS.pointerBorderWidth + THIS.pointerThickness) + 'px';
          p.sldPtrOB.style.top = '0'; // slider pointer middle border

          p.sldPtrMB.style.border = THIS.pointerThickness + 'px solid ' + THIS.pointerColor; // slider pointer spacer

          p.sldPtrS.style.width = THIS.sliderSize + 'px';
          p.sldPtrS.style.height = jsc.pub.sliderInnerSpace + 'px'; // alpha slider

          p.asld.style.overflow = 'hidden';
          p.asld.style.width = THIS.sliderSize + 'px';
          p.asld.style.height = THIS.height + 'px'; // alpha slider gradient

          p.asldGrad.draw(THIS.sliderSize, THIS.height, '#000'); // alpha slider border

          p.asldB.style.display = displayAlphaSlider ? 'block' : 'none';
          p.asldB.style.position = 'absolute';
          p.asldB.style.left = THIS.padding + THIS.width + 2 * THIS.controlBorderWidth + controlPadding + (displaySlider ? THIS.sliderSize + 3 * controlPadding + 2 * THIS.controlBorderWidth : 0) + 'px';
          p.asldB.style.top = THIS.padding + 'px';
          p.asldB.style.border = THIS.controlBorderWidth + 'px solid';
          p.asldB.style.borderColor = THIS.controlBorderColor; // alpha slider mouse area

          p.asldM.style.display = displayAlphaSlider ? 'block' : 'none';
          p.asldM.style.position = 'absolute';
          p.asldM.style.left = THIS.padding + THIS.width + 2 * THIS.controlBorderWidth + controlPadding + (displaySlider ? THIS.sliderSize + 2 * controlPadding + 2 * THIS.controlBorderWidth : 0) + 'px';
          p.asldM.style.top = 0 + 'px';
          p.asldM.style.width = THIS.sliderSize + 2 * controlPadding + 2 * THIS.controlBorderWidth + Math.max(0, THIS.padding - controlPadding) // remaining padding to the right edge
          + 'px';
          p.asldM.style.height = 2 * THIS.controlBorderWidth + 2 * THIS.padding + THIS.height + 'px';
          p.asldM.style.cursor = 'default';
          jsc.setData(p.asldM, {
            instance: THIS,
            control: 'asld'
          }); // alpha slider pointer inner and outer border

          p.asldPtrIB.style.border = p.asldPtrOB.style.border = THIS.pointerBorderWidth + 'px solid ' + THIS.pointerBorderColor; // alpha slider pointer outer border

          p.asldPtrOB.style.position = 'absolute';
          p.asldPtrOB.style.left = -(2 * THIS.pointerBorderWidth + THIS.pointerThickness) + 'px';
          p.asldPtrOB.style.top = '0'; // alpha slider pointer middle border

          p.asldPtrMB.style.border = THIS.pointerThickness + 'px solid ' + THIS.pointerColor; // alpha slider pointer spacer

          p.asldPtrS.style.width = THIS.sliderSize + 'px';
          p.asldPtrS.style.height = jsc.pub.sliderInnerSpace + 'px'; // the Close button

          function setBtnBorder() {
            var insetColors = THIS.controlBorderColor.split(/\s+/);
            var outsetColor = insetColors.length < 2 ? insetColors[0] : insetColors[1] + ' ' + insetColors[0] + ' ' + insetColors[0] + ' ' + insetColors[1];
            p.btn.style.borderColor = outsetColor;
          }

          var btnPadding = 15; // px

          p.btn.className = 'jscolor-btn-close';
          p.btn.style.display = THIS.closeButton ? 'block' : 'none';
          p.btn.style.position = 'absolute';
          p.btn.style.left = THIS.padding + 'px';
          p.btn.style.bottom = THIS.padding + 'px';
          p.btn.style.padding = '0 ' + btnPadding + 'px';
          p.btn.style.maxWidth = dims[0] - 2 * THIS.padding - 2 * THIS.controlBorderWidth - 2 * btnPadding + 'px';
          p.btn.style.overflow = 'hidden';
          p.btn.style.height = THIS.buttonHeight + 'px';
          p.btn.style.whiteSpace = 'nowrap';
          p.btn.style.border = THIS.controlBorderWidth + 'px solid';
          setBtnBorder();
          p.btn.style.color = THIS.buttonColor;
          p.btn.style.font = '12px sans-serif';
          p.btn.style.textAlign = 'center';
          p.btn.style.cursor = 'pointer';

          p.btn.onmousedown = function () {
            THIS.hide();
          };

          p.btnT.style.lineHeight = THIS.buttonHeight + 'px';
          p.btnT.innerHTML = '';
          p.btnT.appendChild(window.document.createTextNode(THIS.closeText)); // reposition the pointers

          redrawPad();
          redrawSld();
          redrawASld(); // If we are changing the owner without first closing the picker,
          // make sure to first deal with the old owner

          if (jsc.picker.owner && jsc.picker.owner !== THIS) {
            jsc.removeClass(jsc.picker.owner.targetElement, jsc.pub.activeClassName);
          } // Set a new picker owner


          jsc.picker.owner = THIS; // The redrawPosition() method needs picker.owner to be set, that's why we call it here,
          // after setting the owner

          if (THIS.container === window.document.body) {
            jsc.redrawPosition();
          } else {
            jsc._drawPosition(THIS, 0, 0, 'relative', false);
          }

          if (p.wrap.parentNode !== THIS.container) {
            THIS.container.appendChild(p.wrap);
          }

          jsc.addClass(THIS.targetElement, jsc.pub.activeClassName);
        }

        function redrawPad() {
          // redraw the pad pointer
          var yChannel = jsc.getPadYChannel(THIS);
          var x = Math.round(THIS.channels.h / 360 * (THIS.width - 1));
          var y = Math.round((1 - THIS.channels[yChannel] / 100) * (THIS.height - 1));
          var crossOuterSize = 2 * THIS.pointerBorderWidth + THIS.pointerThickness + 2 * THIS.crossSize;
          var ofs = -Math.floor(crossOuterSize / 2);
          jsc.picker.cross.style.left = x + ofs + 'px';
          jsc.picker.cross.style.top = y + ofs + 'px'; // redraw the slider

          switch (jsc.getSliderChannel(THIS)) {
            case 's':
              var rgb1 = jsc.HSV_RGB(THIS.channels.h, 100, THIS.channels.v);
              var rgb2 = jsc.HSV_RGB(THIS.channels.h, 0, THIS.channels.v);
              var color1 = 'rgb(' + Math.round(rgb1[0]) + ',' + Math.round(rgb1[1]) + ',' + Math.round(rgb1[2]) + ')';
              var color2 = 'rgb(' + Math.round(rgb2[0]) + ',' + Math.round(rgb2[1]) + ',' + Math.round(rgb2[2]) + ')';
              jsc.picker.sldGrad.draw(THIS.sliderSize, THIS.height, color1, color2);
              break;

            case 'v':
              var rgb = jsc.HSV_RGB(THIS.channels.h, THIS.channels.s, 100);
              var color1 = 'rgb(' + Math.round(rgb[0]) + ',' + Math.round(rgb[1]) + ',' + Math.round(rgb[2]) + ')';
              var color2 = '#000';
              jsc.picker.sldGrad.draw(THIS.sliderSize, THIS.height, color1, color2);
              break;
          } // redraw the alpha slider


          jsc.picker.asldGrad.draw(THIS.sliderSize, THIS.height, THIS.toHEXString());
        }

        function redrawSld() {
          var sldChannel = jsc.getSliderChannel(THIS);

          if (sldChannel) {
            // redraw the slider pointer
            var y = Math.round((1 - THIS.channels[sldChannel] / 100) * (THIS.height - 1));
            jsc.picker.sldPtrOB.style.top = y - (2 * THIS.pointerBorderWidth + THIS.pointerThickness) - Math.floor(jsc.pub.sliderInnerSpace / 2) + 'px';
          } // redraw the alpha slider


          jsc.picker.asldGrad.draw(THIS.sliderSize, THIS.height, THIS.toHEXString());
        }

        function redrawASld() {
          var y = Math.round((1 - THIS.channels.a) * (THIS.height - 1));
          jsc.picker.asldPtrOB.style.top = y - (2 * THIS.pointerBorderWidth + THIS.pointerThickness) - Math.floor(jsc.pub.sliderInnerSpace / 2) + 'px';
        }

        function isPickerOwner() {
          return jsc.picker && jsc.picker.owner === THIS;
        }

        function onValueKeyDown(ev) {
          if (jsc.eventKey(ev) === 'Enter') {
            if (THIS.valueElement) {
              THIS.processValueInput(THIS.valueElement.value);
            }

            THIS.tryHide();
          }
        }

        function onAlphaKeyDown(ev) {
          if (jsc.eventKey(ev) === 'Enter') {
            if (THIS.alphaElement) {
              THIS.processAlphaInput(THIS.alphaElement.value);
            }

            THIS.tryHide();
          }
        }

        function onValueChange(ev) {
          if (jsc.getData(ev, 'internal')) {
            return; // skip if the event was internally triggered by jscolor
          }

          var oldVal = THIS.valueElement.value;
          THIS.processValueInput(THIS.valueElement.value); // this might change the value

          jsc.triggerCallback(THIS, 'onChange');

          if (THIS.valueElement.value !== oldVal) {
            // value was additionally changed -> let's trigger the change event again, even though it was natively dispatched
            jsc.triggerInputEvent(THIS.valueElement, 'change', true, true);
          }
        }

        function onAlphaChange(ev) {
          if (jsc.getData(ev, 'internal')) {
            return; // skip if the event was internally triggered by jscolor
          }

          var oldVal = THIS.alphaElement.value;
          THIS.processAlphaInput(THIS.alphaElement.value); // this might change the value

          jsc.triggerCallback(THIS, 'onChange'); // triggering valueElement's onChange (because changing alpha changes the entire color, e.g. with rgba format)

          jsc.triggerInputEvent(THIS.valueElement, 'change', true, true);

          if (THIS.alphaElement.value !== oldVal) {
            // value was additionally changed -> let's trigger the change event again, even though it was natively dispatched
            jsc.triggerInputEvent(THIS.alphaElement, 'change', true, true);
          }
        }

        function onValueInput(ev) {
          if (jsc.getData(ev, 'internal')) {
            return; // skip if the event was internally triggered by jscolor
          }

          if (THIS.valueElement) {
            THIS.fromString(THIS.valueElement.value, jsc.flags.leaveValue);
          }

          jsc.triggerCallback(THIS, 'onInput'); // triggering valueElement's onInput
          // (not needed, it was dispatched normally by the browser)
        }

        function onAlphaInput(ev) {
          if (jsc.getData(ev, 'internal')) {
            return; // skip if the event was internally triggered by jscolor
          }

          if (THIS.alphaElement) {
            THIS.fromHSVA(null, null, null, parseFloat(THIS.alphaElement.value), jsc.flags.leaveAlpha);
          }

          jsc.triggerCallback(THIS, 'onInput'); // triggering valueElement's onInput (because changing alpha changes the entire color, e.g. with rgba format)

          jsc.triggerInputEvent(THIS.valueElement, 'input', true, true);
        } //
        // Install the color picker on chosen element(s)
        //
        // Determine picker's container element


        if (this.container === undefined) {
          this.container = window.document.body; // default container is BODY element
        } else {
          // explicitly set to custom element
          this.container = jsc.node(this.container);
        }

        if (!this.container) {
          throw new Error('Cannot instantiate color picker without a container element');
        } // Fetch the target element


        this.targetElement = jsc.node(targetElement);

        if (!this.targetElement) {
          // temporarily customized error message to help with migrating from versions prior to 2.2
          if (typeof targetElement === 'string' && /^[a-zA-Z][\w:.-]*$/.test(targetElement)) {
            // targetElement looks like valid ID
            var possiblyId = targetElement;
            throw new Error('If \'' + possiblyId + '\' is supposed to be an ID, please use \'#' + possiblyId + '\' or any valid CSS selector.');
          }

          throw new Error('Cannot instantiate color picker without a target element');
        }

        if (this.targetElement.jscolor && this.targetElement.jscolor instanceof jsc.pub) {
          throw new Error('Color picker already installed on this element');
        } // link this instance with the target element


        this.targetElement.jscolor = this;
        jsc.addClass(this.targetElement, jsc.pub.className); // register this instance

        jsc.instances.push(this); // if target is BUTTON

        if (jsc.isButton(this.targetElement)) {
          if (this.targetElement.type.toLowerCase() !== 'button') {
            // on buttons, always force type to be 'button', e.g. in situations the target <button> has no type
            // and thus defaults to 'submit' and would submit the form when clicked
            this.targetElement.type = 'button';
          }

          if (jsc.isButtonEmpty(this.targetElement)) {
            // empty button
            // it is important to clear element's contents first.
            // if we're re-instantiating color pickers on DOM that has been modified by changing page's innerHTML,
            // we would keep adding more non-breaking spaces to element's content (because element's contents survive
            // innerHTML changes, but picker instances don't)
            jsc.removeChildren(this.targetElement); // let's insert a non-breaking space

            this.targetElement.appendChild(window.document.createTextNode('\xa0')); // set min-width = previewSize, if not already greater

            var compStyle = jsc.getCompStyle(this.targetElement);
            var currMinWidth = parseFloat(compStyle['min-width']) || 0;

            if (currMinWidth < this.previewSize) {
              jsc.setStyle(this.targetElement, {
                'min-width': this.previewSize + 'px'
              }, this.forceStyle);
            }
          }
        } // Determine the value element


        if (this.valueElement === undefined) {
          if (jsc.isTextInput(this.targetElement)) {
            // for text inputs, default valueElement is targetElement
            this.valueElement = this.targetElement;
          } else {// leave it undefined
          }
        } else if (this.valueElement === null) {// explicitly set to null
          // leave it null
        } else {
          // explicitly set to custom element
          this.valueElement = jsc.node(this.valueElement);
        } // Determine the alpha element


        if (this.alphaElement) {
          this.alphaElement = jsc.node(this.alphaElement);
        } // Determine the preview element


        if (this.previewElement === undefined) {
          this.previewElement = this.targetElement; // default previewElement is targetElement
        } else if (this.previewElement === null) {// explicitly set to null
          // leave it null
        } else {
          // explicitly set to custom element
          this.previewElement = jsc.node(this.previewElement);
        } // valueElement


        if (this.valueElement && jsc.isTextInput(this.valueElement)) {
          // If the value element has onInput event already set, we need to detach it and attach AFTER our listener.
          // otherwise the picker instance would still contain the old color when accessed from the onInput handler.
          var valueElementOrigEvents = {
            onInput: this.valueElement.oninput
          };
          this.valueElement.oninput = null;
          this.valueElement.addEventListener('keydown', onValueKeyDown, false);
          this.valueElement.addEventListener('change', onValueChange, false);
          this.valueElement.addEventListener('input', onValueInput, false); // the original event listener must be attached AFTER our handler (to let it first set picker's color)

          if (valueElementOrigEvents.onInput) {
            this.valueElement.addEventListener('input', valueElementOrigEvents.onInput, false);
          }

          this.valueElement.setAttribute('autocomplete', 'off');
          this.valueElement.setAttribute('autocorrect', 'off');
          this.valueElement.setAttribute('autocapitalize', 'off');
          this.valueElement.setAttribute('spellcheck', false);
        } // alphaElement


        if (this.alphaElement && jsc.isTextInput(this.alphaElement)) {
          this.alphaElement.addEventListener('keydown', onAlphaKeyDown, false);
          this.alphaElement.addEventListener('change', onAlphaChange, false);
          this.alphaElement.addEventListener('input', onAlphaInput, false);
          this.alphaElement.setAttribute('autocomplete', 'off');
          this.alphaElement.setAttribute('autocorrect', 'off');
          this.alphaElement.setAttribute('autocapitalize', 'off');
          this.alphaElement.setAttribute('spellcheck', false);
        } // determine initial color value
        //


        var initValue = 'FFFFFF';

        if (this.value !== undefined) {
          initValue = this.value; // get initial color from the 'value' property
        } else if (this.valueElement && this.valueElement.value !== undefined) {
          initValue = this.valueElement.value; // get initial color from valueElement's value
        } // determine initial alpha value
        //


        var initAlpha = undefined;

        if (this.alpha !== undefined) {
          initAlpha = '' + this.alpha; // get initial alpha value from the 'alpha' property
        } else if (this.alphaElement && this.alphaElement.value !== undefined) {
          initAlpha = this.alphaElement.value; // get initial color from alphaElement's value
        } // determine current format based on the initial color value
        //


        this._currentFormat = null;

        if (['auto', 'any'].indexOf(this.format.toLowerCase()) > -1) {
          // format is 'auto' or 'any' -> let's auto-detect current format
          var color = jsc.parseColorString(initValue);
          this._currentFormat = color ? color.format : 'hex';
        } else {
          // format is specified
          this._currentFormat = this.format.toLowerCase();
        } // let's parse the initial color value and expose color's preview


        this.processValueInput(initValue); // let's also parse and expose the initial alpha value, if any
        //
        // Note: If the initial color value contains alpha value in it (e.g. in rgba format),
        // this will overwrite it. So we should only process alpha input if there was any initial
        // alpha explicitly set, otherwise we could needlessly lose initial value's alpha

        if (initAlpha !== undefined) {
          this.processAlphaInput(initAlpha);
        }
      }
    }; //================================
    // Public properties and methods
    //================================
    //
    // These will be publicly available via jscolor.<name> and JSColor.<name>
    //
    // class that will be set to elements having jscolor installed on them

    jsc.pub.className = 'jscolor'; // class that will be set to elements having jscolor active on them

    jsc.pub.activeClassName = 'jscolor-active'; // whether to try to parse the options string by evaluating it using 'new Function()'
    // in case it could not be parsed with JSON.parse()

    jsc.pub.looseJSON = true; // presets

    jsc.pub.presets = {}; // built-in presets

    jsc.pub.presets['default'] = {}; // baseline for customization

    jsc.pub.presets['light'] = {
      // default color scheme
      backgroundColor: 'rgba(255,255,255,1)',
      controlBorderColor: 'rgba(187,187,187,1)',
      buttonColor: 'rgba(0,0,0,1)'
    };
    jsc.pub.presets['dark'] = {
      backgroundColor: 'rgba(51,51,51,1)',
      controlBorderColor: 'rgba(153,153,153,1)',
      buttonColor: 'rgba(240,240,240,1)'
    };
    jsc.pub.presets['small'] = {
      width: 101,
      height: 101,
      padding: 10,
      sliderSize: 14
    };
    jsc.pub.presets['medium'] = {
      width: 181,
      height: 101,
      padding: 12,
      sliderSize: 16
    }; // default size

    jsc.pub.presets['large'] = {
      width: 271,
      height: 151,
      padding: 12,
      sliderSize: 24
    };
    jsc.pub.presets['thin'] = {
      borderWidth: 1,
      controlBorderWidth: 1,
      pointerBorderWidth: 1
    }; // default thickness

    jsc.pub.presets['thick'] = {
      borderWidth: 2,
      controlBorderWidth: 2,
      pointerBorderWidth: 2
    }; // size of space in the sliders

    jsc.pub.sliderInnerSpace = 3; // px
    // transparency chessboard

    jsc.pub.chessboardSize = 8; // px

    jsc.pub.chessboardColor1 = '#666666';
    jsc.pub.chessboardColor2 = '#999999'; // preview separator

    jsc.pub.previewSeparator = ['rgba(255,255,255,.65)', 'rgba(128,128,128,.65)']; // Initializes jscolor

    jsc.pub.init = function () {
      if (jsc.initialized) {
        return;
      } // attach some necessary handlers


      window.document.addEventListener('mousedown', jsc.onDocumentMouseDown, false);
      window.document.addEventListener('keyup', jsc.onDocumentKeyUp, false);
      window.addEventListener('resize', jsc.onWindowResize, false); // install jscolor on current DOM

      jsc.pub.install();
      jsc.initialized = true; // trigger events waiting in the queue

      while (jsc.triggerQueue.length) {
        var ev = jsc.triggerQueue.shift();
        jsc.triggerGlobal(ev);
      }
    }; // Installs jscolor on current DOM tree


    jsc.pub.install = function (rootNode) {
      var success = true;

      try {
        jsc.installBySelector('[data-jscolor]', rootNode);
      } catch (e) {
        success = false;
        console.warn(e);
      } // for backward compatibility with DEPRECATED installation using class name


      if (jsc.pub.lookupClass) {
        try {
          jsc.installBySelector('input.' + jsc.pub.lookupClass + ', ' + 'button.' + jsc.pub.lookupClass, rootNode);
        } catch (e) {}
      }

      return success;
    }; // Triggers given input event(s) (e.g. 'input' or 'change') on all color pickers.
    //
    // It is possible to specify multiple events separated with a space.
    // If called before jscolor is initialized, then the events will be triggered after initialization.
    //


    jsc.pub.trigger = function (eventNames) {
      if (jsc.initialized) {
        jsc.triggerGlobal(eventNames);
      } else {
        jsc.triggerQueue.push(eventNames);
      }
    }; // Hides current color picker box


    jsc.pub.hide = function () {
      if (jsc.picker && jsc.picker.owner) {
        jsc.picker.owner.hide();
      }
    }; // Returns a data URL of a gray chessboard image that indicates transparency


    jsc.pub.chessboard = function (color) {
      if (!color) {
        color = 'rgba(0,0,0,0)';
      }

      var preview = jsc.genColorPreviewCanvas(color);
      return preview.canvas.toDataURL();
    }; // Returns a data URL of a gray chessboard image that indicates transparency


    jsc.pub.background = function (color) {
      var backgrounds = []; // CSS gradient for background color preview

      backgrounds.push(jsc.genColorPreviewGradient(color)); // data URL of generated PNG image with a gray transparency chessboard

      var preview = jsc.genColorPreviewCanvas();
      backgrounds.push(['url(\'' + preview.canvas.toDataURL() + '\')', 'left top', 'repeat'].join(' '));
      return backgrounds.join(', ');
    }; //
    // DEPRECATED properties and methods
    //
    // DEPRECATED. Use jscolor.presets.default instead.
    //
    // Custom default options for all color pickers, e.g. { hash: true, width: 300 }


    jsc.pub.options = {}; // DEPRECATED. Use data-jscolor attribute instead, which installs jscolor on given element.
    //
    // By default, we'll search for all elements with class="jscolor" and install a color picker on them.
    //
    // You can change what class name will be looked for by setting the property jscolor.lookupClass
    // anywhere in your HTML document. To completely disable the automatic lookup, set it to null.
    //

    jsc.pub.lookupClass = 'jscolor'; // DEPRECATED. Use data-jscolor attribute instead, which installs jscolor on given element.
    //
    // Install jscolor on all elements that have the specified class name

    jsc.pub.installByClassName = function () {
      console.error('jscolor.installByClassName() is DEPRECATED. Use data-jscolor="" attribute instead of a class name.' + jsc.docsRef);
      return false;
    };

    jsc.register();
    return jsc.pub;
  }(); // END jscolor


  if (typeof window.jscolor === 'undefined') {
    window.jscolor = window.JSColor = jscolor;
  } // END jscolor code


  return jscolor;
}); // END factory

},{"@babel/runtime/helpers/interopRequireDefault":11,"@babel/runtime/helpers/typeof":13}],9:[function(require,module,exports){
"use strict";

function _classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
}

module.exports = _classCallCheck;

},{}],10:[function(require,module,exports){
"use strict";

function _defineProperties(target, props) {
  for (var i = 0; i < props.length; i++) {
    var descriptor = props[i];
    descriptor.enumerable = descriptor.enumerable || false;
    descriptor.configurable = true;
    if ("value" in descriptor) descriptor.writable = true;
    Object.defineProperty(target, descriptor.key, descriptor);
  }
}

function _createClass(Constructor, protoProps, staticProps) {
  if (protoProps) _defineProperties(Constructor.prototype, protoProps);
  if (staticProps) _defineProperties(Constructor, staticProps);
  return Constructor;
}

module.exports = _createClass;

},{}],11:[function(require,module,exports){
"use strict";

function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : {
    "default": obj
  };
}

module.exports = _interopRequireDefault;

},{}],12:[function(require,module,exports){
"use strict";

var _typeof = require("@babel/runtime/helpers/typeof");

function _getRequireWildcardCache() {
  if (typeof WeakMap !== "function") return null;
  var cache = new WeakMap();

  _getRequireWildcardCache = function _getRequireWildcardCache() {
    return cache;
  };

  return cache;
}

function _interopRequireWildcard(obj) {
  if (obj && obj.__esModule) {
    return obj;
  }

  if (obj === null || _typeof(obj) !== "object" && typeof obj !== "function") {
    return {
      "default": obj
    };
  }

  var cache = _getRequireWildcardCache();

  if (cache && cache.has(obj)) {
    return cache.get(obj);
  }

  var newObj = {};
  var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor;

  for (var key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null;

      if (desc && (desc.get || desc.set)) {
        Object.defineProperty(newObj, key, desc);
      } else {
        newObj[key] = obj[key];
      }
    }
  }

  newObj["default"] = obj;

  if (cache) {
    cache.set(obj, newObj);
  }

  return newObj;
}

module.exports = _interopRequireWildcard;

},{"@babel/runtime/helpers/typeof":13}],13:[function(require,module,exports){
"use strict";

function _typeof(obj) {
  "@babel/helpers - typeof";

  if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {
    module.exports = _typeof = function _typeof(obj) {
      return typeof obj;
    };
  } else {
    module.exports = _typeof = function _typeof(obj) {
      return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
    };
  }

  return _typeof(obj);
}

module.exports = _typeof;

},{}],14:[function(require,module,exports){
"use strict";

var _MIDI = require('./opz.json');

var error = function error(value) {
  console.log('[OPZ]: Untracked midi value. Please create an issue https://github.com/nbw/opz/issues');
  console.log("[OPZ]: ".concat(value));
  return value;
};

var get = function get() {
  var value = _MIDI;

  for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
    args[_key] = arguments[_key];
  }

  for (var i = 0; i < args.length; i++) {
    value = value[args[i]];
    if (!value) throw 'Untracked value';
  }

  return value;
};

var track = function track(input) {
  if (input.length < 1) return null;
  return get('track', input[0]);
};

var action = function action(input) {
  if (input.length < 1) return null;
  return get('action', input[0]);
};

var note = function note(input) {
  if (input.length < 2) return null;
  var n = input[1];
  return {
    value: n,
    note: get('notes', n % 12)
  };
};

var dial = function dial(input) {
  if (input.length < 2) return null;
  var d = input[1];
  return {
    dial: (d - 1) % 4,
    // 0 - 3
    dialColor: get('dial', 'color', d % 100),
    page: Math.floor((d - 1) / 4),
    // 0 - 3
    pageColor: get('dial', 'page', track(input), d % 100)
  };
};

var pitch = function pitch(input) {
  if (input.length < 3) return null;
  return {
    absolute: input[1],
    relative: input[2]
  };
};

var value = function value(input) {
  if (input.length < 3) return null;

  switch (action(input)) {
    case 'keys':
      return note(input);

    case 'dial':
      return dial(input);

    case 'pitch bend':
      return pitch(input);

    default:
      return {};
  }
};

var velocity = function velocity(input) {
  if (input.length < 3) return -1;
  return input[2];
};

var control = function control(input) {
  var c = get('control', input[0]);
  return {
    track: c,
    action: c,
    velocity: velocity(input),
    value: {}
  };
};

var decode = function decode(input) {
  try {
    if (input.length === 1) return control(input);
    if (input.length === 2) return null;
    return {
      track: track(input),
      action: action(input),
      velocity: velocity(input),
      value: value(input)
    };
  } catch (e) {
    error(input);
  }
};

module.exports = {
  decode: decode,
  velocity: velocity
};

},{"./opz.json":15}],15:[function(require,module,exports){
module.exports={
  "dictionary": {
    "action": {
      "dial": "dial",
      "keys": "keys",
      "pitch": "pitch bend"
    },
    "color": {
      "blue": "blue",
      "green": "green",
      "purple": "purple",
      "red": "red",
      "white": "white",
      "yellow": "yellow"
    },
    "track": {
      "arp": "arp",
      "bass": "bass",
      "chord": "chord",
      "fx1": "fx1",
      "fx2": "fx2",
      "kick": "kick",
      "lead": "lead",
      "lights": "lights",
      "master": "master",
      "module": "module",
      "motion": "motion",
      "perc": "perc",
      "perform": "perform",
      "sample": "sample",
      "snare": "snare",
      "tape": "tape"
    },
    "clock": "clock",
    "kill": "kill",
    "start": "start",
    "stop": "stop"
  },
  "control": {
    "248": "clock",
    "250": "start",
    "252": "stop"
  },
  "action": {
    "128": "keys",
    "129": "keys",
    "130": "keys",
    "131": "keys",
    "132": "keys",
    "133": "keys",
    "134": "keys",
    "135": "keys",
    "136": "keys",
    "137": "keys",
    "138": "keys",
    "139": "keys",
    "140": "keys",
    "141": "keys",
    "142": "keys",
    "143": "keys",
    "144": "keys",
    "145": "keys",
    "146": "keys",
    "147": "keys",
    "148": "keys",
    "149": "keys",
    "150": "keys",
    "151": "keys",
    "152": "keys",
    "153": "keys",
    "154": "keys",
    "155": "keys",
    "156": "keys",
    "157": "keys",
    "158": "keys",
    "159": "keys",
    "176": "dial",
    "177": "dial",
    "178": "dial",
    "179": "dial",
    "180": "dial",
    "181": "dial",
    "182": "dial",
    "183": "dial",
    "184": "dial",
    "185": "dial",
    "186": "dial",
    "187": "dial",
    "188": "dial",
    "189": "dial",
    "190": "dial",
    "191": "dial",
    "224": "pitch bend",
    "225": "pitch bend",
    "226": "pitch bend",
    "227": "pitch bend",
    "228": "pitch bend",
    "229": "pitch bend",
    "230": "pitch bend",
    "231": "pitch bend",
    "232": "pitch bend",
    "233": "pitch bend",
    "234": "pitch bend",
    "235": "pitch bend",
    "236": "pitch bend",
    "237": "pitch bend",
    "238": "pitch bend",
    "239": "pitch bend"
  },
  "track": {
    "128": "kick",
    "129": "snare",
    "130": "perc",
    "131": "sample",
    "132": "bass",
    "133": "lead",
    "134": "arp",
    "135": "chord",
    "136": "fx1",
    "137": "fx2",
    "138": "tape",
    "139": "master",
    "140": "perform",
    "141": "module",
    "142": "lights",
    "143": "motion",
    "144": "kick",
    "145": "snare",
    "146": "perc",
    "147": "sample",
    "148": "bass",
    "149": "lead",
    "150": "arp",
    "151": "chord",
    "152": "fx1",
    "153": "fx2",
    "154": "tape",
    "155": "master",
    "156": "perform",
    "157": "module",
    "158": "lights",
    "159": "motion",
    "176": "kick",
    "177": "snare",
    "178": "perc",
    "179": "sample",
    "180": "bass",
    "181": "lead",
    "182": "arp",
    "183": "chord",
    "184": "fx1",
    "185": "fx2",
    "186": "tape",
    "187": "master",
    "188": "perform",
    "189": "lights",
    "190": "lights",
    "191": "motion",
    "224": "kick",
    "225": "snare",
    "226": "perc",
    "227": "sample",
    "228": "bass",
    "229": "lead",
    "230": "arp",
    "231": "chord",
    "232": "fx1",
    "233": "fx2",
    "234": "tape",
    "235": "master",
    "236": "perform",
    "237": "module",
    "238": "lights",
    "239": "motion"
  },
  "notes": {
    "0": "C",
    "1": "C#",
    "2": "D",
    "3": "D#",
    "4": "E",
    "5": "F",
    "6": "F#",
    "7": "G",
    "8": "G#",
    "9": "A",
    "10": "A#",
    "11": "B"
  },
  "dial": {
    "color": {
      "1": "green",
      "2": "blue",
      "3": "yellow",
      "4": "red",
      "5": "green",
      "6": "blue",
      "7": "yellow",
      "8": "red",
      "9": "green",
      "10": "blue",
      "11": "yellow",
      "12": "red",
      "13": "green",
      "14": "blue",
      "15": "yellow",
      "16": "red",
      "23": "kill"
    },
    "page": {
      "kick": {
        "1": "white",
        "2": "white",
        "3": "white",
        "4": "white",
        "5": "green",
        "6": "green",
        "7": "green",
        "8": "green",
        "9": "purple",
        "10": "purple",
        "11": "purple",
        "12": "purple",
        "13": "yellow",
        "14": "yellow",
        "15": "yellow",
        "16": "yellow",
        "23": "kill"
      },
      "snare": {
        "1": "white",
        "2": "white",
        "3": "white",
        "4": "white",
        "5": "green",
        "6": "green",
        "7": "green",
        "8": "green",
        "9": "purple",
        "10": "purple",
        "11": "purple",
        "12": "purple",
        "13": "yellow",
        "14": "yellow",
        "15": "yellow",
        "16": "yellow",
        "23": "kill"
      },
      "perc": {
        "1": "white",
        "2": "white",
        "3": "white",
        "4": "white",
        "5": "green",
        "6": "green",
        "7": "green",
        "8": "green",
        "9": "purple",
        "10": "purple",
        "11": "purple",
        "12": "purple",
        "13": "yellow",
        "14": "yellow",
        "15": "yellow",
        "16": "yellow",
        "23": "kill"
      },
      "sample": {
        "1": "white",
        "2": "white",
        "3": "white",
        "4": "white",
        "5": "green",
        "6": "green",
        "7": "green",
        "8": "green",
        "9": "purple",
        "10": "purple",
        "11": "purple",
        "12": "purple",
        "13": "yellow",
        "14": "yellow",
        "15": "yellow",
        "16": "yellow",
        "23": "kill"
      },
      "bass": {
        "1": "white",
        "2": "white",
        "3": "white",
        "4": "white",
        "5": "green",
        "6": "green",
        "7": "green",
        "8": "green",
        "9": "purple",
        "10": "purple",
        "11": "purple",
        "12": "purple",
        "13": "yellow",
        "14": "yellow",
        "15": "yellow",
        "16": "yellow",
        "23": "kill"
      },
      "lead": {
        "1": "white",
        "2": "white",
        "3": "white",
        "4": "white",
        "5": "green",
        "6": "green",
        "7": "green",
        "8": "green",
        "9": "purple",
        "10": "purple",
        "11": "purple",
        "12": "purple",
        "13": "yellow",
        "14": "yellow",
        "15": "yellow",
        "16": "yellow",
        "23": "kill"
      },
      "arp": {
        "1": "white",
        "2": "white",
        "3": "white",
        "4": "white",
        "5": "green",
        "6": "green",
        "7": "green",
        "8": "green",
        "9": "blue",
        "10": "blue",
        "11": "blue",
        "12": "blue",
        "13": "yellow",
        "14": "yellow",
        "15": "yellow",
        "16": "yellow",
        "23": "kill"
      },
      "chord": {
        "1": "white",
        "2": "white",
        "3": "white",
        "4": "white",
        "5": "green",
        "6": "green",
        "7": "green",
        "8": "green",
        "9": "purple",
        "10": "purple",
        "11": "purple",
        "12": "purple",
        "13": "yellow",
        "14": "yellow",
        "15": "yellow",
        "16": "yellow",
        "23": "kill"
      },
      "fx1": {
        "1": "white",
        "2": "white",
        "3": "white",
        "4": "white",
        "5": "green",
        "6": "green",
        "7": "green",
        "8": "green",
        "9": "purple",
        "10": "purple",
        "11": "purple",
        "12": "purple",
        "13": "yellow",
        "14": "yellow",
        "15": "yellow",
        "16": "yellow",
        "23": "kill"
      },
      "fx2": {
        "1": "white",
        "2": "white",
        "3": "white",
        "4": "white",
        "5": "green",
        "6": "green",
        "7": "green",
        "8": "green",
        "9": "purple",
        "10": "purple",
        "11": "purple",
        "12": "purple",
        "13": "yellow",
        "14": "yellow",
        "15": "yellow",
        "16": "yellow",
        "23": "kill"
      },
      "tape": {
        "1": "white",
        "2": "white",
        "3": "white",
        "4": "white",
        "5": "green",
        "6": "green",
        "7": "green",
        "8": "green",
        "9": "purple",
        "10": "purple",
        "11": "purple",
        "12": "purple",
        "13": "yellow",
        "14": "yellow",
        "15": "yellow",
        "16": "yellow",
        "23": "kill"
      },
      "master": {
        "1": "white",
        "2": "white",
        "3": "white",
        "4": "white",
        "5": "green",
        "6": "green",
        "7": "green",
        "8": "green",
        "9": "purple",
        "10": "purple",
        "11": "purple",
        "12": "purple",
        "13": "yellow",
        "14": "yellow",
        "15": "yellow",
        "16": "yellow",
        "23": "kill"
      },
      "perform": {
        "1": "white",
        "2": "white",
        "3": "white",
        "4": "white",
        "5": "green",
        "6": "green",
        "7": "green",
        "8": "green",
        "9": "purple",
        "10": "purple",
        "11": "purple",
        "12": "purple",
        "13": "yellow",
        "14": "yellow",
        "15": "yellow",
        "16": "yellow",
        "23": "kill"
      },
      "module": {
        "1": "white",
        "2": "white",
        "3": "white",
        "4": "white",
        "5": "green",
        "6": "green",
        "7": "green",
        "8": "green",
        "9": "purple",
        "10": "purple",
        "11": "purple",
        "12": "purple",
        "13": "yellow",
        "14": "yellow",
        "15": "yellow",
        "16": "yellow",
        "23": "kill"
      },
      "lights": {
        "1": "white",
        "2": "white",
        "3": "white",
        "4": "white",
        "5": "green",
        "6": "green",
        "7": "green",
        "8": "green",
        "9": "purple",
        "10": "purple",
        "11": "purple",
        "12": "purple",
        "13": "yellow",
        "14": "yellow",
        "15": "yellow",
        "16": "yellow",
        "23": "kill"
      },
      "motion": {
        "1": "white",
        "2": "white",
        "3": "white",
        "4": "white",
        "5": "green",
        "6": "green",
        "7": "green",
        "8": "green",
        "9": "purple",
        "10": "purple",
        "11": "purple",
        "12": "purple",
        "13": "yellow",
        "14": "yellow",
        "15": "yellow",
        "16": "yellow",
        "23": "kill"
      }
    }
  }
}

},{}]},{},[2]);
