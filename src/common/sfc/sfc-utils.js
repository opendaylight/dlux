angular.module('common.sfc.utils', [])

  .factory('ModalDeleteSvc', function ($modal) {
    var svc = {};
    var modalInstance;

    svc.open = function (name, callback) {
      modalInstance = $modal.open({
        templateUrl: 'sfc/modal.delete.tpl.html',
        controller: ModalInstanceCtrl,
        resolve: {
          name: function () {
            return name;
          }
        }
      });

      modalInstance.result.then(function (result) {
        callback(result);
      }, function (reason) {
        callback(reason);
      });
    };

    var ModalInstanceCtrl = function ($modalInstance, $scope, name) {
      $scope.name = name;

      $scope.delete = function () {
        $modalInstance.close('delete');
      };

      $scope.dismiss = function () {
        $modalInstance.dismiss('cancel');
      };
    };

    return svc;
  })

  .factory('ModalSfnameSvc', function ($modal) {
    var svc = {};
    var modalInstance;

    svc.open = function (sfc, sf, callback) {
      modalInstance = $modal.open({
        templateUrl: 'sfc/servicechain.modal.sfname.tpl.html',
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


