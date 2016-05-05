define(['angular', 'app/yangui/yangui.module', 'common/yangutils/constants'], function (angular, yangui, constants) {
    'use strict';

    yangui.register.service('HistoryService', ['PathUtilsService', 'YangUtilsService', '$filter',
                                                'EventDispatcherService', 'ParsingJsonService', HistoryService]);

    function HistoryService(PathUtilsService, YangUtilsService, $filter, EventDispatcherService, ParsingJsonService){
        var service = {
            createEmptyCollectionList: createEmptyCollectionList,
            createEmptyHistoryList: createEmptyHistoryList,
            createEmptyParamList: createEmptyParamList,
            createHistoryRequest: createHistoryRequest,
            createHistoryRequestFromElement: createHistoryRequestFromElement,
            createParameter: createParameter,
            parametrizeData: parametrizeData,
            replaceStringInText: replaceStringInText,
            setNameAndGroup: setNameAndGroup,
            validateFile: validateFile,
        };

        return service;

        /**
         * Service for replacing string in text
         * @param text
         * @param strToReplace
         * @param newStr
         * @returns {*}
         */
        function replaceStringInText(text, strToReplace, newStr) {
            var replacedText = text;
            if (text.indexOf(strToReplace) > -1) {
                replacedText = text.split(strToReplace).join(newStr);
            }
            return replacedText;
        }

        // TODO: add service's description
        function parametrizeData(parameters, data) {
            var dataStr = JSON.stringify(data);

            parameters.forEach(function (param){
                dataStr = service.replaceStringInText(dataStr, '<<' + param.name + '>>', param.value);
            });
            data = ParsingJsonService.parseJson(dataStr);

            return data;
        }

        // TODO: add service's description
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

        // TODO: add service's description
        function createHistoryRequestFromElement(elem, getApiFunction) {
            return service.createHistoryRequest(elem.sentData, elem.receivedData,
                                                elem.path, elem.parametrizedPath,
                                                elem.method, elem.status, elem.name,
                                                elem.group, getApiFunction);
        }

        /**
         * Service for creating basic history object
         * @param sentData
         * @param receivedData
         * @param path
         * @param parametrizedPath
         * @param operation
         * @param status
         * @param name
         * @param group
         * @param getApiFunction
         * @returns {HistoryRequest}
         */
        function createHistoryRequest(sentData, receivedData, path, parametrizedPath, operation, status, name, group, getApiFunction){
            var api = getApiFunction ? getApiFunction(path) : nullFunction(),
                receivedDataProcessed = status === 'success' ? receivedData : null;

            return new HistoryRequest(sentData, receivedDataProcessed, status, path, parametrizedPath, operation, api, name, group);
        }

        /**
         * Service for creating empty history list
         * @param name
         * @param getApiFunction
         * @returns {HistoryList}
         */
        function createEmptyHistoryList(name, getApiFunction){
            return new HistoryList(name, getApiFunction);
        }

        /**
         * Service for creating empty collection list
         * @param name
         * @param getApiFunction
         * @returns {CollectionList}
         */
        function createEmptyCollectionList(name, getApiFunction){
            return new CollectionList(name, getApiFunction);
        }

        /**
         * Service for creating parameter object
         * @param name
         * @param value
         * @returns {Parameter}
         */
        function createParameter(name, value){
            return new Parameter(name, value);
        }

        /**
         * Service for creating empty parameters list
         * @param name
         * @returns {ParameterList}
         */
        function createEmptyParamList(name){
            return new ParameterList(name);
        }

        // TODO: add service's description
        function setNameAndGroup(name, group, elem) {
            if (name) {
                elem.name = name;
            }

            if (group) {
                elem.groupName = group;
            } else {
                elem.groupName = '';
            }
        }

        /**
         * Base list object for extending history and collection object
         * @param name
         * @constructor
         */
        function BaseList(name) {
            this.name = name;

            this.createEntry = function (elem) {
                return elem;
            };

            this.addRequestToList = function () {};

            this.refresh = function () {};

            this.successfullEditCbk = function () {};

            this.errorEditCbk = function () {};

            this.loadListFromStorage = function (){
                var storageList = localStorage.getItem(this.name),
                    self = this;

                if (storageList){
                    self.clear();
                    ParsingJsonService.parseJson(storageList).map(function (elem) {
                        return self.createEntry(elem);
                    }).forEach(function (elem) {
                        self.addRequestToList(elem);
                    });
                }
            };

            this.saveToStorage = function (){
                try {
                    localStorage.setItem(this.name, JSON.stringify(this.toJSON()));
                } catch (e) {
                    console.info('DataStorage error:', e);
                }
            };

            this.addFromJSON = function (json) {
                var self = this;

                json.forEach(function (elem) {
                    var req = self.createEntry(elem);
                    self.addRequestToList(req);
                });
            };
        }

        /**
         * Base history list object
         * @param name
         * @param getApiFunction
         * @constructor
         */
        function HistoryList(name, getApiFunction){
            BaseList.call(this, name);
            this.list = [];
            this.getApiFunction = getApiFunction;

            this.createEntry = function (elem) {
                return service.createHistoryRequestFromElement(elem, this.getApiFunction);
            };

            this.addRequestToList = function (reqObj){
                this.list.push(reqObj);
            };

            this.refresh = function () {
                var self = this;

                this.list.forEach(function (elem) {
                    elem.refresh(self.getApiFunction);
                });
            };

            this.deleteRequestItem = function (elem){
                this.list.splice(this.list.indexOf(elem), 1);
            };

            this.clear = function () {
                this.list = [];
            };

            this.toJSON = function () {
                return this.list.map(function (elem) {
                    return elem.toJSON();
                });
            };
        }

        HistoryList.prototype = Object.create(BaseList.prototype);

        /**
         * Base collection list object
         * @param name
         * @param getApiFunction
         * @constructor
         */
        function CollectionList(name, getApiFunction){
            BaseList.call(this, name);
            this.groups = {};
            this.groupsKeys = [];
            this.ungrouped = [];
            this.getApiFunction = getApiFunction;

            this.createEntry = function (elem) {
                return service.createHistoryRequestFromElement(elem, this.getApiFunction);
            };

            this.hasGroupKey = function (key) {
                return this.groupsKeys.indexOf(key) !== -1 && this.groups.hasOwnProperty(key);
            };

            this.refreshGroupKeys = function () {
                this.groupsKeys = Object.keys(this.groups);
            };

            this.addRequestToList = function (reqObj){
                if (reqObj.groupName) {
                    if (this.hasGroupKey(reqObj.groupName) === false) {
                        this.groups[reqObj.groupName] = [];
                        this.refreshGroupKeys();
                    }

                    this.groups[reqObj.groupName].push(reqObj);
                } else {
                    this.ungrouped.push(reqObj);
                }
            };

            this.refresh = function () {
                var self = this;
                this.groupsKeys.forEach(function (key) {
                    self.groups[key].forEach(function (elem) {
                        elem.refresh(self.getApiFunction);
                    });
                });

                this.ungrouped.forEach(function (elem) {
                    elem.refresh(self.getApiFunction);
                });
            };

            this.deleteRequestItem = function (elem){
                var groupList = this.hasGroupKey(elem.groupName) ? this.groups[elem.groupName] : this.ungrouped;
                groupList.splice(groupList.indexOf(elem), 1);

                if (groupList.length === 0 && this.hasGroupKey(elem.groupName)) {
                    delete this.groups[elem.groupName];
                    this.refreshGroupKeys();
                }
            };

            this.clear = function () {
                this.groups = {};
                this.ungrouped = [];
                this.groupsKeys = [];
            };

            this.toJSON = function (group) {
                var list = [],
                    self = this;


                if (group && this.groups[group]) {
                    list = this.groups[group].map(function (elem) {
                        return elem.toJSON();
                    });
                } else {
                    this.groupsKeys.forEach(function (key) {
                        self.groups[key].forEach(function (elem) {
                            list.push(elem.toJSON());
                        });
                    });

                    this.ungrouped.forEach(function (elem) {
                        list.push(elem.toJSON());
                    });
                }

                return list;
            };

            this.toJSONungrouped = function () {
                return this.ungrouped.map(function (elem) {
                    return elem.toJSON();
                });
            };

            this.loadListFromFile = function (data){
                var self = this;

                if (data){
                    self.clear();
                    ParsingJsonService.parseJson(data).map(function (elem) {
                        return service.createHistoryRequest(elem.sentData, elem.receivedData, elem.path,
                                                            elem.parametrizedPath, elem.method, elem.status,
                                                            elem.name, elem.group, self.getApiFunction);
                    }).forEach(function (elem) {
                        self.addRequestToList(elem);
                    });
                }
            };
        }
        CollectionList.prototype = Object.create(BaseList.prototype);

        /**
         * Base parameter list object
         * @param name
         * @constructor
         */
        function ParameterList(name){
            HistoryList.call(this, name);
            this.list = [];

            this.successfullEditCbk = function () {
                // console.debug('success');
                EventDispatcherService.dispatch(constants.EV_PARAM_EDIT_SUCC);
            };

            this.errorEditCbk = function () {
                alert($filter('translate')('YANGUI_EXISTING_PARAMETER'));
            };

            this.createEntry = function (elem) {
                return new Parameter(elem.name, elem.value);
            };

            this.getParamListObjsByName = function (wantedName, exceptObj){
                return this.list.filter(function (o){
                    if (exceptObj){
                        return o.name === wantedName && o !== exceptObj;
                    } else {
                        return o.name === wantedName;
                    }
                });
            };

            this.saveRequestToList = function (reqObj, oldReqObj){
                if (oldReqObj instanceof Parameter && oldReqObj.name){
                    var oldParamObjsInList = this.getParamListObjsByName(oldReqObj.name),
                        existingObjsWithSameName = this.getParamListObjsByName(reqObj.name, oldReqObj);

                    if (oldParamObjsInList.length === 1 && existingObjsWithSameName.length === 0){
                        this.editRequestInList(reqObj, oldParamObjsInList[0]);
                    } else {
                        this.errorEditCbk();
                    }
                } else {
                    if (this.getParamListObjsByName(reqObj.name).length){
                        this.errorEditCbk();
                    } else {
                        this.addRequestToList(reqObj);
                        this.successfullEditCbk();
                    }
                }
            };

            this.editRequestInList = function (reqObj, oldReqObjInList){
                oldReqObjInList.name = reqObj.name;
                oldReqObjInList.value = reqObj.value;
                this.successfullEditCbk();
            };

            this.addRequestToList = function (reqObj, oldReqObj){
                this.list.push(reqObj);
                this.successfullEditCbk();
            };

            this.deleteRequestItem = function (elem){
                this.list.splice(this.list.indexOf(elem), 1);
            };

            this.clear = function () {
                this.list = [];
            };

            this.toJSON = function () {
                return this.list.map(function (elem) {
                    return elem.toJSON();
                });
            };

            this.loadListFromFile = function (data){
                var self = this;

                if (data){
                    self.clear();
                    ParsingJsonService.parseJson(data).map(function (elem) {
                        return service.createParameter(elem.name, elem.value);
                    }).forEach(function (elem) {
                        self.addRequestToList(elem);
                    });
                }
            };
        }
        ParameterList.prototype = Object.create(HistoryList.prototype);

        /**
         * Base parameter object
         * @param name
         * @param value
         * @constructor
         */
        function Parameter(name, value) {
            this.name = name;
            this.value = value;

            this.toJSON = function () {
                var obj = {
                    name: this.name,
                    value: this.value,
                };

                return obj;
            };

            this.clone = function () {
                return new Parameter(this.name, this.value);
            };
        }

        /**
         * Base history request object
         * @param sentData
         * @param receivedData
         * @param status
         * @param path
         * @param parametrizedPath
         * @param operation
         * @param api
         * @param name
         * @param group
         * @constructor
         */
        function HistoryRequest(sentData, receivedData, status, path, parametrizedPath, operation, api, name, group){
            this.sentData = sentData === null || sentData === undefined || $.isEmptyObject(sentData) ? null : sentData;
            this.name = name;
            this.path = path;
            this.parametrizedPath = parametrizedPath;
            this.method = operation;
            this.status = status;
            this.receivedData = receivedData === null || receivedData === undefined || $.isEmptyObject(receivedData) ? null : receivedData;
            this.show = false;
            this.api = api;
            this.availability = (api !== null);
            this.groupName = group;

            this.getIdentifiers = function () {
                var identifiers = [];

                api.pathArray.forEach(function (elem) {
                    elem.identifiers.forEach(function (i) {
                        identifiers.push(i);
                    });
                });

                return identifiers;
            };

            this.refresh = function (getApiFunction) {
                var refreshedApi = getApiFunction(this.path);

                this.api = refreshedApi;
                this.availability = (refreshedApi !== null);
            };

            this.toJSON = function () {
                var obj = {
                    sentData: this.sentData,
                    receivedData: this.receivedData,
                    path: this.path,
                    group: this.groupName,
                    parametrizedPath: this.parametrizedPath,
                    method: this.method,
                    status: this.status,
                    name: this.name,
                };

                return obj;
            };

            this.clonePathArray = function () {
                if ( this.api && this.api.pathArray ) {
                    this.api.clonedPathArray = this.api.pathArray.map(function (pe) {
                        return pe.clone();
                    });
                } else {
                    this.api.clonedPathArray = [];
                }
            };

            this.setParametrizedPath = function (){
                this.clonePathArray();
                PathUtilsService.fillPath(this.api.clonedPathArray, this.parametrizedPath);
            };

            this.getLastPathDataElemName = function () {
                var pathArray = this.path.split(':');
                return pathArray[pathArray.length - 1];
            };

            this.setDataForView = function (sent, data){
                var newData = {},
                    parsedData = '';

                angular.copy(data, newData);
                parsedData = JSON.stringify(
                                YangUtilsService.stripAngularGarbage(newData, this.getLastPathDataElemName()), null, 4);

                if ( sent && this.api ) {
                    if ( this.parametrizedPath ) {
                        this.setParametrizedPath();
                    } else {
                        this.clonePathArray();
                    }
                }

                return parsedData;
            };

            this.clearParametrizedData = function () {
                this.parametrizedPath = null;
                this.clonePathArray();
            };

            this.clone = function () {
                return new HistoryRequest(this.sentData, this.receivedData, this.status, this.path,
                                            this.parametrizedPath, this.method, this.api, this.name, this.groupName);
            };

            this.copyWithParametrizationAsNatural = function (parametrizedPath, getApiFunction, dataForView, JSONparsingErrorClbk){

                var parsedJsonObj = null,
                    result = null;

                parsedJsonObj = ParsingJsonService.parseJson(dataForView, JSONparsingErrorClbk);

                if (parsedJsonObj){
                    result = new HistoryRequest(parsedJsonObj, this.receivedData, this.status,
                                                parametrizedPath, '', this.method, this.api, this.name, this.groupName);
                    result.api = getApiFunction ? getApiFunction(result.path) : nullFunction();
                }

                return result;
            };

        }

        /**
         * Helper
         * @returns {null}
         */
        function nullFunction() {
            return null;
        }

    }

});
