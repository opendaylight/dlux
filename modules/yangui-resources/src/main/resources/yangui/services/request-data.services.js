define(['angular'], function (angular) {
    'use strict';

    angular.module('app.yangui').service('RequestDataService', ['HistoryService', RequestDataService]);

    function RequestDataService(HistoryService){
        var service = {
            scanDataParams: scanDataParams,
        };

        return service;

        // TODO: add service's description
        function scanDataParams(paramsObj, lineString) {
            var usedParamLabelArray = [];

            var params = lineString ? lineString.match(/<<(?!<<)[a-zA-Z0-9]+>>/g) : null;

            if ( params ) {
                params
                    .filter(onlyUnique)
                    .forEach(function (i) {
                        usedParamLabelArray.push(removeUnwantedChars(i));
                    });
            }

            var returnedParamsList = paramsObj.list.filter(function (i){
                var nameIndex = usedParamLabelArray.indexOf(i.name);
                if ( nameIndex !== -1 ) {
                    return usedParamLabelArray.splice(nameIndex, 1).length;
                }
            });

            usedParamLabelArray.forEach(function (i){
                returnedParamsList.push(HistoryService.createParameter(i, undefined));
            });

            return returnedParamsList;

            // TODO: add function's description
            function removeUnwantedChars(val){
                var string = val.substring(2);
                return string.substring(0, string.indexOf('>>'));
            }

            // TODO: add function's description
            function onlyUnique(value, index, self) {
                return self.indexOf(value) === index;
            }
        }
    }

});
