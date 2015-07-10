define(['app/yangui/yangui.module'], function(yangui) {

  yangui.register.factory('YangConfigRestangular', function(Restangular, ENV) {
    return Restangular.withConfig(function(RestangularConfig) {
      RestangularConfig.setBaseUrl(ENV.getBaseURL("MD_SAL"));
    });
  });

  yangui.register.factory('HistoryServices', ['pathUtils','yangUtils', '$filter', function(pathUtils, yangUtils, $filter){

    var hs = {};

    hs.replaceStringInText = function(text, strToReplace, newStr) {
        var replacedText = text;
        if(text.indexOf(strToReplace) > -1) {
            replacedText = text.split(strToReplace).join(newStr);
        }
        return replacedText;
    };

    hs.parametrizeData = function(parameters, data) {
        var dataStr = JSON.stringify(data);
        
        parameters.forEach(function(param){
            dataStr = hs.replaceStringInText(dataStr, '<<' + param.name + '>>', param.value);
        });
        data = JSON.parse(dataStr);
        
        return data;
    };

    hs.validateCollectionFile = function(data){
        try {
            var obj = JSON.parse(data),
                checkArray = ['sentData','receivedData','parametrizedData','path','group','parametrizedPath','method','status','name'];

            return resp =  obj && obj.every(function(el){
                return checkArray.every(function(arr){
                    return el.hasOwnProperty(arr);
                });
            });
        } catch(e) {
            return e;
        }
    };

    var BaseList = function(name) {
        this.name = name;

        this.createEntry = function(elem) {
            return elem;
        };

        this.addRequestToList = function() {};

        this.loadListFromStorage = function(){
            var storageList = localStorage.getItem(this.name),
                self = this;

            if(storageList){
                self.clear();
                JSON.parse(storageList).map(function(elem) {
                    return self.createEntry(elem);
                }).forEach(function(elem) {
                    self.addRequestToList(elem);
                });
            }
        };

        this.saveToStorage = function(){
            try {
                localStorage.setItem(this.name, JSON.stringify(this.toJSON()));
            } catch(e) {
                console.info('DataStorage error:', e);
            }
        };

        this.addFromJSON = function(json) {
            var self = this;

            json.forEach(function(elem) {
                var req = self.createEntry(elem);
                self.addRequestToList(req);
            });
        };
    };

    var HistoryList = function(name, getApiFunction){
        BaseList.call(this, name);
        this.list = [];
        this.getApiFunction = getApiFunction;

        this.createEntry = function(elem) {
            return hs.createHistoryRequestFromElement(elem, this.getApiFunction);
        };

        this.addRequestToList = function(reqObj){
            this.list.push(reqObj);
        };

        this.deleteRequestItem = function(elem){
            this.list.splice(this.list.indexOf(elem), 1);
        };

        this.clear = function() {
            this.list = [];
        };

        this.toJSON = function() {
            return this.list.map(function(elem) {
                return elem.toJSON();
            });
        };
    };
    HistoryList.prototype = Object.create(BaseList.prototype);

    var CollectionList = function(name, getApiFunction){
        BaseList.call(this, name);
        this.groups = {};
        this.groupsKeys = [];
        this.ungrouped = [];
        this.getApiFunction = getApiFunction;

        this.createEntry = function(elem) {
            return hs.createHistoryRequestFromElement(elem, this.getApiFunction);
        };

        this.hasGroupKey = function(key) {
            return this.groupsKeys.indexOf(key) !== -1 && this.groups.hasOwnProperty(key);
        };

        this.refreshGroupKeys = function() {
            this.groupsKeys = Object.keys(this.groups);
        };

        this.addRequestToList = function(reqObj){
            if(reqObj.groupName) {
                if(this.hasGroupKey(reqObj.groupName) === false) {
                    this.groups[reqObj.groupName] = [];
                    this.refreshGroupKeys();
                }

                this.groups[reqObj.groupName].push(reqObj);
            } else {
                this.ungrouped.push(reqObj);
            }
        };

        this.deleteRequestItem = function(elem){
            var groupList = this.hasGroupKey(elem.groupName) ? this.groups[elem.groupName] : this.ungrouped;
            groupList.splice(groupList.indexOf(elem), 1);

            if(groupList.length === 0 && this.hasGroupKey(elem.groupName)) {
                delete this.groups[elem.groupName];
                this.refreshGroupKeys();
            }
        };

        this.clear = function() {
            this.groups = {};
            this.ungrouped = [];
            this.groupsKeys = [];
        };

        this.toJSON = function(group) {
            var list = [],
                self = this;


            if(group && this.groups[group]) {
                list = groups[group].map(function(elem) {
                    return elem.toJSON();
                });
            } else {
                this.groupsKeys.forEach(function(key) {
                    self.groups[key].forEach(function(elem) {
                        list.push(elem.toJSON());
                    });
                });

                this.ungrouped.forEach(function(elem) {
                    list.push(elem.toJSON());
                });
            }

            return list;
        };

        this.toJSONungrouped = function() {
            return this.ungrouped.map(function(elem) {
                return elem.toJSON();
            });
        };

        this.loadListFromFile = function(data){
            var self = this;

            if(data){
                self.clear();
                JSON.parse(data).map(function(elem) {
                    return hs.createHistoryRequest(elem.sentData, elem.receivedData, elem.parametrizedData, elem.path, elem.parametrizedPath, elem.method, elem.status, elem.name, elem.group, self.getApiFunction);
                }).forEach(function(elem) {
                    self.addRequestToList(elem);
                });
            }
        };
    };
    CollectionList.prototype = Object.create(BaseList.prototype);

    var ParameterList = function(name){
        HistoryList.call(this, name);
        this.list = [];

        this.createEntry = function(elem) {
            return new Parameter(elem.name, elem.value);
        };
        
        this.getParamListObjsByName = function(wantedName, exceptObj){
            return this.list.filter(function(o){
                if(exceptObj){
                    return o.name === wantedName && o != exceptObj;
                }
                else{
                    return o.name === wantedName;
                }
            });
        };
        
        this.saveRequestToList = function(reqObj, oldReqObj){
            if(oldReqObj instanceof Parameter && oldReqObj.name.length > 0){
                var oldParamObjsInList = this.getParamListObjsByName(oldReqObj.name);
                if(oldParamObjsInList.length == 1){
                    return this.editRequestInList(reqObj, oldParamObjsInList[0]);
                }
                return false;
            }
            else{
                if(this.getParamListObjsByName(reqObj.name).length > 0){
                    alert($filter('translate')('YANGUI_EXISTING_PARAMETER'));
                    return false;
                }
                else{
                    this.addRequestToList(reqObj);
                    return true;
                }
            }
        };
        
        this.editRequestInList = function(reqObj, oldReqObjInList){
            if(this.getParamListObjsByName(reqObj.name, oldReqObjInList).length === 0){
                oldReqObjInList.name = reqObj.name;
                oldReqObjInList.value = reqObj.value;
                return true;
            }
            else{
                alert($filter('translate')('YANGUI_EXISTING_PARAMETER'));
                return false;
            }
        };

        this.addRequestToList = function(reqObj, oldReqObj){
            this.list.push(reqObj);
        };

        this.deleteRequestItem = function(elem){
            this.list.splice(this.list.indexOf(elem), 1);
        };

        this.clear = function() {
            this.list = [];
        };

        this.toJSON = function() {
            return this.list.map(function(elem) {
                return elem.toJSON();
            });
        };
    };
    ParameterList.prototype = Object.create(HistoryList.prototype);

    var nullFunction = function() {
        return null;
    };

    var Parameter = function(name, value) {
        this.name = name;
        this.value = value;

        this.toJSON = function() {
            var obj = {
                name: this.name,
                value: this.value
            };

            return obj;
        };

        this.clone = function() {
            return new Parameter(this.name, this.value);
        };
    };

    var HistoryRequest = function(sentData, receivedData, parametrizedData, status, path, parametrizedPath, operation, api, name, group){
        this.sentData = (sentData === null || sentData === undefined || $.isEmptyObject(sentData)) ? null : sentData;
        this.parametrizedData = parametrizedData ? parametrizedData : {};
        this.name = name;
        this.path = path;
        this.parametrizedPath = parametrizedPath;
        this.method = operation;
        this.status = status;
        this.receivedData = (receivedData === null || receivedData === undefined ||  $.isEmptyObject(receivedData)) ? null : receivedData;
        this.show = false;
        this.api = api;
        this.availability = (api !== null);
        this.data = null;
        this.groupName = group;

        this.getIdentifiers = function() {
            var identifiers = [];

            api.pathArray.forEach(function(elem) {
                elem.identifiers.forEach(function(i) {
                    identifiers.push(i);
                });
            });

            return identifiers;
        };

        this.toJSON = function() {
            var obj = {
                sentData: this.sentData,
                receivedData: this.receivedData,
                parametrizedData: this.parametrizedData,
                path: this.path,
                group: this.groupName,
                parametrizedPath: this.parametrizedPath,
                method: this.method,
                status: this.status,
                name: this.name
            };

            return obj;
        };

        this.clonePathArray = function() {
            if ( this.api && this.api.pathArray ) {
                this.api.clonedPathArray = [];
                angular.copy(this.api.pathArray, this.api.clonedPathArray);
            }
        };

        this.setParametrizedPath = function(){
            this.clonePathArray();
            pathUtils.fillPath(this.api.clonedPathArray, this.parametrizedPath);
        };

        this.getLastPathDataElemName = function() {
            var pathArray = this.path.split(':');
            return pathArray[pathArray.length-1];
        };

        this.setDataForView = function(sentData){
            var data = {};

            this.data = sentData ? Object.keys(this.parametrizedData).length ? this.parametrizedData : this.sentData : this.receivedData;
            angular.copy(this.data, data);
            this.data = JSON.stringify(yangUtils.stripAngularGarbage(data, this.getLastPathDataElemName()), null, 4);
            if ( sentData && this.api ) {

                if ( this.parametrizedPath ) {
                    this.setParametrizedPath();
                } else {
                    this.clonePathArray();
                }
            }

        };

        this.clearParametrizedData = function() {
            this.parametrizedData = {};
            this.parametrizedPath = null;
            this.setDataForView(true);
            this.clonePathArray();
        };
        
        this.clone = function() {
            return new HistoryRequest(this.sentData, this.receivedData, this.parametrizedData, this.status, this.path, this.parametrizedPath, this.method, this.api, this.name, this.groupName);
        };
        
        this.copyWithParametrizationAsNatural = function(parametrizedPath, getApiFunction){
            var result = new HistoryRequest(this.sentData, this.receivedData, this.parametrizedData, this.status, this.path, parametrizedPath, this.method, this.api, this.name, this.groupName);
            
            result.sentData = result.parametrizedData;
            result.parametrizedData = {};
            result.path = result.parametrizedPath;
            result.parametrizedPath = '';
            
            result.api = getApiFunction ? getApiFunction(result.path) : nullFunction();
            
            return result;
        };

    };

    hs.createHistoryRequestFromElement = function(elem, getApiFunction) {
        return hs.createHistoryRequest(elem.sentData, elem.receivedData, elem.parametrizedData, elem.path, elem.parametrizedPath, elem.method, elem.status, elem.name, elem.group, getApiFunction);
    };

    hs.createHistoryRequest = function(sentData, receivedData, parametrizedData, path, parametrizedPath, operation, status, name, group, getApiFunction){
        var api = getApiFunction ? getApiFunction(path) : nullFunction(),
            receivedDataProcessed = status === "success" ? receivedData : null;

        return new HistoryRequest(sentData, receivedDataProcessed, parametrizedData, status, path, parametrizedPath, operation, api, name, group);
    };

    hs.createEmptyHistoryList = function(name, getApiFunction){
        return new HistoryList(name, getApiFunction);
    };

    hs.createEmptyCollectionList = function(name, getApiFunction){
        return new CollectionList(name, getApiFunction);
    };
    
    hs.createParameter = function(name, value){
        return new Parameter(name, value);
    };

    hs.createEmptyParamList = function(name){
        return new ParameterList(name);
    };

    hs.setNameAndGroup = function(name, group, elem) {
        if(name) {
            elem.name = name;
        }

        if(group) {
            elem.groupName = group;
        }
        else{
            elem.groupName = '';
        }
    };

    return hs;

  }]);

  yangui.register.factory('customFunctUnsetter', ['pathUtils','dataBackuper', function(pathUtils, dataBackuper){

    var cfu = {};

    cfu['YANGUI_CUST_MOUNT_POINTS'] = function(scope){
        dataBackuper.getToScope(['treeApis', 'treeRows', 'apis', 'node', 'selApi', 'selSubApi', 'augmentations'], scope);

        scope.baseMpApi = '';

        var path = scope.selApi.basePath+scope.selSubApi.buildApiRequestString();
        pathUtils.searchNodeByPath(path, scope.treeApis, scope.treeRows);
    };

    cfu.unset = function(custFunct, scope) {
        if(cfu.hasOwnProperty(custFunct.label)) {
            cfu[custFunct.label](scope);
        }
    };

    return cfu;

  }]);


});