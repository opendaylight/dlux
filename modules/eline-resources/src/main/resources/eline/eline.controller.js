define(['app/eline/eline.module', 'app/eline/eline.services'], function(eline) {

    eline.register.controller('elineCtrl', ['$scope', '$rootScope', '$http', '$timeout', 'ElineConfigRestangular', 'ElineSvc', 'ElineUtils',
        function ($scope, $rootScope, $http, $timeout, Restangular, ElineSvc, ElineUtils) {
            $rootScope['section_logo'] = 'logo_yangui';

            $scope.epProps = [{key:'remote-id', label:'RemoteId', base64: true},
                              {key:'circuit-id', label:'CircuitId', base64: true},
                              {key:'ip-address', label:'IPv4'},
                              {key:'mac-address', label:'MAC'},
                              {key:'switch', label:'Switch'},
                              {key:'port', label:'Port'},
                              {key:'vlan', label:'VlanID'}];

            $scope.provisionedElines = {};
            $scope.provisionData = [];
            $scope.selectedEP = null;
            $scope.selectedEline = null;
            $scope.selectedElineEP = null;
            $scope.displayHelpers = false;
            $scope.endpoints = [];
            $scope.nodes = [];

            $scope.ts = [];

            $scope.epSetters = [
                { label: 'Switch:Port:VlanID', template: 'spv' },
                { label: 'IPv4', template: 'ipv4' },
                { label: 'MAC', template: 'mac' },
                { label: 'RemoteId:CircuitId', template: 'ridcid' }
            ];

            $scope.$on('ANGULAR_DRAG_START', function() {
                $scope.displayHelpers = true;
                $scope.$digest();
            });

            $scope.$on('ANGULAR_DRAG_END', function() {
                $scope.displayHelpers = false;
                $scope.$digest();
            });

            var refreshTime = 10000;

            var dummyCbk = function() {};

            var getEPstatus = function(epID){
                var foundedEP = $scope.endpoints.filter(function(ep){
                    // console.log(ep['matched']);
                    return ep.matched === epID;
                });
                return foundedEP.length;
            };

            var addElines = function(elinesData) {
                var needInit = $.isEmptyObject($scope.provisionedElines),
                    upElineIds = elinesData.map(function(data) {
                        return data.id;
                    });

                elinesData.forEach(function(elineData) {
                    addEline(elineData.id, elineData.data);
                });

                ElineUtils.deleteDisconnectedElines(upElineIds, $scope.provisionedElines);

                if(needInit && $.isEmptyObject($scope.provisionedElines) === false) {
                   var firstId = Object.keys($scope.provisionedElines)[0];
                   
                   $scope.selectedEline = $scope.provisionedElines[firstId];
                   $scope.selectedEline.name = firstId;
                   $scope.selectedElineEP = $scope.selectedEline.ep1;

                }

                console.info('provisionedElines',$scope.provisionedElines);
            };

            var addEndpoints = function(endpoints) {
                var endpointsIds = endpoints.map(function(ep) {
                    return ep['endpoint-id'];
                });

                ElineUtils.addEndpoints($scope.endpoints, endpoints);
                // console.log($scope.endpoints, endpoints);
                ElineUtils.deleteDisconnectedEndpoints(endpointsIds, $scope.endpoints);
                
            };

            var addEline = function(id, data) {
                // var actionStr = $scope.provisionedElines.hasOwnProperty(id) ? 'Updating' : 'Adding';
                // console.info(actionStr+' eline '+id+' to collection',$scope.provisionedElines);
                if($scope.provisionedElines.hasOwnProperty(id) === false) {
                    $scope.provisionedElines[id] = data;
                }
            };

            $scope.areElinesEmpty = function() {
                return $.isEmptyObject($scope.provisionedElines);
            };

            $scope.clearData = function() {
                $scope.odl_status = false;
                $scope.endpoints = [];
                $scope.nodes = [];
                $scope.provisionedElines = {};
                $scope.provisionData = [];
            };

            $scope.provisionEline = function() {
                $scope.$broadcast('EV_GET_SELECTED_INPUT', 'ep1');
                $scope.$broadcast('EV_GET_SELECTED_INPUT', 'ep2');

                var t = new Date().getTime(),
                    index = 1,
                    elinesToProvision = $scope.provisionData.map(function(data) {
                        var obj = {
                                elineId: 'eline-'+index+'-'+t,
                                ep1: data.ep1,
                                ep2: data.ep2
                            },
                            processedObj = null;

                        if(!$.isEmptyObject(data.ep1) && !$.isEmptyObject(data.ep2)) {
                            obj.ep1['endpoint-id'] = 'ep1-'+index+'-'+t;
                            obj.ep2['endpoint-id'] = 'ep2-'+index+'-'+t;
                            index += 1;
                            processedObj = obj;
                        }

                        return  processedObj;
                    }).filter(function(data) {
                        return data !== null;
                    });

                ElineSvc.create_eline(elinesToProvision, function(){
                    $scope.provisionData = [];
                }, dummyCbk);
            };

            $scope.getData = function() {
                ElineSvc.get_odl_status(function(nodes) {
                    $scope.odl_status = nodes !== null;
                    $scope.nodes = nodes || [];
                }, function() {
                    $scope.odl_status = false;
                    $scope.nodes = [];
                });

                ElineSvc.get_ep_status(function(endpoints) {

                    endpoints.forEach(function(ep){
                        if ( ep.hasOwnProperty('circuit-id') ) {
                        ep['circuit-id'] = ElineUtils.convertBase64toHex(ep['circuit-id']);
                        }
                        if ( ep.hasOwnProperty('remote-id') ) {
                            ep['remote-id'] = ElineUtils.convertBase64toHex(ep['remote-id']);
                        }
                    });

                    addEndpoints(endpoints);
                }, function() {
                    $scope.endpoints = $scope.endpoints.filter(function(ep){
                        return ep.hasOwnProperty('static');
                    });
                    $scope.selectedEP = $scope.endpoints.length ? $scope.endpoints[0] : null;
                });

                ElineSvc.get_eline_status(function(elines) {
                    addElines(elines);
                }, function() {
                    $scope.provisionedElines = {};
                    $scope.selectedEline = null;
                    $scope.selectedElineEP = null;
                });

                $timeout(function () {
                    
                    ElineUtils.matchEndpoints($scope.provisionedElines, $scope.endpoints);

                    if ( $scope.selectedEline ) {
                        $scope.selectedEline.ep1.status = getEPstatus($scope.selectedEline.ep1['endpoint-id']);
                        $scope.selectedEline.ep2.status = getEPstatus($scope.selectedEline.ep2['endpoint-id']);
                    }

                    
                }, 500);

                $timeout(function () {
                    $scope.getData();
                }, refreshTime);

            };

            $scope.convertBase64toHex = function(string){
                return ElineUtils.convertBase64toHex(string);
            };

            $scope.elCounter = 0;
            $scope.addProvisionData = function() {
                $scope.provisionData.push({id: $scope.elCounter++, 'ep1': {}, 'ep2': {}});
            };

            $scope.setData = function(prop, data, $event, k){
                $scope[prop] = data;
                console.log(data);
                
                $($event.target).closest('div').find('button').removeClass('active');
                $($event.target).addClass('active');
                // console.log($event);
            };

            $scope.setSelectedEline = function(data, $event, k) {
                $scope.selectedEline = data;
                $scope.selectedEline.name = k ? k : '';
                $scope.selectedElineEP = data.ep1;

                $($event.target).closest('div').find('button').removeClass('active');
                $($event.target).addClass('active');
            };

            $scope.load = function(){
                $scope.clearData();
                $scope.getData();
                ElineSvc.add_static_eps($scope.endpoints);
                $scope.selectedEP = $scope.endpoints.length && $scope.selectedEP === null ? $scope.endpoints[0] : $scope.selectedEP;
            };

            $scope.load();

            
        }
    ]);

    eline.register.controller('epSetterCtrl', ['$scope',
        function ($scope) {
            $scope.epId = null;
            $scope.pdIndex = null;

            $scope.setOptionByTemplate = function(template) {
                var opt = $scope.epSetters.filter(function(epSetter) {
                        return epSetter.template === template;
                    })[0],
                    prop = $scope.epId + 'setter';

                if(opt) {
                    $scope[prop] = opt;
                }
            };

            $scope.cbkIfSelected = function(opt_id, cbk) {
                if($scope[$scope.epId+'setter'].template === opt_id) {
                    cbk();
                }
            };

            $scope.setEpData = function() {
                return function(value, index) {
                    $scope.provisionData.filter(function(item){
                        return item.id === index;
                    })[0][$scope.epId] = value;
                };
            };

            $scope.fillEpData = function(dataObj, epId, cbk, opt_id) {

                if( $scope.epId === epId ) {
                    switch_opt = cbk(dataObj);

                    if(switch_opt) {
                        $scope.setOptionByTemplate(opt_id);
                    }
                }

            };

            $scope.onDrop = function($event, $data, epId) {
                $scope.$broadcast('EV_ELINE_FILL_INPUTS', $data, $scope.epId);
            };

        }
    ]);

    eline.register.controller('spvCtrl', ['$scope',
        function ($scope) {
            var props = ['switch','port','vlan'],
                opt_id = 'spv';

            $scope.switch  = '';
            $scope.port  = '';
            $scope.vlan  = '';
            $scope.setValue = $scope.setEpData();

            var change = function() {
                var obj = { 'switch': 'switch' + $scope.switch, 'port': 'port' + $scope.port, 'vlan':$scope.vlan };
                $scope.setValue(obj, $scope.pdIndex);
            };

            var fill = function(obj) {
                $scope.switch = obj.switch;
                $scope.port = obj.port;
                $scope.vlan = obj.vlan;

                return (obj.switch !== null && obj.switch !== undefined) ||
                       (obj.port !== null && obj.port !== undefined) ||
                       (obj.vlan !== null && obj.vlan !== undefined);
            };

            $scope.$on('EV_ELINE_FILL_INPUTS', function(ev, dataObj, epId) {
                $scope.fillEpData(dataObj, epId, fill, opt_id);
            });

            $scope.$on('EV_GET_SELECTED_INPUT', function() {
                $scope.cbkIfSelected(opt_id, change);
            });

        }
    ]);

    eline.register.controller('ipv4Ctrl', ['$scope',
        function ($scope) {
            var props = ['ip-address'],
                opt_id = 'ipv4';

            $scope.value  = '';
            $scope.setValue = $scope.setEpData();

            var change = function() {
                var obj = { 'ip-address': $scope.value };
                $scope.setValue(obj, $scope.pdIndex);
            };

            var fill = function(obj) {
                $scope.value = obj['ip-address'];

                return (obj['ip-address'] !== null && obj['ip-address'] !== undefined);
            };

            $scope.$on('EV_ELINE_FILL_INPUTS', function(ev, dataObj, epId) {
                $scope.fillEpData(dataObj, epId, fill, opt_id);
            });

            $scope.$on('EV_GET_SELECTED_INPUT', function() {
                $scope.cbkIfSelected(opt_id, change);
            });

        }
    ]);

    eline.register.controller('macCtrl', ['$scope',
        function ($scope) {
            var props = 'mac-address',
                opt_id = 'mac';

            $scope.value  = '';
            $scope.setValue = $scope.setEpData();

            var change = function() {
                var obj = { 'mac-address': $scope.value };
                $scope.setValue(obj, $scope.pdIndex);
            };

            var fill = function(obj) {
                $scope.value = obj['mac-address'];

                return (obj['mac-address'] !== null && obj['mac-address'] !== undefined);
            };

            $scope.$on('EV_ELINE_FILL_INPUTS', function(ev, dataObj, epId) {
                // console.log(ev, dataObj, epId);
                $scope.fillEpData(dataObj, epId, fill, opt_id);
            });

            $scope.$on('EV_GET_SELECTED_INPUT', function() {
                $scope.cbkIfSelected(opt_id, change);
            });

        }
    ]);

    eline.register.controller('ridcidCtrl', ['$scope','ElineUtils',
        function ($scope, ElineUtils) {
            var props = ['remote-id', 'circuit-id'],
                opt_id = 'ridcid';

            $scope.rid  = '';
            $scope.cid  = '';
            $scope.setValue = $scope.setEpData();
            
            var change = function() {
                var obj = {'remote-id': $scope.rid, 'circuit-id': $scope.cid };
                $scope.setValue(obj, $scope.pdIndex);
            };

            var fill = function(obj) {
                $scope.rid = obj['remote-id'];
                $scope.cid = obj['circuit-id'];

                return (obj['remote-id'] !== null && obj['remote-id'] !== undefined) ||
                       (obj['circuit-id'] !== null && obj['circuit-id'] !== undefined);
            };

            $scope.$on('EV_ELINE_FILL_INPUTS', function(ev, dataObj, epId) {
                $scope.fillEpData(dataObj, epId, fill, opt_id);
            });

            $scope.$on('EV_GET_SELECTED_INPUT', function() {
                $scope.cbkIfSelected(opt_id, change);
            });

        }
    ]);

});


