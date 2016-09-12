


mapboxgl.accessToken = 'pk.eyJ1IjoibndhbHplYnVjazIiLCJhIjoiY2lqdzIycmRiMGdrN3RubHpyMnYzejZzeSJ9.o-aH-OleaG7QgeWfZOOw8A';

var map = new mapboxgl.Map({
	container: 'map',
	center: [-122.162,37.990],
	zoom: 9.3,
	style: 'mapbox://styles/nwalzebuck2/cisz9o8a800612xo4c2de4azp'
	});


var apiResponse = 

map.on('load', function () {
    map.addSource("restaurants", {
        "type": "geojson",
        "data": {
        }
    });

    map.addLayer({
        "id": "restaurants",
        "type": "symbol",
        "source": "points",
        "layout": {
            "icon-image": "{icon}-15",
            "text-field": "{title}",
            "text-font": ["Open Sans Semibold", "Arial Unicode MS Bold"],
            "text-offset": [0, 0.6],
            "text-anchor": "top"
        }
    });
});