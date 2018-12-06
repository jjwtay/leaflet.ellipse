import uglify from 'rollup-plugin-uglify'

export default {
    entry: 'leaflet.ellipse.js',
    plugins: [
        uglify()
    ],
    dest: 'leaflet.ellipse.min.js'
}