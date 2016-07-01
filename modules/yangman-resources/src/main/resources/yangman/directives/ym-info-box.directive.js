define(['angular', 'app/yangman/yangman.module'], function (angular, yangman) {
    'use strict';

    yangman.register.directive('ymInfoBox', infoBoxDirective);

    infoBoxDirective.$inject = [];

    function infoBoxDirective() {
        return {
            restrict: 'A',
            templateUrl: 'src/app/yangman/views/directives/ym-info-box.tpl.html',
            transclude: true,
            scope: {
                node: '=',
            },
            link: function (scope, element) {
                element.addClass('info-box-container');
            },
            controller: function ($scope) {
                var description = $scope.node.getChildren('description', null, null, 'label')[0];

                $scope.description = description ? description : '';
                $scope.infoBox = false;

                // methods
                $scope.dividerCheck = dividerCheck;
                $scope.executeInfoBox = executeInfoBox;
                $scope.showBoxCheck = showBoxCheck;

                /**
                 * Set info box value - true, false
                 * @param value
                 */
                function executeInfoBox(value){
                    $scope.infoBox = value;
                }

                /**
                 * Check if box info could be shown
                 * @returns {boolean|*}
                 */
                function showBoxCheck(){
                    return $scope.infoBox && ($scope.description.length || $scope.node.augmentationId);
                }

                /**
                 * Check for showing divider between different shown info
                 * @param key
                 * @returns {*}
                 */
                function dividerCheck(key){
                    return key ? $scope.description.length || $scope.node.augmentationId : $scope.description.length;
                }
            },
        };
    }
});
