define(['app/yangman/yangman.module'], function (yangman) {
    'use strict';

    yangman.register.controller('ContainerCtrl', ContainerCtrl);

    ContainerCtrl.$inject = ['$scope'];

    function ContainerCtrl($scope){
        var yangContainer = this,
            lastSection = null;

        yangContainer.infoBox = false;
        yangContainer.infoBoxSection = '';

        yangContainer.description = false;
        yangContainer.augmentations = false;

        // methods
        yangContainer.isActionMenu = isActionMenu;
        yangContainer.isNodeInfo = isNodeInfo;
        yangContainer.switchSection = switchSection;
        yangContainer.toggleExpanded = toggleExpanded;
        yangContainer.toggleExpandedAugModal = toggleExpandedAugModal;

        /**
         * Show hide augment modal box
         */
        function toggleExpandedAugModal(){
            $scope.augModalView = !$scope.augModalView;
        }

        /**
         * Show hide node
         */
        function toggleExpanded() {
            $scope.node.expanded = !$scope.node.expanded;
        }

        /**
         * Show hide action menu
         * @returns {boolean|*}
         */
        function isActionMenu() {
            return $scope.node.getChildren('description', null, null, 'label').length > 0 ||
                ($scope.node.augmentionGroups && $scope.node.augmentionGroups.length);
        }

        /**
         * Show hide node info
         * @returns {*}
         */
        function isNodeInfo(){
            return $scope.node.augmentationId;
        }

        /**
         * Switcher for info box section
         * @param section
         */
        function switchSection(section){
            if ( yangContainer.infoBox ) {
                if ( section === lastSection ) {
                    yangContainer.infoBox = false;
                } else {
                    yangContainer.infoBoxSection = section;
                }
            } else {
                yangContainer.infoBox = true;
                yangContainer.infoBoxSection = section;
            }

            lastSection = section;
        }
    }
});

