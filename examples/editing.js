var map = new ol.Map({
  target: 'map',
  layers: [new ol.layer.Tile({
    source: new ol.source.BingMaps({
      key: 'Ak-dzM4wZjSqTlzveKz5u0d4IQ4bRzVI309GxmkgSVr1ewS6iPSrOvOKhA-CJlm3',
      imagerySet: 'Aerial'
    })
  })],
  view: new ol.View({
    center: [-9777389, 5058721],
    zoom: 16
  })
});

function onDrawend() {
  setTimeout(function() {
    setActiveEditing(true);
    activeInteraction.setActive(false);
    document.getElementById('draw').value = 'select';
  }, 200);
}

var vectorLayer = new ol.layer.Vector({
 source: new ol.source.Vector()
});
vectorLayer.setMap(map);

var pointInteraction = new ol.interaction.Draw({
  type: 'Point',
  source: vectorLayer.getSource()
});
pointInteraction.setActive(false);
pointInteraction.on('drawend', onDrawend);

var lineInteraction = new ol.interaction.Draw({
  type: 'LineString',
  source: vectorLayer.getSource()
});
lineInteraction.setActive(false);
lineInteraction.on('drawend', onDrawend);

var polygonInteraction = new ol.interaction.Draw({
  type: 'Polygon',
  source: vectorLayer.getSource()
});
polygonInteraction.setActive(false);
polygonInteraction.on('drawend', onDrawend);

var circleInteraction = new ol.interaction.Draw({
  type: 'Circle',
  source: vectorLayer.getSource()
});
circleInteraction.setActive(false);
circleInteraction.on('drawend', onDrawend);

var rectangleInteraction = new ol.interaction.Draw({
  type: 'LineString',
  source: vectorLayer.getSource(),
  maxPoints: 2,
  geometryFunction: function(coordinates, geometry) {
    if (!geometry) {
      geometry = new ol.geom.Polygon(null);
    }
    var start = coordinates[0];
    var end = coordinates[1];
    geometry.setCoordinates([
      [start, [start[0], end[1]], end, [end[0], start[1]], start]
    ]);
    return geometry;
  }
});
rectangleInteraction.setActive(false);
rectangleInteraction.on('drawend', onDrawend);

var selectInteraction = new ol.interaction.Select({
  condition: ol.events.condition.click,
  wrapX: false
});
var modifyInteraction = new ol.interaction.Modify({
  features: selectInteraction.getFeatures()
});
var translateInteraction = new ol.interaction.Translate({
  features: selectInteraction.getFeatures()
});
var setActiveEditing = function(active) {
  selectInteraction.getFeatures().clear();
  selectInteraction.setActive(active);
  modifyInteraction.setActive(active);
  translateInteraction.setActive(active);
};
setActiveEditing(true);

var snapInteraction = new ol.interaction.Snap({
  source: vectorLayer.getSource()
});

map.getInteractions().extend([
    pointInteraction, lineInteraction, polygonInteraction,
    circleInteraction, rectangleInteraction,
    selectInteraction, modifyInteraction, translateInteraction,
    snapInteraction]);

var activeInteraction;
document.getElementById('draw').addEventListener('change', function(e) {
  var value = e.target.value;
  if (activeInteraction) {
    activeInteraction.setActive(false);
  }
  if (value == 'point') {
    activeInteraction = pointInteraction;
  } else if (value == 'line') {
    activeInteraction = lineInteraction;
  } else if (value == 'polygon') {
    activeInteraction = polygonInteraction;
  } else if (value == 'circle') {
    activeInteraction = circleInteraction;
  } else if (value == 'rectangle') {
    activeInteraction = rectangleInteraction;
  } else {
    activeInteraction = undefined;
  }
  setActiveEditing(!activeInteraction);
  if (activeInteraction) {
    activeInteraction.setActive(true);
  }
});
