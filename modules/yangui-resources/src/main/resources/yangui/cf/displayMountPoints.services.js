define(['app/yangui/yangui.module', 'common/yangutils/yangutils.services'], function(yangui, yangutils) {

    yangui.register.factory('displayMountPoints', function(mountPointsConnector, $timeout) {

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
                                var res = el.module === mpNode.module;
                                if(res){
                                    ind = index;
                                }
                                return res;
                            });

                            if(mpPresent){
                                mountPointsStructure[ind].children.push(mpNode);
                            }else{
                                mountPointsStructure.push({module : mpNode.module, expanded : false, children:[mpNode]});
                            }
                        });

                        $scope.mountPointsStructure = mountPointsStructure;
                    } else {
                        $scope.mountPointsStructure = [];
                        $timeout(function(){
                            alert('No mount points to display');
                        },100);
                    }
                };

                var path = mountPointsConnector.getMpPath($scope.selSubApi);
                mountPointsConnector.discoverMountPoints(path, getNodesMPData, $scope.allNodes, createMPStructure);
        };

        return {
            module: 'opendaylight-inventory',
            revision: null,
            pathString: '/config/opendaylight-inventory:nodes/node/{id}/',
            label: 'YANGUI_CUST_MOUNT_POINTS',
            getCallback: fnc,
            view: './src/app/yangui/cf/cv/cvmountpoints.tpl.html'
        };
    });
});