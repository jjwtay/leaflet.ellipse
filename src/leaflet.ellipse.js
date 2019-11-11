const
    RAD_TO_DEG = 180 / Math.PI,
    DEG_TO_RAD = Math.PI / 180

const wrapBrg = (brg) => {
    if (brg < 0.0) {
        brg += 360.0
        wrapBrg(brg)
    }
    else if (brg > 360.0) {
        brg -= 360.0
        wrapBrg(brg)
    }
    return brg
}

const atan2d = (y, x) => RAD_TO_DEG * Math.atan2(y, x)

const closeToZero = (x) => (Math.abs(x) < 0.0000000001 ? 0 : x)

L.Ellipse = L.Polygon.extend({
    options: {
        weight: 5,
        color: '#ffff00',
        stroke: true
    },

    initialize ({
        center = [0, 0],
        semiMinor = 100,
        semiMajor = 200,
        bearing = 0,
        numberOfPoints = 61,
        ...options
    }
    ) {
        this.setOptions(options)
            .setCenter(center)
            .setSemiMinor(semiMinor)
            .setSemiMajor(semiMajor)
            .setBearing(bearing)
            .setNumberOfPoints(numberOfPoints)
        this.setLatLngs()
        this.setRhumb()
    },

    setCenter (center = { lat: 0, lng: 0 }) {
        this._center = L.latLng(center)
        console.log('set center', center, this)

        return this.redraw()
    },

    getCenter () {
        return this._center
    },

    setSemiMinor (val) {
        this._semiMinor = val
        return this.redraw()
    },

    getSemiMinor () {
        return this._semiMinor
    },

    setSemiMajor (val) {
        this._semiMajor = val
        return this.redraw()
    },

    getSemiMajor () {
        return this._semiMajor
    },

    setBearing (bearing) {
        this._bearing = bearing
        return this.redraw()
    },

    getBearing () {
        return this._bearing
    },

    getNumberOfPoints () {
        return this._numberOfPoints
    },

    setNumberOfPoints () {
        const numberOfPoints = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 32

        this._numberOfPoints = Math.max(10, numberOfPoints)
        return this.redraw()
    },

    getRhumb () { return this._rhumb },

    setRhumb (rhumb = 45) {
        this._rhumb = rhumb
        return this.redraw()
    },

    getOptions () {
        return this.options
    },

    setOptions (options) {
        const ops = options || {}
        L.setOptions(this, ops)
        return this.redraw()
    },

    getLatLngs () {
        let angle, x, y
        const latlngs = []
        let brg = wrapBrg(this.getBearing())
        const delta = (360 / (this._numberOfPoints - 1))

        if (this._semiMinor === this._semiMajor) {
            brg = 0
        }
        console.log(this.getCenter())
        const trueStart = wrapBrg(brg)
        for (let i = 0; i < this._numberOfPoints; i++) {
            angle = (i * delta)
            if (angle >= 360.0) {
                angle -= 360.0
            }

            y = this._semiMinor * Math.sin(angle * DEG_TO_RAD)
            x = this._semiMajor * Math.cos(angle * DEG_TO_RAD)
            const tangle = closeToZero((this._semiMinor !== this._semiMajor ? atan2d(y, x) : i * delta))
            const dist = Math.sqrt(x * x + y * y)
            const pos = this.computeDestinationPos(this.getCenter(), dist, trueStart + tangle)
            //const tpos = this.getPos(this.getCenter(), angle, trueStart, this.getSemiMinor(), this.getSemiMajor())
            latlngs.push(pos)

        }

        return latlngs
    },

    getPos (center, angle, trueStart, semiMinor, semiMajor) {
        const y = semiMinor * Math.cos(angle * DEG_TO_RAD)
        const x = semiMajor * Math.sin(angle * DEG_TO_RAD)
        const tangle = closeToZero((semiMinor !== semiMajor ? atan2d(y, x) : -angle))

        const dist = Math.sqrt(x * x + y * y)
        return (this.computeDestinationPos(center, dist, trueStart + tangle))
    },

    getLatRadius () {
        return (this._semiMinor / 40075017) * 360
    },

    getLngRadius () {
        return ((this._semiMajor / 40075017) * 360) / Math.cos((Math.PI / 180) * this._latlngs.lat)
    },


    setLatLngs (latlngs = this.getLatLngs()) {
        this._setLatLngs(latlngs)
        return this.redraw()
    },

    setStyle: L.Path.prototype.setStyle,

    computeDestinationPos () {
        const start = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : { lat: 0, lng: 0 }
        const distance = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 1
        const bearing = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0
        const rng = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 6378137


        const bng = bearing * Math.PI / 180

        const lat1 = start.lat * Math.PI / 180
        const lon1 = start.lng * Math.PI / 180

        let lat2 = Math.asin(Math.sin(lat1) * Math.cos(distance / rng) + Math.cos(lat1) * Math.sin(distance / rng) * Math.cos(bng))

        let lon2 = lon1 + Math.atan2(Math.sin(bng) * Math.sin(distance / rng) * Math.cos(lat1), Math.cos(distance / rng) - Math.sin(lat1) * Math.sin(lat2))

        lat2 = lat2 * 180 / Math.PI
        lon2 = lon2 * 180 / Math.PI

        return {
            lat: lat2,
            lng: lon2
        }
    }

})

L.ellipse = function ({
    center = [0, 0],
    semiMinor = 100,
    semiMajor = 200,
    bearing = 0,
    ...options
}
) {
    return new L.Ellipse({ center, semiMinor, semiMajor, bearing, ...options })
}

