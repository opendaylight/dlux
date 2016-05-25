define(['angular', 'app/yangui/yangui.module'], function (angular, yangui) {
    'use strict';

    yangui.register.service('HandleFileService', HandleFileService);

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

                var clickEvent = new MouseEvent('click', {
                    'view': window,
                    'bubbles': true,
                    'cancelable': false
                });

                downloadLink.attr('href', window.URL.createObjectURL(blob));
                downloadLink.attr('download', filename);
                downloadLink[0].dispatchEvent(clickEvent);
                successCbk();
            } catch (e) {
                errorCbk(e);
            }
        }
    }
});
