$.google = google;

$(document).ready(function() {

    // TODO - Differentiate between planned and current google data centers
    // TODO - Add Netherlands datacenter

    var map, heatmap, cablemap, datacentermap, landingpointmap;
    var google = $.google;

    var circle ={
        path: google.maps.SymbolPath.CIRCLE,
        fillColor: 'white',
        fillOpacity: 1,
        scale: 2.5,
        strokeColor: 'black',
        strokeWeight: 1
    };

    function InitializeBaseMap () {
        var mapOptions = {
            center: new google.maps.LatLng(37.7047713, 2.0497792),
            zoom: 2,
            mapTypeId: google.maps.MapTypeId.TERRAIN,
            panControl: false,
            zoomControl: true,
            mapTypeControl: true,
            scaleControl: true,
            streetViewControl: false,
            overviewMapControl: true
        };

        map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);

        LoadDataCenterMarkers();

        LoadSubmarineCableData();

        LoadLandingPoints();

        InitializeHeatMap();

        AddEventListeners();

        toggleSubmarineCables();
    }

    function InitializeHeatMap () {
        $.getScript ("js/data/search_volume_data.js")
        .done(function() {
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
        })
        .fail(function() {
            console.log ("Error loading heatmap data");
        });
    }

    function LoadDataCenterMarkers () {
        datacentermap = new google.maps.Data();
        datacentermap.loadGeoJson('js/data/data_center_locations.json');
        datacentermap.setStyle(function(feature) {
            var title = feature.getProperty('city');

            var marker_type = feature.getProperty('type');
            var icon;

            switch (marker_type){
                case 'hq':
                    icon = $("#hq-icon").attr('src');
                    break;
                case 'datacenter':
                    icon = $("#datacenter-icon").attr('src');
                    break;
                default:
                    icon = 'http://maps.google.com/mapfiles/ms/icons/green-dot.png';
            }

            return {
                title: title,
                icon: icon
            };
        });
        datacentermap.setMap(map);
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

    function LoadLandingPoints () {
        landingpointmap = new google.maps.Data();
        landingpointmap.loadGeoJson('js/data/landing_points.json');
        landingpointmap.setStyle(function (feature) {
            var title = feature.getProperty('city');

            return {
                title: title,
                icon: circle
            };
        });
    }

    function AddEventListeners () {

        $('#heatmap_toggle').click(function() {
            toggleHeatmap();
        });

        $('#cablemap_toggle').click(function() {
            toggleSubmarineCables();
        });

        $("#what_is_this_button").click(function() {
            $("#whatModal").modal('toggle');
        });

        datacentermap.addListener('click', function(event) {

            map.setCenter(event.latLng);
            map.setZoom(20);
            setTimeout(x, 500);
            function x () {
                $('#info-panel').addClass('slide-menu-open');
            }

            //var city = event.feature.getProperty('city');
            //var description = event.feature.getProperty('description');
            //
            //$("#infoModalTitle").html(city);
            //$("#infoModalBody").html(description);
            //
            //$('#infoModal').modal('toggle');
        });

        cablemap.addListener('click', function(event) {
            var name = event.feature.getProperty('name');
            var length = event.feature.getProperty('length');
            var rfs = event.feature.getProperty('RFS');
            var description = event.feature.getProperty('description');

            $("#infoModalTitle").html(name);
            $("#infoModalBody").html(description);

            $('#infoModal').modal('toggle');
        });
    }

    function toggleHeatmap() {
        heatmap.setMap(heatmap.getMap() ? null : map);
    }

    function toggleSubmarineCables() {
        cablemap.setMap(cablemap.getMap() ? null : map);
        landingpointmap.setMap(landingpointmap.getMap() ? null : map);
    }

    google.maps.event.addDomListener(window, 'load', InitializeBaseMap);
});