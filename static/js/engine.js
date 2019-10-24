function numberWithCommas(x) {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

function initialize() {
  var hash_values = read_hash();
  if(hash_values.hasOwnProperty('lt') && !isNaN(hash_values.lt)){
    var map_latitude = hash_values.lt;
  }  
  else {
    var map_latitude = json['pn_geo']['lt'];
  }
  if(hash_values.hasOwnProperty('lg') && !isNaN(hash_values.lg)){
    var map_longitude = hash_values.lg;
  }  
  else {
    var map_longitude = json['pn_geo']['lg'];
  }
  if(hash_values.hasOwnProperty('z') && !isNaN(hash_values.z)){
    map_zoom = hash_values.z;
  }  
  else{
    var map_zoom = json['pn_geo']['z'];
  }  
  
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
  var selected_grades = group_data.all_grades; 
  if(hash_values.hasOwnProperty('av')){
    if(hash_values['av'] == 'a'){
      selected_grades = group_data.above_average_grades;
    }
    else if(hash_values['av'] == 'b'){
      selected_grades = group_data.below_average_grades;
    }    
  };

  map = L.map('map', {
      center: [map_latitude, map_longitude],
      zoom: map_zoom,
      layers: [streets, selected_grades]
  });
  
  map.on('overlayadd', function(e) {
    if(e.name == 'Sub Medie'){
      update_avg('b');
    }
    else if(e.name == 'Peste Medie'){
      update_avg('a');      
    }
    else if(e.name == 'Toate'){
      update_avg('');            
    }    
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
          container.innerHTML += '<b>Școlile din ' + json['place_name'] + '</b><br />';
          container.innerHTML += 'Media pe ' + json['place_type'] + ': ' + json['average'] + '<br />';
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
  var placename_selector = L.control.placenameSelect({position: 'bottomright'});
  placename_selector.addTo(map);  
  placename_selector.on('change', function(e){});  
  if(json['school_type'] != 'oraș'){
  var school_type_selector = L.control.schoolTypeSelect({position: 'bottomright'});
    school_type_selector.addTo(map);  
    school_type_selector.on('change', function(e){}); 
  }  

  var schools = json['schools'];
  for(var i=0; i < schools.length; i++){
    if(schools[i].ba){
      marker_options.fillColor = "red";
      marker_options.color = "red";
    }
    else {
      marker_options.fillColor = "green";
      marker_options.color = "green";
    }
    marker_options.radius =  schools[i].r;
    marker_options.fillOpacity =  schools[i].f;
    var marker = L.circleMarker(L.latLng(schools[i].lt, schools[i].lg), marker_options);
    var text = schools[i].sn + "<br />Nota medie: " + schools[i].ag;
    text += "<br/ >Numar elevi: " + schools[i].n;
    marker.bindPopup(text).addTo(group_data.all_grades);
    if(schools[i].ba){
      L.circleMarker(L.latLng(schools[i].lt, schools[i].lg), marker_options).bindPopup(text).addTo(group_data.below_average_grades);
    }
    else {
      L.circleMarker(L.latLng(schools[i].lt, schools[i].lg), marker_options).bindPopup(text).addTo(group_data.above_average_grades);
    }
  };
  if(json['bounds']['res_longitude_sw'] !== null && json['bounds']['res_longitude_ne'] !== null){
    map_bounds = L.latLngBounds([json['bounds']['res_latitude_sw'], json['bounds']['res_longitude_sw']],
                                [json['bounds']['res_latitude_ne'], json['bounds']['res_longitude_ne']]);
    map.fitBounds(map_bounds);
  }  
  map.on('load moveend', function(event){
    map_move_end(map);
  });  
}