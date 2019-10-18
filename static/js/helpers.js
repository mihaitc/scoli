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