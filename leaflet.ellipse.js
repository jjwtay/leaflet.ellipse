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

L.Ellipse = L.Polyline.extend({
    options: {
        weight: 5,
        color: '#ffff00',
        stroke: true
    },

    initialize: function initialize(latlng, radii, tilt, options) {
        L.setOptions(this, options);
        this._center = latlng;
        this._numberOfPoints = 61;
        this._startBearing = 0;
        this._endBearing = 360;

        if (tilt) {
            this._tiltDeg = tilt;
        } else {
            this._tiltDeg = 0;
        }

        if (radii) {
            this._semiMajor = radii[0];
            this._semiMinor = radii[1];
        }
        this.setLatLngs();
    },


    getCenter: function getCenter() {
        return this._center;
    },

    setCenter: function setCenter() {
        var center = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : { lat: 0, lng: 0 };

        this._center = center;
        return this.redraw();
    },

    setRadii: function setRadii(radii) {
        this._semiMajor = radii[0];
        this._semiMinor = radii[1];
        return this.redraw();
    },

    getRadii: function getRadii() {
        return [this._semiMajor, this._semiMinor];
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

    setTilt: function setTilt(tilt) {
        this._tiltDeg = tilt;
        return this.redraw();
    },

    getTilt: function getTilt() {
        return this._tiltDeg;
    },

    setStartBearing: function setStartBearing(brg) {
        var startBearing = brg || 0;
        /**
         * Not sure how much of these checks are neccessary
         * just using all as a temp fix for rotation problems.
         */
        var endBearing = this.getEndBearing() || 360;

        while (startBearing < 0) {
            startBearing += 360;
        }
        while (startBearing > 360) {
            startBearing -= 360;
        }

        if (endBearing < startBearing) {
            while (endBearing <= startBearing) {
                startBearing = startBearing - 360;
            }
        }

        this._startBearing = startBearing;
        return this.redraw();
    },

    getStartBearing: function getStartBearing() {
        return this._startBearing;
    },

    setEndBearing: function setEndBearing(brg) {
        var endBearing = brg || 90;

        /**
         * Not sure how much of these checks are neccessary
         * just using all as a temp fix for rotation problems.
         */
        var startBearing = this.getStartBearing() || 0;

        while (endBearing < 0) {
            endBearing += 360;
        }
        while (endBearing > 360) {
            endBearing -= 360;
        }

        if (startBearing > endBearing) {
            while (startBearing >= endBearing) {
                endBearing += 360;
            }
        }

        while (endBearing - startBearing > 360) {
            endBearing -= 360;
        }this._endBearing = endBearing;
        return this.redraw();
    },

    getEndBearing: function getEndBearing() {
        return this._endBearing;
    },

    getNumberOfPoints: function getNumberOfPoints() {
        return this._numberOfPoints;
    },

    setNumberOfPoints: function setNumberOfPoints() {
        var numberOfPoints = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 32;

        this._numberOfPoints = Math.max(10, numberOfPoints);
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
        var brg = wrapBrg(this.getTilt());
        var start = wrapBrg(this.getStartBearing());
        var diff = this.getEndBearing() - start;
        if (diff < 0) {
            diff += 360;
        }
        var delta = diff / (this._numberOfPoints - 1);

        if (this._semiMinor === this._semiMajor) {
            brg = 0;
        }

        var trueStart = wrapBrg(brg + start);
        //start = wrapBrg(450 - start)
        for (var i = 0; i < this._numberOfPoints; i++) {
            angle = start + i * delta;
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
        var radius = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 6378137;

        var bng = bearing * Math.PI / 180;

        var lat1 = start.lat * Math.PI / 180;
        var lon1 = start.lng * Math.PI / 180;

        var lat2 = Math.asin(Math.sin(lat1) * Math.cos(distance / radius) + Math.cos(lat1) * Math.sin(distance / radius) * Math.cos(bng));

        var lon2 = lon1 + Math.atan2(Math.sin(bng) * Math.sin(distance / radius) * Math.cos(lat1), Math.cos(distance / radius) - Math.sin(lat1) * Math.sin(lat2));

        lat2 = lat2 * 180 / Math.PI;
        lon2 = lon2 * 180 / Math.PI;

        return {
            lat: lat2,
            lng: lon2
        };
    }
});

L.ellipse = function (latlng, radii, tilt, options) {
    return new L.Ellipse(latlng, radii, tilt, options);
};
