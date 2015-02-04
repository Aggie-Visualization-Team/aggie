angular.module('Aggie')

.controller('VisualizationController', [
    '$scope',
    'VisualizationDataFormatter',
    function($scope, VisualizationDataFormatter) {
        $scope.testing = "Controller Test";
        $scope.serviceTest = VisualizationDataFormatter.generateSomeGraphDataForX();
    }
]);
