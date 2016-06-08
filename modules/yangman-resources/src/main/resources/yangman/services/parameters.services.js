define(
    [
        'app/yangman/yangman.module',
        'app/yangman/models/parameter.model',
        'app/yangman/models/parameterslist.model',
    ],
    function (yangui, ParameterModel, ParametersListModel) {
        'use strict';

        yangui.register.service('ParametersService', ParametersService);

        ParametersService.$inject = ['ParsingJsonService'];

        function ParametersService(ParsingJsonService){

            var service = {};

            service.createEmptyParametersList = createEmptyParametersList;
            service.createParameter = createParameter;
            // service.validateFile = validateFile;

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
             * @param key
             * @param value
             */
            function createParameter(element){
                var result = new ParameterModel();
                result.setData(element.key, element.value);
                return result;
            }


            /**
             * Service for creating empty parameters list
             * @param name used as key in local storage
             * @returns {*}
             */
            function createEmptyParametersList(name){
                var result = new ParametersListModel(ParsingJsonService, service);
                result.setName(name);
                return result;
            }


            return service;

        }

    });
