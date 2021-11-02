const regionStyle = new ol.style.Style({
  text: new ol.style.Text({
    font: 'bold 18px "Open Sans", "Arial Unicode MS", "sans-serif"',
    placement: 'line',
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
        maxZoom: 15,
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
        url: 'https://raw.githubusercontent.com/BeauNouvelle/toril-geojson/main/cities.geojson',
      }),
      style: function(feature) {
        return new ol.style.Style({
            image: new ol.style.Icon({
            anchor: [0.5, 46],
            anchorXUnits: 'fraction',
            anchorYUnits: 'pixels',
            // we will need more of these for different types of pois. Put this in the geojson.
            // Also need mouse over on markers.
            src: 'https://openlayers.org/en/latest/examples/data/icon.png'
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
map.on('click', function(evt){
    console.log(ol.proj.transform(evt.coordinate, 'EPSG:3857', 'EPSG:4326'));
});