define(['angular'], function (angular) {
    'use strict';

    angular.module('app.yangman').controller('yangFormMenu', menuDirective);

    menuDirective.$inject = [];

    function menuDirective() {
        return {
            restrict: 'E',
            templateUrl: 'src/app/yangman/views/directives/yang-form-menu.tpl.html',
            scope: {
                node: '=',
                augmentations: '=',
                allowItems: '=',
                isActionMenu: '&',
                isNodeInfo: '&',
                addListItem: '&',
                yangForm: '=',
                yangList: '=',
            },
            controller: function ($scope) {
                var lastSection = null;

                $scope.infoBox = false;
                $scope.infoBoxSection = '';
                $scope.selectedListItem = 0;

                // methods
                $scope.switchSection = switchSection;
                $scope.hideInfoBox = hideInfoBox;

                /**
                 * Switcher for info box section
                 * @param section
                 */
                function switchSection(section){
                    if ( $scope.infoBox ) {
                        if ( section === lastSection ) {
                            $scope.infoBox = false;
                        } else {
                            $scope.infoBoxSection = section;
                        }
                    } else {
                        $scope.infoBox = true;
                        $scope.infoBoxSection = section;
                    }
                    lastSection = section;
                }

                /**
                 * Hide menu info box
                 */
                function hideInfoBox(){
                    $scope.infoBox = false;
                }
            },
        };
    }
});
