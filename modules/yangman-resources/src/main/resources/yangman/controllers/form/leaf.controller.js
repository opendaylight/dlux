define(['app/yangman/yangman.module'], function (yangman) {
    'use strict';

    yangman.register.controller('LeafCtrl', LeafCtrl);

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
            yanfLeaf = this,
            lastSection = null;

        yanfLeaf.infoBox = false;
        yanfLeaf.infoBoxSection = '';

        // methods
        yanfLeaf.isActionMenu = isActionMenu;
        yanfLeaf.isNodeInfo = isNodeInfo;
        yanfLeaf.switchSection = switchSection;
        yanfLeaf.getLeafType = getLeafType;
        yanfLeaf.displayValue = displayValue;

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
            return $scope.node.getChildren('description', null, null, 'label').length > 0;
        }

        /**
         * Show hide node info
         * @returns {*}
         */
        function isNodeInfo(){
            return $scope.node.augmentationId || $scope.node.isKey();
        }

        /**
         * Switcher for info box section
         * @param section
         */
        function switchSection(section){
            if ( yanfLeaf.infoBox ) {
                if ( section === lastSection ) {
                    yanfLeaf.infoBox = false;
                } else {
                    yanfLeaf.infoBoxSection = section;
                }
            } else {
                yanfLeaf.infoBox = true;
                yanfLeaf.infoBoxSection = section;
            }

            lastSection = section;
        }
    }
});

