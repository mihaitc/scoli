function numberWithCommas(x) {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

function initialize() {
  var map_latitude = 44.435599;
  var map_longitude = 26.10194;
  var map_zoom = 13;
 	var streets = L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoibWloYWl0YyIsImEiOiJQdlZ3Vk1jIn0.tifaZEFZJjYcbkOBRooqGw', {
		maxZoom: 18,
		id: 'mapbox.streets'
	});
	var here_hybrid = L.tileLayer.provider('HERE.hybridDay', {
      app_id: 'e8cITM4ZmLZY5vCISfGG',
      app_code: 'eWDxP5uk72zORpQjf8GANw'
  });
  var group_data = {
    all_grades: new L.LayerGroup(),
    above_average_grades: new L.LayerGroup(),
    below_average_grades: new L.LayerGroup(),
  };
  

  map = L.map('map', {
      center: [map_latitude, map_longitude],
      zoom: map_zoom,
      layers: [streets, group_data.all_grades]
  });

  var marker_options = {
      weight: 1,
      opacity: 1
  };

  var InfoControl = L.Control.extend({
      options: {
          position: 'bottomleft'
      },

      onAdd: function (map) {
          // create the control container with a particular class name
          var container = L.DomUtil.create('div', 'info-control');
          container.innerHTML += '<b>Școlile din București după media notelor</b><br />';
          container.innerHTML += 'Media pe oraș: ' + json['average'] + '<br />';
          container.innerHTML += json['number_schools'] + ' școli și ' +  numberWithCommas(json['number_pupils']) + ' elevi';

          L.DomEvent.disableClickPropagation(container);
          return container;
      }
  });
  map.addControl(new InfoControl());
  
  // Overlay layers are grouped
  var groupedOverlays = {
    "Note": {
      "Toate": group_data.all_grades,
      "Peste Medie": group_data.above_average_grades,
      "Sub Medie": group_data.below_average_grades,
    },
  };
  var group_options = {
    // Make the "Note" group exclusive (use radio inputs)
    exclusiveGroups: ["Note", "Localitate"],
  };     
  var base_maps = {"Hibrid": here_hybrid, "Strazi": streets, }
  L.control.groupedLayers(base_maps, groupedOverlays, group_options).addTo(map);       

  var schools = json['schools'];
  for(var i=0; i < schools.length; i++){
    if(schools[i].below_average){
      marker_options.fillColor = "red";
      marker_options.color = "red";
    }
    else {
      marker_options.fillColor = "green";
      marker_options.color = "green";
    }
    marker_options.radius =  schools[i].radius;
    marker_options.fillOpacity =  schools[i].fill;
    var marker = L.circleMarker(L.latLng(schools[i].latitude, schools[i].longitude), marker_options).addTo(map);
    var text = schools[i].school_name + "<br />Nota medie: " + schools[i].average_grade;
    text += "<br/ >Numar elevi: " + schools[i].number_pupils;
    marker.bindPopup(text);
  }
}