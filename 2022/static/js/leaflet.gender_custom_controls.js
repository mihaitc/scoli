var class_names = ['romana', 'mate', ]
var school_type_names = ['rural', 'urban']

L.Control.SchoolTypeSelect = L.Control.extend({
 onAdd: function(map) {
   var school_type = '';
   var new_path_split = new Array();
   var path_split = window.location.pathname.split('/');
   for(var i=0; i < path_split.length; i++){
     if(path_split[i]){
       new_path_split.push(path_split[i]);
     }
   };
   if(new_path_split.length == 2){
     new_path_split.push('bucuresti');
   }
   if(new_path_split){
     var place_name = new_path_split[new_path_split.length-1];
     var place_name_split = place_name.split('_');
     if(place_name_split){
       var intersection = intersect(place_name_split, school_type_names);
       if(intersection){
         var school_type = intersection[0];
       }       
     }
   }
   // console.log(place_name);
   var school_type_dict = {};
   for(var i=0; i < school_type_names.length; i++){
     if(school_type_names[i] == school_type){
       school_type_dict[school_type_names[i]] = 'selected="SELECTED"';
     }
     else {
       school_type_dict[school_type_names[i]] = '';
     }
   }

   this.div = L.DomUtil.create('div','leaflet-schooltypeselect-container');
   this.select = L.DomUtil.create('select','leaflet-schooltypeselect',this.div);
   this.select.onmousedown = L.DomEvent.stopPropagation;
   var content = '';
   content += '<option value="">Toate</option>';
   content += '<option value="rural" ' + school_type_dict['rural'] + '>Rural</option>';
   content += '<option value="urban" ' + school_type_dict['urban'] + '>Urban</option>';
   this.select.innerHTML = content;

   return this.div;
 },
  on: function(type,handler){
    if (type == 'change'){
      this.onChange = handler;
      L.DomEvent.addListener(this.select,'change',this._onChange,this);
    } else if (type == 'click'){ //don't need this here probably, but for convenience?
      this.onClick = handler;
      L.DomEvent.addListener(this.select,'click',this.onClick,this);
    } else {
      console.log('SchoolTypeSelect - cannot handle '+type+' events.')
    }
  },
  _onChange: function(e) {
    var combined = class_names.concat(school_type_names);
    var selected_school_type = this.select.options[this.select.selectedIndex].value;
    var new_path_split = new Array();
    var path_split = window.location.pathname.split('/')
    for(var i=0; i < path_split.length; i++){
      if(path_split[i]){
        new_path_split.push(path_split[i]);
      }
    };
    if(new_path_split.length == 2){
      new_path_split.push('bucuresti');
    }    
    if(new_path_split){
      var place_name = new_path_split[new_path_split.length-1];
      var place_name_split = place_name.split('_');
      var new_place_name = place_name;
      if(place_name_split.length){
        var temp_array = new Array();
        temp_array.push(substract(place_name_split, combined).join('_'));
        if(selected_school_type){
          temp_array.push(selected_school_type);
        }
        var class_intersection = intersect(place_name_split, class_names);
        if(class_intersection.length){
          temp_array.push(class_intersection[0]);
        }
        new_place_name = temp_array.join('_');
      }
      window.location.hash = '';
      window.location.pathname = '/' + new_path_split.slice(0, -1).join('/') + '/' + new_place_name + '/';
    }
  }
});

L.control.schoolTypeSelect = function(opts) {
 return new L.Control.SchoolTypeSelect(opts);
};

