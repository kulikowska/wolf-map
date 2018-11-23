APP
.directive('content',  [function() {
    return {
        restrict: 'A',
        replace: false,
        templateUrl: 'html/content.html',
        link: function($scope, $element, $attributes) {

            $scope.state = {
                'opts'             : false,
                'zoomOnYearChange' : true,
                'mapLabels'        : true
            }

            $scope.currentYear = '2016';

            KEY_API_SDK.setClientUid('b6be70d1-e2b8-cca8-a121-85f4cca43715'); 

            KEY_API_SDK.getItem("packs").then( 
                function(response) {
                    $scope.packs = response;
                    console.log($scope.packs, ' packs');
                }
            );

            $scope.allYears = [];

            KEY_API_SDK.getItem("years").then( 
                function(response) {
                    console.log( response );
                    $scope.years = response;

                    for (year in response) {
                        $scope.allYears.push(year);
                    }
                }
            );
        } 
    } 
}])
.directive('map', ['styleSvc', '$rootScope', function(styleSvc, SCOPE) {
    return {
        restrict: 'A',
        replace: false,
        templateUrl: 'html/map.html',
        link: function($scope, $element, $attributes) {

            mapboxgl.accessToken = 'pk.eyJ1Ijoia3VsaWtvd3NrYSIsImEiOiJjamRtY2l6dHAwbG9mMnhtdGp6eWY0a283In0.6OYpoUZAkRskJcXej314lg';
            var map = new mapboxgl.Map({
                container: 'map',
                style: 'mapbox://styles/kulikowska/cjiv4b6b08cjh2qpbvbo1xo2o',
                zoom: 7.75,
                center: [-110.5885, 44.5580]
            });

            var labels = {
               "type" : "FeatureCollection",
               "features" : []
            }

            $scope.legendData = [];

            map.on('load', function() {
                getYearData($scope.currentYear); 
            });

            var popup = new mapboxgl.Popup();
            var legendData;
            var polyFeatures;
            var activePacks = [];

            function getYearData(year) {

                const yearData = $scope.years[$scope.currentYear];

                var geojson;
                labels.features = [];
                legendData      = { 'packs' : [], 'other' : yearData.other };
                lastYearPacks   = JSON.parse(JSON.stringify(activePacks));
                activePacks     = [];

                polyFeatures = {
                      "type" : "FeatureCollection",
                      "features" : []
                };

                for (pack in yearData.packs) {
                    let data = yearData.packs[pack];

                    activePacks.push(pack);

                    // create an array of packs layers to be removed from map
                    //console.log(pack, 'pack', lastYearPacks.indexOf(pack), 'idx');
                    const idx = lastYearPacks.indexOf(pack);
                    if (idx !== -1) {
                        lastYearPacks.splice(idx, 1); 
                    }

                    geojson = {
                      "type" : "FeatureCollection",
                      "features" : [{
                          "type" : "Feature",
                          "properties" : { 
                               "name"   : data.name,
                               "id"     : pack,
                               "adults" : data.numbers.adults,
                               "pups"   : data.numbers.pups,
                               "total"  : data.numbers.total
                           },
                          "geometry" : data.geometry
                      }]
                    }

                    legendData.packs.push({ 'id' : pack, 'data' : data });

                    //console.log(geojson, ' geojson');

                    // Add each layer to array of all polygons to later find bounds
                    polyFeatures.features.push(geojson.features[0]);


                    // Find center of polygon, create popup and label based on coords
                    let centroid = turf.centroid(geojson)
                    centroid.properties.pack = data.name;
                    labels.features.push(centroid);

                    map.on('mouseenter', pack, function(e) {
                       var props = e.features[0].properties;

                       popup.setLngLat([centroid.geometry.coordinates[0], centroid.geometry.coordinates[1]])
                       .setHTML(
                               '<div class="popUp">' + 
                                   '<div class="popHeader ' + e.features[0].layer.id + '"> ' + props.name + '</div>' +
                                   '<div>Adults: ' + (typeof props.adults !== 'undefined' ? props.adults : 'N/A') + '</div>' +
                                   '<div>Pups: ' + (typeof props.pups !== 'undefined' ? props.pups : 'N/A') + '</div>' +
                                   '<div>Total: ' + (typeof props.total !== 'undefined' ? props.total : (props.pups + props.adults)) + '</div>' +
                               '</div>'
                        )
                       .addTo(map);
                    });


                    // Add territory layer to map 
                    var before = map.getSource('pack-labels') ? 'pack-labels' : '';

                    if (!map.getSource(pack)) {
                        if (data.geometry.type === "Polygon") {
                            map.addLayer({
                                "id": pack,
                                "type": "fill",
                                "source": {
                                    "type": "geojson",
                                    "data" : geojson 
                                },
                                "paint": styleSvc[data.name] 
                            }, before);
                        }
                        if (data.geometry.type === "Point") {
                            map.addLayer({
                                "id": pack,
                                "type": "circle",
                                "source": {
                                    "type": "geojson",
                                    "data" : geojson 
                                },
                                "paint": styleSvc[data.name + '-point'] 
                            }, before);
                        }
                    }
                    else {
                        map.getSource(pack).setData(geojson);
                    }
                } 
                // END LOOP


                // Add no territory packs to legend data
                if (yearData.other['no-territory']) {
                    for (pack in yearData.other['no-territory']) {
                        legendData.packs.push({ 'id' : pack, 'data' : yearData.other['no-territory'][pack]});
                    }
                }

                $scope.$evalAsync(function() {
                    $scope.legendData = legendData;
                });

                // Remove the previous years packs that aren't in the current year
                lastYearPacks.map(id => {
                    map.removeLayer(id);
                    map.removeSource(id);
                });


                if ($scope.state.zoomOnYearChange) {
                    var bbox = turf.bbox(polyFeatures)
                    map.fitBounds(bbox, { duration: 700, padding: 20 });
                }

                // Add label layer
                if (!map.getSource('pack-labels')) {
                    map.addLayer({
                        "id": "pack-labels",
                        "type": "symbol",
                        "source": {
                            "type": "geojson",
                            "data": labels
                        },
                        "layout": {
                            "text-field": '{pack}',
                            "text-size" : 14,
                            "text-allow-overlap" : true
                        },
                        "paint" : {
                            //"text-color": '#ffffff'
                            "text-color": '#000000'
                        },
                        "minzoom" : 0,
                        "maxzoom" : 18,
                    });
                } else {
                    map.getSource('pack-labels').setData(labels);
                }
            }

            $scope.changeYear = function(year) {
                $scope.currentYear = year;
                getYearData(year);
                popup.remove();
            }

           $scope.toggleLabels = function() {
               var layerVis = (map.getLayoutProperty('pack-labels', 'visibility') === 'visible') ? 'none' : 'visible';
               map.setLayoutProperty('pack-labels', 'visibility', layerVis);
           }

           $scope.hoverPack = function(pack) {
               popup.remove();
               var activePack = polyFeatures.features.find(function(feature) {
                   return feature.properties.name === pack;
               });

               var pack = {
                      "type" : "FeatureCollection",
                      "features" : [ activePack ] 
               }

               var centre = turf.centroid(pack)
               const props = activePack.properties;
               popup.setLngLat([centre.geometry.coordinates[0], centre.geometry.coordinates[1]])
               .setHTML(
                       '<div class="popUp">' + 
                           '<div class="popHeader ' + props.id + '"> ' + props.name + '</div>' +
                           '<div>Adults: ' + (typeof props.adults !== 'undefined' ? props.adults : 'N/A') + '</div>' +
                           '<div>Pups: ' + (typeof props.pups !== 'undefined' ? props.pups : 'N/A') + '</div>' +
                           '<div>Total: ' + (typeof props.total !== 'undefined' ? props.total : (props.pups + props.adults)) + '</div>' +
                       '</div>'
                )
               .addTo(map);
           }
         }
      } 
 }])
