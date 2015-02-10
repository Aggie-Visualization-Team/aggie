angular.module('Aggie').factory('VisualizationDataFormatter', [
    function () {
        return {
            generateSomeGraphDataForX: function(eventName, callback) {
                return "Service Test";
            },
            generateSomeGraphDataForY: function() {
                return "Directive Test";
            }
        };
    }
]);
