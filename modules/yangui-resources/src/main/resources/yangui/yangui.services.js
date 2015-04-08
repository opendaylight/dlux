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

});