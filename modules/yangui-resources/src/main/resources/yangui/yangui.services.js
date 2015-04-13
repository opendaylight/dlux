define(['app/yangui/yangui.module'], function(yangui) {

  yangui.register.factory('YangConfigRestangular', function(Restangular, ENV) {
    return Restangular.withConfig(function(RestangularConfig) {
      RestangularConfig.setBaseUrl(ENV.getBaseURL("MD_SAL"));
    });
  });

  yangui.register.factory('HistoryServices',['pathUtils', function(pathUtils){

    var hs = {};

    hs.checkPathAvailability = function(data, treeApis, treeRows){
      data.forEach(function(item){
        item.availability = pathUtils.searchNodeByPath(item.path, treeApis, treeRows) !== null ? true : false;
      });
    };

    return hs;

  }]);

  yangui.register.factory('customFunctUnsetter',[function(pathUtils){

    var cfu = {};

    cfu['YANGUI_CUST_MOUNT_POINTS'] = function(scope){
        scope.refreshSelSubApiPathArray(scope.selSubApi);
        scope.setApiNode(scope.apis.indexOf(scope.selApi),scope.selApi.subApis.indexOf(scope.selSubApi), true);
        scope.mountModule = '';
        scope.selSubApi.operations = scope.mountBckOperations;
        scope.mpDatastore = null;
    };

    cfu.unset = function(custFunct, scope) {
        if(cfu.hasOwnProperty(custFunct.label)) {
            cfu[custFunct.label](scope);
        }
    };

    return cfu;

  }]);


});