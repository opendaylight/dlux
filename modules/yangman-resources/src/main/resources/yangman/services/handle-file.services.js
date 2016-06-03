define(['angular', 'app/yangman/yangman.module'], function (angular) {
    'use strict';

    angular.module('app.yangman').service('HandleFileService', HandleFileService);

    function HandleFileService(){
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
                var blob = new Blob([data], { type: 'application/' + format + '; ' + charset + ';' }),
                    downloadLink = angular.element('<a></a>');

                downloadLink.attr('href', window.URL.createObjectURL(blob));
                downloadLink.attr('download', filename);
                downloadLink[0].click();
                successCbk();
            } catch (e) {
                errorCbk(e);
            }
        }
    }
});
