define(['app/yangui/yangui.module'], function(yangui) {

    yangui.register.service('RequestDataService', ['HistoryService', function(HistoryService){
        var rdf = {};

        rdf.scanDataParams = function (paramsObj, lineString) {
            var usedParamLabelArray = [],
                removeUnwantedChars = function(val){
                    var string = val.substring(2);
                    return string.substring(0, string.indexOf('>>'));
                },
                onlyUnique = function(value, index, self) {
                    return self.indexOf(value) === index;
                };

            var params = lineString ? lineString.match(/<<(?!<<)[a-zA-Z0-9]+>>/g) : null;

            if ( params ) {
                params
                    .filter(onlyUnique)
                    .forEach(function (i) {
                        usedParamLabelArray.push(removeUnwantedChars(i));
                    });
            }

            var returnedParamsList = paramsObj.list.filter(function(i){
                var nameIndex = usedParamLabelArray.indexOf(i.name);
                if ( nameIndex !== -1 ) {
                    return usedParamLabelArray.splice(nameIndex, 1).length;
                }
            });

            usedParamLabelArray.forEach(function(i){
                returnedParamsList.push(HistoryService.createParameter(i, undefined));
            });

            return returnedParamsList;
        };

        return rdf;
    }]);

});