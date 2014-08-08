define(['app/sfc/sfc.module'], function (sfc) {

  sfc.controller('rootSfcCtrl', function ($rootScope) {
    $rootScope['section_logo'] = 'logo_sfc';

    $rootScope.sfcState = {PERSISTED: "persisted", NEW: "new", EDITED: "edited"};
    if (angular.isDefined(Object.freeze)) {
      Object.freeze($rootScope.sfcState);
    }

    $rootScope.sfpState = {PERSISTED: "persisted", NEW: "new", EDITED: "edited"};
    if (angular.isDefined(Object.freeze)) {
      Object.freeze($rootScope.sfpState);
    }

    $rootScope.sfcs = [];
    $rootScope.sfps = [];
    $rootScope.sfpEffectMe = {};
    $rootScope.servicefunction =
    {
      type: ["napt44", "dpi", "firewall"]
    };
    $rootScope.dataplane_locator =
    {
      type: ["ip:port"]
    };
  });
});