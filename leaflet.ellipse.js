var _extends = Object.assign || function (target) {
  for (var i = 1; i < arguments.length; i++) {
    var source = arguments[i];

    for (var key in source) {
      if (Object.prototype.hasOwnProperty.call(source, key)) {
        target[key] = source[key];
      }
    }
  }

  return target;
};

var objectWithoutProperties = function (obj, keys) {
  var target = {};

  for (var i in obj) {
    if (keys.indexOf(i) >= 0) continue;
    if (!Object.prototype.hasOwnProperty.call(obj, i)) continue;
    target[i] = obj[i];
  }

  return target;
};

var RAD_TO_DEG = 180 / Math.PI,
    DEG_TO_RAD = Math.PI / 180;

var wrapBrg = function wrapBrg(brg) {
    if (brg < 0.0) {
        brg += 360.0;
        wrapBrg(brg);
    } else if (brg > 360.0) {
        brg -= 360.0;
        wrapBrg(brg);
    }
    return brg;
};

var atan2d = function atan2d(y, x) {
    return RAD_TO_DEG * Math.atan2(y, x);
};

var closeToZero = function closeToZero(x) {
    return Math.abs(x) < 0.0000000001 ? 0 : x;
};

L.Ellipse = L.Polygon.extend({
    options: {
        weight: 5,
        color: '#ffff00',
        stroke: true
    },

    initialize: function initialize(_ref) {
        var _ref$center = _ref.center,
            center = _ref$center === undefined ? [0, 0] : _ref$center,
            _ref$semiMinor = _ref.semiMinor,
            semiMinor = _ref$semiMinor === undefined ? 100 : _ref$semiMinor,
            _ref$semiMajor = _ref.semiMajor,
            semiMajor = _ref$semiMajor === undefined ? 200 : _ref$semiMajor,
            _ref$bearing = _ref.bearing,
            bearing = _ref$bearing === undefined ? 0 : _ref$bearing,
            _ref$numberOfPoints = _ref.numberOfPoints,
            numberOfPoints = _ref$numberOfPoints === undefined ? 61 : _ref$numberOfPoints,
            options = objectWithoutProperties(_ref, ['center', 'semiMinor', 'semiMajor', 'bearing', 'numberOfPoints']);

        this.setOptions(options).setCenter(center).setSemiMinor(semiMinor).setSemiMajor(semiMajor).setBearing(bearing).setNumberOfPoints(numberOfPoints);
        this.setLatLngs();
        this.setRhumb();
    },
    setCenter: function setCenter() {
        var center = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : { lat: 0, lng: 0 };

        this._center = L.latLng(center);

        return this.redraw();
    },
    getCenter: function getCenter() {
        return this._center;
    },
    setSemiMinor: function setSemiMinor(val) {
        this._semiMinor = val;
        return this.redraw();
    },
    getSemiMinor: function getSemiMinor() {
        return this._semiMinor;
    },
    setSemiMajor: function setSemiMajor(val) {
        this._semiMajor = val;
        return this.redraw();
    },
    getSemiMajor: function getSemiMajor() {
        return this._semiMajor;
    },
    setBearing: function setBearing(bearing) {
        this._bearing = bearing;
        return this.redraw();
    },
    getBearing: function getBearing() {
        return this._bearing;
    },
    getNumberOfPoints: function getNumberOfPoints() {
        return this._numberOfPoints;
    },
    setNumberOfPoints: function setNumberOfPoints() {
        var numberOfPoints = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 32;

        this._numberOfPoints = Math.max(10, numberOfPoints);
        return this.redraw();
    },
    getRhumb: function getRhumb() {
        return this._rhumb;
    },
    setRhumb: function setRhumb() {
        var rhumb = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 45;

        this._rhumb = rhumb;
        return this.redraw();
    },
    getOptions: function getOptions() {
        return this.options;
    },
    setOptions: function setOptions(options) {
        var ops = options || {};
        L.setOptions(this, ops);
        return this.redraw();
    },
    getLatLngs: function getLatLngs() {
        var angle = void 0,
            x = void 0,
            y = void 0;
        var latlngs = [];
        var brg = wrapBrg(this.getBearing());
        var delta = 360 / (this._numberOfPoints - 1);

        if (this._semiMinor === this._semiMajor) {
            brg = 0;
        }

        var trueStart = wrapBrg(brg);
        for (var i = 0; i < this._numberOfPoints; i++) {
            angle = i * delta;
            if (angle >= 360.0) {
                angle -= 360.0;
            }

            y = this._semiMinor * Math.sin(angle * DEG_TO_RAD);
            x = this._semiMajor * Math.cos(angle * DEG_TO_RAD);
            var tangle = closeToZero(this._semiMinor !== this._semiMajor ? atan2d(y, x) : i * delta);
            var dist = Math.sqrt(x * x + y * y);
            var pos = this.computeDestinationPos(this.getCenter(), dist, trueStart + tangle);
            //const tpos = this.getPos(this.getCenter(), angle, trueStart, this.getSemiMinor(), this.getSemiMajor())
            latlngs.push(pos);
        }

        return latlngs;
    },
    getPos: function getPos(center, angle, trueStart, semiMinor, semiMajor) {
        var y = semiMinor * Math.cos(angle * DEG_TO_RAD);
        var x = semiMajor * Math.sin(angle * DEG_TO_RAD);
        var tangle = closeToZero(semiMinor !== semiMajor ? atan2d(y, x) : -angle);

        var dist = Math.sqrt(x * x + y * y);
        return this.computeDestinationPos(center, dist, trueStart + tangle);
    },
    getLatRadius: function getLatRadius() {
        return this._semiMinor / 40075017 * 360;
    },
    getLngRadius: function getLngRadius() {
        return this._semiMajor / 40075017 * 360 / Math.cos(Math.PI / 180 * this._latlngs.lat);
    },
    setLatLngs: function setLatLngs() {
        var latlngs = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : this.getLatLngs();

        this._setLatLngs(latlngs);
        return this.redraw();
    },


    setStyle: L.Path.prototype.setStyle,

    computeDestinationPos: function computeDestinationPos() {
        var start = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : { lat: 0, lng: 0 };
        var distance = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 1;
        var bearing = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0;
        var rng = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 6378137;

        var bng = bearing * Math.PI / 180;

        var lat1 = start.lat * Math.PI / 180;
        var lon1 = start.lng * Math.PI / 180;

        var lat2 = Math.asin(Math.sin(lat1) * Math.cos(distance / rng) + Math.cos(lat1) * Math.sin(distance / rng) * Math.cos(bng));

        var lon2 = lon1 + Math.atan2(Math.sin(bng) * Math.sin(distance / rng) * Math.cos(lat1), Math.cos(distance / rng) - Math.sin(lat1) * Math.sin(lat2));

        lat2 = lat2 * 180 / Math.PI;
        lon2 = lon2 * 180 / Math.PI;

        return {
            lat: lat2,
            lng: lon2
        };
    }
});

L.ellipse = function (_ref2) {
    var _ref2$center = _ref2.center,
        center = _ref2$center === undefined ? [0, 0] : _ref2$center,
        _ref2$semiMinor = _ref2.semiMinor,
        semiMinor = _ref2$semiMinor === undefined ? 100 : _ref2$semiMinor,
        _ref2$semiMajor = _ref2.semiMajor,
        semiMajor = _ref2$semiMajor === undefined ? 200 : _ref2$semiMajor,
        _ref2$bearing = _ref2.bearing,
        bearing = _ref2$bearing === undefined ? 0 : _ref2$bearing,
        options = objectWithoutProperties(_ref2, ['center', 'semiMinor', 'semiMajor', 'bearing']);

    return new L.Ellipse(_extends({ center: center, semiMinor: semiMinor, semiMajor: semiMajor, bearing: bearing }, options));
};
