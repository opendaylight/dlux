define(['app/yangui/yangui.module', 'common/yangutils/yangutils.services'], function(yangui, yangutils) {

  yangui.register.factory('checkFlow', function($http, reqBuilder, yangUtils, YangUtilsRestangular) {

      var fnc = function($scope) {
          var requestPath = $scope.selSubApi.buildApiRequestString().replace('config','operational'),
              requestData = {},
              getPathIdentifierData = function(pathArray){
                  var data = '';
                      pathArray.forEach(function(item){
                      if( item.hasIdentifier() ) {
                          data += item.name + ': ' + item.identifierValue + '\n ';
                      }
                  });
                  return data;
              },
              identifiers = getPathIdentifierData($scope.selSubApi.pathArray);

          YangUtilsRestangular.one('restconf').customGET(requestPath).then(
              function (data) {
                  alert('Flow: \n\n' + identifiers + '\n\n is in controller.');
              }, function (result) {
                  alert('Flow: \n\n' + identifiers + '\n\n isn\'t in controller.');
              }
          );
      };

      return {
        module: ['opendaylight-inventory'],
        revision: null,
        pathString: ['config/opendaylight-inventory:nodes/node/{id}/flow-node-inventory:table/{id}/flow/{id}/'],
        label: 'Verify operational flow', 
        getCallback: fnc
      };
    });
});