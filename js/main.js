var map, heatmap, cablemap;
var google = google;

function InitializeBaseMap () {
    var mapOptions = {
        center: new google.maps.LatLng(37.7047713, 2.0497792),
        zoom: 3,
        mapTypeId: google.maps.MapTypeId.TERRAIN
    };

    map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);

    var infoWindow = new google.maps.InfoWindow({
        content: "",
        maxWidth: 400
    });

    LoadDataCenterMarkers();

    LoadSubmarineCableData();

    AddEventListeners(infoWindow);

    InitializeHeatMap();
}

function AddEventListeners (infowindow) {
    google.maps.event.addListener(map,'click',function() {
        infowindow.close();
    });

    map.data.addListener('click', function(event) {
        var city = event.feature.getProperty('city');
        var description = event.feature.getProperty('description');

        // TODO - Add attribution paragraph (source)
        infowindow.setContent('<div>' +
                                '<h1>' + city + '</h1>' +
                                '<div>' +
                                    '<p>' + description + '</p>' +
                                '</div>' +
                              '</div>');

        infowindow.setPosition(event.feature.getGeometry().get());
        infowindow.setOptions({pixelOffset: new google.maps.Size(0,-30)});
        infowindow.open(map);
    });

    cablemap.addListener('click', function(event) {
        var name = event.feature.getProperty('name');
        var length = event.feature.getProperty('length');
        var rfs = event.feature.getProperty('RFS');
        var description = event.feature.getProperty('description');

        // TODO - Add attribution paragraph (source)
        infowindow.setContent('<div>' +
        '<h1>' + name + '</h1>' +
        '<div>' +
            '<div><b>Length: </b>' + length + '</div>' +
            '<div><b>Ready for service: </b>' + rfs + '</div>' +
            '<p>' + description + '</p>' +
        '</div>' +
        '</div>');

        infowindow.setPosition(event.latLng);
        infowindow.open(map);
    });
}

function InitializeHeatMap () {
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
}

function LoadDataCenterMarkers () {
    map.data.loadGeoJson('js/data/data_center_locations.json');
    map.data.setStyle(function(feature) {
        var title = feature.getProperty('city');

        var marker_type = feature.getProperty('type');
        var icon;

        switch (marker_type){
            case 'hq':
                icon = 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png';
                break;
            case 'datacenter':
                icon = 'http://maps.google.com/mapfiles/ms/icons/red-dot.png';
                break;
            default:
                icon = 'http://maps.google.com/mapfiles/ms/icons/green-dot.png';
        }

        return {
            title: title,
            icon: icon
        };
    });
}

function LoadSubmarineCableData () {
    cablemap = new google.maps.Data();
    cablemap.loadGeoJson('js/data/submarine-cables.json');
    cablemap.setStyle(function(feature) {
        var color = feature.getProperty('color');

        return {
            strokeColor: color
        };
    });
}


function toggleHeatmap() {
    heatmap.setMap(heatmap.getMap() ? null : map);
}

function toggleSubmarineCables() {
    cablemap.setMap(cablemap.getMap() ? null : map);
}

google.maps.event.addDomListener(window, 'load', InitializeBaseMap);
