var rasterLayer = new ol.layer.Tile({
  source: new ol.source.XYZ({
    url: 'https://{a-d}.tiles.mapbox.com/v4/tschaub.nfak88cd/{z}/{x}/{y}.png?' +
        'access_token=pk.eyJ1IjoidHNjaGF1YiIsImEiOiI2TndKSnNjIn0.3Sc9yGKMUweACk0iG6HUbg'
  })
});

var vectorLayer = new ol.layer.Vector({
  source: new ol.source.Vector({
    url: 'data/2012-02-10.kml',
    format: new ol.format.KML()
  })
});

var map = new ol.Map({
  target: 'map',
  controls: ol.control.defaults({
    attributionOptions: {
      collapsible: false
    }
  }),
  layers: [rasterLayer, vectorLayer],
  view: new ol.View({
    center: [834774.7888102563, 5853936.254341479],
    zoom: 13
  })
});

var div = document.createElement('div');
div.className = 'overlay';
var overlay = new ol.Overlay({
  element: div,
  positioning: 'bottom-left'
});
map.addOverlay(overlay);


map.getViewport().addEventListener('mousemove', function(e) {
  var coord = map.getEventCoordinate(e);
  var pixel = map.getEventPixel(e);
  var html = map.forEachFeatureAtPixel(pixel, function(feature, layer) {
    return feature.get('name') || feature.get('description');
  });
  if (html) {
    map.getViewport().style.cursor = 'pointer';
    overlay.setPosition(coord);
    overlay.getElement().innerHTML = html;
    div.parentNode.style.display = "block";
  } else {
    map.getViewport().style.cursor = 'default';
    div.parentNode.style.display = "none";
  }
});
