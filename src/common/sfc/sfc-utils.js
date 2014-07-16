angular.module('common.sfc.utils', [])

  .directive('ipAddress', function () {
    return {
      require: 'ngModel',
      link: function (scope, elm, attrs, ctrl) {
        ctrl.$parsers.unshift(function (viewValue) {
          if (inet_pton(viewValue)) {
            ctrl.$setValidity('ipAddress', true);
            return viewValue;
          }
          else {
            ctrl.$setValidity('ipAddress', false);
            return undefined;
          }
        });
      }
    };
  })

  //textarea from xeditable enhanced with save on blur event
  .directive('easyEditableTextarea', ['editableDirectiveFactory',
    function (editableDirectiveFactory) {
      return editableDirectiveFactory({
        directiveName: 'easyEditableTextarea',
        inputTpl: '<textarea></textarea>',
        addListeners: function () {
          var self = this;
          self.parent.addListeners.call(self);
          // submit textarea by ctrl+enter even with buttons
          if (self.single && self.buttons !== 'no') {
            self.autosubmit();
          }
        },
        autosubmit: function () {
          var self = this;
          self.inputEl.bind('keydown', function (e) {
            if ((e.ctrlKey || e.metaKey) && (e.keyCode === 13)) {
              self.scope.$apply(function () {
                self.scope.$form.$submit();
              });
            }
          });
          self.inputEl.bind('blur', function (e) {
            self.scope.$apply(function () {
              self.scope.$form.$submit();
            });
          });
        }
      });
    }])

  .factory('ServiceNodeCtrlFunc', function () {
    var svc = {};

    svc.createGraphData = function (nodeArray, sfs) {
      var graphData = [];
      _.each(nodeArray, function (element) {

        var nodeSfs = [];
        _.each(element['service-function'], function (sfName) {
          var sf = _.findWhere(sfs, {name: sfName});

          if (angular.isDefined(sf)) {
            nodeSfs.push(sf);
          }
        });

        var innerData = {
          "name": element['name'],
          "ip-mgmt-address": element['ip-mgmt-address'],
          "children": nodeSfs
        };

        graphData.push(innerData);
      });
      return graphData;
    };

    return svc;
  })

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

function inet_pton(a) {
  //  discuss at: http://phpjs.org/functions/inet_pton/
  // original by: Theriault
  //   example 1: inet_pton('::');
  //   returns 1: '\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0'
  //   example 2: inet_pton('127.0.0.1');
  //   returns 2: '\x7F\x00\x00\x01'

  // enhanced by: Andrej Kincel (akincel@cisco.com)
  //    features: IPv4 regex checks for valid range

  var r, m, x, i, j, f = String.fromCharCode;
  // IPv4
  m = a.match(/^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/);
  if (m) {
    m = m[0].split('.');
    m = f(m[0]) + f(m[1]) + f(m[2]) + f(m[3]);
    // Return if 4 bytes, otherwise false.
    return m.length === 4 ? m : false;
  }
  r = /^((?:[\da-f]{1,4}(?::|)){0,8})(::)?((?:[\da-f]{1,4}(?::|)){0,8})$/;
  // IPv6
  m = a.match(r);
  if (m) {
    // Translate each hexadecimal value.
    for (j = 1; j < 4; j++) {
      // Indice 2 is :: and if no length, continue.
      if (j === 2 || m[j].length === 0) {
        continue;
      }
      m[j] = m[j].split(':');
      for (i = 0; i < m[j].length; i++) {
        m[j][i] = parseInt(m[j][i], 16);
        // Would be NaN if it was blank, return false.
        if (isNaN(m[j][i])) {
          // Invalid IP.
          return false;
        }
        m[j][i] = f(m[j][i] >> 8) + f(m[j][i] & 0xFF);
      }
      m[j] = m[j].join('');
    }
    x = m[1].length + m[3].length;
    if (x === 16) {
      return m[1] + m[3];
    }
    else if (m[2] !== undefined) {
      if (x < 16 && m[2].length > 0) {
        return m[1] + (new Array(16 - x + 1))
          .join('\x00') + m[3];
      }
    }
  }
  // Invalid IP.
  return false;
}

