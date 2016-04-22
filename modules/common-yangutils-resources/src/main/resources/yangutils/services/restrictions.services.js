define([], function () {
    'use strict';

    function RestrictionsService(){
        var RestrictionObject = function(fnc, info) {
            this.info = info;
            this.check = fnc;
        };

        var convertToInteger = function(value) {
            var strVal = typeof value === 'string' ? value : value.toString(),
                radix = strVal.indexOf('0x') === 0 ? 16 : strVal.indexOf('0') === 0 ? 8 : 10;

            return parseInt(strVal, radix);
        };

        var restrictions = {};

        restrictions.getEqualsFnc = function (target) {
            var intTarget = parseInt(target);

            return new RestrictionObject(
                function (value) {
                    var intVal = convertToInteger(value);
                    return intVal === intTarget;
                },
                'Value must be equal to '+target
            );
        };

        restrictions.getMinMaxFnc = function (min, max) {
            var intMin = parseInt(min),
                intMax = parseInt(max);

            return new RestrictionObject(
                function (value) {
                    var intVal = convertToInteger(value);
                    return (intMin <= intVal) && (intVal <= intMax);
                },
                'Value must be in between '+min+' and '+max
            );
        };

        restrictions.getReqexpValidationFnc = function (patternString) {
            return new RestrictionObject(
                function (value) {
                    var pattern = new RegExp(patternString);
                    return pattern.test(value.toString());
                },
                'Value must match '+patternString
            );
        };

        restrictions.getIsNumberFnc = function () {
            return new RestrictionObject(
                function (value) {
                    var pattern = new RegExp('^[+-]?((0x[0-9A-Fa-f]+)|(0[0-9]+)|([0-9]+))$');
                    return pattern.test(value.toString());
                },
                'Value must be number (+/-, 0x and 0) prefixed are permitted'
            );
        };

        restrictions.getIsUNumberFnc = function () {
            return new RestrictionObject(
                function (value) {
                    var pattern = new RegExp('^[+]?((0x[0-9A-Fa-f]+)|(0[0-9]+)|([0-9]+))$');
                    return pattern.test(value.toString());
                },
                'Value must be positive number (+, 0x and 0) prefixed are permitted'
            );
        };

        restrictions.getIsDecimalFnc = function () {
            return new RestrictionObject(
                function (value) {
                    var pattern = new RegExp("^[-]?[1-9]?[0-9]+[.|,]?[0-9]*$");
                    return pattern.test(value.toString());
                },
                'Value must be decimal number - prefix is permitted'
            );
        };

        restrictions.isInArray = function (array) {
            return new RestrictionObject(
                function (value) {
                    return array.some(function(arrVal) {
                        return arrVal === value;
                    });
                },
                'Value must be in ' + array.toString()
            );
        };


        return restrictions;
    }

    RestrictionsService.$inject=[];

    return RestrictionsService;

});