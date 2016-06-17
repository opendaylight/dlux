define([
    'app/yangman/yangman.module',
    'common/yangutils/constants',
], function (yangman, constants) {
    'use strict';

    yangman.register.service('MountPointsConnectorService', MountPointsConnectorService);

    MountPointsConnectorService.$inject = [
        'YangUiApisService', 'NodeWrapperService',
        'YangUtilsService', 'EventDispatcherService',
        'YinParserService', 'PathUtilsService', 'YangUtilsRestangularService',
    ];

    function MountPointsConnectorService(
        YangUiApisService, NodeWrapperService,
        YangUtilsService, EventDispatcherService,
        YinParserService, PathUtilsService, YangUtilsRestangularService){

        var mountPrefix = constants.MPPREFIX,
            service = {
                addPathElemsToPathArray: addPathElemsToPathArray,
                alterMpPath: alterMpPath,
                createCustomButton: createCustomButton,
                createMPRootNode: createMPRootNode,
                discoverMountPoints: discoverMountPoints,
                getMPModulesAPI: getMPModulesAPI,
                updateMountPointApis: updateMountPointApis,
            };

        return service;

        // TODO: add service's description
        function createMPRootNode(mpNodes) {
            var node = null,
                yangParser = YinParserService.yangParser;

            yangParser.setCurrentModuleObj(new YinParserService.Module('yang-ext', null, null));
            node = yangParser.createNewNode('mount', 'container', null, constants.NODE_UI_DISPLAY);
            NodeWrapperService.wrapAll(node);

            node.buildRequest = function (builder, req, module) {
                var added = false,
                    builderNodes = node.getChildren(null, null, constants.NODE_UI_DISPLAY);

                if (builderNodes.length) {
                    builderNodes.forEach(function (child) {
                        var childAdded = child.buildRequest(builder, req, module);
                    });
                }

                return added;
            };

            node.fill = function (name, data) {
                var nodesToFill = node.getChildren(null, null, constants.NODE_UI_DISPLAY);

                nodesToFill.forEach(function (child) {
                    var childFilled = child.fill(name, data);
                });
            };


            mpNodes.forEach(function (mp){
                node.addChild(mp);
            });

            return node;
        }

        // TODO: add service's description
        function addPathElemsToPathArray(pathElems, pathArray, index) {
            var updatedPath = pathArray.slice();

            pathElems.forEach(function (pe, offset) {
                // pe.disabled = true; //add disabled flag so user won't be able to change it in the UI
                updatedPath.splice(index + offset, 0, pe);
            });

            return updatedPath;
        }

        // TODO: add service's description
        function alterMpPath(path) {
            var pathParts = path.split('/'),
                restconfIndex = PathUtilsService.findIndexOfStrInPathStr(pathParts, 'restconf'),
                mpIndex = PathUtilsService.findIndexOfStrInPathStr(pathParts, mountPrefix),
                mpPath = path.slice(),
                mpPathParts = '';

            if (mpIndex !== -1){
                mpPathParts = pathParts.slice(mpIndex);

                var unshiftIndex = restconfIndex !== -1 ? restconfIndex + 1 : 0;

                mpPathParts.unshift(pathParts[unshiftIndex]);
                mpPath = mpPathParts.join('/');
            }

            return mpPath;
        }

        /**
         * function for adding path to mountpoint + yang:ext-mount to mount point patharray so the request string
         * will be built correctly
         * @param basePathArray
         * @param mpApis
         */
        function updateMountPointApis(basePathArray, mpApis) {
            var actualPath = basePathArray.slice(1); // we don't want to have config/operational storage in path
            // actualPath.push(PathUtilsService.createPathElement(mountPrefix, null, null, false));
            // we want to push yang-ext:mount to the path - not if we have yang-ext:mount rootNode

            mpApis.forEach(function (api) {
                api.subApis.forEach(function (subApi) {
                    subApi.pathArray = addPathElemsToPathArray(actualPath, subApi.pathArray, 1);
                });
            });
        }

        // TODO: add service's description
        function getMPModulesAPI(api) {
            var apiArray = api.split('/'),
                yangExtMountStr = mountPrefix;

            if (apiArray[apiArray.length - 1] !== yangExtMountStr) {
                apiArray.push(yangExtMountStr);
            }

            return apiArray.slice(1).join('/');
        }

        // TODO: add service's description
        function discoverMountPoints(api, getModulesCbk, callback) {
            var modulesCbk = getModulesCbk || angular.noop,
                mpNodes = [],
                baseApiPath = getMPModulesAPI(api),
                time = {
                    started: 0,
                    finished: 0,
                };

            YangUtilsRestangularService.setFullResponse(true);

            time.started = new Date().getMilliseconds();

            return YangUiApisService.getCustomModules(baseApiPath).then(
                function (response) {
                    time.finished = new Date().getMilliseconds();

                    var reqObj = {
                        status: response.status,
                        statusText: response.statusText,
                        time: (time.finished - time.started),
                    };

                    YangUtilsService.processModulesMP(response.data.modules, baseApiPath, function (result, augments) {
                        EventDispatcherService.dispatch(constants.EV_SRC_MAIN, 'Linking modules to Apis');
                        var allRootNodes = result.map(function (node) {
                            var copy = node.deepCopy(['augmentionGroups', 'augmentationId']);

                            NodeWrapperService.wrapAll(copy);
                            return copy;
                        });

                        var moduleNames = response.data.modules.module.map(function (m) {
                            return m.name;
                        });

                        allRootNodes.forEach(function (n) {
                            if (moduleNames.indexOf(n.module) > -1 && ['container', 'list'].indexOf(n.type) > -1) {
                                mpNodes.push(n);
                            }
                        });

                        console.info('loaded mount point nodes', mpNodes);
                        callback(mpNodes, augments, reqObj);
                        YangUtilsRestangularService.setFullResponse(false);
                    });
                },
                function (response) {
                    time.finished = new Date().getMilliseconds();

                    var reqObj = {
                        status: response.status,
                        statusText: response.statusText,
                        time: (time.finished - time.started),
                    };

                    callback([], [], reqObj);
                    YangUtilsRestangularService.setFullResponse(false);
                });
        }

        // TODO: add service's description
        function createCustomButton(label, show, click){
            return {
                label: label,
                show: show,
                onclick: click,
            };
        }
    }

});
