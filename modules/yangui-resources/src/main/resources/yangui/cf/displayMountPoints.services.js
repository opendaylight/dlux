define(['app/yangui/yangui.module', 'common/yangutils/yangutils.services'], function(yangui, yangutils) {

    yangui.register.factory('displayMountPoints', function(mountPointsConnector, $timeout) {

        var loadId = 0;

        var fnc = function($scope) {
            var getNodesMPData = function(data) {
                    var node = data.node[0];
                    return node && node['netconf-node-inventory:initial-capability'] ? node['netconf-node-inventory:initial-capability'].map(function(c) {
                        return c.slice(c.lastIndexOf(")") + 1);
                    }) : [];
                },
                createMPStructure = function(mpNodes) {
                    if(mpNodes.length){
                        var mountPointsStructure = [];

                        mpNodes.forEach(function(mpNode){
                            var ind = null;
                            var mpPresent = mountPointsStructure.some(function(el,index){
                                var res = el.module === mpNode.module && el.revision === mpNode.moduleRevision;
                                if(res){
                                    ind = index;
                                }
                                return res;
                            });

                            if(mpPresent){
                                mountPointsStructure[ind].children.push(mpNode);
                            }else{
                                mountPointsStructure.push({module : mpNode.module, revision: mpNode.moduleRevision, expanded : false, children:[mpNode]});
                            }
                        });

                        $scope.mountPointsStructure = mountPointsStructure;
                        $scope.initMp();
                        $scope.processingModulesSuccessCallback();
                    } else {
                        $scope.processingModulesErrorCallback();
                        $scope.mountPointsStructure = [];
                        $timeout(function(){
                            alert('No mount points to display');
                            $scope.unsetCustomFunctionality();
                        },100);
                    }

                    $scope.mpSynchronizer.removeRequest(reqId);
                },
                reqId = $scope.mpSynchronizer.spawnRequest(loadId++);

            $scope.mountPointsStructure = [];
            var path = $scope.selSubApi.buildApiRequestString();
            mountPointsConnector.discoverMountPoints(path, getNodesMPData, createMPStructure);
        };

        return {
            module: ['network-topology','opendaylight-inventory','network-topology','opendaylight-inventory'],
            revision: null,
            pathString: ['config/network-topology:network-topology/topology/{topology-id}/node/{node-id}/','config/opendaylight-inventory:nodes/node/{id}/',
                         'operational/network-topology:network-topology/topology/{topology-id}/node/{node-id}/','operational/opendaylight-inventory:nodes/node/{id}/'],
            label: 'YANGUI_CUST_MOUNT_POINTS',
            getCallback: fnc,
            view: './src/app/yangui/cf/cv/cvmountpoints.tpl.html'
        };
    });
});