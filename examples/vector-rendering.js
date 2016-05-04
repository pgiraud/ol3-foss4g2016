function updateStatitics() {
  var layer = map.getLayers().item(0);
  var features = countries.getFeatures();
  var count = 0;
  for (var i = 0, ii = features.length; i<ii; ++i) {
    count += (features[i].getGeometry().getFlatCoordinates().length / 2);
  }
  var vertexCount = count;
  count = 0;
  for (i = 0, ii = features.length; i<ii; ++i) {
    count += (features[i].getGeometry().getSimplifiedGeometry(ol.renderer.vector.getSquaredTolerance(map.getView().getResolution(), ol.has.DEVICE_PIXEL_RATIO)).getFlatCoordinates().length / 2);
  }
  var simplifiedVertexCount = count;
  var extent = map.getView().calculateExtent(map.getSize());
  extent = ol.extent.extend(extent, layer.getRenderBuffer() * map.getView().getResolution());
  features = countries.getFeaturesInExtent(extent);
  count = 0;
  for (i = 0, ii = features.length; i<ii; ++i) {
    count += (features[i].getGeometry().getSimplifiedGeometry(ol.renderer.vector.getSquaredTolerance(map.getView().getResolution(), ol.has.DEVICE_PIXEL_RATIO)).getFlatCoordinates().length / 2);
  }
  simplifiedExtentVertexCount = count;
  var replays = map.renderer_.layerRenderers_[goog.getUid(layer)].replayGroup_.replaysByZIndex_;
  var renderedVerticesCount = 0;
  if (replays[0]) {
    renderedVerticesCount = replays[0].Polygon.coordinates.length / 2;
  }
  document.getElementById('info').innerHTML =
      vertexCount + ' vertices loaded<br>' +
      simplifiedVertexCount + ' simplified vertices at current resolution<br>' +
      simplifiedExtentVertexCount + ' simplified vertices of features intersecting the current extent<br>' +
      renderedVerticesCount + ' vertices rendered';
}

var text = new ol.style.Text({
  text: '',
  fill: new ol.style.Fill({
    color: 'black'
  }),
  stroke: new ol.style.Stroke({
    color: 'white',
    width: 1
  }),
  textBaseLine: 'bottom',
  offsetY: -10
});
var cityStyles = [new ol.style.Style({
  image: new ol.style.Circle({
    radius: 3,
    fill: new ol.style.Fill({
      color: 'red'
    })
  }),
  text: text
})];

var countries = new ol.source.Vector({
  url: 'data/countries.geojson',
  format: new ol.format.GeoJSON({
    defaultDataProjection: 'EPSG:3857'
  })
});

countries.once('change', function() {
  map.once('postcompose', updateStatitics);
});

var map = new ol.Map({
  target: 'map',
  layers: [
    new ol.layer.Vector({
      name: 'countries',
      source: countries
    }),
    new ol.layer.Vector({
      name: 'cities',
      source: new ol.source.Vector({
        url: 'data/cities.geojson',
        format: new ol.format.GeoJSON()
      }),
      style: function(feature, resolution) {
        if (resolution < 5000) {
          text.setText(feature.get('NAME'));
          return cityStyles;
        }
      }
    })
  ],
  view: new ol.View({
    center: [0, 0],
    zoom: 1
  })
});

map.on('moveend', updateStatitics);
