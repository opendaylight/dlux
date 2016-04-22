define(['app/yangui/yangui.module', 'common/yangutils/constants'], function(yangui, constants) {

    yangui.register.service('MountPointsConnectorService', ['YangUiApisService', 'NodeWrapperService', 'YangUtilsService',
                                                        'EventDispatcherService', 'YinParserService', 'PathUtilsService',
        function(YangUiApisService, NodeWrapperService, YangUtilsService, EventDispatcherService, YinParserService,
                 PathUtilsService){

            var mountPrefix = constants.MPPREFIX,
                mp = {};

            mp.createMPRootNode = function(mpNodes) {
                var node = null,
                    yangParser = YinParserService.yangParser;

                yangParser.setCurrentModuleObj(new YinParserService.Module('yang-ext', null, null));
                node = yangParser.createNewNode('mount','container',null, constants.NODE_UI_DISPLAY);
                NodeWrapperService.wrapAll(node);

                node.buildRequest = function (builder, req, module) {
                    var added = false,
                        name = node.label,
                        builderNodes = node.getChildren(null, null, constants.NODE_UI_DISPLAY);

                    if (builderNodes.length) {
                        builderNodes.forEach(function (child) {
                            var childAdded = child.buildRequest(builder, req, module);
                        });
                    }

                    return added;
                };

                node.fill = function(name, data) {
                    var nodesToFill = node.getChildren(null, null, constants.NODE_UI_DISPLAY);

                    nodesToFill.forEach(function (child) {
                        var childFilled = child.fill(name, data);
                    });
                };


                mpNodes.forEach(function(mp){
                    node.addChild(mp);
                });

                return node;
            };

            var addPathElemsToPathArray = function(pathElems, pathArray, index) {
                var updatedPath = pathArray.slice();

                pathElems.forEach(function(pe, offset) {
                    // pe.disabled = true; //add disabled flag so user won't be able to change it in the UI
                    updatedPath.splice(index + offset, 0, pe);
                });

                return updatedPath;
            };

            mp.alterMpPath = function(path) {
                var pathParts = path.split('/'),
                    restconfIndex = PathUtilsService.findIndexOfStrInPathStr(pathParts, 'restconf'),
                    mpIndex = PathUtilsService.findIndexOfStrInPathStr(pathParts, mountPrefix),
                    mpPath = path.slice(),
                    mpPathParts = '';

                if(mpIndex !== -1){
                    mpPathParts = pathParts.slice(mpIndex);

                    var unshiftIndex = restconfIndex !== -1 ? restconfIndex + 1 : 0;

                    mpPathParts.unshift(pathParts[unshiftIndex]);
                    mpPath = mpPathParts.join('/');
                }

                return mpPath;
            };

            //function for adding path to mountpoint + yang:ext-mount to mount point patharray so the request string will be built correctly
            mp.updateMountPointApis = function(basePathArray, mpApis) {
                var actualPath = basePathArray.slice(1); //we don't want to have config/operational storage in path
                // actualPath.push(PathUtilsService.createPathElement(mountPrefix, null, null, false)); //we want to push yang-ext:mount to the path - not if we have yang-ext:mount rootNode

                mpApis.forEach(function(api) {
                    api.subApis.forEach(function(subApi) {
                        subApi.pathArray = addPathElemsToPathArray(actualPath, subApi.pathArray, 1);
                    });
                });
            };

            mp.getMPModulesAPI = function(api) {
                var apiArray = api.split('/'),
                    yangExtMountStr = mountPrefix;

                if(apiArray[apiArray.length - 1] !== yangExtMountStr) {
                    apiArray.push(yangExtMountStr);
                }

                return apiArray.slice(1).join('/');
            };

            mp.discoverMountPoints = function(api, getModulesCbk, callback) {
                var modulesCbk = getModulesCbk || function() { return []; },
                    mpNodes = [],
                    baseApiPath = mp.getMPModulesAPI(api);

                YangUiApisService.getCustomModules(baseApiPath).then(
                    function (data) {
                        YangUtilsService.processModulesMP(data.modules, baseApiPath, function (result, augments) {
                            EventDispatcherService.dispatch(constants.EV_SRC_MAIN, 'Linking modules to Apis');
                            var allRootNodes = result.map(function (node) {
                                var copy = node.deepCopy(['augmentionGroups', 'augmentationId']);

                                NodeWrapperService.wrapAll(copy);
                                return copy;
                            });

                            var moduleNames = data.modules.module.map(function(m) {
                                return m.name;
                            });

                            allRootNodes.forEach(function(n) {
                                if(moduleNames.indexOf(n.module) > -1 && ['container','list'].indexOf(n.type) > -1) {
                                    mpNodes.push(n);
                                }
                            });

                            console.info('loaded mount point nodes', mpNodes);
                            callback(mpNodes, augments);
                        });
                    }, function (result) {
                        console.error('Error getting Mount point data:', result);
                        callback([]);
                    }
                );
            };

            mp.createCustomButton = function(label, show, click){
                return {
                    label: label,
                    show: show,
                    onclick: click
                };
            };


            return mp;
        }
    ]);

});