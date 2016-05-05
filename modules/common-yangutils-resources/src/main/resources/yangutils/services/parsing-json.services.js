define([], function () {
    'use strict';

    function ParsingJsonService(){
        var pj = {};

        pj.parseJson = function(data, parsingErrorClbk){

            var result = null;

            try{
                result = JSON.parse(data);
            }catch(e){
                if(angular.isFunction(parsingErrorClbk)){
                    parsingErrorClbk(e);
                }
            }

            finally {
                return result;
            }

        };

        return pj;
    }

    ParsingJsonService.$inject=[];

    return ParsingJsonService;

});