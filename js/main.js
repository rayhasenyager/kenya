var dataLayer,
    cattle,
    goats,
    sheep,
    total,
    density,
    scaleFactor = .05;

L.mapbox.accessToken = 'pk.eyJ1IjoicmF5aGFzZW55YWdlciIsImEiOiJjaW03djhsZGswMHBvdm1tMHdvam54djRzIn0.E4iemJxzce4ZKFxgLjT57w';

var map = L.mapbox.map('map', 'mapbox.outdoors', {
    center: [-.23, 37.8],
    zoom: 7,
    minZoom: 6,
    maxZoom: 9,
    maxBounds: L.latLngBounds([-6.22, 27.72], [5.76, 47.83])
});

var countyCentroids = omnivore.csv('data/livestock_county_2009.csv')
    .on('ready', function(e) {
        drawMap(e.target.toGeoJSON());
    })
    .on('error', function(e) {
        console.log(e.error[0].message);
    });

function drawMap(stockData) {
    // access to stockData here
}

function drawMap(stockData) {

    cattle = L.geoJson(stockData, {
        pointToLayer: function(feature, layer) {
            return L.circleMarker(layer, {
                radius: calcRadius(Number(feature.properties.Cattle)),
                color: '#6813D2',
                opacity: 1,
                weight: 2,
                fillOpacity: 0
            });
        }
    }).addTo(map);

    goats = L.geoJson(stockData, {
        pointToLayer: function(feature, layer) {
            return L.circleMarker(layer, {
                radius: calcRadius(Number(feature.properties.Goats)),
                color: '#DAA520',
                opacity: 1,
                weight: 2,
                fillOpacity: 0
            });
        }
    }).addTo(map);

    sheep = L.geoJson(stockData, {
        pointToLayer: function(feature, layer) {
            return L.circleMarker(layer, {
                radius: calcRadius(Number(feature.properties.Sheep)),
                color: '#008000',
                opacity: 1,
                weight: 2,
                fillOpacity: 0
            });
        }
    }).addTo(map);
    drawLegend();
    infoWindow();
}

function calcRadius(val) {
    var radius = Math.sqrt(val / Math.PI);
    return radius * scaleFactor;
}

function drawLegend() {

    var legend = $('.legend');

    legend.html()
}

$.getJSON('data/county.geojson', function(county) {

    dataLayer = L.geoJson(county, {
        style: function(feature) {
            return {
                color: '#dddddd', //grey borders
                weight: 2, //border thickness
                fillOpacity: .3, //no opacity
                fillColor: '#CCC7B3'
            };
        }
    });
    drawCounties(county);
});

function infoWindow() {

    var info = $('#info');

    sheep.on('mouseover', function(e) {
        var props = e.layer.feature.properties;

        info.show();
        $('#info span').text(props.County);
        $(".cattle span:first-child").text(' ');
        $(".goats span:first-child").text('');
        $(".sheep span:first-child").text(' ');
        $(".density span:first-child").text(' ');

        $(".cattle span:last-child").text(props.Cattle.toLocaleString());
        $(".goats span:last-child").text(props.Goats.toLocaleString());
        $(".sheep span:last-child").text(props.Sheep.toLocaleString());
        $(".density span:last-child").text(props.density.toLocaleString());

        e.layer.setStyle({
            fillOpacity: .4
        });
    });

    sheep.on('mouseout', function(e) {
        info.hide();
        e.layer.setStyle({
            fillOpacity: 0
        });
    });

    $(document).mousemove(function(e) {
        // first offset from the mouse position of the info window
        info.css({
            "left": e.pageX + 6,
            "top": e.pageY - info.height() - 15
        });
        // if it crashes into the top, flip it lower right
        if (info.offset().top < 4) {
            info.css({
                "top": e.pageY + 15
            });
        }
        // do the same for crashing into the right
        if (info.offset().left + info.width() >= $(document).width() - 40) {
            info.css({
                "left": e.pageX - info.width() - 30
            });
        }
    });
}

function drawCounties(county) {
    dataLayer = L.geoJson(county, {

        // initially set polygon border and fill properties
        style: function(feature) {
                return {
                    color: '#A9A9A9',
                    weight: 1,
                    fillOpacity: 1,
                    fillColor: '#1f78b4'
                }
            }
            // add polygons to the map    
    }).addTo(map).bringToBack();
    // fires the function to update the map for user functionality
    updateMap();
}

function updateMap() {

    var breaks = getClassBreaks();

    dataLayer.eachLayer(function(layer) {
        layer.setStyle({
            color: '#A9A9A9',
            weight: 1,
            fillColor: getColor(layer.feature.properties.density, breaks),
            fillOpacity: 1,
        });

        var props = layer.feature.properties;
    });
    updateLegend(breaks);
}

function updateLegend(breaks) {

    var legend = $('.legend').html("<h3>% Growth: " + (Number(density)) + "</h3><ul>");

    for (var i = 0; i < breaks.length - 1; i++) {

        var color = getColor(breaks[i + 1], breaks);

        $('.legend ul').append('<li><span style="background:' + color + '"></span> ' + breaks[i] + ' &mdash; ' + breaks[i + 1] + '</li>');
    }

    legend.append("</ul>");
}

function getClassBreaks() {

    var values = [];

    dataLayer.eachLayer(function(layer) {
        var value = layer.feature.properties.density;

        values.push(value);
    });

    var clusters = ss.ckmeans(values, 5);

    var breaks = clusters.map(function(cluster) {
        return [cluster[0], cluster.pop()];
    });

    return breaks;
}

function getColor(d, breaks) {

    if (d <= breaks[0][1]) {
        return '#ca641c';
    } else if (d <= breaks[1][1]) {
        return '#9d4e15';
    } else if (d <= breaks[2][1]) {
        return '#874312';
    } else if (d <= breaks[3][1]) {
        return '#5a2d0c'
    } else if (d <= breaks[4][1]) {
        return '#2d1606'
    }
}