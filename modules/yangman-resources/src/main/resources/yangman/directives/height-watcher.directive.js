define([], function () {
    'use strict';

    angular.module('app.yangman').directive('heightWatcher', heightWatcherDirective);

    function heightWatcherDirective() {
    return {
        restrict: 'A',
        link: function (scope, element, attrs) {
            scope.$watch(function () {
                return element.css(attrs['watchAttribute']);
            },  heightChangedCallBack,
            true);

            scope.heightTotal = null;

            function heightChangedCallBack(newHeight, oldHeight) {
                var heightReceivedData, heightSentData;

                if (newHeight !== oldHeight) {
                    // set total available height
                    if (!scope.heightTotal) {
                        scope.heightTotal = newHeight.replace("px", "") * 2;
                    }

                    heightSentData = angular.element('#sentData')[0].offsetHeight;
                    heightReceivedData = angular.element('#ReceiveData')[0].offsetHeight;

                    // set ReceiveData height to fill up bottom
                    if ((heightSentData + heightReceivedData) < scope.heightTotal) {
                        angular.element('#ReceiveData').css('height', scope.heightTotal - heightSentData + 'px');
                    }
                }
            }
        }
    };
    }
});
