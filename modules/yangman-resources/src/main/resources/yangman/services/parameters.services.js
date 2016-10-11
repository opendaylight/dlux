define([
    'app/yangman/models/parameter.model',
    'app/yangman/models/parameterslist.model',
],
    function (ParameterModel, ParametersListModel) {
        'use strict';

        angular.module('app.yangman').service('ParametersService', ParametersService);

        ParametersService.$inject = ['$filter', 'ParsingJsonService'];

        function ParametersService($filter, ParsingJsonService){

            var service = {};

            service.createEmptyParametersList = createEmptyParametersList;
            service.createParameter = createParameter;
            // service.validateFile = validateFile;

            return service;


            /**
             * Validating collection import file
             * @param data
             * @param checkArray
             * @returns {*}
             */
            function validateFile(data, checkArray){
                try {
                    var obj = ParsingJsonService.parseJson(data);

                    return obj && obj.every(function (el){
                        return checkArray.every(function (arr){
                            return el.hasOwnProperty(arr);
                        });
                    });
                } catch (e) {
                    return e;
                }
            }

            /**
             * Service for creating basic parameter object
             * @returns {*}
             * @param name
             * @param value
             */
            function createParameter(element){
                var result = new ParameterModel();
                result.setData(element.name, element.value);
                return result;
            }


            /**
             * Service for creating empty parameters list
             * @param name used as name in local storage
             * @returns {*}
             */
            function createEmptyParametersList(name){
                var result = new ParametersListModel($filter, ParsingJsonService, service);
                result.setName(name);
                return result;
            }



        }

    });
