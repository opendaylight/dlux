define([], function () {
    'use strict';

    function TypeWrapperService(RestrictionsService){

        var service = {
            bits: bits,
            decimal64: decimal64,
            empty: empty,
            enumeration: enumeration,
            int16: int16,
            int32: int32,
            int64: int64,
            int8: int8,
            _setDefaultProperties: _setDefaultProperties,
            uint16: uint16,
            uint32: uint32,
            uint64: uint64,
            uint8: uint8,
            union: union,
            wrapAll: wrapAll,
            __test: {
                findLeafParent: findLeafParent,
            },
        };

        return service;

        // TODO: add service's description
        function uint64(node) {
            node.builtInChecks.push(RestrictionsService.getIsUNumberFnc());
            node.builtInChecks.push(RestrictionsService.getMinMaxFnc(0, 18446744073709551615));
        }

        // TODO: add service's description
        function uint32(node) {
            node.builtInChecks.push(RestrictionsService.getIsUNumberFnc());
            node.builtInChecks.push(RestrictionsService.getMinMaxFnc(0, 4294967295));
        }

        // TODO: add service's description
        function uint16(node) {
            node.builtInChecks.push(RestrictionsService.getIsUNumberFnc());
            node.builtInChecks.push(RestrictionsService.getMinMaxFnc(0, 65535));
        }

        // TODO: add service's description
        function uint8(node) {
            node.builtInChecks.push(RestrictionsService.getIsUNumberFnc());
            node.builtInChecks.push(RestrictionsService.getMinMaxFnc(0, 255));
        }

        // TODO: add service's description
        function int64(node) {
            node.builtInChecks.push(RestrictionsService.getIsNumberFnc());
            node.builtInChecks.push(RestrictionsService.getMinMaxFnc(-9223372036854775808, 9223372036854775807));
        }

        // TODO: add service's description
        function int32(node) {
            node.builtInChecks.push(RestrictionsService.getIsNumberFnc());
            node.builtInChecks.push(RestrictionsService.getMinMaxFnc(-2147483648, 2147483647));
        }

        // TODO: add service's description
        function int16(node) {
            node.builtInChecks.push(RestrictionsService.getIsNumberFnc());
            node.builtInChecks.push(RestrictionsService.getMinMaxFnc(-32768, 32767));
        }

        // TODO: add service's description
        function int8(node) {
            node.builtInChecks.push(RestrictionsService.getIsNumberFnc());
            node.builtInChecks.push(RestrictionsService.getMinMaxFnc(-128, 127));
        }

        // TODO: add service's description
        function decimal64(node) {
            node.builtInChecks.push(RestrictionsService.getIsDecimalFnc());
        }

        // TODO: add service's description
        function union(node) {
            node.clear = function () {
                node.getChildren('type').forEach(function (child) {
                    child.clear();
                });
            };
            node.fill = function (value) {
                node.getChildren('type').forEach(function (child) {
                    child.fill(value);
                });
            };

            node.check = function (value) {
                var condition = false;
                node.getChildren('type').forEach(function (childType) {
                    var childCondition = childType.check(value);
                    condition = condition || childCondition;
                });
                return condition;
            };

            node.getChildren('type').forEach(function (childType) {
                wrapAll(childType);
            });
        }

        // TODO: add service's description
        function bits(node) {
            var i;

            node.maxBitsLen = node.getChildren('bit').length;
            node.bitsValues = [];

            for (i = 0; i < node.maxBitsLen; i++) {
                node.bitsValues[i] = 0;
            }

            node.clear = function () {
                for (i = 0; i < node.bitsValues.length; i++) {
                    node.bitsValues[i] = 0;
                }
            };

            node.fill = function (value) {
                var bitLabels = node.getChildren('bit').map(function (bit) {
                    return bit.label;
                });

                node.leafParent.value.split(' ').forEach(function (val) {
                    var valIndex = bitLabels.indexOf(val);
                    if (valIndex !== -1) {
                        node.bitsValues[valIndex] = 1;
                    }
                });
            };

            node.setLeafValue = function (values, fromFilter) {
                var bitLabels = node.getChildren('bit').map(function (bit) {
                        return bit.label;
                    }),
                    nodeValue = null;

                nodeValue = node.bitsValues.map(function (val, index) {
                    if (parseInt(val, 10) === 1) {
                        return bitLabels[index];
                    } else {
                        return null;
                    }
                }).filter(function (val) {
                    return val !== null;
                }).join(' ');

                node.leafParent.value = nodeValue;
                if (fromFilter){
                    node.leafParent.filterBitsValue = nodeValue;
                }
            };
        }

        // TODO: add service's description
        function enumeration(node) {
            node.selEnum = null;

            var childNames = [];
            node.getChildren('enum').forEach(function (child) {
                childNames.push(child.label);
            });
            node.builtInChecks.push(RestrictionsService.isInArray(childNames));

            node.setLeafValue = function (value) {
                if (value !== null) {
                    node.leafParent.value = value;
                }
            };

            node.clear = function () {
                node.selEnum = null;
            };

            node.fill = function (value) {
                var selChild = node.getChildren('enum', value)[0];
                node.selEnum = selChild ? selChild : null;
            };
        }

        // TODO: add service's description
        function empty(node) {
            node.setLeafValue = function (value) {
                node.leafParent.value = value === 1 ? {} : '';
            };

            node.clear = function () {
                node.value = null;
            };

            node.fill = function (value) {
                node.emptyValue = value === '' ? 1 : ($.isEmptyObject(value) ? 1 : 0);
                node.leafParent.value = parseInt(node.emptyValue, 10) === 1 ? {} : '';
            };

            node.getValue = function (){
                return parseInt(node.emptyValue, 10) === 1 ? {} : '';
            };
        }

        // TODO: add service's description
        function _setDefaultProperties(node) {
            var fnToString = function (string) {
                var valueStr = '';

                if (string !== null) {
                    try {
                        valueStr = string.toString();
                    } catch (e) {
                        // uncomment for debug purposes
                        // console.warn('cannot convert value', node.value);
                    }
                }

                return valueStr;
            };

            node.leafParent = findLeafParent(node);
            node.builtInChecks = [];
            node.errors = [];
            node.clear = function () {
            };
            node.fill = function () {
            };
            node.performRestrictionsCheck = function (value) {
                var patternRestrictions = node.getChildren('pattern'),
                    patternCheck = function (value) {
                        return patternRestrictions.map(function (patternNode) {
                            return patternNode.restrictions[0];
                        }).some(function (patternRestriction) {
                            var condition = patternRestriction.check(value);
                            if (condition === false) {
                                node.errors.push(patternRestriction.info);
                            }
                            return condition;
                        });
                    },
                    lengthRestrictions = node.getChildren('length'),
                    rangeRestrictions = node.getChildren('range'),
                    lengthRangeCheck = function (restrictionsContainers, value) {
                        return restrictionsContainers[0].restrictions.some(function (restriction) {
                            var condition = restriction.check(value);
                            if (condition === false) {
                                node.errors.push(restriction.info);
                            }
                            return condition;
                        });
                    };

                var patternCondition = patternRestrictions.length ? patternCheck(value) : true,
                    lengthCondition = lengthRestrictions.length && value.length ?
                                                            lengthRangeCheck(lengthRestrictions, value.length) : true,
                    rangeCondition = rangeRestrictions.length ? lengthRangeCheck(rangeRestrictions, value) : true;

                return patternCondition && lengthCondition && rangeCondition;
            };
            node.performBuildInChecks = function (value) {
                return node.builtInChecks.length ? node.builtInChecks.every(function (restriction) {
                    var condition = restriction.check(value);
                    if (condition === false) {
                        node.errors.push(restriction.info);
                    }
                    return condition;
                }) : true;
            };
            node.check = function (value) {
                node.errors = [];
                var condition = value !== '' ?
                                    node.performBuildInChecks(value) && node.performRestrictionsCheck(value) : true;
                if (condition) {
                    node.errors = [];
                }
                return condition;
            };
            node.getValue = function (){
                return fnToString(node.leafParent.value);
            };
        }

        // TODO: add service's description
        function wrapAll(node) {
            if (node.type === 'type') {
                _setDefaultProperties(node);
            }

            if (service.hasOwnProperty(node.label)) {
                service[node.label](node);
            }
        }

        // TODO: add function's description
        function findLeafParent(node) {
            if (node.type === 'leaf') {
                return node;
            } else {
                if (node.parent) {
                    return findLeafParent(node.parent);
                } else {
                    return null;
                }
            }
        }
    }

    TypeWrapperService.$inject = ['RestrictionsService'];

    return TypeWrapperService;

});
