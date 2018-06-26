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
                zoom: 9,
                center: [-110.5885, 44.4280]
            });


            /*
            var newdata = [];
            var goodata;
            fetch('../2013-2.json').then(function(data) {
                return data.json();
            }).then(function(json) {
                console.log(json, ' new json');
                goodata = json;
            });
            */

            /*
            fetch('../2013.json').then(function(response) {
              return response.json();
            }).then(function(json) {
                json.layers[0].featureSet.features.map((feature, i) => {
                    console.log(feature, i);
                    if (i === 11) {
                        var newFeature = {
                            "type": "Feature",
                            "properties": { 'pack' : feature.TITLE },
                            "geometry": {
                                "type": "Polygon",
                                "coordinates": [
                                    feature.geometry.rings[0]
                                ]
                            }
                        }
                        newdata.push(newFeature);
                    }
                })
            });
            */

            //console.log(goodata, ' goodata');
            /*
            var geojson = {
                "type" : "FeatureCollection",
                "features " : goodata 
            };
            console.log(geojson, ' geojson');
            */

            var geojson = {
              "type": "FeatureCollection",
              "features": [
                {
                  "type": "Feature",
                  "properties": {},
                  "geometry": {
                    "type": "Polygon",
                    "coordinates": [
                      [
                        [
                          -110.31097412109375,
                          44.58655513209543
                        ],
                        [
                          -110.28213500976561,
                          44.54644144698688
                        ],
                        [
                          -110.23681640625,
                          44.51805165000559
                        ],
                        [
                          -110.19973754882812,
                          44.56601255400719
                        ],
                        [
                          -110.18875122070311,
                          44.595356872562235
                        ],
                        [
                          -110.27252197265625,
                          44.870469502172696
                        ],
                        [
                          -110.31097412109375,
                          44.58655513209543
                        ]
                      ]
                    ]
                  }
                }
              ]
            }

            map.on('load', function() {
                map.addLayer({
                  "id": "packs-2013",
                  "type": "fill",
                  "source": {
                      "type": "geojson",
                      "data" : geojson
                  },
                  "paint": {
                      "fill-outline-color" : '#000',
                      "fill-color" : 'rgba(0,0,0,0.5)',
                      "fill-opacity" : 0.5
                  }
              });
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
