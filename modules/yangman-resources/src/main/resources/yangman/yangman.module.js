define([
    'angular',
    'app/routingConfig',
    'Restangular',
    'angular-translate',
    'angular-translate-loader-partial',
    'ngMaterial',
    'common/yangutils/yangutils.module',
], function (angular) {
    'use strict';

    var yangman = angular.module('app.yangman', [
        'ui.router.state',
        'app.core',
        'app.common.yangUtils',
        'restangular',
        'pascalprecht.translate',
        'ngMaterial',
    ]);

    yangman.config(YangManConfig);

    function YangManConfig($stateProvider, $compileProvider, $controllerProvider, $mdThemingProvider, $provide, $filterProvider,
                           $translateProvider, $translatePartialLoaderProvider,  NavHelperProvider) {

        $translatePartialLoaderProvider.addPart('app/yangman/assets/data/locale');

        yangman.register = {
            directive: $compileProvider.directive,
            controller: $controllerProvider.register,
            factory: $provide.factory,
            filter: $filterProvider.register,
            service: $provide.service,
            constant: $provide.constant,
        };

        $mdThemingProvider.theme('default')
            .primaryPalette('blue')
            .accentPalette('light-blue');
        NavHelperProvider.addControllerUrl('app/yangman/controllers/yangman.controller');
        NavHelperProvider.addToMenu('yangman', {
            link: '#/yangman/index',
            active: 'main.yangman',
            title: 'Yangman',
            icon: 'icon-rocket',
            page: {
                title: 'Yangman',
                description: 'Yangman',
            },
        });

        var access = routingConfig.accessLevels;
        $stateProvider.state('main.yangman', {
            url: 'yangman',
            abstract: true,
            views: {
                content: {
                    templateUrl: 'src/app/yangman/views/root.tpl.html',
                },
            },
        });

        $stateProvider.state('main.yangman.index', {
            url: '/index',
            access: access.admin,
            views: {
                '': {
                    controller: 'YangmanCtrl',
                    controllerAs: 'main',
                    templateUrl: 'src/app/yangman/views/index.tpl.html',
                },
            },
        });
    }

    return yangman;
});
