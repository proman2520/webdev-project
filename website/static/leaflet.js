// Flask App necessary first in order to use SQL data to make Leaflet map
// Flask App will utilize the SQL database to jsonify the necessary elements (latitude and longitude)
// JSON data from Flask App will then be available for use by Leaflet

// UFO coordinates
let queryUrl = "http://127.0.0.1:5000/api/v1.0/all_locations";

let y = 0;

d3.json(queryUrl).then(function(data) {
    console.log(data);
    y = data;
    createFeatures(data);
});

function createMap(ufos) {

    // Create the base layers.
    let street = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    })
  
    // let dark = L.tileLayer('https://stamen-tiles-{s}.a.ssl.fastly.net/watercolor/{z}/{x}/{y}.jpg', {
    //   maxZoom: 18,
    //   attribution: 'Map data &copy; <a href="https://stamen.com/">Stamen Design</a>'
    // });
  
    // Create a baseMaps object.
    let baseMaps = {
      // "Night Map": dark,
      "Street Map": street
    };
  
    // Create an overlay object to hold our overlay.
    let overlayMaps = {
      Ufos: ufos
    };
  
    // Create our map, giving it the streetmap and earthquakes layers to display on load.
    let myMap = L.map("map", {
      center: [
        37.09, -95.71
      ],
      zoom: 5,
      layers: [street, ufos]
    });
  
    // Create a layer control.
    // Pass it our baseMaps and overlayMaps.
    // Add the layer control to the map.
    L.control.layers(baseMaps, overlayMaps, {
      collapsed: false
    }).addTo(myMap);
    
    // // Create a legend (COMMENTED OUT)
    // let legend = L.control({
    //   position: "bottomright"
    // });

    // // When the layer control is added, insert a div with the class of "legend".
    // legend.onAdd = function() {
    //   let div = L.DomUtil.create("div", "legend");

    //   let grades = [-10, 10, 30, 50, 70, 90];
    //   let colors = ["green", "yellowgreen", "yellow", "orange", "orangered","red"]

    //   //Assistance
    //   for (let i = 0; i < grades.length; i++) {
    //     div.innerHTML += "<i style='background: " + colors[i] + "'>&nbsp;</i> "
    //       + grades[i] + (grades[i + 1] ? "&ndash;" + grades[i + 1] + "<br>" : "+");
    //   }
    //   return div;
    // };

    // // Add the info legend to the map.
    // legend.addTo(myMap);
}

// function onEachFeature(feature, layer) {
//     layer.bindPopup(`<h3>${feature.id}</h3><hr><p>${new Date(feature.datetime)}</p><hr> \
//                     <p>Descriptor: ${feature.shape}<br>Duration: ${feature.duration_seconds}</p>`);
// }

function createFeatures(ufoData) {

  function createCircleMarker(ufo) {
    let options = {
      radius: 1,
      fillOpacity: 0.50,
      color: "grey",
      weight: 1,
    };

    const coord = [ufo.latitude, ufo.longitude];

    // Create the circle marker and bind the popup to it
    const marker = L.circleMarker(coord, options).bindPopup(
      `<h3>${ufo.id}</h3><hr><p>${new Date(ufo.datetime)}</p><hr>
       <p>Descriptor: ${ufo.shape}<br>Duration: ${ufo.duration_seconds}</p>`
    );

    return marker;
  }

  let markers = L.markerClusterGroup();

  for (ufo of ufoData) {
    markers.addLayer(createCircleMarker(ufo));
  } 

    // Send our ufo layer to the createMap function/
    // createMap(L.layerGroup(markers));
    createMap(markers);

}