.directive('legend', [function() {
    return {
        restrict: 'E',
        replace: false,
        templateUrl: 'html/legend.html',
        link: function($scope, $element, $attributes) {
        }
     } 
 }])
.directive('charts', [function() {
    return {
        restrict: 'A',
        replace: false,
        templateUrl: 'html/charts.html',
        link: function($scope, $element, $attributes) {

            //console.log($scope.totalForYear);
            var ctx = document.getElementById("chart").getContext('2d');
            var myChart = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: ["1995", "1996", "1997", "1998", "1999", "2000"],
                    datasets: [{
                        label: 'Population Over the Years',
                        data: [12, 19, 3, 5, 2, 3],
                        backgroundColor: [
                            'rgba(255, 99, 132, 0.2)',
                            'rgba(54, 162, 235, 0.2)',
                            'rgba(255, 206, 86, 0.2)',
                            'rgba(75, 192, 192, 0.2)',
                            'rgba(153, 102, 255, 0.2)',
                            'rgba(255, 159, 64, 0.2)'
                        ],
                        borderColor: [
                            'rgba(255,99,132,1)',
                            'rgba(54, 162, 235, 1)',
                            'rgba(255, 206, 86, 1)',
                            'rgba(75, 192, 192, 1)',
                            'rgba(153, 102, 255, 1)',
                            'rgba(255, 159, 64, 1)'
                        ],
                        borderWidth: 1
                    }]
                },
                options: {
                    responsive: false,
                    scales: {
                        yAxes: [{
                            ticks: {
                                beginAtZero:true
                            }
                        }]
                    }
                }
            });
        }
     } 
 }])
.directive('header', [function() {
    return {
        restrict: 'A',
        replace: false,
        templateUrl: 'html/header.html',
        link: function($scope, $element, $attributes) {
            $scope.nav = 'map';
        }
     } 
 }])
.directive('footer', [function() {
    return {
        restrict: 'A',
        replace: false,
        templateUrl: 'html/footer.html',
        link: function($scope, $element, $attributes) {
         }
      } 
 }])
.filter('checkInactive', function() {
    return function(input) { return input ? 'inactive' : ''; };
})
.filter('checkActive', function() {
    return function(input) { return input ? 'active' : ''; };
})
