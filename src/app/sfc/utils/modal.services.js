define(['app/sfc/sfc.module'], function (sfc) {

  sfc.register.factory('ModalInfoSvc', function ($modal) {
    var svc = {};
    var modalInstance;

    svc.open = function (info) {
      modalInstance = $modal.open({
        templateUrl: 'src/app/sfc/utils/modal.info.tpl.html',
        controller: ModalInstanceCtrl,
        resolve: {
          info: function () {
            return info;
          }
        }
      });
    };

    var ModalInstanceCtrl = function ($modalInstance, $scope, info) {
      $scope.info = info;

      $scope.dismiss = function () {
        $modalInstance.dismiss('ok');
      };
    };

    return svc;
  });

  sfc.register.factory('ModalErrorSvc', function ($modal) {
    var svc = {};
    var modalInstance;

    svc.open = function (error) {
      modalInstance = $modal.open({
        templateUrl: 'src/app/sfc/utils/modal.error.tpl.html',
        controller: ModalInstanceCtrl,
        resolve: {
          error: function () {
            return error;
          }
        }
      });
    };

    var ModalInstanceCtrl = function ($modalInstance, $scope, error) {
      $scope.error = error;

      $scope.isRpcError = function() {
        return (!!error.rpcError);
      };

      $scope.dismiss = function () {
        $modalInstance.dismiss('close');
      };
    };

    return svc;
  });

  sfc.register.factory('ModalDeleteSvc', function ($modal) {
    var svc = {};
    var modalInstance;

    svc.open = function (name, callback) {
      modalInstance = $modal.open({
        templateUrl: 'src/app/sfc/utils/modal.delete.tpl.html',
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
  });

});