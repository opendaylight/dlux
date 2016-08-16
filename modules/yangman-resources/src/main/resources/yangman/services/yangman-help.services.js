define([], function () {
    'use strict';

    angular.module('app.yangman').service('YangmanHelpService', YangmanHelpService);

    YangmanHelpService.$inject = [];

    function YangmanHelpService(){

        var service = {
            getYangmanHelpItems: getYangmanHelpItems,
        };

        return service;

        /**
         * Get item descriptions for yangman-help
         * Unfinished: put this data into json file and get them from this service...
         */
        function getYangmanHelpItems() {
            return {
                "general": [
                    ['text_format', 'Enlarge/Reduce json font size.'],
                    ['import_export', 'Import or export data.'],
                    ['sort', 'Sort Ascending or descending.'],
                    ['close', 'Close popup / Clear input'],
                    ['search', 'Search for a term.'],
                ],
                "modules": [
                    ['remove_red_eye', 'Visible items.'],
                    ['remove_circle_outline', 'Delete item.'],
                ],
                "history-collections": [
                    ['playlist_add_check', 'Select or deselect all history requests'],
                    ['file_upload', 'Import collections from PC'],
                    ['save', 'Save selected/all requests/collections to browsers local storage.'],
                    ['delete', 'Delete selected or all requests/collections from browsers local storage.'],
                ],
                "keyboard-shortcuts": [
                    ['Alt', '+', 'Enlarge json font size.'],
                    ['Alt', '-', 'Reduce json font size.'],
                ],
                "help": [
                    ['help', 'This is yangman help menu. To find more descriptions select desired icon from the left side.'],
                ],
            };
        }

    }
});
