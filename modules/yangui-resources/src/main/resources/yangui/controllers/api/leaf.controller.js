define([], function() {
    angular.module('app.yangui').controller('leafCtrl', function ($scope) {
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
            'union'
        ];

        $scope.getLeafType = function(){
            var label = $scope.node.getChildren('type')[0].label;
            return types.indexOf(label) !== -1 ? label : 'default';
        };

        $scope.displayValue = function() {
            return $scope.node.typeChild.label !== 'empty';
        };
    });

});
