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

.controller('yanguiCtrl', ['$scope', '$http', '$timeout', 'Restangular', 'yangUtils', 'apiConnector', function ($scope, $http, $timeout, Restangular, yangUtils) {
    $scope.currentPath = './assets/views/yangui';
    $scope.host = '127.0.0.1';
    $scope.port = '9999';
    $scope.status = {
        type: 'noreq',
        msg: null
    };

    var processingModulesCallback = function() {
        $scope.status = {
            isWorking: true,
            type: 'warning',
            msg: 'PROCESSING_MODULES'
        };
    };

    var processingModulesSuccessCallback = function() {
        $scope.status = {
            type: 'success',
            msg: 'PROCESSING_MODULES_SUCCESS'
        };
    };

    var processingModulesErrorCallback = function(e) {
        $scope.status = {
            type: 'danger',
            msg: 'PROCESSING_MODULES_ERROR',
            rawMsg: e.toString()
        };
    };

    var requestWorkingCallback = function() {
        $scope.status = {
            isWorking: true,
            type: 'warning',
            msg: 'SEND_OPER_WAIT'
        };
    };

    var requestOperErrorCallback = function() {
        $scope.status = {
            type: 'danger',
            msg: 'SEND_OPER_ERROR'
        };
    };

    var requestSuccessCallback = function() {
        $scope.status = {
            type: 'success',
            msg: 'SEND_SUCCESS'
        };
    };

    var requestErrorCallback = function() {
        $scope.status = {
            type: 'danger',
            msg: 'SEND_ERROR'
        };
    };

    var loadApis = function loadApis() {
        $scope.apis = [];
        $scope.allNodes = [];
        processingModulesCallback();
        yangUtils.generateNodesToApis(function(apis, allNodes) {
            $scope.apis = apis;
            $scope.allNodes = allNodes;
            processingModulesSuccessCallback();
            console.info('got api data',$scope.apis, allNodes);
        }, function(e) {
            processingModulesErrorCallback(e);
        });
    };

    var loadNodes = function loadNodes() {
        //TODO change when module discovery will be implemented
        $scope.devices = [];
        Restangular.all('operational').all('opendaylight-inventory:nodes').getList().then(function(inventoryRawData) {
            $scope.devices = yangUtils.processNodes(inventoryRawData.nodes);
        });
    };

    $scope.dismissStatus = function() {
        $scope.status = {};
    };

    $scope.setNode = function() {
        $scope.node = $scope.selSubApi.node;
    };

    $scope.loadController = function() {
        $scope.flows = [];
        $scope.devices = [];
        $scope.apis = [];
        $scope.showPreview = true;
        $scope.previewValue = '';

        loadApis();
        loadNodes();
    };

    $scope.getAPIs = function() {
        console.info(yangUtils.exportModulesLocales($scope.allNodes));
    };

    $scope.executeOperation = function(operation) {
        var requestPath = $scope.selSubApi.buildApiRequestString();
        alert('sending '+operation+' request to\n'+$scope.selApi.basePath+'/'+requestPath);
    };

    $scope.fill = function() {
        if($scope.selFlow && $scope.node) {
            //TODO when rest api explorer will be available do it by it
            var data = {'flow-node-inventory:flow': [$scope.selFlow.data]},
                name = 'flow-node-inventory:flows';
            
            $scope.node.clear();
            $scope.node.fill(name, data); 
            $scope.preview();
        }
    };

    $scope.clear = function() {
        if($scope.node) {
            $scope.node.clear();
            $scope.preview();
        }
    };

    $scope.preview = function() {
        if($scope.showPreview && $scope.node) {
            $scope.previewValue = yangUtils.getRequestString($scope.node);
        } else {
            $scope.previewValue = '';
        }

        $scope.previewVisible = ($scope.showPreview && $scope.previewValue);
    };

    $scope.__test = {
        loadApis: loadApis,
        loadNodes: loadNodes
    };

    $scope.loadController();
}])

.controller('leafCtrl', function ($scope) {
    $scope.changed = function() {
        $scope.preview();
    };
})

.controller('containerCtrl', function ($scope) {
    $scope.toggleExpanded = function() {
        $scope.node.expanded = !$scope.node.expanded;
    };
})

.controller('caseCtrl', function ($scope) {
    $scope.empty = ($scope.node.children.length === 0 || ($scope.node.children.length === 1 && $scope.node.children[0].children.length ===0));
})

.controller('choiceCtrl', function () {
})

.controller('listCtrl', function ($scope) {
    $scope.actElement = null;

    $scope.setActElement = function setActElement(elem) {
        $scope.node.actElement = elem;
    };

    $scope.addListElem = function addListElem() {
        $scope.node.addListElem();
    };

    $scope.removeListElem = function removeListElem(elem) {
        $scope.node.removeListElem(elem);
        // $scope.preview();
    };

    $scope.isElemActive = function isElemActive(elem) {
        var match = (elem === $scope.node.actElement);
        return (match ? 'active' : '');
    };
})

.controller('leafListCtrl', function ($scope) {

    $scope.addListElem = function addListElem() {
        $scope.node.addListElem();
    };

    $scope.removeListElem = function removeListElem(elem){
        $scope.node.removeListElem(elem);
    };

    $scope.changed = function() {
        $scope.preview();
    };
})

.controller('leafListCtrl', function ($scope) {

    $scope.addListElem = function addListElem() {
        $scope.node.addListElem();
    };

    $scope.removeListElem = function removeListElem(elem){
        $scope.node.removeListElem(elem);
    };

    $scope.changed = function() {
        $scope.preview();
    };

});