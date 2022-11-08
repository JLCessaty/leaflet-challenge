var defaultMap = L.tileLayer('https://{s}.tile.openstreetmap.de/{z}/{x}/{y}.png', {
	maxZoom: 18,
	attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
});

// gray layer
var grayscale = L.tileLayer('https://stamen-tiles-{s}.a.ssl.fastly.net/toner-lite/{z}/{x}/{y}{r}.{ext}', {
	attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
	subdomains: 'abcd',
	minZoom: 0,
	maxZoom: 20,
	ext: 'png'
});

// water layer

var waterColor = L.tileLayer('https://stamen-tiles-{s}.a.ssl.fastly.net/watercolor/{z}/{x}/{y}.{ext}', {
	attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
	subdomains: 'abcd',
	minZoom: 1,
	maxZoom: 16,
	ext: 'jpg'
});

// topo

let topoMap = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
	maxZoom: 17,
	attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
});

//
let basemaps = {
    GrayScale: grayscale,
    "Water Color": waterColor,
    "Topography": topoMap,
    Default: defaultMap
};

// map opbject

var myMap = L.map("map", {
    center: [36.77, 119.41],
    zoom: 3,
    layers: [grayscale, waterColor, topoMap, defaultMap]
});

// add base to map

defaultMap.addTo(myMap);

//

let tPlates = new L.layerGroup();

// call api

d3.json("https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json")
.then(function(plateData){
    //load and add data
    L.geoJson(plateData,{
        color:"yellow",
        weight:1
    }).addTo(tPlates);
});

//add tPlates to map
tPlates.addTo(myMap);

//quake data

let quakes = new L.layerGroup();

//grab quake data

d3.json("https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson")
.then(
    function(earthquakeData){
        //color function
        function dataColor(depth){
            if (depth > 90)
                return "red";
            else if (depth > 70)
                return "#fc4903";
            else if (depth > 50)
                return "fc8403";
            else if (depth > 30)
                return "fcad03";
            else if (depth > 10)
                return "cafc03";
            else
                return "green";
            
        }
        function radiusSize(mag){
            if (mag == 0)
                return 1;
            else
                return mag * 5;
        }

        function dataStyle(feature)
        {
            return {
                opacity: 0.5,
                fillOpacity: 0.5,
                fillColor: dataColor(feature.geometry.coordinates[2]),
                color: "000000",
                radius: radiusSize(feature.properties.mag),
                weight: 0.5,
                stroke: true
            }
        }
       
        //add data
        L.geoJson(earthquakeData, {
            pointToLayer: function(feature, latLng){
                return L.circleMarker(latLng);
            },
            //style
            style: dataStyle,
            //popups
            onEachFeature: function(feature, layer){
                layer.bindPopup(`Magnitude: <b>${feature.properties.mag}</b><br>
                                Depth: <b>${feature.geometry.coordinates[2]}</b><br>
                                Location: <b>${feature.properties.place}</b>`);
            }

        

        }).addTo(quakes);

    }

);

//add quakes to map 
quakes.addTo(myMap);


let overlays = {
    "Tectonic Plates": tPlates,
    "Earthquake Data": quakes


};

// layer control
L.control
    .layers(basemaps, overlays)
    .addTo(myMap);

//legend
    let legend = L.control({
    position: "bottomright"

});

legend.onAdd = function() {
    let div = L.DomUtil.create("div", "info legend");
    let intervals = [-10, 10, 30, 50, 70, 90];
    let colors = [
        "green",
        "cafc03",
        "fcad03",
        "fc8403",
        "#fc4903",
        "red"
    ];

    for(var i=0; i < intervals.length; i++)
    {
        div.innerHTML += "<i style='background: "
            +colors[i]
            +"'></i>"
            +intervals[i]
            +(intervals[i+1] ? "km &ndash km;" + intervals[i+1] + "km<br>" : "+");
    }
    return div;

};

//add legend
legend.addTo(myMap);


