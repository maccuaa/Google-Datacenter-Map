$.google = google;

$(document).ready(function() {

    // TODO - Differentiate between planned and current google data centers
    // TODO - Add Netherlands datacenter

    var map, heatmap, cablemap, datacentermap, landingpointmap;
    var google = $.google;

    var default_map_center = new google.maps.LatLng(37.7047713, 2.0497792);
    var default_map_zoom = 2;

    var circle ={
        path: google.maps.SymbolPath.CIRCLE,
        fillColor: 'white',
        fillOpacity: 1,
        scale: 2.5,
        strokeColor: 'black',
        strokeWeight: 1
    };

    var panel = $('#info-panel');
    var panel_title = panel.find('#title');
    var panel_image = panel.find('#panel-image');
    var panel_image_source = panel.find("#panel-image-source");
    var panel_intro = panel.find("#intro");
    var panel_desc_energy = panel.find('#energy');
    var panel_desc_climate = panel.find('#climate');
    var panel_desc_government = panel.find('#government');
    var panel_desc_economy = panel.find('#economy');

    function InitializeBaseMap () {
        var mapOptions = {
            center: default_map_center,
            zoom: default_map_zoom,
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

        $("#panel_toggle").click(function() {
            $('#info-panel').toggleClass('slide-menu-open');
        });

        $("#map_reset").click(function() {
            if ($("#info-panel").hasClass('slide-menu-open')) {
                closeInfoPanel();
                setTimeout(function() {
                   resetMap();
                }, 500);
            }
            else {
                resetMap();
            }
        });

        $("#panel_close").click(function() {
            $("#info-panel").removeClass('slide-menu-open');
        });

        datacentermap.addListener('click', function(event) {

            var city = event.feature.getProperty('city');
            var intro = event.feature.getProperty('intro');
            var climate = event.feature.getProperty('climate');
            var energy = event.feature.getProperty('energy');
            var economy = event.feature.getProperty('economy');
            var government = event.feature.getProperty('government');
            var image = event.feature.getProperty('image');
            var source = event.feature.getProperty('img-source');

            setPanelContent(city, image, source, intro, climate, energy, economy, government);

            map.setCenter(event.latLng);
            map.setZoom(20);
            openInfoPanel();
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

    function openInfoPanel() {
        setTimeout(function() {
            $('#info-panel').addClass('slide-menu-open');
        }, 500);
    }

    function closeInfoPanel() {
        $('#info-panel').removeClass('slide-menu-open');
    }

    function setPanelContent(title, image, source,  intro, climate, energy, economy, government) {
        var panel = $('#info-panel');
        panel_title.html(title);
        panel_image.attr('src', image);
        panel_image_source.attr('href', source);
        panel_intro.html(intro);

        panel_desc_climate.html(climate);
        if (climate !== undefined) {
            panel_desc_climate.parent().parent().show();
        }
        else {
            panel_desc_climate.parent().parent().hide();
        }

        panel_desc_energy.html(energy);
        if (energy !== undefined) {
            panel_desc_energy.parent().parent().show();
        }
        else {
            panel_desc_energy.parent().parent().hide();
        }

        panel_desc_economy.html(economy);
        if (economy !== undefined) {
            panel_desc_economy.parent().parent().show();
        }
        else {
            panel_desc_economy.parent().parent().hide();
        }

        panel_desc_government.html(government);
        if (government !== undefined) {
            panel_desc_government.parent().parent().show();
        }
        else {
            panel_desc_government.parent().parent().hide();
        }
    }

    function resetMap() {
        map.setCenter(default_map_center);
        map.setZoom(default_map_zoom);
    }

    google.maps.event.addDomListener(window, 'load', InitializeBaseMap);
});