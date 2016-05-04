var raster = new ol.layer.Tile({
  source: new ol.source.BingMaps({
    imagerySet: 'Aerial',
    key: 'Ak-dzM4wZjSqTlzveKz5u0d4IQ4bRzVI309GxmkgSVr1ewS6iPSrOvOKhA-CJlm3'
  })
});

var style = new ol.style.Style({
  image: new ol.style.Circle({
    fill: new ol.style.Fill({
      color: 'rgb(255,240,0)'
    }),
    stroke: new ol.style.Stroke({
      color: 'rgb(255,170,0)',
      width: 1.5
    }),
    radius: 5.5
  }),
  stroke: new ol.style.Stroke({
    color: 'rgb(50,200,50)',
    width: 2
  })
});

var source = new ol.source.Vector({
  url: 'data/leverich.gpx',
  format: new ol.format.GPX()
});

var maxRotation = Math.PI / 200;

var past = [];
var vector = new ol.layer.Vector({
  source: source,
  style: function(feature, resolution) {
    var deltaTime;
    if (playing) {
      deltaTime = 30 * ((Date.now() / 1000) - originM);
    } else if (stopM) {
      deltaTime = 30 * (stopM - originM);
    } else {
      deltaTime = 0;
    }
    var line = feature.getGeometry().getLineString(0);
    var time = stats.minTime + deltaTime;
    if (time > stats.maxTime) {
      time = stats.maxTime;
      reset();
    }
    var coord = line.getCoordinateAtM(time, true);
    var next = line.getCoordinateAtM(time + 30, true);
    var nextRotation = Math.atan2(next[1] - coord[1], next[0] - coord[0]) - Math.PI / 2
    var rotation = view.getRotation();
    var deltaRotation = nextRotation - rotation;
    if (deltaRotation > maxRotation) {
      view.setRotation(rotation + maxRotation);
    } else if (deltaRotation < -maxRotation) {
      view.setRotation(rotation - maxRotation);
    } else {
      view.setRotation(nextRotation);
    }
    view.setCenter(coord);

    var point = new ol.geom.Point(coord, 'XYZM');
    past.unshift(point);
    style.setGeometry(new ol.geom.GeometryCollection([line, point]));
    return [style];
  }
});

var view = new ol.View({
  center: ol.proj.fromLonLat([-111.0335, 45.5765]),
  zoom: 10
});

var map = new ol.Map({
  target: document.getElementById('map'),
  layers: [raster, vector],
  controls: [new ol.control.Zoom()],
  view: view
});

var timeRange = null;

var stats = {
  minTime: Infinity,
  maxTime: -Infinity,
  minZ: Infinity,
  maxZ: -Infinity,
  lengths: [],
  coordinates: []
};

function distance(from, to) {
  var dx = to[0] - from[0];
  var dy = to[1] - from[1];
  return Math.sqrt(dx * dx + dy * dy);
}

source.on('addfeature', function(event) {
  var line = event.feature.getGeometry().getLineString(0);
  var coords = line.getCoordinates();
  var first = coords[0];
  var num = coords.length;
  var last = coords[num - 1];
  stats.minTime = first[3];
  stats.maxTime = last[3];
  for (var i = 0; i < num; ++i) {
    var z = coords[i][2];
    if (z < stats.minZ) {
      stats.minZ = z;
    }
    if (z > stats.maxZ) {
      stats.maxZ = z;
    }
    if (i === 0) {
      stats.lengths.push(0);
    } else {
      stats.lengths.push(
          distance(coords[i - 1], coords[i]) + stats.lengths[i - 1]);
    }
  }
  stats.coordinates = coords;
  var pan = ol.animation.pan({source: view.getCenter()});
  var zoom = ol.animation.zoom({resolution: view.getResolution()});
  map.beforeRender(pan, zoom);
  view.setCenter(first);
  view.setZoom(17);
});

var playing = false;
var originM;
function start() {
  originM = Date.now() / 1000;
  playing = true;
  stopM = null;
  source.changed();
}

var stopM;
function stop() {
  stopM = Date.now() / 1000;
  playing = false;
}

function resume() {
  originM += (Date.now() / 1000) - stopM;
  playing = true;
  source.changed();
}

function reset() {
  stop();
  stopM = null;
}

map.on('singleclick', function() {
  if (playing) {
    stop();
  } else if (stopM) {
    resume();
  } else {
    start();
  }
})

var maxHistory = 30;

map.on('postcompose', function(event) {
  if (playing) {
    var vectorContext = event.vectorContext;
    var len = Math.min(maxHistory, past.length);
    for (var i = 0; i < len; i += 6) {
      vectorContext.setImageStyle(new ol.style.Circle({
        fill: new ol.style.Fill({
          color: 'rgba(255,240,0, ' + (1 - i / len) + ')'
        }),
        radius: 4
      }));
      vectorContext.drawPointGeometry(past[i]);
    }
    past.length = len;
    plot(event.context);
    setTimeout(function() {
      source.changed();
    }, 100);
  } else {
    past.length = 0;
  }
});

function plot(context) {
  var canvas = context.canvas;
  var width = canvas.width;
  var bottom = canvas.height;
  var height = bottom / 5;

  var rangeZ = stats.maxZ - stats.minZ;
  var rangeX = stats.lengths[stats.lengths.length - 1];

  // full plot
  context.beginPath();
  context.moveTo(0, bottom);
  for (var i = 0, ii = stats.coordinates.length; i < ii; i += 2) {
    var coord = stats.coordinates[i];
    var deltaZ = coord[2] - stats.minZ;
    var x = width * stats.lengths[i] / rangeX;
    var y = bottom - height * deltaZ / rangeZ;
    context.lineTo(x, y);
  }
  context.lineTo(width, bottom);
  context.closePath();
  context.fillStyle = 'rgba(0,0,0,0.6)';
  context.fill();

  // current progress
  if (past.length < 1) {
    return;
  }
  var now = past[0].getCoordinates()[3];
  context.beginPath();
  context.moveTo(0, bottom);
  for (var i = 0, ii = stats.coordinates.length; i < ii; i += 2) {
    var coord = stats.coordinates[i];
    if (coord[3] > now) {
      break;
    }
    var deltaZ = coord[2] - stats.minZ;
    var x = width * stats.lengths[i] / rangeX;
    var y = bottom - height * deltaZ / rangeZ;
    context.lineTo(x, y);
  }
  context.lineTo(x, bottom);
  context.closePath();
  context.fillStyle = 'rgba(50,170,50,0.5)';
  context.fill();
}
