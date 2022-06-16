function map_move_end(map){
  var hash_values = read_hash();
  update_hash(map);
}

function update_hash(map){
  var center = map.getCenter();
  var temp_hash = new Object();
  temp_hash.lt = center.lat;
  temp_hash.lg = center.lng;
  temp_hash.z = map.getZoom();
  array_hash = new Array();
  for (var property in temp_hash) {
    if (temp_hash.hasOwnProperty(property)) {
      array_hash.push(property + '=' + temp_hash[property]);
    }
  }
  var hash_values = read_hash();
  if(hash_values.hasOwnProperty('av')){
    array_hash.push('av=' + hash_values['av']);
  }  
  location.hash = array_hash.join('&');
}

function read_hash(){
  var temp_hash = new Object();
  var hash = location.hash.substring(1);
  if(hash.length > 0){
    var hash_split = hash.split('&');
    for(var i=0;i<hash_split.length;i++){
      var item_split = hash_split[i].split('=');
      if(item_split.length == 2){
        temp_hash[item_split[0]] = item_split[1];
      }
    }
  }
  return temp_hash;
}

function update_avg(value){
  array_hash = new Array();
  var hash_values = read_hash();
  hash_values.av = value;
  for (var property in hash_values) {
    if (hash_values.hasOwnProperty(property)) {
      if(hash_values[property] != ''){
        array_hash.push(property + '=' + hash_values[property]);
      }
    }
  }  
  location.hash = array_hash.join('&');
}

function intersect(first_array, second_array){
  return first_array.filter(value => -1 !== second_array.indexOf(value));
}

function substract(first_array, second_array){
  return first_array.filter(value => -1 === second_array.indexOf(value));
}

function is_valid_year(path_item){
  var allowed_years = ['2016', '2017', '2018', '2019', '2020', '2021'];
  var return_value = false;
  if(path_item && path_item.length==4 && !isNaN(path_item)){
    if(allowed_years.includes(path_item)){
      return_value = true;
    }
  }  
  return return_value;
}

function get_year_from_path(){
  var return_value = '2021';
  var path_split = window.location.pathname.split('/')
  for(var i=0; i < path_split.length; i++){
    if(is_valid_year(path_split[i])){
      return_value = path_split[i];
    }
  };  
  return return_value;
}