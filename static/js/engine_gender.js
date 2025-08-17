function numberWithCommas(x) {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

function add_css(filename){
  var base_static = 'https://mihaitc.github.io/scoli/static/';
  var head  = document.getElementsByTagName('head')[0];
  var link  = document.createElement('link');
  link.rel  = 'stylesheet';
  link.type = 'text/css';
  link.href = base_static + 'css/' + filename;
  link.media = 'all';
  head.appendChild(link);  
}

add_css('leaflet.css');
add_css('scoli.css');
add_css('bootstrap.min.css');

var female_draw_color = "red";
var male_draw_color = "blue";
var no_color = "";

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
  
 	var streets = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', { 
		maxZoom: 18,
		id: 'streets'
	});
  var here_hybrid = L.tileLayer('https://api.maptiler.com/maps/hybrid/{z}/{x}/{y}.png?key=hkaDaUlIs4llswXSkpD7',{ //style URL
          tileSize: 512,
          zoomOffset: -1,
          minZoom: 1,
          attribution: "\u003ca href=\"https://www.maptiler.com/copyright/\" target=\"_blank\"\u003e\u0026copy; MapTiler\u003c/a\u003e \u003ca href=\"https://www.openstreetmap.org/copyright\" target=\"_blank\"\u003e\u0026copy; OpenStreetMap contributors\u003c/a\u003e",
          crossOrigin: true
        })
  var group_data = {
    all_grades: new L.FeatureGroup(),
    female_grades: new L.FeatureGroup(),
    male_grades: new L.FeatureGroup(),
  };
  var selected_grades = group_data.all_grades; 
  if(hash_values.hasOwnProperty('av')){
    if(hash_values['av'] == 'a'){
      selected_grades = group_data.female_grades;
    }
    else if(hash_values['av'] == 'b'){
      selected_grades = group_data.male_grades;
    }    
  };      
  
  map = L.map('map', {
      center: [map_latitude, map_longitude],
      zoom: map_zoom,
      layers: [streets, selected_grades]
  });
   
  map.on('overlayadd', function(e) {
    if(e.name == 'Băieți'){
      update_avg('b');
    }
    else if(e.name == 'Fete'){
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
          var average_diff_color = json['males_a'] ? male_draw_color : female_draw_color;
          var container = L.DomUtil.create('div', 'info-control');
          var control_html = '<b>Școlile din '+ json['place_name'];
          control_html += ' după media notelor</b><br />';
          control_html += '<span style="color:' + female_draw_color + '">Media fete ';
          if(json['class_name']){
            control_html += '(' + json['class_name']  + ') ';
          }
          control_html += 'pe ' + json['place_type'] + ': ' + json['average_f'] + '</span><br />';
          control_html += '<span style="color:' + male_draw_color + '">Media băieți ';
          if(json['class_name']){
            control_html += '(' + json['class_name']  + ') ';
          }
          control_html += 'pe ' + json['place_type'] + ': ' + json['average_m'] + '</span><br />';
          control_html += 'Diferență: <span style="color:' + average_diff_color + '">' + json['average_diff'] + '</span><br />';
          control_html += 'Fete: ' + numberWithCommas(json['female_count']) + ', băieți: ' +  numberWithCommas(json['male_count']);
          container.innerHTML = control_html;

          L.DomEvent.disableClickPropagation(container);
          return container;
      }
  });
  map.addControl(new InfoControl());  
  
  // Overlay layers are grouped
  var groupedOverlays = {
    "Note": {
      "Toate": group_data.all_grades,
      "Fete": group_data.female_grades,
      "Băieți": group_data.male_grades,
    },
  };

  var group_options = {
    // Make the "Note" group exclusive (use radio inputs)
    exclusiveGroups: ["Note", ],
  };
  var base_maps = {"Hibrid": here_hybrid, "Strazi": streets, }
  L.control.groupedLayers(base_maps, groupedOverlays, group_options).addTo(map);
  var placename_selector = L.control.placenameSelect({position: 'bottomright'});
  placename_selector.addTo(map);
  placename_selector.on('change', function(e){});
  var class_selector = L.control.classSelect({position: 'bottomright'});
  class_selector.addTo(map);
  class_selector.on('change', function(e){});
  if(json['school_type'] != 'oraș'){
    var school_type_selector = L.control.schoolTypeSelect({position: 'bottomright'});
    school_type_selector.addTo(map);
    school_type_selector.on('change', function(e){});
  };    
  
  var year_selector = L.control.yearSelect({position: 'bottomright'});
  year_selector.addTo(map);  
  year_selector.on('change', function(e){});  
  
  var schools = json['schools'];
  for(var i=0; i < schools.length; i++){
    var diff_color = '';
    if(schools[i].ba){
      marker_options.fillColor = male_draw_color;
      marker_options.color = male_draw_color;
      diff_color = male_draw_color;
    }
    else {
      marker_options.fillColor = female_draw_color;
      marker_options.color = female_draw_color;
      diff_color = female_draw_color;
    }
    marker_options.radius =  schools[i].r;
    marker_options.fillOpacity =  schools[i].f;
    var marker = L.circleMarker(L.latLng(schools[i].lt, schools[i].lg), marker_options);
    var text = schools[i].sn + "<br /><span style=\"color:" + female_draw_color + "\">Nota medie fete";
    if(json['class_name']){
      text += ' (' + json['class_name']  + ')';
    }
    text += ": " + schools[i].agf + '</span>';
    text += "<br /><span style=\"color:" + male_draw_color + "\">Nota medie băieți";
    if(json['class_name']){
      text += ' (' + json['class_name']  + ')';
    }
    text += ': ' + schools[i].agm + '</span>';
    text += "<br />Diferență: <span style=\"color:" + diff_color + "\">" + schools[i].df + "</span>";
    text += "<br/ >Număr elevi: " + schools[i].n;
    text += " (<span style=\"color:" + no_color + ";\">f: " + schools[i].nf + "</span>, <span style=\"color:" + no_color + ";\">b: " + schools[i].nm + "</span>)";
    marker.bindPopup(text).addTo(group_data.all_grades);
    if(schools[i].ba){
      L.circleMarker(L.latLng(schools[i].lt, schools[i].lg), marker_options).bindPopup(text).addTo(group_data.male_grades);
    }
    else {
      L.circleMarker(L.latLng(schools[i].lt, schools[i].lg), marker_options).bindPopup(text).addTo(group_data.female_grades);
    }
  };
  if(json['bounds']['res_longitude_sw'] !== null && json['bounds']['res_longitude_ne'] !== null){
    var hash_values = read_hash();
    if(!hash_values.hasOwnProperty('lt') || (hash_values.hasOwnProperty('lt') && isNaN(hash_values.lt))){
      map.fitBounds(group_data.all_grades.getBounds());
    }
  }
  map.on('load moveend', function(event){
    map_move_end(map);
  });  
}