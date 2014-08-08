var controllers = [
  'app/sfc/sfc.controller',
  'app/sfc/servicenode/servicenode.controller',
  'app/sfc/serviceforwarder/serviceforwarder.controller',
  'app/sfc/servicefunction/servicefunction.controller',
  'app/sfc/servicechain/servicechain.controller',
  'app/sfc/servicepath/servicepath.controller',
  'app/sfc/config/config.controller'];
var services = [
  'app/core/core.services',
  'app/sfc/sfc.services',
  'app/sfc/utils/modal.services',
  'app/sfc/servicechain/servicechain.services',
  'app/sfc/servicenode/servicenode.services',
  'app/sfc/config/config.services',
  'app/sfc/config/schemas.services'];
var directives = [
  'app/sfc/sfc.directives',
  'app/sfc/servicenode/servicenode.directives',
  'app/sfc/config/config.directives'
];

define(['app/sfc/sfc.module'].concat(services).concat(directives).concat(controllers), function (sfc) {

//  sfc.factory("sfcLoaderSvc", function ($q) {
//    console.log("sfcLoaderSvc");
//
//    var loaded = $q.defer();
//
//    require([].concat(services).concat(directives).concat(controllers), function () {
//      console.log("sfcLoaderSvc completed");
//      loaded.resolve(true);
//    });
//
//    return loaded.promise;
//  });

  sfc.config(function ($stateProvider, $compileProvider, $controllerProvider, $provide, NavHelperProvider, $translateProvider) {
    sfc.register = {
      controller: $controllerProvider.register,
      directive: $compileProvider.directive,
      factory: $provide.factory,
      service: $provide.service
    };

    $translateProvider.useStaticFilesLoader({
      prefix: 'assets/data/locale-',
      suffix: '.json'
    });

    NavHelperProvider.addControllerUrl('app/sfc/sfc.controller');
    NavHelperProvider.addToMenu('sfc', {
      "link": "#/sfc/servicenode",
      "active": "main.sfc",
      "title": "SFC",
      "icon": "icon-sitemap",
      "page": {
        "title": "SFC",
        "description": "SFC"
      }
    });

    var access = routingConfig.accessLevels;
    $stateProvider.state('main.sfc', {
      url: 'sfc',
      abstract: true,
      views: {
        'content': {
          templateUrl: 'src/app/sfc/root.tpl.html',
          controller: 'rootSfcCtrl'
        }
      },
      resolve: {
        translateLoaded: function ($rootScope) {
          return $rootScope.translateLoadingEnd.promise;
        }
//        loaded: "sfcLoaderSvc"
      }
    });

    $stateProvider.state('main.sfc.servicenode', {
      url: '/servicenode',
      access: access.public,
      views: {
        'sfc': {
          templateUrl: 'src/app/sfc/servicenode/servicenode.tpl.html',
          controller: 'serviceNodeCtrl'
        }
      }
    });

    $stateProvider.state('main.sfc.servicenode-create', {
      url: '/servicenode-create',
      access: access.public,
      views: {
        'sfc': {
          templateUrl: 'src/app/sfc/servicenode/servicenode.create.tpl.html',
          controller: 'serviceNodeCreateCtrl'
        }
      }
    });

    $stateProvider.state('main.sfc.servicenode-edit', {
      url: '/servicenode-edit:snName',
      access: access.public,
      views: {
        'sfc': {
          templateUrl: 'src/app/sfc/servicenode/servicenode.edit.tpl.html',
          controller: 'serviceNodeEditCtrl'
        }
      }
    });

    $stateProvider.state('main.sfc.serviceforwarder', {
      url: '/serviceforwarder',
      access: access.public,
      views: {
        'sfc': {
          templateUrl: 'src/app/sfc/serviceforwarder/serviceforwarder.tpl.html',
          controller: 'serviceForwarderCtrl'
        }
      }
    });

    $stateProvider.state('main.sfc.serviceforwarder-create', {
      url: '/serviceforwarder-create',
      access: access.public,
      views: {
        'sfc': {
          templateUrl: 'src/app/sfc/serviceforwarder/serviceforwarder.create.tpl.html',
          controller: 'serviceForwarderCreateCtrl'
        }
      }
    });

    $stateProvider.state('main.sfc.servicefunction', {
      url: '/servicefunction',
      access: access.public,
      views: {
        'sfc': {
          templateUrl: 'src/app/sfc/servicefunction/servicefunction.tpl.html',
          controller: 'serviceFunctionCtrl'
        }
      }
    });

    $stateProvider.state('main.sfc.servicefunction-create', {
      url: '/servicefunction-create',
      access: access.public,
      'views': {
        'sfc': {
          templateUrl: 'src/app/sfc/servicefunction/servicefunction.create.tpl.html',
          controller: 'serviceFunctionCreateCtrl'
        }
      }
    });

    $stateProvider.state('main.sfc.servicechain', {
      url: '/servicechain',
      access: access.public,
      views: {
        'sfc': {
          templateUrl: 'src/app/sfc/servicechain/servicechain.tpl.html',
          controller: 'serviceChainCtrl'
        }
      }
    });

    $stateProvider.state('main.sfc.servicechain-create', {
      url: '/servicechain-create',
      access: access.public,
      views: {
        'sfc': {
          templateUrl: 'src/app/sfc/servicechain/servicechain.create.tpl.html',
          controller: 'serviceChainCreateCtrl'
        }
      }
    });

    $stateProvider.state('main.sfc.servicepath', {
      url: '/servicepath',
      access: access.public,
      views: {
        'sfc': {
          templateUrl: 'src/app/sfc/servicepath/servicepath.tpl.html',
          controller: 'servicePathCtrl'
        }
      }
    });

    $stateProvider.state('main.sfc.config', {
      url: '/config',
      access: access.public,
      views: {
        'sfc': {
          templateUrl: 'src/app/sfc/config/config.tpl.html',
          controller: 'configCtrl'
        }
      }
    });
  });

  return sfc;
});