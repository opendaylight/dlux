define([
    'app/yangman/services/mount-points-connector.services',
], function (yangman) {
    'use strict';

    angular.module('app.yangman').service('ymDisplayMountPoints', DisplayMountPoints);

    DisplayMountPoints.$inject =
        ['MountPointsConnectorService', '$timeout', 'YangUtilsService', '$filter', 'ApiBuilderService', 'constants'];

    function DisplayMountPoints(
        MountPointsConnectorService, $timeout, YangUtilsService, $filter, ApiBuilderService, constants) {
        var loadId = 0;

        return {
            module: ['network-topology', 'opendaylight-inventory', 'network-topology', 'opendaylight-inventory'],
            revision: null,
            pathString: [
                'operational/network-topology:network-topology/topology/{topology-id}/node/{node-id}/',
                'operational/opendaylight-inventory:nodes/node/{id}/',
            ],
            label: 'YANGMAN_CUST_MOUNT_POINTS',
            hideButtonOnSelect: true,
            getCallback: displayMountPointsCallback,
        };

        function displayMountPointsCallback(args) {
            var controller = args.controller,
                scope = args.scope,
                path = scope.selectedSubApi.buildApiRequestString();

            scope.rootBroadcast('YANGMAN_SET_LOADING_BOX', true, function () {
                scope.setLeftPanel(0);
                $timeout(function () {
                    MountPointsConnectorService.discoverMountPoints(path, getNodesMPData, createMPStructure);
                }, 1000);
            });

            /**
             * Get Mount point data from received raw data
             * @param data
             * @returns {*}
             */
            function getNodesMPData(data) {
                var node = data.node[0];
                return node && node['netconf-node-inventory:initial-capability'] ?
                    node['netconf-node-inventory:initial-capability'].map(function (c) {
                        return c.slice(c.lastIndexOf(')') + 1);
                    }) : [];
            }

            // TODO :: description
            function findFirstSubApiIndex(subApis) {
                var firstConfigSubApiIndex = 0;

                subApis.some(function (sa, index) {
                    var condition = sa.storage === constants.DATA_STORE_CONFIG;
                    if (condition) {
                        firstConfigSubApiIndex = index;
                    }
                    return condition;
                });

                return firstConfigSubApiIndex;
            }

            /**
             * Create base params for setup mount points in app
             * @param mpNodes
             * @param mpAugments
             * @param reqObj
             */
            function createMPStructure(mpNodes, mpAugments, reqObj) {
                if (mpNodes.length){
                    var mpRootNode = MountPointsConnectorService.createMPRootNode(mpNodes),
                        mountPointApis = ApiBuilderService.processAllRootNodes([mpRootNode]),
                    // root node has isConfigStm undefined, we need to create root config SubApi by hand
                    // if we set the variable isConfigStm to true and then generate the subApis it will do it
                    // incorrectly because, the variable is inherited to children and we would malform the data
                    // we need just to get operational root subApi...
                        rootApi = mountPointApis[0],
                        rootOperSubApi = rootApi.subApis.filter(function (sa) {
                            return sa.pathTemplateString === 'yang-ext:mount/' && sa.storage === constants.DATA_STORE_OPERATIONAL;
                        })[0];

                    if (rootOperSubApi) {
                        var rootConfigSubApi =  rootOperSubApi.clone(), // clone it and...
                            firstConfigSubApiIndex = findFirstSubApiIndex(rootApi.subApis);
                        // we need to find first index of config
                        // subApi - because generating treeApis depends on order

                        // set storage to config
                        rootConfigSubApi.storage = constants.DATA_STORE_CONFIG;
                        rootConfigSubApi.pathArray[0].name = constants.DATA_STORE_CONFIG;

                        // and add it to rest of the apis
                        rootApi.subApis.splice(firstConfigSubApiIndex, 0, rootConfigSubApi);
                        rootConfigSubApi.parent = rootApi;
                    }

                    var mountPointTreeApis = YangUtilsService.generateApiTreeData(mountPointApis),
                        pathItems = path.split('/');

                    MountPointsConnectorService.updateMountPointApis(scope.selectedSubApi.pathArray, mountPointApis);

                    // call initialization after necessary things are loaded
                    controller.initMountPoint(mountPointTreeApis, mountPointApis, mpAugments, reqObj);

                    scope.rootBroadcast(
                        'YANGMAN_SET_MODULE_LIST_TITLE',
                        pathItems[pathItems.length - 1] + ' [ ' + $filter('translate')('YANGMAN_MOUNT_POINT') + ' ]'
                    );

                    controller.selectedPluginsButtons.push(
                        MountPointsConnectorService.createCustomButton('YANGMAN_CANCEL_MP', function (){
                            return controller.selectedPlugin.label === 'YANGMAN_CUST_MOUNT_POINTS';
                        },
                        function (){
                            controller.unsetPluginFunctionality();
                        })
                    );

                } else {
                    $timeout(function (){
                        controller.selectedPlugin = null;
                        scope.rootBroadcast('YANGMAN_SET_LOADING_BOX', false);
                        scope.rootBroadcast('YANGMAN_SHOW_TOAST', 'YANGMAN_NO_MOUNT_POINT');
                    }, 100);
                }
            }

        }
    }
});