L.Control.PlacenameSelect = L.Control.extend({
 onAdd: function(map) {
   var placename = '';
   var combined = class_names.concat(school_type_names);
   var cities = new Array();
   var counties = new Array();
   var new_path_split = new Array();
   var path_split = window.location.pathname.split('/');
   for(var i=0; i < path_split.length; i++){
     if(path_split[i]){
       new_path_split.push(path_split[i]);
     }
   };
   if(new_path_split.length == 2){
     new_path_split.push('bucuresti');
   }   
   if(new_path_split){
     var place_name = new_path_split[new_path_split.length-1];
     var place_name_split = place_name.split('_');
     if(place_name_split){       
       placename = substract(place_name_split, combined).join('_');
     }
   }
   var placename_dict = {};
   for(var i=0; i < placenames.length; i++){
     if(placenames[i]['place_type'] == 'city'){
       cities.push(placenames[i]);
     }
     else if(placenames[i]['place_type'] == 'county'){
       counties.push(placenames[i]);
     }     
     if(placenames[i]['slug'] == placename){
       placename_dict[placenames[i]['slug']] = 'selected="SELECTED"';
     }
     else {
       placename_dict[placenames[i]['slug']] = '';
     }
   }

   this.div = L.DomUtil.create('div','leaflet-placenameselect-container');
   this.select = L.DomUtil.create('select','leaflet-placenameselect',this.div);
   this.select.onmousedown = L.DomEvent.stopPropagation;
   var content = '';
   content += '<option value="romania">România</option>';
   content += '<optgroup label="Județe">';
   for(var i=0; i< counties.length; i++){
     content += '<option value="' + counties[i]['slug'] + '" ' + placename_dict[counties[i]['slug']] + '>' + counties[i]['place_name'] + '</option>';
   }
   content += '</optgroup>';
   content += '<optgroup label="Orașe">';
   for(var i=0; i< cities.length; i++){
     content += '<option value="' + cities[i]['slug'] + '" ' + placename_dict[cities[i]['slug']] + '>' + cities[i]['place_name'] + '</option>';
   }
   content += '</optgroup>';  
   this.select.innerHTML = content;

   return this.div;
 },
  on: function(type,handler){
    if (type == 'change'){
      this.onChange = handler;
      L.DomEvent.addListener(this.select,'change',this._onChange,this);
    } else if (type == 'click'){ //don't need this here probably, but for convenience?
      this.onClick = handler;
      L.DomEvent.addListener(this.select,'click',this.onClick,this);
    } else {
      console.log('Placename - cannot handle '+type+' events.')
    }
  },
  _onChange: function(e) {
    var selected_placename = this.select.options[this.select.selectedIndex].value;
    var new_path_split = new Array();
    var path_split = window.location.pathname.split('/')
    for(var i=0; i < path_split.length; i++){
      if(path_split[i]){
        new_path_split.push(path_split[i]);
      }
    };
    if(new_path_split.length == 2){
      new_path_split.push('bucuresti');
    }    
    var new_path = '/' + new_path_split.slice(0, -1).join('/') + '/' + selected_placename + '/';
    window.location.hash = '';
    window.location.pathname = new_path;
  }
});

L.control.placenameSelect = function(opts) {
 return new L.Control.PlacenameSelect(opts);
};

L.Control.ClassSelect = L.Control.extend({
 onAdd: function(map) {
   var gender = '';
   var new_path_split = new Array();
   var path_split = window.location.pathname.split('/');
   for(var i=0; i < path_split.length; i++){
     if(path_split[i]){
       new_path_split.push(path_split[i]);
     }
   };
   if(new_path_split.length == 2){
     new_path_split.push('bucuresti');
   }
   if(new_path_split){
     var place_name = new_path_split[new_path_split.length-1];
     var place_name_split = place_name.split('_');
     if(place_name_split){
       var intersection = intersect(place_name_split, class_names);
       if(intersection){
         var class_name = intersection[0];
       }
     }
   }
   var class_name_dict = {};
   for(var i=0; i < class_names.length; i++){
     if(class_names[i] == class_name){
       class_name_dict[class_names[i]] = 'selected="SELECTED"';
     }
     else {
       class_name_dict[class_names[i]] = '';
     }
   }

   this.div = L.DomUtil.create('div','leaflet-genderselect-container');
   this.select = L.DomUtil.create('select','leaflet-genderselect',this.div);
   this.select.onmousedown = L.DomEvent.stopPropagation;
   var content = '';
   content += '<option value="">Toate</option>';
   content += '<option value="romana" ' + class_name_dict['romana'] + '>Lb. română</option>';
   content += '<option value="mate" ' + class_name_dict['mate'] + '>Matematică</option>';
   this.select.innerHTML = content;

   return this.div;
 },
  on: function(type,handler){
    if (type == 'change'){
      this.onChange = handler;
      L.DomEvent.addListener(this.select,'change',this._onChange,this);
    } else if (type == 'click'){ //don't need this here probably, but for convenience?
      this.onClick = handler;
      L.DomEvent.addListener(this.select,'click',this.onClick,this);
    } else {
      console.log('GenderSelect - cannot handle '+type+' events.')
    }
  },
  _onChange: function(e) {
    var selected_class = this.select.options[this.select.selectedIndex].value;
    var new_path_split = new Array();
    var path_split = window.location.pathname.split('/')
    for(var i=0; i < path_split.length; i++){
      if(path_split[i]){
        new_path_split.push(path_split[i]);
      }
    };  
    if(new_path_split.length == 2){
      new_path_split.push('bucuresti');
    }    
    if(new_path_split){
      var place_name = new_path_split[new_path_split.length-1];
      var place_name_split = place_name.split('_');
      var new_place_name = place_name;
      if(place_name_split.length == 1){
        var old_place_name = place_name_split[0];
      }
      else if (place_name_split.length >=2 ){
        if(intersect(place_name_split, class_names)){
          var old_place_name =  substract(place_name_split, class_names).join('_');
        }
      }
      else {
        var old_place_name = place_name;
      }
      if(selected_class){
        new_place_name = old_place_name + '_' + selected_class;
      }
      else {
        new_place_name = old_place_name;
      }
      window.location.hash = '';
      window.location.pathname = '/' + new_path_split.slice(0, -1).join('/') + '/' + new_place_name + '/';
    }
  }
});

