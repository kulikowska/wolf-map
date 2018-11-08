APP
.directive('templateBody',  [function() {
    return {
        restrict: 'C',
        replace: false,
        templateUrl: 'html/content.html',
        //template: TPL.content,
        link: function($scope, $element, $attributes) {

            $scope.state = {
                'opts'             : false,
                'zoomOnYearChange' : true,
                'mapLabels'        : true
            }

            $scope.currentYear = '2016';

            /*
            $scope.allYears = ["2016", "2015", "2014", "2013", "2012", "2011", "2010", "2009", "2008", "2007", "2006", "2005",
                            "2004", "2003", "2002", "2001", "2000", "1999", "1998", "1997", "95/96"]
            */


            KEY_API_SDK.setClientUid('b6be70d1-e2b8-cca8-a121-85f4cca43715'); 
            KEY_API_SDK.getDataItem("territories").then( 
                function(response) {
                    $scope.allPackData = response.data.content;
                    $scope.packDataUid = response.data.uid;

                    $scope.$digest();

                    /* migrate to new format here

                    let packs = response.data.content.packs;
                    let newPacksData = {};
                    let newYearsData = {};

                    console.log(packs, ' original pack data');

                    packs.map(pack => {
                       newPacksData[pack.id] = {
                            'name'  : pack.name,
                            'years' : pack.years
                       }

                       for (year in pack.years) {
                           if (!newYearsData.hasOwnProperty(year)) {
                               newYearsData[year] = {};    
                           }
                           newYearsData[year][pack.id] = pack.years[year];
                           newYearsData[year][pack.id]['name'] = pack.name;
                       };
                    });

                    console.log(newYearsData, ' newYearsData');
                    console.log(newPacksData, ' newPacksData');
                    */
                }
            );
            KEY_API_SDK.getDataItem("no-territories").then( 
                function(response) {
                    $scope.noTerritoryData = response.data.content;
                    $scope.$digest();
                }
            );

            KEY_API_SDK.getDataItem("packs").then( 
                function(response) {
                    $scope.packs = response.data.content;
                    console.log($scope.packs, ' packs');
                }
            );

            $scope.allYears = [];

            KEY_API_SDK.getDataItem("years").then( 
                function(response) {
                    $scope.years = response.data.content;

                    for (year in $scope.years) {
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

            $scope.legendData = [];

            /*
            fetch('../wolf-report-data.json').then(function(data) {
            //fetch('./wolf-report-data.json').then(function(data) { 
                return data.json();
            }).then(function(json) {
                allPackData = json;
                //console.log(allPackData);
            });
            */

            /*
            fetch('../no-territory.json').then(function(data) {
            //fetch('./no-territory.json').then(function(data) {
                return data.json();
            }).then(function(json) {
                //console.log(json);
                $scope.noTerritoryData = json;
            });
            */

            map.on('load', function() {
                getYearData($scope.currentYear); 
            });

            var popup = new mapboxgl.Popup();

            /*
            function getNoTerritory() {
                $scope.noTerritoryData.packs.forEach(pack => {
                    if (pack.years[$scope.currentYear]) {
                        legendData.push(pack);
                    }
                });

                if ($scope.noTerritoryData.loners.years[$scope.currentYear]) {
                    const lonerData = $scope.noTerritoryData.loners.years[$scope.currentYear].numbers;
                    $scope.loners = (lonerData.adults + lonerData.pups);
                }
                else {
                    $scope.loners = undefined;
                }

                if ($scope.noTerritoryData.unknown.years[$scope.currentYear]) {
                    const unknownData = $scope.noTerritoryData.unknown.years[$scope.currentYear].numbers;
                    $scope.unknowns = (unknownData.adults + unknownData.pups);
                }
                else {
                    $scope.unknowns = undefined;
                }

                if ($scope.noTerritoryData.captive.years[$scope.currentYear]) {
                    const captiveData = $scope.noTerritoryData.captive.years[$scope.currentYear].numbers;
                    $scope.captives = (captiveData.adults + captiveData.pups);
                }
                else {
                    $scope.captives = undefined;
                }
                
                //console.log(legendData, ' legendData');
                getYearTotal(legendData);
            }
            */

            var legendData;
            var polyFeatures;
            var activePacks = [];

            function getYearData(year) {

                labels.features = [];
                var geojson;
                polyFeatures = {
                      "type" : "FeatureCollection",
                      "features" : []
                };
                legendData = [];
                yearPacks = [];

                const yearData = $scope.years[$scope.currentYear];
                console.log(yearData, ' yearData');

                for (pack in yearData) {
                    let data = yearData[pack];
                    activePacks.push(pack);

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

                    legendData.push({ 'id' : pack, 'data' : data });

                    //console.log(geojson, ' geojson');

                    // Add each layer to array of all polygons 
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



                    // Create label source 
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


                if ($scope.state.zoomOnYearChange) {
                    var bbox = turf.bbox(polyFeatures)
                    map.fitBounds(bbox, { duration: 700, padding: 20 });
                }

                //getNoTerritory();

                $scope.$evalAsync(function() {
                    $scope.legendData = legendData;
                });

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
                $scope.state.activePacks = activePacks;
                console.log($scope.state, ' state');
            }

                /*
                else if (map.getSource(pack)) {
                    map.removeLayer(pack);
                    map.removeSource(pack);
                }
                */

          $scope.changeYear = function(year) {
              $scope.currentYear = year;
              getYearData(year);
              popup.remove();
          }

          function getYearTotal(data) {
              //console.log(data, ' getYearTotal data');
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

           $scope.highlightPack = function(pack) {
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
        //template: TPL.content,
        link: function($scope, $element, $attributes) {
        }
     } 
 }])
.directive('edit', [function() {
    return {
        restrict: 'E',
        replace: false,
        templateUrl: 'html/edit.html',
        //template: TPL.content,
        link: function($scope, $element, $attributes) {

            $scope.formType = 'login';
            $scope.email    = 'rubykulikowska@gmail.com';
            $scope.password = 'donkey';

            $scope.login = function(email, password) {
                KEY_API_SDK.login(email, password)
                .then( userLoginInfo => {
                    if (userLoginInfo.success) {
                        $scope.formType = 'edit';
                        $scope.$digest();
                    }
                })
                .catch( loginErrorResponse => {
                    console.log(loginErrorResponse);
                    $scope.errorMsg = loginErrorResponse.msg;
                });
            }

            $scope.close = function() {
                $scope.errorMsg = false;
            }

            $scope.setNewData = function(idx) {
                $scope.dataToEdit = { 
                    'data' : $scope.allPackData.packs[idx],
                    'idx'  : idx
                }
                console.log($scope.dataToEdit, ' dataToEdit');
            }

            $scope.saveData = function() {

                console.log($scope.dataToEdit, ' dataToEdit');
                $scope.allPackData.packs[$scope.dataToEdit.idx] = $scope.dataToEdit.data;
                console.log($scope.allPackData, ' all pack data');

                let data = {
                    'uid'     : $scope.packDataUid, 
                    'content' : $scope.allPackData
                }

                console.log(data, ' data');
                //if (false)  
                KEY_API_SDK.updateDataItem('territories', data)
                .then( function(addResponse) {
                    console.log(addResponse);
                })
                .then( function(updateResponse) {
                    console.log( updateResponse );
                })
                .catch();
            }
         }
     } 
 }])
.directive('charts', [function() {
    return {
        restrict: 'E',
        replace: false,
        templateUrl: 'html/charts.html',
        //template: TPL.content,
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
        //template: TPL.content,
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





                $scope.allPackData.packs.map(pack => {
                    if (pack.years[$scope.currentYear] && pack.years[$scope.currentYear].geometry) {
                        geojson = {
                          "type" : "FeatureCollection",
                          "features" : [{
                              "type" : "Feature",
                              "properties" : { 
                                   "name" : pack.name,
                                   "id" : pack.id,
                                   "adults" : pack.years[$scope.currentYear].numbers.adults,
                                   "pups" : pack.years[$scope.currentYear].numbers.pups,
                                   "total" : pack.years[$scope.currentYear].numbers.total
                               },
                              "geometry" : pack.years[$scope.currentYear].geometry
                          }]
                        }

                        polyFeatures.features.push(geojson.features[0]);

                        //console.log(geojson, ' geosjon');
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
                */


