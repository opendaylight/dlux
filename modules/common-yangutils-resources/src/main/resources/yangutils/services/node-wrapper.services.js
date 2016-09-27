define([], function () {
    'use strict';

    function NodeWrapperService(constants, RequestBuilderService, RestrictionsService, TypeWrapperService,
                                ListFilteringService, EventDispatcherService, FilterNodeWrapperService){

        var service = {
            case: caseYang,
            config: config,
            container: container,
            checkKeyDuplicity: checkKeyDuplicity,
            choice: choice,
            input: input,
            key: key,
            leaf: leaf,
            'leaf-list': leafList,
            length: length,
            list: list,
            _listElem: _listElem,
            output: output,
            pattern: pattern,
            range: range,
            rpc: rpc,
            type: type,
            wrap: wrap,
            wrapAll: wrapAll,
            __test: {
                comparePropToElemByName: comparePropToElemByName,
                equalArrays: equalArrays,
                equalListElems: equalListElems,
                parseRestrictText: parseRestrictText,
                getTypes: getTypes,
                checkListElemKeys: checkListElemKeys,
            },
        };

        return service;

        /**
         * Service for wrapping list element
         * @param node
         * @private
         */
        function _listElem(node) {
            node.refKey = [];

            node.listElemBuildRequest = function (builder, req) {
                var added = false,
                    objToAdd = builder.createObj();

                node.getChildren(null, null, constants.NODE_UI_DISPLAY).forEach(function (child) {
                    var childAdded = child.buildRequest(builder, objToAdd, node.module);
                    added = added || childAdded;
                });

                if (added) {
                    builder.insertObjToList(req, objToAdd);
                }

                return added;
            };

            node.fillListElement = function (name, data) {
                var filled = false;

                node.getChildren(null, null, constants.NODE_UI_DISPLAY).forEach(function (child) {
                    var childFilled = child.fill(name, data);
                    filled = filled || childFilled;
                });

                return filled;
            };

            node.isFilled = function () {
                return node.getChildren(null, null, constants.NODE_UI_DISPLAY).some(function (child) {
                    return child.isFilled();
                });
            };

            node.clear = function () {
                var nodesToClear = node.getChildren(null, null, constants.NODE_UI_DISPLAY);

                if (nodesToClear.length) {
                    nodesToClear.forEach(function (child) {
                        child.clear();
                    });
                }
            };

            node.children.forEach(function (child) {
                wrapAll(child);
            });
        }

        /**
         * Service for wrapping list yang element
         * @param node
         */
        function list(node) {
            node.refKey = [];
            node.doubleKeyIndexes = [];
            node.actElemStructure = null;
            node.actElemIndex = -1;
            node.listData = [];
            node.expanded = true;
            node.filters = [];
            node.filterNodes = [];
            node.searchedPath = [];
            node.referenceNode = null;
            node.filteredListData = [];
            node.currentFilter = 0;

            node.toggleExpand = function () {
                node.expanded = !node.expanded;
            };

            node.createStructure = function () {
                if (node.actElemStructure === null) {
                    var copy = node.deepCopy(['augmentionGroups', 'augmentationId']);
                    _listElem(copy);
                    node.actElemStructure = copy;
                    node.actElemStructure.getActElemIndex = node.getActElemIndex;
                }
            };

            node.getActElemIndex = function () {
                return node.actElemIndex;
            };

            node.addListElem = function () {
                node.createStructure();
                var newElemData = {};
                node.listData.push(newElemData);
                node.changeActElementData(node.listData.length - 1, true);
            };

            node.buildActElemData = function () {
                var list = [],
                    result;

                if (node.actElemStructure) {
                    node.actElemStructure.listElemBuildRequest(RequestBuilderService, list, node.module);
                    result = list[0] ? list[0] : {};
                }
                return result;
            };

            node.changeActElementData = function (index, fromAdd) {
                var storeData = node.buildActElemData();
                node.expanded = true;

                if (node.actElemIndex > -1) { // we are changing already existing data
                    if (node.filteredListData && node.filteredListData.length){
                        node.listData[node.listData.indexOf(node.filteredListData[node.actElemIndex])] = storeData;
                        node.filteredListData[node.actElemIndex] = storeData;
                        if (fromAdd){
                            ListFilteringService.clearFilterData(node, true, false);
                        }
                    } else {
                        node.listData[node.actElemIndex] = storeData;
                    }
                }
                node.actElemIndex = index;

                var actData = null;
                if (!(node.filteredListData && node.filteredListData.length)){
                    actData = node.listData[node.actElemIndex];
                } else {
                    actData = node.listData[node.listData.indexOf(node.filteredListData[node.actElemIndex])];
                }

                node.actElemStructure.clear();
                Object.keys(actData).forEach(function(prop) {
                    node.actElemStructure.fillListElement(prop, actData[prop]);
                });

                EventDispatcherService.dispatch(constants.EV_LIST_CHANGED, node.actElemStructure);
            };

            node.removeListElem = function (elemIndex, fromFilter) {

                if (fromFilter){
                    elemIndex = node.listData.indexOf(node.filteredListData[elemIndex]);
                }

                node.listData.splice(elemIndex, 1);
                node.actElemIndex = node.listData.length - 1;

                if (fromFilter){
                    ListFilteringService.clearFilterData(node, true, false);
                }

                if (node.actElemIndex === -1) {
                    node.actElemStructure = null;
                } else {
                    var actData = node.listData[node.actElemIndex];

                    node.actElemStructure.clear();
                    Object.keys(actData).forEach(function(prop) {
                        node.actElemStructure.fillListElement(prop, actData[prop]);
                    });
                }

                EventDispatcherService.dispatch(constants.EV_LIST_CHANGED, node.actElemStructure);
            };

            node.buildRequest = function (builder, req, module) {
                var added = false;
                // store entered data
                var storeData = node.buildActElemData(),
                    labelWithModule = (module !== node.module ? node.module + ':' : '') + node.label;

                if (node.actElemIndex > -1) {
                    if (node.filteredListData && node.filteredListData.length){
                        node.listData[node.listData.indexOf(node.filteredListData[node.actElemIndex])] = storeData;
                        node.filteredListData[node.actElemIndex] = storeData;
                    } else {
                        node.listData[node.actElemIndex] = storeData;
                    }
                }

                added = node.listData.filter(function (data) {
                    return $.isEmptyObject(data) === false;
                }).length > 0;

                var buildedDataCopy = node.listData.slice().map(function (item) {
                    var newItem = {};
                    Object.keys(item).forEach(function(prop) {
                        if (prop !== '$$hashKey'){
                            newItem[prop] = item[prop];
                        }
                    });
                    return newItem;
                }).filter(function (item){
                    return Object.keys(item).length !== 0;
                });

                // check of listElems keyValues duplicity
                if (node.filteredListData && node.filteredListData.length){
                    node.doubleKeyIndexes = checkKeyDuplicity(node.filteredListData, node.refKey);
                } else {
                    node.doubleKeyIndexes = checkKeyDuplicity(node.listData, node.refKey);
                }

                if (added) {
                    builder.insertPropertyToObj(req, labelWithModule, buildedDataCopy);
                }

                return added;
            };

            node.fill = function (name, array) { // data is array

                var match = comparePropToElemByName(name, node.label);

                if (match && array.length) {
                    node.createStructure();
                    node.listData = array.slice();
                    node.actElemIndex = node.listData.length - 1;

                    Object.keys(node.listData[node.actElemIndex]).forEach(function(prop) {
                        node.actElemStructure.fillListElement(prop, node.listData[node.actElemIndex][prop]);
                    });
                }

                return (match && array.length > 0);
            };

            node.clear = function () {
                while (node.listData.length > 0) {
                    node.listData.pop();
                }
                while (node.filteredListData.length > 0) {
                    node.filteredListData.pop();
                }

                node.actElemIndex = -1;
                node.actElemStructure = null;
                node.nodeType = constants.NODE_UI_DISPLAY;
            };

            node.isFilled = function () {
                return node.listData.length > 0;
            };

            node.createListName = function (index) {
                var name = '',
                    val = '',
                    currentList = null;

                if (node.filteredListData && node.filteredListData.length){
                    currentList = node.filteredListData;
                } else {
                    currentList = node.listData;
                }

                if (index > -1) {
                    node.actElemStructure.refKey.forEach(function (key) {
                        if (index === node.getActElemIndex()) {
                            val = key.value !== '' ? key.label + ':' + key.value : '';
                        } else {
                            var prop = '';
                            if (!($.isEmptyObject(currentList[index]))) {
                                if (currentList[index][key.label]) {
                                    prop = key.label;
                                } else if (currentList[index][key.module + ':' + key.label]) {
                                    prop = key.module + ':' + key.label;
                                }
                                val = prop ? key.label + ':' + currentList[index][prop] : prop;
                            }
                        }

                        name = name ? (name + (val ? (' ' + val) : '')) : (name + (val ? (' <' + val) : ''));
                    });
                }

                if (name) {
                    name = name + '>';
                }

                return name;
            };

            node.getNewFilterElement = function (){
                return node.getChildrenForFilter().map(function (element){
                    FilterNodeWrapperService.init(element);
                    var copy = element.deepCopyForFilter();
                    wrapAll(copy);
                    FilterNodeWrapperService.wrapForFilter(copy);
                    return copy;
                });
            };
        }

        // TODO: add service's description
        function config(node) {
            node.parent.isConfigStm = (node.label === 'true');
        }

        // TODO: add service's description
        function key(node) {
            // do this only on list, not on listElem because deepCopy on list doesn't copy property keys to
            // listElem => don't do this when button for add new list is clicked
            if (node.parent.hasOwnProperty('refKey')) {
                var keyLabels = node.label.split(' '),
                    keyNodes = node.parent.getChildren(null, null, constants.NODE_UI_DISPLAY).filter(function (child) {
                        return keyLabels.indexOf(child.label) > -1;
                    }),
                    getRefKeyArray = function (keys){
                        var refKeyArray = [];
                        keyLabels.forEach(function (keyLabel){
                            var nk = keys.filter(function (k){
                                return keyLabel === k.label;
                            });

                            if ( nk.length ) {
                                refKeyArray.push(nk[0]);
                            }
                        });
                        return refKeyArray;
                    };

                node.parent.refKey = getRefKeyArray(keyNodes);
            }
        }

        /**
         * Service for wrapping leaf list yang element
         * @param node
         */
        function leafList(node) {
            node.value = [];
            node.expanded = true;

            node.toggleExpand = function () {
                node.expanded = !node.expanded;
            };

            node.addListElem = function () {
                var newElement = {
                    value: '',
                };
                node.value.push(newElement);
            };

            node.removeListElem = function (elem) {
                node.value.splice(node.value.indexOf(elem), 1);
            };

            node.buildRequest = function (builder, req, module) {
                var valueArray = [],
                    labelWithModule = (module !== node.module ? node.module + ':' : '') + node.label;

                for (var i = 0; i < node.value.length; i++) {
                    valueArray.push(node.value[i].value);
                }

                if (valueArray.length > 0) {
                    builder.insertPropertyToObj(req, labelWithModule, valueArray);
                    return true;
                }

                return false;

            };


            node.fill = function (name, array) {
                var match = comparePropToElemByName(name, node.label),
                    newLeafListItem;

                if (match) {
                    node.value = [];
                    for (var i = 0; i < array.length; i++) {
                        newLeafListItem = {
                            value: array[i],
                        };
                        node.value.push(newLeafListItem);
                    }

                }
                return match;
            };

            node.clear = function () {
                node.nodeType = constants.NODE_UI_DISPLAY;
                node.value = [];
            };

            node.isFilled = function () {
                return node.value.length > 0;
            };
        }

        /**
         * Service for wrapping choice yang element
         * @param node
         */
        function choice(node) {
            node.choice = null;
            node.expanded = true;

            node.buildRequest = function (builder, req, module) {
                var added = false;

                if (node.choice) {
                    added = node.choice.buildRequest(builder, req, module);
                }

                return added;
            };

            node.fill = function (name, data) {
                var filled = false,
                    nodesToFill = node.getChildren(null, null, constants.NODE_UI_DISPLAY);

                nodesToFill.forEach(function (child) {
                    var childFilled = child.fill(name, data);

                    if (childFilled) {
                        node.choice = child;
                    }

                    filled = filled || childFilled;
                    if (filled) {
                        return false;
                    }
                });

                return filled;
            };

            node.clear = function () {
                node.nodeType = constants.NODE_UI_DISPLAY;

                if (node.choice) {
                    node.choice.clear();
                    node.choice = null;
                }
            };

            node.isFilled = function () {
                return node.choice !== null;
            };
        }

        /**
         * Service for wrapping case yang element
         * @param node
         */
        function caseYang(node) {

            node.buildRequest = function (builder, req, module) {
                var added = false;

                node.getChildren(null, null, constants.NODE_UI_DISPLAY).forEach(function (child) {
                    var childAdded = child.buildRequest(builder, req, module);
                    added = added || childAdded;
                });

                return added;
            };

            node.fill = function (name, data) {
                var filled = false,
                    nodesToFill = node.getChildren(null, null, constants.NODE_UI_DISPLAY);

                nodesToFill.forEach(function (child) {
                    var childFilled = child.fill(name, data);
                    filled = filled || childFilled;
                });

                return filled;
            };

            node.clear = function () {
                var nodesToClear = node.getChildren(null, null, constants.NODE_UI_DISPLAY);

                nodesToClear.forEach(function (child) {
                    child.clear();
                });
            };

            node.isFilled = function () {
                return node.getChildren(null, null, constants.NODE_UI_DISPLAY).some(function (child) {
                    return child.isFilled();
                });
            };
        }

        /**
         * Service for wrapping output yang element
         * @param node
         */
        function output(node) {
            node.expanded = true;

            node.buildRequest = function (builder, req) {

            };

            node.fill = function (name, data) {
                var match = comparePropToElemByName(name, node.label),
                    nodesToFill = node.getChildren(null, null, constants.NODE_UI_DISPLAY);

                if (match && nodesToFill.length) {
                    nodesToFill.forEach(function (child) {
                        Object.keys(data).forEach(function(prop) {
                            child.fill(prop, data[prop]);
                        });
                    });
                    node.expanded = match;
                }

                return match;
            };

            node.clear = function () {
                var nodesToClear = node.getChildren(null, null, constants.NODE_UI_DISPLAY);

                if (nodesToClear.length) {
                    nodesToClear.forEach(function (child) {
                        child.clear();
                    });
                }
            };

            node.isFilled = function () {
                return node.getChildren(null, null, constants.NODE_UI_DISPLAY).some(function (child) {
                    return child.isFilled();
                });
            };

        }

        // TODO: add service's description
        function input(node) {
            node.expanded = true;

            node.buildRequest = function (builder, req, module) {
                var added = false,
                    objToAdd = builder.createObj(),
                    builderNodes = node.getChildren(null, null, constants.NODE_UI_DISPLAY),
                    labelWithModule = (module !== node.module ? node.module + ':' : '') + node.label;

                if (builderNodes.length) {

                    builderNodes.forEach(function (child) {
                        var childAdded = child.buildRequest(builder, objToAdd, node.module);
                        added = added || childAdded;
                    });
                } else {
                    added = true;
                }

                if (added) {
                    builder.insertPropertyToObj(req, labelWithModule, objToAdd);
                }

                return added;
            };

            node.fill = function (name, data) {
                var match = comparePropToElemByName(name, node.label),
                    nodesToFill = node.getChildren(null, null, constants.NODE_UI_DISPLAY);

                if (match && nodesToFill.length) {
                    nodesToFill.forEach(function (child) {
                        Object.keys(data).forEach(function(prop) {
                            child.fill(prop, data[prop]);
                        });
                    });
                    node.expanded = match;
                }

                return match;
            };

            node.clear = function () {
                var nodesToClear = node.getChildren(null, null, constants.NODE_UI_DISPLAY);

                if (nodesToClear.length) {
                    nodesToClear.forEach(function (child) {
                        child.clear();
                    });
                }
            };

            node.isFilled = function () {
                return node.getChildren(null, null, constants.NODE_UI_DISPLAY).some(function (child) {
                    return child.isFilled();
                });
            };

        }

        /**
         * Service for wrapping rpc yang element
         * @param node
         */
        function rpc(node) {
            node.expanded = true;
            node.buildRequest = function (builder, req, module) {
                var added = false,
                    objToAdd = builder.createObj(),
                    builderNodes = node.getChildren(null, null, constants.NODE_UI_DISPLAY),
                    labelWithModule = (module !== node.module ? node.module + ':' : '') + node.label;

                if (builderNodes.length) {
                    builderNodes.forEach(function (child) {
                        var childAdded = child.buildRequest(builder, objToAdd, node.module);
                        added = added || childAdded;
                    });
                } else {
                    added = true;
                    objToAdd = constants.NULL_DATA;
                }

                if (added) {
                    builder.insertPropertyToObj(req, labelWithModule, objToAdd);
                }

                return added;
            };

            node.fill = function (name, data) {
                var match = comparePropToElemByName(name, node.label),
                    nodesToFill = node.getChildren(null, null, constants.NODE_UI_DISPLAY);

                if (match && nodesToFill.length) {
                    nodesToFill.forEach(function (child) {
                        Object.keys(data).forEach(function(prop) {
                            child.fill(prop, data[prop]);
                        });
                    });
                }

                node.expanded = match;

                return match;
            };

            node.clear = function () {
                var nodesToClear = node.getChildren(null, null, constants.NODE_UI_DISPLAY);

                if (nodesToClear.length) {
                    nodesToClear.forEach(function (child) {
                        child.clear();
                    });
                }
            };

            node.isFilled = function () {
                return node.getChildren(null, null, constants.NODE_UI_DISPLAY).some(function (child) {
                    return child.isFilled();
                });
            };

        }

        /**
         * Service for wrapping container yang element
         * @param node
         */
        function container(node) {
            node.expanded = false;

            node.toggleExpand = function () {
                node.expanded = !node.expanded;
            };

            node.buildRequest = function (builder, req, module) {
                var added = false,
                    objToAdd = builder.createObj(),
                    builderNodes = node.getChildren(null, null, constants.NODE_UI_DISPLAY),
                    labelWithModule = (module !== node.module ? node.module + ':' : '') + node.label;

                if (builderNodes.length) {
                    builderNodes.forEach(function (child) {
                        var childAdded = child.buildRequest(builder, objToAdd, node.module);
                        added = added || childAdded;
                    });
                } else  {
                    added = true;
                }

                if (added && (checkEmptyContainer(node.parent ? node.parent.type : 'blanktype', objToAdd) ||
                    checkPresence(node))) {
                    builder.insertPropertyToObj(req, labelWithModule, objToAdd);
                }

                return added;

                // TODO: add function's description
                function checkPresence(containerNode) {
                    return containerNode.children.some(function (ch) {
                        return ch.type === 'presence';
                    });
                }

                // TODO: add function's description
                function checkEmptyContainer(type, obj) { // TODO: absolete after when statement is implemented
                    return !!(type === 'case' || !$.isEmptyObject(objToAdd));
                }
            };

            node.fill = function (name, data) {
                var match = comparePropToElemByName(name, node.label),
                    nodesToFill = node.getChildren(null, null, constants.NODE_UI_DISPLAY);

                if (match && nodesToFill.length) {
                    nodesToFill.forEach(function (child) {
                        Object.keys(data).forEach(function(prop) {
                            child.fill(prop, data[prop]);
                        });
                    });

                    node.expanded = match;
                }

                return match;
            };

            node.clear = function () {
                var nodesToClear = node.getChildren(null, null, constants.NODE_UI_DISPLAY);
                node.nodeType = constants.NODE_UI_DISPLAY;

                if (nodesToClear.length) {
                    nodesToClear.forEach(function (child) {
                        child.clear();
                    });
                }
            };

            node.isFilled = function () {
                return node.getChildren(null, null, constants.NODE_UI_DISPLAY).some(function (child) {
                    return child.isFilled();
                });
            };
        }

        /**
         * Service for set patern restriction from yang element
         * @param node
         */
        function pattern(node) {
            node.restrictions = [RestrictionsService.getReqexpValidationFnc(node.label)];
        }

        /**
         * Service for set range restriction from yang element
         * @param node
         */
        function range(node) {
            node.restrictions = parseRestrictText(node.label);
        }

        /**
         * Service for set length restriction from yang element
         * @param node
         */
        function length(node) {
            node.restrictions = parseRestrictText(node.label);
        }

        /**
         * Service for wrapping type yang element
         * @param node
         */
        function type(node) {
            TypeWrapperService.wrapAll(node);
        }

        /**
         * Service for wrapping leaf yang element
         * @param node
         */
        function leaf(node) {
            node.value = '';
            node.valueIsValid = true;
            node.typeChild = node.getChildren('type')[0];

            node.buildRequest = function (builder, req, module) {
                var value = node.typeChild.getValue(),
                    labelWithModule = (module !== node.module ? node.module + ':' : '') + node.label;

                if (node.isKey()) {
                    EventDispatcherService.dispatch(constants.EV_FILL_PATH, node, value);
                }

                if (value) {
                    builder.insertPropertyToObj(req, labelWithModule, value);
                    return true;
                }

                return false;
            };

            node.fill = function (name, data) {
                var match = '';

                match = comparePropToElemByName(name, node.label);
                if (match) {
                    node.value = data.toString();
                    if (node.typeChild) {
                        node.typeChild.fill(node.value);
                    }
                }
                return match;
            };

            node.clear = function () {
                node.value = '';

                if (node.typeChild) {
                    node.typeChild.clear();
                }
            };

            node.isFilled = function () {
                var filled = node.typeChild.getValue() ? true : false;
                return filled;
            };

            node.checkValueType = function () {
                node.valueIsValid = node.typeChild ? node.typeChild.check(node.value) : true;
            };

            node.isKey = function () {
                return node.parent &&
                    node.parent.type === 'list' &&
                    node.parent.refKey && node.parent.refKey.indexOf(node) !== -1;
            };
        }

        /**
         * Service for wrapping single node
         * @param node
         */
        function wrap(node) {
            if (service.hasOwnProperty(node.type)) {
                service[node.type](node);
            }
        }

        /**
         * Main service for wrapping nodes
         * @param node
         */
        function wrapAll(node) {
            service.wrap(node);
            node.children.forEach(function (child) {
                service.wrapAll(child);
            });
        }

        // TODO: add service's description
        function checkKeyDuplicity(listData, refKey) {
            return checkListElemKeys(listData, refKey);
        }

        // TODO: add function's description
        function comparePropToElemByName(propName, elemName) {
            // AUGMENT FIX
            // return propName === elemName; // TODO also check by namespace - redundancy?

            // TODO also check by namespace - redundancy?
            return (propName.indexOf(':') > -1 ? propName.split(':')[1] : propName) === elemName;
        }

        // TODO: add function's description
        function equalArrays(arrA, arrB) {
            var match = (arrA.length === arrB.length) && arrA.length > 0;

            if (match) {
                var i = 0;
                while (i < arrA.length && match) {
                    var valMatch = arrA[i] === arrB[i];
                    match = match && valMatch;
                    i++;
                }
            }
            return match;
        }

        // TODO: add function's description
        function equalListElems(listElemA, listElemB, refKey) {
            var keyValuesA = getKeyArrayValues(listElemA, refKey),
                keyValuesB = getKeyArrayValues(listElemB, refKey);

            return equalArrays(keyValuesA, keyValuesB);

            // TODO: add function's description
            function getKeyValue(data, label, module) {
                if (data && data.hasOwnProperty(label)) {
                    return data[label];
                } else if (data && data.hasOwnProperty(module + ':' + label)) {
                    return data[module + ':' + label];
                } else {
                    return null;
                }
            }

            // TODO: add function's description
            function getKeyArrayValues(data, refKey) {
                return refKey.map(function (key) {
                    return getKeyValue(data, key.label, key.module);
                }).filter(function (item) {
                    return item !== null;
                });
            }
        }

        // TODO: add function's description
        function checkListElemKeys(listData, refKey) {
            var doubleKeyIndexes = [],
                checkedElems = [];

            listData.forEach(function (item, index) {
                var duplitactes = checkedElems.filter(function (checked) {
                    var isDuplicate = equalListElems(item, checked.item, refKey);
                    if (isDuplicate && doubleKeyIndexes.indexOf(checked.index) === -1) {
                        doubleKeyIndexes.push(checked.index);
                    }
                    return isDuplicate;
                });

                if (duplitactes.length) {
                    // item is already in checkedElems so we don't need to push it again
                    doubleKeyIndexes.push(index);
                } else {
                    checkedElems.push({ index: index, item: item });
                }
            });

            return doubleKeyIndexes;
        }

        // TODO: add function's description
        function parseRestrictText(text) {
            return text.split('|').map(function (elem) {
                var subElems = elem.split('..');
                return subElems.length === 1 ? RestrictionsService.getEqualsFnc(subElems[0]) :
                    RestrictionsService.getMinMaxFnc(subElems[0], subElems[1]);
            });
        }

        // TODO: add function's description
        function getTypes(node) {
            var types = [];

            var getTypesRecursive = function (node, types) {
                types.push(node);

                node.getChildren('type').forEach(function (child) {
                    getTypesRecursive(child, types);
                });
            };

            node.getChildren('type').forEach(function (child) {
                getTypesRecursive(child, types);
            });

            return types;
        }
    }

    NodeWrapperService.$inject = ['constants', 'RequestBuilderService', 'RestrictionsService', 'TypeWrapperService',
        'ListFilteringService', 'EventDispatcherService', 'FilterNodeWrapperService'];

    return NodeWrapperService;

});
