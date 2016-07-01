define([], function () {
    'use strict';

    angular.module('app.yangman').controller('LeafCtrl', LeafCtrl);

    LeafCtrl.$inject = ['$scope'];

    function LeafCtrl($scope){
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
            ],
            yangLeaf = this;

        yangLeaf.infoBox = false;
        yangLeaf.infoBoxSection = '';

        // methods
        yangLeaf.displayValue = displayValue;
        yangLeaf.getLeafCentering = getLeafCentering;
        yangLeaf.getLeafType = getLeafType;
        yangLeaf.isActionMenu = isActionMenu;


        function getLeafCentering(){
            return ['union', 'bits', 'empty'].indexOf(getLeafType()) > -1 ? 'start' : 'center';
        }

        /**
         * Get leaf type
         * @returns {*}
         */
        function getLeafType(){
            var label = $scope.node.getChildren('type')[0].label;
            return types.indexOf(label) !== -1 ? label : 'default';
        }

        function displayValue() {
            return $scope.node.typeChild.label !== 'empty';
        }

        /**
         * Show hide action menu
         * @returns {boolean|*}
         */
        function isActionMenu() {
            return false;
        }
    }
});

