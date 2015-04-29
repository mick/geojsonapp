// Load native UI library
var fs = require('fs');
var dnode = require('dnode');
var lightStyle = require('./style/mapbox-light.json');
var geojsonExtent = require('geojson-extent');
var geojsonNormalize = require('geojson-normalize');
//var mapboxgl = require('mapbox-gl');
var server = dnode({
    open : function (s, cb) {
        try {
            geojson(JSON.parse(s.data), s.noClear);
        } catch(e){
            console.error('Error parsing geojson', e);
        }
        cb();
    }
}, {weak:false});
server.listen(5004);

var layers = [];

mapboxgl.accessToken = 'pk.eyJ1IjoibWlja3QiLCJhIjoiLXJIRS1NbyJ9.EfVT76g4A5dyuApW_zuIFQ';
var map = new mapboxgl.Map({
  container: 'map',
  style: lightStyle,
  center: [40, -74.50],
  zoom: 9
});

var lineLayer;
var markerLayer;

function geojson(data, noClear){
    if(!noClear) clear();
    data = geojsonNormalize(data);
    var bounds = geojsonExtent(data);

    var geojsonSource = map.addSource('geojson', {
        "type": "geojson",
        "data": data
    });


    if(!lineLayer)
        lineLayer = map.addLayer({
            "id": "lines",
            "type": "line",
            "source": "geojson",
            "paint": {
                "line-color": "#EC8D8D",
                "line-width": "4"
            }
        });

    if(!markerLayer)
        markerLayer = map.addLayer({
            "id": "markers",
            "type": "symbol",
            "source": "geojson",
            "layout": {
              "icon-image": "{marker-symbol}-12",
              "text-field": "{title}{name}",
              "text-font": "Open Sans Semibold, Arial Unicode MS Bold",
              "text-offset": [0, 0.6],
              "text-anchor": "top"
            },
            "paint": {
              "text-size": 12
            }
        });

    if ((bounds[1] ==bounds[3]) && (bounds[0] == bounds[2]))
        return console.error('skipping bad bounds');

    map.fitBounds([
        [
            bounds[1],
            bounds[0]
        ],
        [
            bounds[3],
            bounds[2]
        ]
    ], {padding: 50, speed:3});
}

function clear(){
    try {
        map.removeSource('geojson');
    } catch(e){}
}
