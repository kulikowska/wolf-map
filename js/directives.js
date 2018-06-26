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

            map.on('load', function() {
                fetch('../2016.json').then(function(data) {
                    return data.json();
                }).then(function(json) {
                    geodata = json;
                    console.log(json, ' 2016');
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
