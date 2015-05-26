define(['app/yangui/yangui.module', 'common/yangutils/yangutils.services', 'common/sigmatopology/sigma.directive'], function(yangui, yangutils) {

    yangui.register.factory('displayTopology', function($http, reqBuilder, yangUtils) {

        var fnc = function($scope) {
            if($scope.node && 
                $scope.node.getChildren('list', 'topology').length > 0 && 
                $scope.node.getChildren('list', 'topology')[0].actElemStructure) {
                var dataList = [],
                    dataObj = {};

                $scope.node.getChildren('list', 'topology')[0].actElemStructure.listElemBuildRequest(reqBuilder, dataList);
                dataObj = {'network-topology': { 'topology': dataList }};

                var topoDataYang = yangUtils.transformTopologyData(dataObj),
                    topoData = {
                        nodes: [],
                        links: []
                    };

                topoData.nodes = topoDataYang.nodes.map(function(node){
                                    return {
                                        'id': 'n' + node.id,
                                        'label': node.label,
                                        'size': 3,
                                        'x': Math.random(),
                                        'y': Math.random(),
                                        'color': '#464646'
                                    };
                                });

                topoData.links = topoDataYang.links.map(function(link){
                                    return {
                                        id: 'e' + link.id,
                                        source: 'n' + link.from,
                                        target: 'n' + link.to,
                                        color: '#464646'
                                    };
                                });

                // console.info('topoData', topoData);
                $scope.topologyData = topoData;

            } else {
                alert('No topology data to display');
            }
        };

        return {
            module: ['network-topology'],
            revision: null,
            pathString: ['operational/network-topology:network-topology/'],
            label: 'YANGUI_CUST_TOPOLOGY',
            getCallback: fnc,
            view: './src/app/yangui/cf/cv/cvtopology.tpl.html'
        };
    });
});