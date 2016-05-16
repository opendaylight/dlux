define([
    'app/yangman/yangman.module',
], function () {
    'use strict';

    angular.module('app.yangman').controller('YangmanCtrl', YangmanCtrl);

    YangmanCtrl.$inject = ['$scope', '$rootScope'];

    function YangmanCtrl($scope, $rootScope) {

        $rootScope.section_logo = 'assets/images/logo_yangman.png';
        $scope.currentPath = 'src/app/yangman/views/';
        $scope.leftPanelTab = 0;

        $scope.toggleLeftPanel = toggleLeftPanel;

        function toggleLeftPanel(){
            $scope.leftPanelTab = ($scope.leftPanelTab + 1) % 2;
            console.debug($scope.leftPanelTab);
        }
    }

});
