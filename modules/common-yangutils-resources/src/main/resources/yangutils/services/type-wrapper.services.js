define([], function () {
    'use strict';

    function TypeWrapperService(RestrictionsService){
        var findLeafParent = function (node) {
            if (node.type === 'leaf') {
                return node;
            } else {
                if (node.parent) {
                    return findLeafParent(node.parent);
                } else {
                    return null;
                }
            }
        };

        var wrapper = {
            wrapAll: function (node) {
                if (node.type === 'type') {
                    this._setDefaultProperties(node);
                }

                if(this.hasOwnProperty(node.label)) {
                    this[node.label](node);
                }
            },
            _setDefaultProperties: function (node) {
                var fnToString = function (string) {
                    var valueStr = '';

                    if(string !== null) {
                        try {
                            valueStr = string.toString();
                        } catch (e) {
                            console.warn('cannot convert value', node.value);
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
                        patternCheck = function(value) {
                            return patternRestrictions.map(function(patternNode) {
                                return patternNode.restrictions[0];
                            }).some(function(patternRestriction) {
                                var condition = patternRestriction.check(value);
                                if(condition === false) {
                                    node.errors.push(patternRestriction.info);
                                }
                                return condition;
                            });
                        },
                        lengthRestrictions = node.getChildren('length'),
                        rangeRestrictions = node.getChildren('range'),
                        lengthRangeCheck = function(restrictionsContainers, value) {
                            return restrictionsContainers[0].restrictions.some(function(restriction) {
                                var condition = restriction.check(value);
                                if(condition === false) {
                                    node.errors.push(restriction.info);
                                }
                                return condition;
                            });
                        };

                    var patternCondition = patternRestrictions.length ? patternCheck(value) : true,
                        lengthCondition = lengthRestrictions.length && value.length? lengthRangeCheck(lengthRestrictions, value.length) : true,
                        rangeCondition = rangeRestrictions.length ? lengthRangeCheck(rangeRestrictions, value) : true;

                    return patternCondition && lengthCondition && rangeCondition;
                };
                node.performBuildInChecks = function (value) {
                    return node.builtInChecks.length ? node.builtInChecks.every(function (restriction) {
                        var condition = restriction.check(value);
                        if(condition === false) {
                            node.errors.push(restriction.info);
                        }
                        return condition;
                    }) : true;
                };
                node.check = function (value) {
                    node.errors = [];
                    var condition = value !== '' ? node.performBuildInChecks(value) && node.performRestrictionsCheck(value) : true;
                    if(condition) {
                        node.errors = [];
                    }
                    return condition;
                };
                node.getValue = function(){
                    return fnToString(node.leafParent.value);
                };
            },
            // string: function (node) {
            // },
            // boolean: function (node) {
            // },
            empty: function (node) {
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

                node.getValue = function(){
                    return parseInt(node.emptyValue, 10) === 1 ? {} : '';
                };
            },
            enumeration: function (node) {
                node.selEnum = null;

                var childNames = [];
                node.getChildren('enum').forEach(function(child) {
                    childNames.push(child.label);
                });
                node.builtInChecks.push(RestrictionsService.isInArray(childNames));

                node.setLeafValue = function (value) {
                    if(value !== null) {
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
            },
            bits: function (node) {
                var actBitsLen = 0,
                    i;

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
                    var bitLabels = node.getChildren('bit').map(function(bit) {
                        return bit.label;
                    });

                    node.leafParent.value.split(' ').forEach(function(val) {
                        var valIndex = bitLabels.indexOf(val);
                        if(valIndex !== -1) {
                            node.bitsValues[valIndex] = 1;
                        }
                    });
                };

                node.setLeafValue = function (values, fromFilter) {
                    var bitLabels = node.getChildren('bit').map(function(bit) {
                            return bit.label;
                        }),
                        nodeValue = null;

                    nodeValue = node.bitsValues.map(function(val, index) {
                        if(parseInt(val, 10) === 1) {
                            return bitLabels[index];
                        } else {
                            return null;
                        }
                    }).filter(function(val) {
                        return val !== null;
                    }).join(" ");

                    node.leafParent.value = nodeValue;
                    if(fromFilter){
                        node.leafParent.filterBitsValue = nodeValue;
                    }
                };
            },
            // binary: function (node) {
            // },
            // leafref: function (node) {
            // },
            // identityref: function (node) {
            // },
            union: function (node) {
                node.clear = function () {
                    node.getChildren('type').forEach(function(child) {
                        child.clear();
                    });
                };
                node.fill = function (value) {
                    node.getChildren('type').forEach(function(child) {
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
                    wrapper.wrapAll(childType);
                });
            },
            // 'instance-identifier': function (node) {
            // },
            decimal64: function (node) {
                node.builtInChecks.push(RestrictionsService.getIsDecimalFnc());
            },
            int8: function (node) {
                node.builtInChecks.push(RestrictionsService.getIsNumberFnc());
                node.builtInChecks.push(RestrictionsService.getMinMaxFnc(-128, 127));
            },
            int16: function (node) {
                node.builtInChecks.push(RestrictionsService.getIsNumberFnc());
                node.builtInChecks.push(RestrictionsService.getMinMaxFnc(-32768, 32767));
            },
            int32: function (node) {
                node.builtInChecks.push(RestrictionsService.getIsNumberFnc());
                node.builtInChecks.push(RestrictionsService.getMinMaxFnc(-2147483648, 2147483647));
            },
            int64: function (node) {
                node.builtInChecks.push(RestrictionsService.getIsNumberFnc());
                node.builtInChecks.push(RestrictionsService.getMinMaxFnc(-9223372036854775808, 9223372036854775807));
            },
            uint8: function (node) {
                node.builtInChecks.push(RestrictionsService.getIsUNumberFnc());
                node.builtInChecks.push(RestrictionsService.getMinMaxFnc(0, 255));
            },
            uint16: function (node) {
                node.builtInChecks.push(RestrictionsService.getIsUNumberFnc());
                node.builtInChecks.push(RestrictionsService.getMinMaxFnc(0, 65535));
            },
            uint32: function (node) {
                node.builtInChecks.push(RestrictionsService.getIsUNumberFnc());
                node.builtInChecks.push(RestrictionsService.getMinMaxFnc(0, 4294967295));
            },
            uint64: function (node) {
                node.builtInChecks.push(RestrictionsService.getIsUNumberFnc());
                node.builtInChecks.push(RestrictionsService.getMinMaxFnc(0, 18446744073709551615));
            }
        };

        wrapper.__test = {
            findLeafParent: findLeafParent
        };

        return wrapper;
    }

    TypeWrapperService.$inject=['RestrictionsService'];

    return TypeWrapperService;

});