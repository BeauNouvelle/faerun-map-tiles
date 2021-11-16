const regionStyle = new ol.style.Style({
  text: new ol.style.Text({
    font: 'bold 18px "Open Sans", "Arial Unicode MS", "sans-serif"',
    placement: 'line',
    overflow: true,
    fill: new ol.style.Fill({
      color: 'black',
    }),
    stroke: new ol.style.Stroke({
      color: 'red',
      width: 2,
    })
  }),
});

const streetStyle = new ol.style.Style({
  text: new ol.style.Text({
    font: '11px "Open Sans", "Arial Unicode MS", "sans-serif"',
    placement: 'line',
    fill: new ol.style.Fill({
      color: 'black',
    }),
    stroke: new ol.style.Stroke({
      color: 'white',
      width: 4,
    })
  }),
});

var map = new ol.Map({
  target: 'map',
  layers: [
  new ol.layer.Tile({
    source: new ol.source.XYZ({
      attributions: [
      'Support the project on <a href="https://www.patreon.com/fantasyatlas?fan_landing=true/">Patreon</a>'
      ],
      url: 'https://raw.githubusercontent.com/BeauNouvelle/toril-tiles/main/{z}/{y}/{x}.jpg',
      maxZoom: 20,
    })
  }),
  new ol.layer.Vector({
    declutter: true,
    source: new ol.source.Vector({
      format: new ol.format.GeoJSON(),
      url: 'https://raw.githubusercontent.com/BeauNouvelle/toril-geojson/main/roads.geojson',
    }),
    style: function (feature) {
      streetStyle.getText().setText(feature.get('name'));
      return streetStyle;
    },
  }),
  new ol.layer.Vector({
    declutter: true,
    source: new ol.source.Vector({
      format: new ol.format.GeoJSON(),
      url: 'https://raw.githubusercontent.com/BeauNouvelle/toril-geojson/main/regions.geojson',
    }),
    style: function (feature) {
      regionStyle.getText().setText(feature.get('name'));
      return regionStyle;
    },
  }),
  new ol.layer.Vector({
    declutter: true,
    source: new ol.source.Vector({
      format: new ol.format.GeoJSON(),
      url: 'https://raw.githubusercontent.com/BeauNouvelle/toril-geojson/main/pois.geojson',
    }),
    style: function(feature) {
      return new ol.style.Style({
        image: new ol.style.Icon({
          anchor: [0.5, 30],
          anchorXUnits: 'fraction',
          anchorYUnits: 'pixels',
          src: icon_source(feature)
        })
      });
    }
  }),
  new ol.layer.Vector({
    declutter: true,
    source: new ol.source.Vector({
      format: new ol.format.GeoJSON(),
      url: 'https://raw.githubusercontent.com/BeauNouvelle/toril-geojson/main/cities.geojson',
    }),
    style: function(feature) {
      return new ol.style.Style({
        image: new ol.style.Icon({
          anchor: [0.5, 30],
          anchorXUnits: 'fraction',
          anchorYUnits: 'pixels',
          src: icon_source(feature)
        })
      });
    }
  })
  ],
  view: new ol.View({
    center: ol.proj.fromLonLat([-74.76219340955835, 38.689597526996266]),
    zoom: 5
  }),
  // controls: ol.control.defaults({ attribution: false}).extend([attribution])
});

// Popup showing the position the user clicked
var coordElement = document.getElementById('coordpopup');
const coordPopup = new ol.Overlay({
  element: document.getElementById('coordpopup'),
});
map.addOverlay(coordPopup);

map.on('pointermove', function (evt) {
  var feature = map.forEachFeatureAtPixel(evt.pixel, function (feature) {
    if (canShowWiki(feature)) {
      return feature;
    };
  });

  if (feature) {
    var name = feature.get('name');
    var style = feature.get('style');
    var coordinates = feature.getGeometry().getCoordinates();

    $(coordElement).tooltip('dispose');
    coordPopup.setPosition(coordinates);
    $(coordElement).tooltip({
      container: coordElement,
      placement: 'top',
      animation: false,
      html: true,
      title: '<h3>'+name+'</h3>',
    });
    $(coordElement).tooltip('show');
  } else {
    $(coordElement).tooltip('dispose');
  }
});

var featElement = document.getElementById('featurepopup');

var featPopup = new ol.Overlay({
  element: featElement,
  stopEvent: false
});
map.addOverlay(featPopup);

function canShowWiki(feature) {
  var style = feature.get('style');
  return style == "city" || style == "town" || style == "castle"
}

// display overlay on Feature click
map.on('click', function (evt) {
  var feature = map.forEachFeatureAtPixel(evt.pixel, function (feature) {
    if (canShowWiki(feature)) {
      return feature;
    };
  });

  if (feature) {
    var name = feature.get('name');
    $.ajax({
      url: 'https://forgottenrealms.fandom.com/api.php',
      dataType: 'jsonp',
      data: {
        page: name,
        prop: "text",
        redirects: !0,
        action: "parse",
        format: "json"
      }
    }).done(function(o) {
      if (o.parse && o.parse.text) {
        var n = o.parse.text["*"];
        var t = parse_wiki_html(n);
        $('#overlay').html(t);
        $('#referencelink').html("<a href='https://forgottenrealms.fandom.com/wiki/" + name + "'>Reference</a>");
        document.getElementById("sidebar").style.display = "block";
        $("#overlay").scrollTop(0);
      }
    });
  } else {
    document.getElementById("sidebar").style.display = "none";
  }
});


// log coords on click. (useful for creating geojson content)
map.on('click', function(evt){
  console.log(ol.proj.transform(evt.coordinate, 'EPSG:3857', 'EPSG:4326'));
});

function icon_source(feature) {
  var style = feature.get('style');
  switch(style) {
    case "city":
      return 'https://img.icons8.com/external-wanicon-lineal-color-wanicon/40/000000/external-castle-fairytale-wanicon-lineal-color-wanicon.png'
    case "town":
      return 'https://img.icons8.com/color/40/000000/village.png'
    case "castle":
      return 'https://img.icons8.com/color/36/000000/palace.png'
    default:
      return 'https://img.icons8.com/fluency/30/000000/sphere.png'
  }
}

function parse_wiki_html(e) {
  var t = $("<div></div>").html(e);
  t.find("a").each(function() {
    $(this).replaceWith($(this).html())
  });
  var o = new RegExp("^(?:[a-z]+:)?//", "i");
  return t.find("img").not('[src^="http"],[src^="https"]').each(function() {
    $(this).attr("src", function(e, t) {
      return o.test(t) ? void 0 : "https://forgottenrealms.fandom.com/api.php" + t
    })
  }), t.find("sup").remove(), t.find(".mw-ext-cite-error").remove(), t.find(".mw-editsection").remove(), t
}

var i = 0;
var dragging = false;
$('#dragbar').mousedown(function(e){
 e.preventDefault();

 dragging = true;
 var main = $('#main');
 var ghostbar = $('<div>',
  {id:'ghostbar',
  css: {
    height: main.outerHeight(),
    top: main.offset().top,
    left: main.offset().left
  }
}).appendTo('body');

 $(document).mousemove(function(e){
  ghostbar.css("left",e.pageX+2);
});
});

$(document).mouseup(function(e){
 if (dragging) {
   $('#sidebar').css("width",e.pageX+2);
           // $('#main').css("left",e.pageX+2);
           $('#ghostbar').remove();
           $(document).unbind('mousemove');
           dragging = false;
         }
       });


