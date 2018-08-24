APP
.directive('templateBody',  ['styleSvc', function(styleSvc) {
    return {
        restrict: 'C',
        replace: false,
        templateUrl: 'html/content.html',
        //template: TPL.content,
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

            var geodata;
            var activePacks = [];
            var allpackdata;
            var noTerritoryData;

            $scope.currentYear = '95/96';
            $scope.legendData = [];

            fetch('../wolf-report-data.json').then(function(data) {
                return data.json();
            }).then(function(json) {
                allpackdata = json;
                console.log(allpackdata);
            });

            fetch('../no-territory.json').then(function(data) {
                return data.json();
            }).then(function(json) {
                console.log(json);
                noTerritoryData = json;
            });

            map.on('load', function() {
                getYearData($scope.currentYear); 
                //setLabelLayer($scope.currentYear);
                console.log(map.queryRenderedFeatures('yellowstone-boundary'));
            });
            var popup = new mapboxgl.Popup();

            function getNoTerritory() {
                noTerritoryData.packs.forEach(pack => {
                    if (pack.years[$scope.currentYear]) {
                        legendData.push(pack);
                    }
                });

                if (noTerritoryData.loners.years[$scope.currentYear]) {
                    const lonerData = noTerritoryData.loners.years[$scope.currentYear].numbers;
                    $scope.loners = (lonerData.adults + lonerData.pups);
                }
                else {
                    $scope.loners = undefined;
                }

                if (noTerritoryData.unknown.years[$scope.currentYear]) {
                    const unknownData = noTerritoryData.unknown.years[$scope.currentYear].numbers;
                    $scope.unknowns = (unknownData.adults + unknownData.pups);
                }
                else {
                    $scope.unknowns = undefined;
                }

                if (noTerritoryData.captive.years[$scope.currentYear]) {
                    const captiveData = noTerritoryData.captive.years[$scope.currentYear].numbers;
                    $scope.captives = (captiveData.adults + captiveData.pups);
                }
                else {
                    $scope.captives = undefined;
                }
                
                console.log(legendData, ' legendData');
                getYearTotal(legendData);
            }

            var legendData;
            function getYearData(year) {
                //console.log(allpackdata, ' allpackdata');
                labels.features = [];
                var geojson;
                legendData = [];
                allpackdata.packs.map(pack => {
                    if (pack.years[$scope.currentYear] && pack.years[$scope.currentYear].geometry) {
                        geojson = {
                          "type" : "FeatureCollection",
                          "features" : [{
                              "type" : "Feature",
                              "properties" : { 
                                   "name" : pack.name,
                                   "adults" : pack.years[$scope.currentYear].numbers.adults,
                                   "pups" : pack.years[$scope.currentYear].numbers.pups,
                                   "total" : pack.years[$scope.currentYear].numbers.total
                               },
                              "geometry" : pack.years[$scope.currentYear].geometry
                          }]
                        }

                        var centroid = turf.centroid(geojson)
                        centroid.properties.pack = pack.name;
                        labels.features.push(centroid);

                        map.on('mouseenter', pack.id, function(e) {
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

                        legendData.push(pack);

                        var before = map.getSource('pack-labels') ? 'pack-labels' : '';
                        //console.log(map.getSource(pack.id));

                        if (!map.getSource(pack.id)) {
                            if (pack.years[$scope.currentYear].geometry.type === "Polygon") {
                                map.addLayer({
                                    "id": pack.id,
                                    "type": "fill",
                                    "source": {
                                        "type": "geojson",
                                        "data" : geojson 
                                    },
                                    "paint": styleSvc[pack.name] 
                                }, before);
                            }
                            if (pack.years[$scope.currentYear].geometry.type === "Point") {
                                map.addLayer({
                                    "id": pack.id,
                                    "type": "circle",
                                    "source": {
                                        "type": "geojson",
                                        "data" : geojson 
                                    },
                                    "paint": styleSvc[pack.name + '-point'] 
                                }, before);
                            }
                        }
                        else {
                            map.getSource(pack.id).setData(geojson);
                        }
                    } else if (map.getSource(pack.id)) {
                        map.removeLayer(pack.id);
                        map.removeSource(pack.id);
                    }
                });
                getNoTerritory();
                $scope.$evalAsync(function() {
                    $scope.allPackData = legendData;
                });


                //console.log(labels, ' labels');
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


          function getYearTotal(data) {
              console.log(data, ' getYearTotal data');
              var totalWolves = 0;
              data.forEach(pack => {
                var adults = pack.years[$scope.currentYear].numbers.adults;
                var pups = pack.years[$scope.currentYear].numbers.pups;
                var total = pack.years[$scope.currentYear].numbers.total;

                if (!isNaN(total)) { totalWolves  +=  total; }
                else {
                    if (!isNaN(adults)) { totalWolves  += adults; }
                    if (!isNaN(pups)) { totalWolves  +=  pups; }
                }
              })
              $scope.totalForYear = totalWolves;
           }

           $scope.toggleLabels = function() {
               var layerVis = (map.getLayoutProperty('pack-labels', 'visibility') === 'visible') ? 'none' : 'visible';
               map.setLayoutProperty('pack-labels', 'visibility', layerVis);
           }
        } 
    } 
}])
.directive('header', [function() {
    return {
        restrict: 'A',
        replace: false,
        templateUrl: 'html/header.html',
        //template: TPL.content,
        link: function($scope, $element, $attributes) {
         }
      } 
 }])
.directive('footer', [function() {
    return {
        restrict: 'A',
        replace: false,
        templateUrl: 'html/footer.html',
        //template: TPL.content,
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


                    /*
                    map.addLayer({
                      "id": "packs-2016",
                      "type": "fill",
                      "source": {
                          "type": "geojson",
                          "data" : json 
                      },
                      "paint": {
                          "fill-outline-color" : '#000',
                          "fill-color" : 'rgba(51, 53, 119, 0.8)',
                          "fill-opacity" : 0.8
                      }
                  });

                  var labels = {
                      "type" : "FeatureCollection",
                      "features" : []
                  }
                  json.features.map((feature, i) => {
                      var centroid = turf.centroid(feature)
                      centroid.properties.pack = feature.properties.pack;
                      labels.features.push(centroid);
                  });

                  map.addLayer({
                      "id": "packs-labels",
                      "type": "symbol",
                      "source": {
                          "type": "geojson",
                          "data": labels
                      },
                      "layout": {
                          "text-field": '{pack}',
                      },
                      "paint" : {
                          "text-color": '#ffffff'
                      }
                  });
              */
           

                /*
                map.addLayer({
                    "id": "packs-labels",
                    "type": "symbol",
                    "source": {
                        "type": "geojson",
                        "data": labels
                    },
                    "layout": {
                        "text-field": '{pack}',
                    },
                    "paint" : {
                        "text-color": '#ffffff'
                    }
                });
                */


            /*
            function getLayerStyleObj(pack) {
                switch(pack) {
                    case 'Lamar Canyon' :
                        colorObj = {
                          "fill-outline-color" : '#000',
                          "fill-color" : 'rgba(88, 43, 115, 1)',
                          "fill-opacity" : 0.8 
                        }  
                        break;
                    case 'Canyon':
                        colorObj = {
                          "fill-outline-color" : '#000',
                          "fill-color" : 'rgba(61, 49, 119, 1)',
                          "fill-opacity" : 0.8 
                        } 
                        break;
                    case 'Snake River':
                        colorObj = {
                          "fill-outline-color" : '#000',
                          "fill-color" : 'rgba(42, 80, 111, 1)',
                          "fill-opacity" : 0.8
                        } 
                        break;
                    case 'Mollies':
                        colorObj = {
                          "fill-outline-color" : '#000',
                          "fill-color" : 'rgba(37, 111, 91, 1)',
                          "fill-opacity" : 0.8
                        } 
                        break;
                    case 'Cinnabar':
                        colorObj = {
                          "fill-outline-color" : '#000',
                          "fill-color" : 'rgba(68, 145, 48, 1)',
                          "fill-opacity" : 0.8
                        } 
                        break;
                    case 'Cougar Creek':
                        colorObj = {
                          "fill-outline-color" : '#000',
                          "fill-color" : 'rgba(247, 247, 16, 1)',
                          "fill-opacity" : 0.8
                        } 
                        break;
                    case '8 Mile':
                        colorObj = {
                          "fill-outline-color" : '#000',
                          "fill-color" : 'rgba(191, 150, 0, 1)',
                          "fill-opacity" : 0.8
                        } 
                        break;
                    case 'Prospect Peak':
                        colorObj = {
                          "fill-outline-color" : '#000',
                          "fill-color" : 'rgba(238, 164, 0, 1)',
                          "fill-opacity" : 0.8
                        } 
                        break;
                    case 'Wapati Lake':
                    case 'Blacktail':
                        colorObj = {
                          "fill-outline-color" : '#000',
                          "fill-color" : 'rgba(238, 96, 0, 1)',
                          "fill-opacity" : 0.8
                        } 
                        break;
                    case 'Junction Butte':
                        colorObj = {
                          "fill-outline-color" : '#000',
                          "fill-color" : 'rgba(238, 6, 0, 1)',
                          "fill-opacity" : 0.8
                        } 
                        break;
                    case 'Blecher':
                        colorObj = {
                            "circle-radius": 28,
                            "circle-color": 'rgba(91, 147, 198, 1)',
                            "circle-opacity": 0.6
                        } 
                        break;
                    case 'Yellowstone Delta':
                        colorObj = {
                          "fill-outline-color" : '#000',
                          "fill-color" : 'rgba(68, 145, 48, 1)',
                          "fill-opacity" : 0.8
                        } 
                        break;
                    case 'Agate':
                        colorObj = {
                          "fill-outline-color" : '#000',
                          "fill-color" : 'rgba(170, 51, 174, 1)',
                          "fill-opacity" : 0.8
                        } 
                        break;
                    case 'Mary Mountain':
                        colorObj = {
                          "fill-outline-color" : '#000',
                          "fill-color" : 'rgba(74, 52, 54, 1)',
                          "fill-opacity" : 0.8
                        } 
                        break;
                    case '642F Group' :
                    case '755M Group' :
                    case '911M Group' :
                    case '755M/889F Group' :
                        colorObj = {
                          "fill-outline-color" : '#000',
                          "fill-color" : 'rgba(255,255, 255, 1)',
                          "fill-opacity" : 0.6
                        } 
                        break;
                    }
                return colorObj;
            }
            */


