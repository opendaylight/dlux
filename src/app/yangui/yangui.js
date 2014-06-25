var leafId = 0;

angular.module('console.yangui', ['common.yangUtils'])

    

.config(function ($stateProvider) {
    // var access = routingConfig.accessLevels;
    $stateProvider.state('yangui', {
        url: '/yangui',
        abstract: true,
        templateUrl: 'yangui/root.tpl.html'
    });

    $stateProvider.state('yangui.index', {
        url: '/index',
        //access: access.admin,
        views: {
            '': {
                controller: 'yanguiCtrl',
                templateUrl: 'yangui/index.tpl.html'
            }
        }
    });
})

.controller('yanguiCtrl', ['$scope', '$location', 'yangUtils', function ($scope, $location, yangUtils) {
    $scope.currentPath = './assets/views/yangui';
    $scope.host = '127.0.0.1';
    $scope.port = '9999';

    var builder = yangUtils.builder,
        filler = yangUtils.filler;

    $scope.loadController = function() {
        $scope.nodeModules = [];
        $scope.flows = [];
        $scope.devices = [];
        $scope.previewValue = '';

        var loadedModules = yangUtils.utils.getModules($scope.host, $scope.port);
        loadedModules.forEach(function(module) {
            var rawNode = yangUtils.utils.parseYang('/yang2xml/'+module.name+'.yang.xml');

            if(rawNode) {
                //rawNode.revision = module.revision; //this will be added in yang parsing, just for test for now
                // rawNode.text = rawNode.label;
                yangUtils.wrapper.wrapAll(rawNode);
                $scope.nodeModules.push(rawNode);
            }
        });

        // var rawNode = yangUtils.utils.parseYang('yang2xml/'+'flow-management'+'.yang.xml');

        // if(rawNode) {
        //     yangUtils.wrapper.wrapAll(rawNode);
        //     $scope.nodeModules.push(rawNode);
        // }

        console.log('loaded modules:',$scope.nodeModules);
        $scope.devices = yangUtils.utils.getTopologyData($scope.host, $scope.port);
        
        // $scope.modulesSelection = {
        //     data: $scope.nodeModules
        // };
    };

    $scope.getAPIs = function() {
        // if($scope.selModule) {
        //     var apis = yangUtils.utils.getAPIs($scope.host, $scope.port,$scope.selModule.module,$scope.selModule.revision);
        //     console.info(apis);
        // }
        console.info('module',$scope.selModule,'device',$scope.selDevice);
    };

    $scope.getFlowsFromDevice = function() {
        if($scope.selDevice) {
            $scope.flows = yangUtils.utils.getFlows($scope.host, $scope.port, $scope.selDevice.label);
        }
    };

    $scope.loadFlow = function() {
        if($scope.selFlow) {
            var flow = $scope.selFlow.data,//yangUtils.utils.getFlow('xmls/f1.xml'),
            wrapper = document.createElement('flows');

            wrapper.appendChild(flow);

            $scope.selModule.clear();
            $scope.selModule.fill(filler, wrapper);
            $scope.viewPreview();
        }
    };

    $scope.deleteFlow = function() {
        if($scope.selFlow) {
            // console.info('to delete:',$scope.host, $scope.port, $scope.selDevice.label, $scope.selFlow);
            yangUtils.utils.sendDeleteFlow($scope.host, $scope.port, $scope.selDevice.label, $scope.selFlow.table, $scope.selFlow.flow);

            $scope.selModule.clear();
            $scope.viewPreview();
            $scope.getFlowsFromDevice();
        }
    };

    $scope.clear = function() {
        if($scope.selModule) {
            $scope.selModule.clear();
            $scope.viewPreview();
        }
    };

    $scope.buildRequest = function(inNode) {
        var node = (inNode ? inNode : $scope.selModule);

        if($scope.selDevice && node) {
            var request = builder.createObj();

            node.buildRequest(builder, request);
            request = request.flows; //TODO use API when it will be available

            if(request) {
                var requestStr = builder.resultToString(request);
                //alert('sending request:\n'+requestStr);
                yangUtils.utils.sendRequest($scope.host, $scope.port, $scope.selDevice.label, request.flow[0].table_id, request.flow[0].id, requestStr);
                $scope.getFlowsFromDevice();
            }
        }
    };

    $scope.viewPreview = function(inNode) {
        var node = (inNode ? inNode : $scope.selModule),
            request = builder.createObj();

        if(node) {
            node.buildRequest(builder, request);
            //request = request.flows; //TODO use API when it will be available
            
            if(request) {
                var requestStr = builder.resultToString(request);
                $scope.previewValue = requestStr;
            } else {
                $scope.previewValue = '';
            }

            $scope.previewVisible = ($scope.showPreview && $scope.previewValue);
       }
    };

    $scope.loadController();
}])

.controller('leafCtrl', function ($scope, $rootScope) {
    $scope.parentNode = $scope.node;

    $scope.changeCallback = function() {
        //TODO rework to be more generic
        $rootScope.$$childHead.$$childHead.$$childHead.$$childHead.$$childHead.viewPreview();
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
    $scope.leafId = 'laefInput'+(++leafId);
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

