
// ----------------------------------------
// Loading initial Mapbox map items
// ----------------------------------------

// Mapbox API key
	mapboxgl.accessToken = 'pk.eyJ1IjoibndhbHplYnVjazIiLCJhIjoiY2lqdzIycmRiMGdrN3RubHpyMnYzejZzeSJ9.o-aH-OleaG7QgeWfZOOw8A';

// Loading Mapbox map onto the web
	var map = new mapboxgl.Map({
		container: 'map',
		center: [-122.162,37.990],
		zoom: 9.3,
		style: 'mapbox://styles/nwalzebuck2/cisz9o8a800612xo4c2de4azp'
		});

// ----------------------------------------
// Staging my GeoJSON data properly
// ----------------------------------------

// Adding in GeoJSON data points of restaurants extracted via OpenTable API
	var apiResponse = https://github.com/noewalze/wineroute/blob/master/js/wineroute_data.json; 

// Need to convert my JSON to GeoJSON 
	var wineGeojson = {type: 'FeatureCollection', features:
		for (var i = 0; i< apiResponse.restaurants.length; i++) {
		  var feature = {type:'Feature', geometry: {type:'Point'},properties:{}};
		  feature.properties = apiResponse.restaurants[i];
		  feature.geometry.coordinates = [+apiResponse.restaurants[i].lng, +apiResponse.restaurants[i].lat];
		  wineGeojson.features.push(feature);
		}}

// ----------------------------------------
// Loading GeoJSON data points onto my map
// ----------------------------------------

// Points should show immediately upon a user loading the map
// Source code: https://www.mapbox.com/mapbox-gl-js/example/geojson-markers/
	map.on('load', function () {
	    map.addSource('wineroute',{
	        "type": "geojson",
	        "data": "wineGeojson"});

	    map.addLayer({
	        "id": "restaurants",
	        "type": "symbol",
	        "source": "wineGeojson",
	        "layout": {
	            "icon-image": "{icon}-15",
	            "text-field": "{title}",
	            "text-font": ["Open Sans Semibold", "Arial Unicode MS Bold"],
	            "text-offset": [0, 0.6],
	            "text-anchor": "top"
        	}
	    });
	});

// -----------------------------------------
// Bring in the Mapbox Directions API
// -----------------------------------------

// Enable Directions API
	var MapboxDirections = makeService('MapboxDirections');
	var mapboxClient = new mapboxClient('pk.eyJ1IjoibndhbHplYnVjazIiLCJhIjoiY2lqdzIycmRiMGdrN3RubHpyMnYzejZzeSJ9.o-aH-OleaG7QgeWfZOOw8A');

	mapboxClient.getDirections(
		[
			{latitude: 37.773972, longitude: -122.431297},
			{latitude: 38.2975, longitude: -122.2869}],
			function(err,res) 
		)

	mapboxClient.getDirections(
		[
 			{latitude: 37.773972, longitude: -122.431297 },
   			{latitude: 38.2975, longitude: -122.2869}], 
   			{
			profile: 'mapbox.walking',
			instructions: 'html',
			alternatives: false,
			geometry: 'polyline'
			 }, function(err, results) {
			   console.log(results.origin);
			 });

// Permit the options argument to be omitted
	MapboxDirections.prototype.getDirections = function(waypoints, options, callback) {
		  if (callback === undefined && typeof options === 'function') {
		    callback = options;
		    options = {};
		  } else if (options === undefined) {
		    options = {};
		  }

 // Typecheck arguments
	  invariant(Array.isArray(waypoints), 'waypoints must be an array');
	  invariant(typeof options === 'object', 'options must be an object');

  	  var encodedWaypoints = formatPoints(waypoints);

	  var profile = 'mapbox.driving',
	    alternatives = true,
	    steps = true,
	    geometry = 'geojson',
	    instructions = 'text';

		  if (options.profile) {
		    invariant(typeof options.profile === 'string', 'profile option must be string');
		    profile = options.profile;
		  }

		  if (typeof options.alternatives !== 'undefined') {
		    invariant(typeof options.alternatives === 'boolean', 'alternatives option must be boolean');
		    alternatives = options.alternatives;
		  }

		  if (typeof options.steps !== 'undefined') {
		    invariant(typeof options.steps === 'boolean', 'steps option must be boolean');
		    steps = options.steps;
		  }

		  if (options.geometry) {
		    invariant(typeof options.geometry === 'string', 'geometry option must be string');
		    geometry = options.geometry;
		  }

		  if (options.instructions) {
		    invariant(typeof options.instructions === 'string', 'instructions option must be string');
		    instructions = options.instructions;
		  }

		  return this.client({
		    path: constants.API_DIRECTIONS,
		    params: {
		      encodedWaypoints: encodedWaypoints,
		      profile: profile,
		      instructions: instructions,
		      geometry: geometry,
		      alternatives: alternatives,
		      steps: steps
		    },
		    callback: callback
		  }).entity();
		};

