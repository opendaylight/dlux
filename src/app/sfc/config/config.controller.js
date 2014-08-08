define(['app/sfc/sfc.module'], function (sfc) {

  sfc.register.controller('configCtrl', function ($scope, SfcConfigSvc, SfcFileReaderSvc, SfcRestangularSvc, SfcConfigExportSvc) {


    $scope.validationRevision = SfcConfigSvc.getValidationRevision();
    $scope.validateBefore = true;
    $scope.fileContent = "";
    $scope.restangularBaseUrl = SfcRestangularSvc.getCurrentBaseUrl();

    $scope.getOnFileSelect = function (file) {
      SfcFileReaderSvc.readAsText(file, $scope)
        .then(function (fileContent) {
          $scope.fileContent = fileContent;
        });
    };

    $scope.applyConfig = function () {
      try {

        if (_.isEmpty($scope.fileContent)) {
          alert('file is empty.');
          return;
        }

        SfcConfigSvc.runConfig($scope.fileContent, $scope.validateBefore);
      } catch (e) {
        console.error(e.stack);
        alert(e.message);
      }
    };

    $scope.exportConfig = function () {
      try {
        SfcConfigExportSvc.exportConfig(function (dataObj) {
          $scope.fileContent = $scope.fileContent + "\n" + angular.toJson(dataObj, true) + ";";
        });
      } catch (e) {
        console.error(e.stack);
        alert(e.message);
      }
    };

    $scope.applyBaseUrl = function () {
      try {
        SfcRestangularSvc.changeBaseUrl($scope.restangularBaseUrl);
        alert('url changed to ' + $scope.restangularBaseUrl);
      } catch (e) {
        alert(e.message);
        return;
      }
    };
  });

});