define([], function () {
    'use strict';
    angular.module('app.yangui').controller('LeafCtrl', LeafCtrl);

    LeafCtrl.$inject = ['$scope'];

    // todo: comment the whole controller
    function LeafCtrl($scope) {
        var types = [
            'binary',
            'bits',
            'boolean',
            'decimal64',
            'enumeration',
            'empty',
            'identityref',
            'instance-identifier',
            'int16',
            'int32',
            'int64',
            'int8',
            'leafref',
            'string',
            'uint16',
            'uint32',
            'uint64',
            'uint8',
            'union',
        ];

        $scope.displayValue = displayValue;
        $scope.getLeafType = getLeafType;

        function getLeafType(){
            var label = $scope.node.getChildren('type')[0].label;
            return types.indexOf(label) !== -1 ? label : 'default';
        }

        function displayValue() {
            return $scope.node.typeChild.label !== 'empty';
        }
    }

});
