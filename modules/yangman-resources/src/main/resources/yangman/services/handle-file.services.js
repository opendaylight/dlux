define([], function () {
    'use strict';

    angular.module('app.yangman').service('YMHandleFileService', YMHandleFileService);

    YMHandleFileService.$inject = ['$window'];

    function YMHandleFileService($window){
        var service = {
            downloadFile: downloadFile,
        };

        return service;

        /**
         * Service for preparing file and creating link for downloading
         * @param filename
         * @param data
         * @param format
         * @param charset
         * @param successCbk
         * @param errorCbk
         */
        function downloadFile(filename, data, format, charset, successCbk, errorCbk){
            try {
                var blob = new Blob([JSON.stringify(data, null, 4)], { type: 'application/' + format + '; ' + charset + ';' }),
                    downloadLink = angular.element('<a></a>');

                var clickEvent = new MouseEvent('click', {
                    'view': window,
                    'bubbles': true,
                    'cancelable': false
                });

                downloadLink.attr('href', window.URL.createObjectURL(blob));
                if(downloadLink.attr('download', filename) !== undefined) {
                    downloadLink[0].dispatchEvent(clickEvent);
                    successCbk();
                }
                else {
                    $window.location.href = downloadLink[0].href;
                }
            } catch (e) {
                errorCbk(e);
            }
        }
    }
});
