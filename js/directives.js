APP
.directive('templateBody', [function() {
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
                zoom: 7.5,
                center: [-110.5885, 44.4280]
            });

            var labels = {
               "type" : "FeatureCollection",
               "features" : []
            }

            var geodata;
            var activePacks = [];
            var allpackdata;
            $scope.currentYear = '2015';

            fetch('../2016-1.json').then(function(data) {
                return data.json();
            }).then(function(json) {
                allpackdata = json;
            });

            map.on('load', function() {
                getYearData($scope.currentYear); 
                //setLabelLayer($scope.currentYear);
            });

            var colorObj = { } 
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
                          /*
                          "fill-outline-color" : '#000',
                          "fill-color" : 'rgba(200, 0, 91)',
                          "fill-opacity" : 0.8
                          */
                        } 
                        break;
                    }
                return colorObj;
            }

            function getYearData(year) {
                console.log(allpackdata, ' allpackdata');
                labels.features = [];
                allpackdata.packs.map(pack => {
                    if ( 
                        pack.years[$scope.currentYear].geometry &&
                        typeof map.getSource(pack.name) === 'undefined') 
                     {
                        var geojson = {
                          "type" : "FeatureCollection",
                          "features" : [{
                              "type" : "Feature",
                              "properties" : {},
                              "geometry" : pack.years[$scope.currentYear].geometry
                          }]
                        }

                        activePacks.push(pack.name);

                        map.addLayer({
                            "id": pack.name,
                            "type": "fill",
                            "source": {
                                "type": "geojson",
                                "data" : geojson 
                            },
                            "paint": getLayerStyleObj(pack.name) 
                        });

                        var centroid = turf.centroid(geojson)
                        centroid.properties.pack = pack.name;
                        labels.features.push(centroid);
                    }
                    else if ( typeof map.getSource(pack.name) !== 'undefined') {
                        var geojson = {
                          "type": "FeatureCollection",
                          "features": [{
                              "type": "Feature",
                              "properties": { },
                              "geometry": pack.years[$scope.currentYear].geometry
                          }]
                        }
                        map.getSource(pack.name).setData(geojson);

                        var centroid = turf.centroid(geojson)
                        centroid.properties.pack = pack.name;
                        labels.features.push(centroid);
                    }
                });

                console.log(labels, ' labels');
                if (typeof map.getSource('packs-labels') === 'undefined') {
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
                } else {
                    map.getSource('packs-labels').setData(
                        labels
                    );
                }
            }

          $scope.changeYear = function(year) {
              $scope.currentYear = year;
              getYearData(year);
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



