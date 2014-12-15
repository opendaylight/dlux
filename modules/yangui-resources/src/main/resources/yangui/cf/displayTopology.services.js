define(['app/yangui/yangui.module', 'common/yangutils/yangutils.services'], function(yangui, yangutils) {

    yangui.register.factory('displayTopology', function($http, reqBuilder, apiConnector, yangUtils) {

        var fnc = function($scope) {
            if($scope.node && 
                $scope.node.getChildren('list', 'topology').length > 0 && 
                $scope.node.getChildren('list', 'topology')[0].actElemStructure) {
                var dataList = [],
                    dataObj = {};

                $scope.node.getChildren('list', 'topology')[0].actElemStructure.listElemBuildRequest(reqBuilder, dataList);
                dataObj = {'network-topology': { 'topology': dataList }};

                $scope.topologyData = yangUtils.transformTopologyData(dataObj);
            } else {
                alert('No topology data to display');
            }
        };

        return {
            module: 'network-topology',
            revision: null,
            pathString: '/operational/network-topology:network-topology/',
            label: 'YANGUI_CUST_TOPOLOGY',
            getCallback: fnc,
            view: './src/app/yangui/cf/cv/cvtopology.tpl.html'
        };
    });
});