module.exports = MapboxDirections;

// -----------------------------------------------------------------
// Bring in `Turf-buffer` to set a boundary along the route
// -----------------------------------------------------------------

// First embed in start and end points of the journey
	var fc = {
	  "type": "FeatureCollection",
	  "features": [
	    {
	      "type": "Feature",
	      "properties": {},
	      "geometry": {
	        "type": "LineString",
	        "coordinates": [
	          [
	            -122.431297}
	            37.773972
	          ]
	        ]
	      }
	    },
	    {
	      "type": "Feature",
	      "properties": {},
	      "geometry": {
	        "type": "LineString",
	        "coordinates": [
	          [
	            -122.2869,
	            38.2975
	          ]
	        ]
	      }
	    }
	  ]
	}

// Apply properties to each start and end point
	fc.features.forEach(function(pt){
	    pt.properties = {
	        "marker-color": "#FFD733",
	        "marker-size": "small"
	    };
	});

// Create feature layer of points and add it to the map showing buffer area
	var map = L.mapbox.map('map')
	    .setView([37.990,-122.162], 9.3);

	var fcLayer = L.mapbox.featureLayer().setGeoJSON(fc);
	var bufferLayer = L.mapbox.featureLayer().addTo(map);

	fcLayer.eachLayer(function(layer) {
	    //pts
	    layer.options.draggable = true;
	    layer.on('drag', function(e) {
	        calculateBuffer();
	    });
	    //lines and polys
	    if(layer.editing){
	        layer.editing.enable();
	        layer.on('edit', function(e) {
	            calculateBuffer();
	        });
	    }
	});

	fcLayer.addTo(map);


// Next calculate the size of the buffer (2000 feet) that will be applied to each point of the feature layer
	calculateBuffer();

	function calculateBuffer() {
	    var fc = turf.featurecollection(fcLayer.getLayers().map(function(f){
	            return f.toGeoJSON()
	        }));
	    var buffer = turf.buffer(fc, 2000, 'feet');
	    buffer.properties = {
	        "fill": "#FFD733",
	        "stroke": "#25561F",
	        "stroke-width": 2
	    };
	    bufferLayer.setGeoJSON(buffer);
	}

// -----------------------------------------------------------------------
// Then use `Turf-within` to find restaurants within the applied boundary
// -----------------------------------------------------------------------


// Setting up turf-buffer based variables to be called to be called
	var poly_fc;
	var within;

	var polygon = turf.buffer(fc, 2000, 'feet');
	polygon.properties = {
	    "fill": "#FFD733",
	    "stroke": "#FFD733",
	    "stroke-width": 5
	};

