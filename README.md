# leaflet-ellipse
Leaflet plugin for drawing ellipse

Checkout the [Demo] (https://github.com/MoebiusSolutions/leaflet-ellipse)

# Important
Leaflet.draw-ellipse requires 

+ [Leaflet 0.7](https://github.com/Leaflet/Leaflet/releases/tag/v0.7) or higher
+ [Leaflet.draw 0.2.4](https://github.com/Leaflet/Leaflet.draw/releases/tag/v0.2.4) or higher

## How to

*Traditional*

    Include Leaflet.ellipse.js in your html

    <script src='/path/to/leaflet.ellipse></script>

*Webpack as non es6 module*

    import './path/to/leaflet.ellipse'


*ES6 module*

    TODO

## API

*Factory method*

    L.ellipse(
              <LatLng> center,
              [<Number>, <Number>] radii,
              <Number> tilt,
            {  
              <...Leaflet Polyline Options>
            }
    )

    * center - Leaflet latlng (optional - [0,0])
    * radii  - Array [semiMajor,semiMinor] meters (optional - 100)
    * tilt - bearing in degrees (optional - 0)
    * any leaflet polygon options 

## Also Checkout


[leaflet.arc](https://github.com/jjwtay/leaflet.arc) - Leaflet Arc drawing.

[leaflet.draw-arc](https://github.com/jjwtay/leaflet.draw-arc) - Leaflet Draw support for leaflet.arc.

[leaflet.box](https://github.com/jjwtay/leaflet.box) - Leaflet Box(rotatable rectangle) drawing.

[leaflet.draw-box](https://github.com/jjwtay/leaflet.draw-box) - Leaflet Draw support for leaflet.box.

## License

This code is provided under the Apache 2.0 license.
