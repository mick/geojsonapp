// Load native UI library
var fs = require('fs');
var dnode = require('dnode');
var mapboxjs = require('mapbox.js')
var server = dnode({
    open : function (s, cb) {
        if(s.clear) clear();
        geojson(JSON.parse(s.data));
        cb();
    }
}, {weak:false});
server.listen(5004);

L.mapbox.accessToken = 'pk.eyJ1IjoibWlja3QiLCJhIjoiLXJIRS1NbyJ9.EfVT76g4A5dyuApW_zuIFQ';
var map = L.mapbox.map('map', 'mickt.hdof2a3d');
var layers = [];

function geojson(data){

    var geojsonLayer = L.geoJson(data, {
        onEachFeature: function (feature, layer) {
            var desc = "";
            for(p in feature.properties) {
                desc += "<b>"+p+":</b> "+feature.properties[p]+"<br />";
            }
            layer.bindPopup(desc);
        }
    }).addTo(map);
    layers.push(geojsonLayer);
    map.fitBounds(geojsonLayer.getBounds());
}

function clear(){
    while(layers.length > 0) {
        map.removeLayer(layers.shift());
    }
}
