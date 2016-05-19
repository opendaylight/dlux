define(['app/yangman/yangman.module'], function (yangman) {
    'use strict';

    yangman.controller('YangmanCtrl', YangmanCtrl);

    YangmanCtrl.$inject = ['$scope', '$rootScope'];

    function YangmanCtrl($scope, $rootScope) {

        $rootScope.section_logo = 'assets/images/logo_yangman.png';
        $scope.currentPath = 'src/app/yangman/views/';

    }

});
