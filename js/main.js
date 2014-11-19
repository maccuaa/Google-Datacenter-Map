var map, heatmap;
var google = google;

function initialize() {
    var mapOptions = {
        center: new google.maps.LatLng(37.7047713, 2.0497792),
        zoom: 3,
        mapTypeId: google.maps.MapTypeId.TERRAIN
    };

    map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);

    // Load heat map data
    var map_data = [];
    for (var i = 0; i < search_data.length; i+=4) {
        var lat = search_data[i];
        var lon = search_data[i+1];
        var mag = search_data[i+2];
        map_data.push({location: new google.maps.LatLng(lat, lon), weight: mag});
    }

    var heat_array = new google.maps.MVCArray(map_data);

    heatmap = new google.maps.visualization.HeatmapLayer({
        data: heat_array
    });

    heatmap.set('dissipating', false);

    heatmap.setMap(map);
}

function toggleHeatmap() {
    heatmap.setMap(heatmap.getMap() ? null : map);
}

function changeGradient() {
    var gradient = [
        'rgba(0, 255, 255, 0)',
        'rgba(0, 255, 255, 1)',
        'rgba(0, 191, 255, 1)',
        'rgba(0, 127, 255, 1)',
        'rgba(0, 63, 255, 1)',
        'rgba(0, 0, 255, 1)',
        'rgba(0, 0, 223, 1)',
        'rgba(0, 0, 191, 1)',
        'rgba(0, 0, 159, 1)',
        'rgba(0, 0, 127, 1)',
        'rgba(63, 0, 91, 1)',
        'rgba(127, 0, 63, 1)',
        'rgba(191, 0, 31, 1)',
        'rgba(255, 0, 0, 1)'
    ];
    heatmap.set('gradient', heatmap.get('gradient') ? null : gradient);
}

function changeRadius() {
    heatmap.set('radius', heatmap.get('radius') ? null : 5);
}

function changeOpacity() {
    heatmap.set('opacity', heatmap.get('opacity') ? null : 0.2);
}

google.maps.event.addDomListener(window, 'load', initialize);
