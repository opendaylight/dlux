define([], function () {
    'use strict';

    function FilterNodeWrapperService(constants){

        var service = {
            init: init,
            wrapForFilter: wrapForFilter,
        };

        return service;

        // TODO: add service's description
        function init(node){

            node.childrenFilterConditions = function (children){
                var allowedNodeTypesForFilter = constants.ALLOWED_NODE_TYPES_FOR_FILTER,
                    conditionTypes = function (item){
                        return allowedNodeTypesForFilter.some(function (elem){
                            return elem === item.type;
                        }); },
                    conditionEmptyChildren = function (item){
                        return item.children.some(function (child){
                            return (child.type !== 'leaf-list' && child.type !== 'list');
                        }); },
                    conditionChildDescription = function (item){
                        return !(item.children.every(function (childDes){
                            return childDes.type === 'description';
                        })); };

                return children.filter(function (item){
                    if (item.parent.type === 'leaf' || item.parent.parent.type === 'leaf'){
                        return true;
                    } else {
                        return conditionTypes(item) && conditionEmptyChildren(item) && conditionChildDescription(item);
                    }
                });
            };

            node.getChildrenForFilter = function () {
                return node.childrenFilterConditions(node.getChildren(null, null, constants.NODE_UI_DISPLAY, null));
            };

            node.deepCopyForFilter = function (additionalProperties) {
                var copy = node.getCleanCopy(),
                    self = this,
                    allowedLeafTypesForFilter = constants.ALLOWED_LEAF_TYPES_FOR_FILTER,

                    addFilterProps = function (childrenArray){
                        if (childrenArray.type === 'leaf' && childrenArray.children && childrenArray.children.length){
                            if (childrenArray.children.some(function (item){
                                return item.type === 'type' && allowedLeafTypesForFilter.indexOf(item.label) !== -1;
                            })){
                                childrenArray.filterType = '=';
                            }
                            if (childrenArray.children.some(function (item){
                                return item.type === 'type' && item.label === 'bits';
                            })){
                                childrenArray.filterBitsValue = '';
                            }
                            if (childrenArray.children.some(function (item){
                                return item.type === 'type' && item.label === 'enumeration';
                            })){
                                childrenArray.filterSelectboxBitsValue = [];
                            }
                        }
                    };

                additionalProperties = additionalProperties || ['pathString'];

                additionalProperties.forEach(function (prop) {
                    if (prop !== 'children' && self.hasOwnProperty(prop) && copy.hasOwnProperty(prop) === false) {
                        copy[prop] = self[prop];
                    }
                });

                this.childrenFilterConditions(this.children).forEach(function (child) {
                    var childCopy = null;
                    if (child.type === 'leaf'){
                        childCopy = child.deepCopy();
                    } else {
                        init(child);
                        childCopy = child.deepCopyForFilter();
                    }

                    childCopy.parent = copy;

                    addFilterProps(childCopy);

                    copy.children.push(childCopy);
                });

                addFilterProps(copy);

                return copy;
            };
        }

        // TODO: add service's description
        function wrapForFilter(node) {
            var comparePropToElemByName = function (propName, elemName) {
                    // TODO: also check by namespace - redundancy?
                    return (propName.indexOf(':') > -1 ? propName.split(':')[1] : propName) === elemName;
                },

                wrapperFilter = {

                    wrapFilter: function (node) {
                        if (this.hasOwnProperty(node.type)) {
                            this[node.type](node);
                        }
                    },

                    wrapAllFilter: function (node) {
                        var self = this;
                        self.wrapFilter(node);
                        node.children.forEach(function (child) {
                            self.wrapAllFilter(child);
                        });
                    },

                    leaf: function (node) {
                        var auxBuildRequest = node.buildRequest,
                            auxFill = node.fill,
                            auxClear = node.clear,
                            fnToString = function (string) {
                                var valueStr = '';
                                try {
                                    valueStr = string.toString();
                                } catch (e) {
                                    console.warn('cannot convert value', node.value);
                                }
                                return valueStr;
                            };

                        node.expandedBits = false;

                        node.filterRangeFrom = '';
                        node.filterRangeTo = '';

                        node.buildRequest = function (builder, req) {
                            auxBuildRequest(builder, req);
                            var valueStr = '';
                            valueStr = fnToString(node.value);

                            var filterTypeArray = {
                                '=': function (element, filterValue, i){
                                    return element ? element[i] === filterValue : false;
                                },
                                '>': function (element, filterValue, i){
                                    return element ? element[i] > filterValue : false;
                                },
                                '>=': function (element, filterValue, i){
                                    return element ? element[i] >= filterValue : false;
                                },
                                '<': function (element, filterValue, i){
                                    return element ? element[i] < filterValue : false;
                                },
                                '<=': function (element, filterValue, i){
                                    return element ? element[i] <= filterValue : false;
                                },
                                'contains': function (element, filterValue, i){
                                    return  element ? element[i] && element[i].indexOf(filterValue) > -1 : false;
                                },
                                'regExp': function (element, filterValue, i){
                                    var testRegExp = function (patternString, nodeValue) {
                                        var pattern = new RegExp(patternString);
                                        return pattern.test(nodeValue);
                                    };
                                    return  element ? testRegExp(filterValue, element[i]) : false;
                                },
                                'range': function (element, from, to, i){
                                    if (from && to){
                                        return element ? element[i] <= to && element[i] >= from : false;
                                    } else if (from){
                                        return element ? element[i] >= from : false;
                                    } else {
                                        return element ? element[i] <= to : false;
                                    }
                                } };

                            if (valueStr || (node.filterBitsValue && node.filterBitsValue !== '') ||
                                (node.filterSelectboxBitsValue && node.filterSelectboxBitsValue.length) ||
                                (node.filterRangeFrom && node.filterRangeFrom !==  '') ||
                                (node.filterRangeTo && node.filterRangeTo !==  '')){

                                var reqFilter = {};

                                if (node.filterSelectboxBitsValue && node.filterSelectboxBitsValue.length){
                                    reqFilter.selectboxBitsValue = node.filterSelectboxBitsValue;
                                    reqFilter.getResult = function (element, filterValue, i){
                                        var selectSomeFun = function (filterSelectboxBitsValue, el){
                                            return filterSelectboxBitsValue.some(function (item){
                                                return item === el;
                                            });
                                        };
                                        return element[i] && selectSomeFun(filterValue, element[i]);
                                    };
                                } else {
                                    if (node.filterBitsValue && node.filterBitsValue !== ''){
                                        reqFilter.bitsValue = node.filterBitsValue;
                                    } else {
                                        reqFilter.value = valueStr;
                                    }

                                    if (node.filterType){
                                        reqFilter.filterType = node.filterType;
                                    } else {
                                        reqFilter.filterType = '=';
                                    }

                                    if (node.filterRangeFrom){
                                        reqFilter.filterRangeFrom = node.filterRangeFrom;
                                    }

                                    if (node.filterRangeTo){
                                        reqFilter.filterRangeTo = node.filterRangeTo;
                                    }

                                    reqFilter.getFilterResult = filterTypeArray;
                                }

                                builder.insertPropertyToObj(req, node.label, reqFilter);

                                return true;
                            }
                            return false;
                        };

                        node.fill = function (name, data) {
                            if (data){
                                if (data.hasOwnProperty('value')){
                                    auxFill(name, data.value);
                                }
                                var match = '';

                                if (data.hasOwnProperty('filterType')){
                                    match = comparePropToElemByName(name, node.label);
                                    if (match){
                                        node.filterType = data.filterType;
                                    }
                                }
                                if (data.hasOwnProperty('bitsValue')){
                                    match = comparePropToElemByName(name, node.label);
                                    if (match){
                                        node.filterBitsValue = data.bitsValue;
                                    }
                                }
                                if (data.hasOwnProperty('selectboxBitsValue')){
                                    match = comparePropToElemByName(name, node.label);
                                    if (match){
                                        node.filterSelectboxBitsValue = data.selectboxBitsValue;
                                    }
                                }
                                if (data.hasOwnProperty('filterRangeFrom')){
                                    match = comparePropToElemByName(name, node.label);
                                    if (match){
                                        node.filterRangeFrom = data.filterRangeFrom;
                                    }
                                }
                                if (data.hasOwnProperty('filterRangeTo')){
                                    match = comparePropToElemByName(name, node.label);
                                    if (match){
                                        node.filterRangeTo = data.filterRangeTo;
                                    }
                                }
                            } else {
                                console.error('fill data are empty');
                            }
                        };

                        node.clear = function () {
                            auxClear();
                            node.value = '';

                            if (node.filterType){
                                node.filterType = '=';
                            }
                            if (node.filterBitsValue){
                                node.filterBitsValue = '';
                            }
                            if (node.filterSelectboxBitsValue){
                                node.filterSelectboxBitsValue = [];
                            }
                            if (node.filterRangeFrom){
                                node.filterRangeFrom = '';
                            }
                            if (node.filterRangeTo){
                                node.filterRangeTo = '';
                            }
                        };

                    },

                    type: function (node) {
                    },

                    length: function (node) {
                    },

                    range: function (node) {
                    },

                    pattern: function (node) {
                    },

                    container: function (node) {
                    },

                    rpc: function (node) {
                    },

                    input: function (node) {
                    },

                    output: function (node) {
                    },

                    case: function (node) {
                    },

                    choice: function (node) {
                    },

                    'leaf-list': function (node) {
                    },

                    key: function (node) {
                    },

                    list: function (node) {

                    },

                    _listElem: function (node) {
                    },
                };

            wrapperFilter.wrapAllFilter(node);
        }
    }

    FilterNodeWrapperService.$inject = ['constants'];

    return FilterNodeWrapperService;

});