L.control.classSelect = function(opts) {
 return new L.Control.ClassSelect(opts);
};

L.Control.YearSelect = L.Control.extend({
 onAdd: function(map) {
   var year = '2021';
   var allowed_years = get_gender_allowed_years();
   var path_split = window.location.pathname.split('/');
   for(var i=0; i < path_split.length; i++){
     if(path_split[i] && path_split[i].length==4 && !isNaN(path_split[i])){
       if(allowed_years.includes(path_split[i])){
         year = path_split[i];
         break;
       }
     }
   };
   var year_dict = {};   
   for(var i=0; i < allowed_years.length; i++){
     if(allowed_years[i] == year){
       year_dict[allowed_years[i]] = 'selected="SELECTED"';
     }
     else {
       year_dict[allowed_years[i]] = '';
     }
   }

   this.div = L.DomUtil.create('div','leaflet-yearselect-container');
   this.select = L.DomUtil.create('select','leaflet-yearselect',this.div);
   this.select.onmousedown = L.DomEvent.stopPropagation;
   var content = '';
   for(var i=0; i < allowed_years.length; i++){
     content += '<option value="' + allowed_years[i] + '" ' + year_dict[allowed_years[i]] + '>' + allowed_years[i] + '</option>';   
   }
   this.select.innerHTML = content;

   return this.div;
 },
  on: function(type,handler){
    if (type == 'change'){
      this.onChange = handler;
      L.DomEvent.addListener(this.select,'change',this._onChange,this);
    } else if (type == 'click'){ //don't need this here probably, but for convenience?
      this.onClick = handler;
      L.DomEvent.addListener(this.select,'click',this.onClick,this);
    } else {
      console.log('Year - cannot handle '+type+' events.')
    }
  },
  _onChange: function(e) {
    var latest_year = '2021';
    var selected_year = this.select.options[this.select.selectedIndex].value;
    var new_path_split = new Array();
    var year_path_list = new Array();
    var path_split = window.location.pathname.split('/')
    for(var i=0; i < path_split.length; i++){
      if(path_split[i] && !is_valid_year(path_split[i])){
        new_path_split.push(path_split[i]);
      }
    };
    if(new_path_split.length == 2){
      new_path_split.push('bucuresti');
    }    
    if(selected_year == latest_year){
      year_path_list = new_path_split;
    }
    else {
      year_path_list = year_path_list.concat(new_path_split.slice(0, 2), [selected_year], new_path_split.slice(2));
    }
    var new_path = year_path_list.join('/') + '/';
    window.location.hash = '';
    window.location.pathname = new_path;
  }
});

L.control.yearSelect = function(opts) {
 return new L.Control.YearSelect(opts);
};