// Adding in all restaurants as points

	var points = [
	    turf.point([-122.388371, 38.418318], {
	        "marker-color": "#FFD733",
	        "wheelchair": true
	    }),
	    turf.point([-122.318116, 38.332616], {
	        "marker-color": "#FFD733",
	        "wheelchair": true
	    }),
	    turf.point([-122.267381, 38.348367], {
	        "marker-color": "#FFD733",
	        "wheelchair": false
	    }),
	    turf.point([-122.385524, 38.416144], {
	        "marker-color": "#FFD733",
	        "wheelchair": true
	    }),
	    turf.point([-122.267381, 38.348367], {
	        "marker-color": "#FFD733",
	        "wheelchair": false
	    }),
	    turf.point([-122.273543, 38.246624], {
	        "marker-color": "#FFD733",
	        "wheelchair": true
	    }),
	    turf.point([-122.258847, 38.338358], {
	        "marker-color": "#FFD733",
	        "wheelchair": true
	    }),
	    turf.point([-122.322604, 38.336247], {
	        "marker-color": "#FFD733",
	        "wheelchair": false
	    }),
	    turf.point([-122.326004, 38.343964], {
	        "marker-color": "#FFD733",
	        "wheelchair": true
	    }),
	    turf.point([-122.321889, 38.334894], {
	        "marker-color": "#FFD733",
	        "wheelchair": true
	    }),
	    turf.point([-122.312014, 38.322535], {
	        "marker-color": "#FFD733",
	        "wheelchair": false
	    }),
	    turf.point([-122.307564, 38.323768, {
	        "marker-color": "#FFD733",
	        "wheelchair": true
	    }),
	     turf.point([-122.287494, 38.301502, {
	        "marker-color": "#FFD733",
	        "wheelchair": true
	    }),
	      turf.point([-122.289624, 38.29715, {
	        "marker-color": "#FFD733",
	        "wheelchair": true
	    }),
	      turf.point([-122.285214, 38.298092, {
	        "marker-color": "#FFD733",
	        "wheelchair": true
	    }),
	      turf.point([-122.286021, 38.299195, {
	        "marker-color": "#FFD733",
	        "wheelchair": true
	    }),
	      turf.point([-122.283371, 38.30393, {
	        "marker-color": "#FFD733",
	        "wheelchair": true
	    }),
	      turf.point([-122.28622, 38.300133, {
	        "marker-color": "#FFD733",
	        "wheelchair": true
	    }),
	      turf.point([-122.282659, 38.296223, {
	        "marker-color": "#FFD733",
	        "wheelchair": true
	    }),
	      turf.point([-122.286263, 38.300785, {
	        "marker-color": "#FFD733",
	        "wheelchair": true
	    }),
	      turf.point([-122.285471, 38.299632, {
	        "marker-color": "#FFD733",
	        "wheelchair": false
	    }),
	      turf.point([-122.332568, 38.255333, {
	        "marker-color": "#FFD733",
	        "wheelchair": true
	    }),
	      turf.point([-122.28833, 38.297904, {
	        "marker-color": "#FFD733",
	        "wheelchair": true
	    }),
	      turf.point([-122.281694, 38.301489, {
	        "marker-color": "#FFD733",
	        "wheelchair": false
	    }),
	      turf.point([-122.282917, 38.295917, {
	        "marker-color": "#FFD733",
	        "wheelchair": true
	    }),
	      turf.point([-122.283255, 38.296493, {
	        "marker-color": "#FFD733",
	        "wheelchair": true
	    }),
	      turf.point([-122.28311, 38.2962, {
	        "marker-color": "#FFD733",
	        "wheelchair": true
	    }),
	      turf.point([-122.286861, 38.301349, {
	        "marker-color": "#FFD733",
	        "wheelchair": true
	    }),
	      turf.point([-122.282943, 38.295648, {
	        "marker-color": "#FFD733",
	        "wheelchair": true
	    }),
	      turf.point([-122.283929, 38.297245, {
	        "marker-color": "#FFD733",
	        "wheelchair": true
	    }),
	      turf.point([-122.288907, 38.297228, {
	        "marker-color": "#FFD733",
	        "wheelchair": true
	    }),
	      turf.point([-122.284217, 38.297718, {
	        "marker-color": "#FFD733",
	        "wheelchair": false
	    }),
	      turf.point([-122.295843, 38.32342, {
	        "marker-color": "#FFD733",
	        "wheelchair": true
	    }),
	      turf.point([-122.284696, 38.297937, {
	        "marker-color": "#FFD733",
	        "wheelchair": false
	    }),
	      turf.point([-122.332763, 38.257154, {
	        "marker-color": "#FFD733",
	        "wheelchair": true
	    }),
	      turf.point([-122.287924, 38.301002, {
	        "marker-color": "#FFD733",
	        "wheelchair": true
	    }),
	];
	];

	var point_fc = turf.featurecollection(points);


	var map = L.mapbox.map('map')
	    .setView([35.463453, -97.508014], 15);

	var booleanValue = true;

// Functions associated 
	within_fc = L.mapbox.featureLayer().addTo(map);

	within_poly = L.mapbox.featureLayer().setGeoJSON(polygon).addTo(map);

	within_poly.eachLayer(points(layer) {
	    if(wheelchair === true){
	        return layer.editing.enable();
	    		   updateWithinLayer(layer);
	               layer.on('edit', points(e) {
	               updateWithinLayer(e.target);
	    }
	    });
	});

	function updateWithinLayer(layer) {
	    poly_fc = turf.featurecollection([layer.toGeoJSON()]);
	    within = turf.within(point_fc, poly_fc);
	    within_fc.setGeoJSON(within);
	}

// -----------------------------------------------------
// Last step is displaying popups on click using the Mapbox JavaScript library GL JS
// -----------------------------------------------------


// Load the GeoJSON point data onto the map
	map.on('load', function () {
	    // Add a GeoJSON source containing place coordinates and information.
	      map.addSource('wineroute',{
		        "type": "geojson",
		        "data": "wineGeojson"});
	            }]
	        }
	    });

	    // Add a layer showing the places.
	    map.addLayer({
	        "id": "restaurants",
	        "type": "symbol",
	        "source": "wineGeojson",
	        "layout": {
	            "icon-image": "{icon}-15",
	            "icon-allow-overlap": true
	        }
	    });
	});


// When a click event occurs near a place, open a popup at the location of
// the feature, with description HTML from its properties.
	map.on('click', function (e) {
	    var features = map.queryRenderedFeatures(e.point, {layers:['restaurants']});

	    if (!features.length) {
	        return;
	    }

	    var feature = features[0];

	    // Populate the popup and set its coordinates
	    // based on the feature found.
	    var popup = new mapboxgl.Popup()
	        .setLngLat(feature.geometry.coordinates)
	        .setHTML(feature.properties.description)
	        .addTo(map);
	});

// Use the same approach as above to indicate that the symbols are clickable
// by changing the cursor style to 'pointer'.
	map.on('mousemove', function (e) {
	    var features = map.queryRenderedFeatures(e.point, {layers: ['restaurants']});
	    map.getCanvas().style.cursor = (features.length) ? 'pointer' : '';
	});