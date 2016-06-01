var services = [
    'common/yangutils/services/node-utils.services',
    'common/yangutils/services/yang-utils-restangular.services',
    'common/yangutils/services/yang-utils.services',
    'common/yangutils/services/yin-parser.services',
    'common/yangutils/services/sync.services',
    'common/yangutils/services/path-utils.services',
    'common/yangutils/services/array-utils.services',
    'common/yangutils/services/yang-ui-apis.services',
    'common/yangutils/services/node-wrapper.services',
    'common/yangutils/services/request-builder.services',
    'common/yangutils/services/restrictions.services',
    'common/yangutils/services/type-wrapper.services',
    'common/yangutils/services/list-filtering.services',
    'common/yangutils/services/filter-node-wrapper.services',
    'common/yangutils/services/event-dispatcher.services',
    'common/yangutils/services/module-connector.services',
    'common/yangutils/services/api-builder.services',
    'common/yangutils/services/data-backup.services',
    'common/yangutils/services/parsing-json.services',
    'common/yangutils/services/custom-funct.services',
];

var constant = [
    'common/yangutils/constants',
];

define(['angular'].concat(services).concat(constant),
    function (angular, NodeUtilsService, YangUtilsRestangularService, YangUtilsService, YinParserService, SyncService,
              PathUtilsService, ArrayUtilsService, YangUiApisService, NodeWrapperService, RequestBuilderService,
              RestrictionsService, TypeWrapperService, ListFilteringService, FilterNodeWrapperService,
              EventDispatcherService, ModuleConnectorService, ApiBuilderService, DataBackupService, ParsingJsonService,
              CustomFuncService, constants) {

        'use strict';

        angular.module('app.common.yangUtils', [])
            .service('NodeUtilsService', NodeUtilsService)
            .service('YangUtilsRestangularService', YangUtilsRestangularService)
            .service('YangUtilsService', YangUtilsService)
            .service('YinParserService', YinParserService)
            .service('SyncService', SyncService)
            .service('PathUtilsService', PathUtilsService)
            .service('ArrayUtilsService', ArrayUtilsService)
            .service('YangUiApisService', YangUiApisService)
            .service('NodeWrapperService', NodeWrapperService)
            .service('RequestBuilderService', RequestBuilderService)
            .service('RestrictionsService', RestrictionsService)
            .service('TypeWrapperService', TypeWrapperService)
            .service('ListFilteringService', ListFilteringService)
            .service('FilterNodeWrapperService', FilterNodeWrapperService)
            .service('EventDispatcherService', EventDispatcherService)
            .service('ModuleConnectorService', ModuleConnectorService)
            .service('ApiBuilderService', ApiBuilderService)
            .service('DataBackupService', DataBackupService)
            .service('ParsingJsonService', ParsingJsonService)
            .service('CustomFuncService', CustomFuncService)

            .constant('constants', constants);

    });
