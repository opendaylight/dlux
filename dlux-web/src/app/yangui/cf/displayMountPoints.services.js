define(['app/yangui/yangui.module', 'common/yangutils/yangutils.services'], function(yangui, yangutils, $filter) {

    yangui.register.factory('displayMountPoints', function(mountPointsConnector, $timeout, yangUtils, $filter, apiBuilder) {

        var loadId = 0;

        var fnc = function($scope) {
            var path = $scope.selSubApi.buildApiRequestString(),
                getMpBasePathWOStorage = function(path) {
                    return path.split('/').slice(1).join('/');
                },
                getNodesMPData = function(data) {
                    var node = data.node[0];
                    return node && node['netconf-node-inventory:initial-capability'] ? node['netconf-node-inventory:initial-capability'].map(function(c) {
                        return c.slice(c.lastIndexOf(")") + 1);
                    }) : [];
                },
                findFirstSubApiIndex = function(subApis) {
                    var firstConfigSubApiIndex = 0;

                    subApis.some(function(sa, index) {
                        var condition = sa.storage === 'config';
                        if(condition) {
                            firstConfigSubApiIndex = index;
                        }
                        return condition;
                    });

                    return firstConfigSubApiIndex;
                },
                createMPStructure = function(mpNodes, mpAugments) {
                    if(mpNodes.length){
                        var mountPointStructure = [];

                        mpNodes.forEach(function(mpNode){
                            var ind = null;
                            var mpPresent = mountPointStructure.some(function(el,index){
                                var res = el.module === mpNode.module && el.revision === mpNode.moduleRevision;
                                if(res){
                                    ind = index;
                                }
                                return res;
                            });

                            if(mpPresent){
                                mountPointStructure[ind].children.push(mpNode);
                            }else{
                                mountPointStructure.push({module : mpNode.module, revision: mpNode.moduleRevision, expanded : false, children:[mpNode]});
                            }
                        });

                        var mpRootNode = mountPointsConnector.createMPRootNode(mpNodes),
                            mountPointApis = apiBuilder.processAllRootNodes([mpRootNode]),
                            //root node has isConfigStm undefined, we need to create root config SubApi by hand
                            //if we set the variable isConfigStm to true and then generate the subApis it will do it 
                            //incorrectly because, the variable is inherited to children and we would malform the data
                            //we need just to get operational root subApi...
                            rootApi = mountPointApis[0],
                            rootOperSubApi = rootApi.subApis.filter(function(sa) {
                                return sa.pathTemplateString === 'yang-ext:mount/' && sa.storage === 'operational';
                            })[0];

                        if(rootOperSubApi) {
                            var rootConfigSubApi =  rootOperSubApi.clone(), //clone it and... 
                                firstConfigSubApiIndex = findFirstSubApiIndex(rootApi.subApis); //we need to find first index of config subApi - because generating treeApis depends on order

                            //set storage to config
                            rootConfigSubApi.storage = 'config';
                            rootConfigSubApi.pathArray[0].name = 'config';

                            //and add it to rest of the apis
                            rootApi.subApis.splice(firstConfigSubApiIndex, 0, rootConfigSubApi);
                            rootConfigSubApi.parent = rootApi;
                        }

                        var mountPointTreeApis = yangUtils.generateApiTreeData(mountPointApis);

                        mountPointsConnector.updateMountPointApis($scope.selSubApi.pathArray, mountPointApis);
                        //$scope.initMp(mountPointStructure, mountPointTreeApis, mountPointApis, mpAugments, getMpBasePathWOStorage(path));
                        $scope.initMp(mountPointStructure, mountPointTreeApis, mountPointApis, mpAugments);
                        $scope.processingModulesSuccessCallback();
                    } else {
                        $scope.processingModulesErrorCallback();
                        $scope.mountPointStructure = [];
                        $timeout(function(){
                            alert('No mount points to display');
                            $scope.unsetCustomFunctionality();
                        },100);
                    }

                    $scope.mpSynchronizer.removeRequest(reqId);
                    
                    var pathItems = path.split('/');
                    $scope.treeName = pathItems[pathItems.length-1] + ' [  ' + $filter('translate')('YANGUI_MOUNT_POINT') + ' ] ';
                    
                    $scope.selCustFunctButts.push(mountPointsConnector.createCustomButton(
                        'YANGUI_CANCEL_MP', 
                        function(){
                            return $scope.selCustFunct.label === 'YANGUI_CUST_MOUNT_POINTS';
                        }, 
                        function(){
                            $scope.unsetCustomFunctionality();
                        })
                    );
                },
                reqId = $scope.mpSynchronizer.spawnRequest(loadId++);

            $scope.mountPointStructure = [];
            mountPointsConnector.discoverMountPoints(path, getNodesMPData, createMPStructure);
        };

        return {
            module: ['network-topology','opendaylight-inventory','network-topology','opendaylight-inventory'],
            revision: null,
            pathString: ['operational/network-topology:network-topology/topology/{topology-id}/node/{node-id}/','operational/opendaylight-inventory:nodes/node/{id}/'],
            label: 'YANGUI_CUST_MOUNT_POINTS',
//            view: './src/app/yangui/cf/cv/cvmountpoints.tpl.html',
            hideButtonOnSelect: true,
            getCallback: fnc
            
        };
    });
});