define(['angular'], function (angular) {
    'use strict';

    function ParsingJsonService(){
        var service = {
            parseJson: parseJson,
        };

        return service;

        /**
         * Util for parsing json with error checking
         * @param data
         * @param parsingErrorClbk
         * @returns {*}
         */
        function parseJson(data, parsingErrorClbk){
            var result = null;

            try {
                result = JSON.parse(data);
            } catch (e){
                if (angular.isFunction(parsingErrorClbk)){
                    parsingErrorClbk(e);
                }
            }

            finally {
                return result;
            }

        }
    }

    ParsingJsonService.$inject = [];

    return ParsingJsonService;

});
