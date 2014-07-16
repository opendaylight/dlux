function consoleSfcPartConfig(module) {

  module.config(function ($stateProvider) {
    var access = routingConfig.accessLevels;

    $stateProvider.state('sfc.config', {
      url: '/config',
      access: access.public,
      templateUrl: 'sfc/sfc.config.tpl.html',
      controller: function ($scope, SfcConfigSvc, SfcFileReaderSvc, SfcRestangularSvc, SfcConfigExportSvc) {

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

            SfcConfigSvc.runConfig($scope.fileContent);
          } catch (e) {
            console.error(e.stack);
            alert(e.message);
          }
        };

        $scope.exportConfig = function () {
          try {
            SfcConfigExportSvc.exportConfig(function(dataObj){
              $scope.fileContent = $scope.fileContent + "\n" + angular.toJson(dataObj, true) + ";";
            });
          } catch (e) {
            console.error(e.stack);
            alert(e.message);
          }
        };

        $scope.applyBaseUrl = function() {
          try {
            SfcRestangularSvc.changeBaseUrl($scope.restangularBaseUrl);
            alert('url changed to ' + $scope.restangularBaseUrl);
          } catch (e) {
            alert(e.message);
            return;
          }
        };

      }
    });
  });

  module.directive("ngFileSelect", function () {

    return {
      link: function ($scope, el) {
        el.bind("change", function (e) {
          $scope.getOnFileSelect((e.srcElement || e.target).files[0]);
        });
      }
    };
  });
}