define(['app/sfc/sfc.module'], function (sfc) {

  sfc.register.controller('serviceForwarderCtrl', function ($scope, $state, ServiceForwarderSvc, ModalDeleteSvc) {

    $scope.sffInterfaceToString = function(sffInterfaces) {
      var string = "";
      _.each(sffInterfaces, function(interf){
        string = string.concat(interf['sff-interface'] + ", ");
      });
      return string.slice(0, -2);
    };

    ServiceForwarderSvc.getArray(function (data) {
      $scope.sffs = data;
    });

    $scope.deleteSFF = function deleteSFF(sffName, index) {
      ModalDeleteSvc.open(sffName, function (result) {
        if (result == 'delete') {
          //delete the row
          ServiceForwarderSvc.deleteItem({"name": sffName}, function () {
            $scope.sffs.splice(index, 1);
          });
        }
      });
    };

    $scope.editSFF = function editSF(sffName) {
      $state.transitionTo('main.sfc.serviceforwarder-edit', {sffName: sffName}, { location: true, inherit: true, relative: $state.$current, notify: true });
    };
  });

  sfc.register.controller('serviceForwarderCreateCtrl', function ($scope, $state, ServiceNodeSvc, ServiceForwarderSvc) {

    ServiceNodeSvc.getArray(function (data) {
      $scope.sns = data;
    });

    $scope.selectOptions = {
      'multiple': true,
      'simple_tags': true,
      'tags': function(){
        var interfacesArray = [];
        _.each($scope.data['sff-data-plane-locator'], function (locator){
          if(angular.isDefined(locator['name'])){
            interfacesArray.push(locator['name']);
          }
        });
        return interfacesArray;
      }
    };

    $scope.data = {
      "sff-data-plane-locator": [
        {
          "data-plane-locator": {}
        }
      ],
      "service-function-dictionary": [
        {
          "sff-sf-data-plane-locator": {},
          "sff-interfaces": []
        }
      ]
    };

    $scope.addLocator = function () {
      $scope.data['sff-data-plane-locator'].push({"data-plane-locator": {}});
    };

    $scope.removeLocator = function (index) {
      $scope.data['sff-data-plane-locator'].splice(index, 1);
    };

    $scope.addFunction = function () {
      $scope.data['service-function-dictionary'].push(
        {
          "sff-sf-data-plane-locator": {},
          "sff-interfaces": []
        });
    };

    $scope.removeFunction = function (index) {
      $scope.data['service-function-dictionary'].splice(index, 1);
    };

    $scope.sffInterfaceToObjectArray = function(functionDictionaryList) {
      _.each(functionDictionaryList, function(dictionary) {
        var sffInterfaces = [];
        _.each(dictionary['sff-interfaces'], function(interf) {
          sffInterfaces.push({'sff-interface': interf});
        });
        dictionary['sff-interfaces'] = sffInterfaces;
      });
    };

    $scope.submit = function () {
      //reformat sff-interfaces string array to object array
      $scope.sffInterfaceToObjectArray($scope.data['service-function-dictionary']);

      ServiceForwarderSvc.putItem($scope.data, function () {
        $state.transitionTo('main.sfc.serviceforwarder', null, { location: true, inherit: true, relative: $state.$current, notify: true });
      });
    };
  });

  sfc.register.controller('serviceForwarderEditCtrl', function ($scope, $state, $stateParams, ServiceNodeSvc, ServiceForwarderSvc) {

    $scope.data = {
      "sff-data-plane-locator": [
        {
          "data-plane-locator": {}
        }
      ],
      "service-function-dictionary": [
        {
          "sff-sf-data-plane-locator": {},
          "sff-interfaces": []
        }
      ]
    };

    ServiceNodeSvc.getArray(function (data) {
      $scope.sns = data;

      ServiceForwarderSvc.getItem($stateParams.sffName, function (item){
        $scope.data = item;
        removeNonExistentSN($scope.data, $scope.sns);
      });
    });

    $scope.selectOptions = {
      'multiple': true,
      'simple_tags': true,
      'tags': function(){
        var interfacesArray = [];
        _.each($scope.data['sff-data-plane-locator'], function (locator){
          if(angular.isDefined(locator['name'])){
            interfacesArray.push(locator['name']);
          }
        });
        return interfacesArray;
      }
    };

    $scope.addLocator = function () {
      $scope.data['sff-data-plane-locator'].push({"data-plane-locator": {}});
    };

    $scope.removeLocator = function (index) {
      $scope.data['sff-data-plane-locator'].splice(index, 1);
    };

    $scope.addFunction = function () {
      $scope.data['service-function-dictionary'].push(
        {
          "sff-sf-data-plane-locator": {},
          "sff-interfaces": []
        });
    };

    $scope.removeFunction = function (index) {
      $scope.data['service-function-dictionary'].splice(index, 1);
    };

    $scope.sffInterfaceToObjectArray = function(functionDictionaryList) {
      _.each(functionDictionaryList, function(dictionary) {
        var sffInterfaces = [];
        _.each(dictionary['sff-interfaces'], function(interf) {
          sffInterfaces.push({'sff-interface': interf});
        });
        dictionary['sff-interfaces'] = sffInterfaces;
      });
    };

    $scope.submit = function () {
      //reformat sff-interfaces string array to object array
      $scope.sffInterfaceToObjectArray($scope.data['service-function-dictionary']);

      ServiceForwarderSvc.putItem($scope.data, function () {
        $state.transitionTo('main.sfc.serviceforwarder', null, { location: true, inherit: true, relative: $state.$current, notify: true });
      });
    };
  });

  function removeNonExistentSN(sff, sns){
    if (angular.isDefined(sff['service-node'])){
      var snExists = _.findWhere(sns, {'name': sff['service-node']});

      if(angular.isUndefined(snExists)){
        delete sff['service-node'];
      }
    }
  }

});