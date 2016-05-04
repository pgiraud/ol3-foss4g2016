proj4.defs('ESRI:54009', '+proj=moll +lon_0=0 +x_0=0 +y_0=0 +datum=WGS84 ' +
    '+units=m +no_defs');
proj4.defs("EPSG:5179","+proj=tmerc +lat_0=38 +lon_0=127.5 +k=0.9996 +x_0=1000000 +y_0=2000000 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs");

// ol.proj.get('EPSG:5179').setExtent([531371.84, 967246.47, 1576674.68, 2274021.31]);
ol.proj.get('ESRI:54009').setExtent([-18e6, -9e6, 18e6, 9e6]);

var map = new ol.Map({
  target: 'map',
  controls: ol.control.defaults({
    attributionOptions: {
      collapsible: false
    }
  }),
  layers: [
    new ol.layer.Tile({
      source: new ol.source.OSM({
        reprojectionErrorThreshold: 10,
        url: 'https://otile{1-4}-s.mqcdn.com/tiles/1.0.0/osm/{z}/{x}/{y}.jpg',
        wrapX: false,
        attributions: [
          new ol.Attribution({
            html: 'Tiles Courtesy of <a href="http://www.mapquest.com/">MapQuest</a>'
          })
        ]
      })
    })
  ],
  view: new ol.View({
    center: [0, 0],
    zoom: 3
  })
});

var projection = document.getElementById('projection');
projection.addEventListener('change', function() {
  var view = map.getView();
  var newProj = projection.options[projection.selectedIndex].value;
  var oldProj = view.getProjection();

  map.setView(new ol.View({
    projection: newProj,
    center: ol.proj.transform(view.getCenter(), oldProj, newProj),
    zoom: view.getZoom(),
    rotation: view.getRotation()
  }));
});
