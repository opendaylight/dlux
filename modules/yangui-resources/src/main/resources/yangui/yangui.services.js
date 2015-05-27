define(['app/yangui/yangui.module'], function(yangui) {

  yangui.register.factory('YangConfigRestangular', function(Restangular, ENV) {
    return Restangular.withConfig(function(RestangularConfig) {
      RestangularConfig.setBaseUrl(ENV.getBaseURL("MD_SAL"));
    });
  });

  yangui.register.factory('HistoryServices',['pathUtils','yangUtils', function(pathUtils, yangUtils){

    var hs = {};

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

        this.addRequestToList = function() {};

        this.loadListFromStorage = function(getApiFunction){
            var storageList = localStorage.getItem(this.name),
                self = this;

            if(storageList){
                self.clear();
                JSON.parse(storageList).map(function(elem) {
                    return hs.createHistoryRequest(elem.sentData, elem.receivedData, elem.parametrizedData, elem.path, elem.parametrizedPath, elem.method, elem.status, elem.name, elem.group, getApiFunction);
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

        this.addFromJSON = function(json, getApiFunction) {
            var self = this;

            json.forEach(function(elem) {
                var req = hs.createHistoryRequest(elem.sentData, elem.receivedData, null, elem.path, null, elem.method, elem.status, elem.name, elem.group, getApiFunction);
                self.addRequestToList(req);
            });
        };
    };

    var HistoryList = function(name){
        BaseList.call(this, name);
        this.list = [];

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

    var CollectionList = function(name){
        BaseList.call(this, name);
        this.groups = {};
        this.groupsKeys = [];
        this.ungrouped = [];

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

        this.loadListFromFile = function(data, getApiFunction){
            var self = this;

            if(data){
                self.clear();
                JSON.parse(data).map(function(elem) {
                    return hs.createHistoryRequest(elem.sentData, elem.receivedData, elem.parametrizedData, elem.path, elem.parametrizedPath, elem.method, elem.status, elem.name, elem.group, getApiFunction);
                }).forEach(function(elem) {
                    self.addRequestToList(elem);
                });
            }
        };
    };
    CollectionList.prototype = Object.create(BaseList.prototype);

    var nullFunction = function() {
        return null;
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

    };

    hs.createHistoryRequest = function(sentData, receivedData, parametrizedData, path, parametrizedPath, operation, status, name, group, getApiFunction){
        var api = getApiFunction ? getApiFunction(path) : nullFunction(),
            receivedDataProcessed = status === "success" ? receivedData : null;

        return new HistoryRequest(sentData, receivedDataProcessed, parametrizedData, status, path, parametrizedPath, operation, api, name, group);
    };

    hs.createEmptyHistoryList = function(name){
        return new HistoryList(name);
    };

    hs.createEmptyCollectionList = function(name){
        return new CollectionList(name);
    };

    hs.setNameAndGroup = function(name, group, elem) {
        if(name) {
            elem.name = name;
        }

        if(group) {
            elem.groupName = group;
        }
    };

    return hs;

  }]);

  yangui.register.factory('customFunctUnsetter', ['pathUtils','dataBackuper', function(pathUtils, dataBackuper){

    var cfu = {};

    cfu['YANGUI_CUST_MOUNT_POINTS'] = function(scope){
        dataBackuper.getToScope(['treeApis', 'treeRows', 'apis', 'node', 'selApi', 'selSubApi'], scope);

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