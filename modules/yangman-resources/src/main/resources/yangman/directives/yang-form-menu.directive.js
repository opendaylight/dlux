define(['angular'], function (angular) {
    'use strict';

    angular.module('app.yangman').directive('yangFormMenu', menuDirective);

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
                addListItemFunc: '&',
                addListItem: '=',
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
                    angular.element('#infoBox').addClass('ng-hide');
                }

                $scope.$on('hideInfoBox', function () {
                    hideInfoBox();
                });
            },
            link: function (scope, element, attrs) {
                scope.isActive = false;

                // methods
                scope.closeMenu = closeMenu;
                scope.openMenu = openMenu;

                /**
                 * Close Yang menu
                 */
                function closeMenu(){
                    scope.isActive = false;
                    scope.hideInfoBox();
                }

                /**
                 * Open Yang menu
                 */
                function openMenu(){
                    scope.isActive = true;
                }

            },
        };
    }
});
