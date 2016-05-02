define([], function () {
    'use strict';

    function RestrictionsService(){

        var service = {
            getEqualsFnc: getEqualsFnc,
            getIsDecimalFnc: getIsDecimalFnc,
            getIsNumberFnc: getIsNumberFnc,
            getIsUNumberFnc: getIsUNumberFnc,
            getMinMaxFnc: getMinMaxFnc,
            getReqexpValidationFnc: getReqexpValidationFnc,
            isInArray: isInArray,
        };

        return service;

        // TODO: add service's description
        function getEqualsFnc(target) {
            var intTarget = parseInt(target);

            return new RestrictionObject(
                function (value) {
                    var intVal = convertToInteger(value);
                    return intVal === intTarget;
                },
                'Value must be equal to ' + target
            );
        }

        // TODO: add service's description
        function getMinMaxFnc(min, max) {
            var intMin = parseInt(min),
                intMax = parseInt(max);

            return new RestrictionObject(
                function (value) {
                    var intVal = convertToInteger(value);
                    return (intMin <= intVal) && (intVal <= intMax);
                },
                'Value must be in between ' + min + ' and ' + max
            );
        }

        // TODO: add service's description
        function getReqexpValidationFnc(patternString) {
            return new RestrictionObject(
                function (value) {
                    var pattern = new RegExp(patternString);
                    return pattern.test(value.toString());
                },
                'Value must match ' + patternString
            );
        }

        // TODO: add service's description
        function getIsNumberFnc() {
            return new RestrictionObject(
                function (value) {
                    var pattern = new RegExp('^[+-]?((0x[0-9A-Fa-f]+)|(0[0-9]+)|([0-9]+))$');
                    return pattern.test(value.toString());
                },
                'Value must be number (+/-, 0x and 0) prefixed are permitted'
            );
        }

        // TODO: add service's description
        function getIsUNumberFnc() {
            return new RestrictionObject(
                function (value) {
                    var pattern = new RegExp('^[+]?((0x[0-9A-Fa-f]+)|(0[0-9]+)|([0-9]+))$');
                    return pattern.test(value.toString());
                },
                'Value must be positive number (+, 0x and 0) prefixed are permitted'
            );
        }

        // TODO: add service's description
        function getIsDecimalFnc() {
            return new RestrictionObject(
                function (value) {
                    var pattern = new RegExp('^[-]?[1-9]?[0-9]+[.|,]?[0-9]*$');
                    return pattern.test(value.toString());
                },
                'Value must be decimal number - prefix is permitted'
            );
        }

        // TODO: add service's description
        function isInArray(array) {
            return new RestrictionObject(
                function (value) {
                    return array.some(function (arrVal) {
                        return arrVal === value;
                    });
                },
                'Value must be in ' + array.toString()
            );
        }

        /**
         * Base restriction object
         * @param fnc
         * @param info
         * @constructor
         */
        function RestrictionObject(fnc, info) {
            this.info = info;
            this.check = fnc;
        }

        // TODO: add function's description
        function convertToInteger(value) {
            var strVal = typeof value === 'string' ? value : value.toString(),
                radix = strVal.indexOf('0x') === 0 ? 16 : strVal.indexOf('0') === 0 ? 8 : 10;

            return parseInt(strVal, radix);
        }
    }

    RestrictionsService.$inject = [];

    return RestrictionsService;

});
