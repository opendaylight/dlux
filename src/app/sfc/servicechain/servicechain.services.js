define(['app/sfc/sfc.module'], function (sfc) {

  sfc.register.factory('ModalSfpInstantiateSvc', function ($modal) {
    var svc = {};
    var modalInstance;

    svc.open = function (sfc, callback) {
      modalInstance = $modal.open({
        templateUrl: 'src/app/sfc/servicechain/servicechain.modal.instantiate.tpl.html',
        controller: ModalInstanceCtrl,
        resolve: {
          sfc: function () {
            return sfc;
          }
        }
      });

      modalInstance.result.then(function (result) {
        callback(result);
      }, function (reason) {
        callback(reason);
      });
    };

    var ModalInstanceCtrl = function ($scope, $modalInstance, sfc) {

      $scope.sfc = sfc;
      $scope.data = {};
      $scope.data.name = sfc.name + "-";

      $scope.save = function () {
        var sfp = {};
        sfp.name = this.data.name;
        sfp['service-chain-name'] = sfc.name;
        $modalInstance.close(sfp);
      };

      $scope.dismiss = function () {
        $modalInstance.dismiss('cancel');
      };
    };

    return svc;
  });

  sfc.register.factory('ModalSfNameSvc', function ($modal) {
    var svc = {};
    var modalInstance;

    svc.open = function (sfc, sf, callback) {
      modalInstance = $modal.open({
        templateUrl: 'src/app/sfc/servicechain/servicechain.modal.sfname.tpl.html',
        controller: ModalInstanceCtrl,
        resolve: {
          sfc: function () {
            return sfc;
          },
          sf: function () {
            return sf;
          }
        }
      });

      modalInstance.result.then(function (result) {
        callback(result);
      }, function (reason) {
        callback(reason);
      });
    };

    var ModalInstanceCtrl = function ($scope, $modalInstance, sfc, sf) {

      $scope.sfc = sfc;
      $scope.sf = sf;

      $scope.save = function () {
        var newSfName;
        if (this.data.prefix) {
          newSfName = (this.data.prefix + "-");
        }
        newSfName = newSfName.concat($scope.sf.type);
        if (this.data.sufix) {
          newSfName = newSfName.concat("-" + this.data.sufix);
        }

        $scope.sf.name = newSfName;
        $modalInstance.close(sf);
      };

      $scope.dismiss = function () {
        $modalInstance.dismiss('cancel');
      };
    };

    return svc;
  });

});