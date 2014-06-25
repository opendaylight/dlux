angular.module('console.yangui', ['common.yangUtils'])

    

.config(function ($stateProvider) {
    var access = routingConfig.accessLevels;
    $stateProvider.state('yangui', {
        url: '/yangui',
        abstract: true,
        templateUrl: 'yangui/root.tpl.html'
    });

    $stateProvider.state('yangui.index', {
        url: '/index',
        access: access.admin,
        views: {
            '': {
                controller: 'yanguiCtrl',
                templateUrl: 'yangui/index.tpl.html'
            }
        }
    });
})

.controller('yanguiCtrl', ['$scope', '$http', 'Restangular', 'yangUtils', function ($scope, $http, Restangular, yangUtils) {
    $scope.currentPath = './assets/views/yangui';
    $scope.host = '127.0.0.1';
    $scope.port = '9999';


    var requestSuccessCallback = function() {
        $scope.statusMsg = 'SEND_SUCCESS';
    };

    var requestErrorCallback = function() {
        $scope.statusMsg = 'SEND_ERROR';
    };

    var loadModules = function loadModules() {
        $scope.nodeModules = [];
        Restangular.all('modules').getList().then(function(modulesRawData) {
            yangUtils.processModules(modulesRawData.modules, function(node) {
                $scope.nodeModules.push(node);
            });
        });
    };

    var loadNodes = function loadNodes() {
        //TODO change when module discovery will be implemented
        $scope.devices = [];
        Restangular.all('operational').all('opendaylight-inventory:nodes').getList().then(function(inventoryRawData) {
            $scope.devices = yangUtils.processNodes(inventoryRawData.nodes);
        });
    };

    var loadFlows = function loadFlows() {
        $scope.flows = [];
        if($scope.selDevice) { 
            //TODO change when module discovery will be implemented
            Restangular.all('config').all('opendaylight-inventory:nodes').one('node', $scope.selDevice).get().then(function(nodeRawData) {
                $scope.flows = yangUtils.processFlows(nodeRawData.node[0]);
            });
        }
    };

    var sendFlow = function sendFlow() {
        if($scope.selDevice && $scope.selModule) {
            var requestData = yangUtils.buildRequest($scope.selModule),
                flowId = requestData.flow[0].id,
                tableId = requestData.flow[0].table_id;

            if(requestData) {
                //TODO change when module discovery will be implemented
                var request = Restangular.all('config').all('opendaylight-inventory:nodes').one('node',$scope.selDevice).one('table',tableId).one('flow',flowId);

                request.customPUT(requestData).then(function() {
                    requestSuccessCallback();
                }, function(response) {
                    requestErrorCallback();
                });
            }
        }
    };

    var deleteFlow = function deleteFlow() {
        if($scope.selDevice && $scope.selFlow) {
            var flowId = $scope.selFlow.flow,
                tableId = $scope.selFlow.table,
                //TODO change when module discovery will be implemented
                request = Restangular.all('config').all('opendaylight-inventory:nodes').one('node',$scope.selDevice).one('table',tableId).one('flow',flowId);

            request.remove().then(function() {
                requestSuccessCallback();
            }, function(response) {
                requestErrorCallback();
            });
        }
    };

    $scope.dismissStatus = function() {
        $scope.statusMsg = null;
    };

    $scope.loadController = function() {
        $scope.nodeModules = [];
        $scope.flows = [];
        $scope.devices = [];
        $scope.showPreview = true;
        $scope.previewValue = '';

        loadModules();
        loadNodes();
    };

    $scope.getAPIs = function() {
        //TODO load api when cross domain issue with Restconf API explorer will be closed

        // Restangular.all('config').all('opendaylight-inventory:nodes').one('node', 'openflow:1').one('table', '1').one('flow', '1').get().then(function(flowData) {
        //     console.info('flowData:',flowData);
        // });
        console.info(yangUtils.exportModulesLocales($scope.nodeModules));
    };

    $scope.getData = function() {
        loadFlows();
    };

    $scope.fill = function() {
        if($scope.selFlow && $scope.selModule) {
            //TODO when rest api explorer will be available do it by it
            var data = {'flow-node-inventory:flow': [$scope.selFlow.data]},
                name = 'flow-node-inventory:flows';
            
            $scope.selModule.clear();
            $scope.selModule.fill(name, data); 
            $scope.preview();
        }
    };

    $scope.delete = function() {
        deleteFlow();
        // loadFlows();
        $scope.preview();
    };

    $scope.clear = function() {
        if($scope.selModule) {
            $scope.selModule.clear();
            $scope.preview();
        }
    };

    $scope.send = function() {
        sendFlow();
        // loadFlows();
    };

    $scope.preview = function() {
        if($scope.showPreview && $scope.selModule) {
            $scope.previewValue = yangUtils.getRequestString($scope.selModule);
        } else {
            $scope.previewValue = '';
        }

        $scope.previewVisible = ($scope.showPreview && $scope.previewValue);
    };

    $scope.loadController();
}])

.controller('leafCtrl', function ($scope) {
    $scope.parentNode = $scope.node;

    $scope.changed = function() {
        $scope.preview();
    };
})

.controller('containerCtrl', function ($scope) {
    $scope.parentNode = $scope.node;
    var node = $scope.node;
    $scope.toggleExpanded = function() {
        node.expanded = !node.expanded;
    };
})

.controller('caseCtrl', function ($scope) {
    $scope.parentNode = $scope.node;
    var node = $scope.node;
    $scope.empty = (node.children.length === 0 || (node.children.length === 1 && node.children[0].children.length ===0));
})

.controller('choiceCtrl', function ($scope) {
    $scope.parentNode = $scope.node;

})


.controller('listCtrl', function ($scope) {
    $scope.parentNode = $scope.node;
    $scope.actElement = null;
    var node = $scope.node;
    
    $scope.setActElement = function setActElement(elem) {
        $scope.parentNode.actElement = elem;
    };

    $scope.addListElem = function addListElem() {
        node.addListElem();
    };

    $scope.removeListElem = function removeListElem(elem) {
        node.removeListElem(elem);
    };

    $scope.isElemActive = function isElemActive(elem) {
        var match = (elem === $scope.parentNode.actElement);
        return (match ? 'active' : '');
    };

    //node.addListElem(); //creating loop errors
});