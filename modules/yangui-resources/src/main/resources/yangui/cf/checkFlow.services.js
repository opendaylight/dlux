define(['app/yangui/yangui.module', 'common/yangutils/yangutils.services'], function(yangui, yangutils) {

  yangui.register.factory('checkFlow', function($http, reqBuilder, apiConnector, yangUtils) {

      var fnc = function($scope) {
          var requestPath = $scope.selApi.basePath+'/'+$scope.selSubApi.buildApiRequestString().replace('config','operational'),
              requestData = {},
              identifiers,
              getPathIdentifierData = function(pathArray){
                  var data = '';
                      pathArray.forEach(function(item){
                      if( item.hasIdentifier() ) {
                          data += item.name + ': ' + item.identifierValue + '\n ';
                      }
                  });
                  return data;
              };

          $http({method: "GET", url: requestPath}).success(function(data) {
              if(data) {
                  identifiers = getPathIdentifierData($scope.selSubApi.pathArray);
                  alert('Flow: \n\n' + identifiers + '\n\n is in controller.');
              }
          }).error(function(data, status) {
              console.info('error sending request to',requestPath,'got',status,'data',data);
              identifiers = getPathIdentifierData($scope.selSubApi.pathArray);
              alert('Flow: \n\n' + identifiers + '\n\n isn\'t in controller.');
          });
      };

      return {
        module: 'opendaylight-inventory',
        revision: null,
        pathString: '/config/opendaylight-inventory:nodes/node/{id}/table/{id}/flow/{id}/',
        label: 'Verify operational flow', 
        getCallback: fnc
      };
    });
});