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
            style: 'mapbox://styles/kulikowska/cjiv4b6b08cjh2qpbvbo1xo2o'
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
