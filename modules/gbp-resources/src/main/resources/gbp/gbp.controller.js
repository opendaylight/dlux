var modules = ['app/gbp/gbp.module',
               'app/gbp/gbp.services'
               ];


define(modules, function(gbp) {

    gbp.register.controller('gbpCtrl', ['$scope', '$rootScope', '$http', '$timeout', 'PGNServices', 'TopoServices', 'GBPTenantServices', 'GBPConstants',
        function ($scope, $rootScope, $http, $timeout, PGNServices, TopoServices, GBPTenantServices, GBPConstants) {
            $rootScope['section_logo'] = 'logo_yangui';
            $scope.view_path =  'src/app/gbp/views/';
            $scope.topologyData = { nodes: [], links: [] };
            $scope.topologyType = null;
            $scope.legend = {};
            $scope.showLegend = false;

            var reloadShowLegend = function() {
                $scope.showLegend = !$.isEmptyObject($scope.legend);
            };

            $scope.settingsSigma = {
                defaultLabelColor: '#fff',
                doubleClickEnabled: false,
                labelThreshold: 8
            };

            $scope.settingsAtlas = {
                adjustSizes: true,
                gravity: 0.2
            };

            $scope.viewTopo = {
                box: false,
                button: false
            };

            $scope.view = {
                slider : true,
                basic : true,
                policy: false,
                tenants : false,
                l2l3 : false,
                epg : false,
                contracts : false,
                docs : false,
                groupMenu: false,
                classifiers: false,
                actions: false
            };

            // TENANTS
            $scope.tenantList = [];
            $scope.selectedTenant = null;

            $scope.mandatoryProperties = [];
            $scope.loadTopology = function(type, args) {
                if ( $scope.selectedTenant  ) {

                    $scope.topologyData = { nodes: [], links: [] };
                    $scope.topologyType = type;

                    TopoServices.loadTopology(type, function(nodes, links) {
                        $scope.topologyData = { nodes: nodes, links: links };
                        $scope.viewTopo.box = true;
                        $scope.viewTopo.button = type !== 'L2L3' && type !== null ? true : false;
                        $scope.legend = TopoServices.getLegend(type);
                        reloadShowLegend();
                    }, function() {
                        $scope.legend = {};
                        reloadShowLegend();
                    }, args);

                }
            };

            $scope.toggleExpanded = function(expand, show) {
                $scope.view[expand] = show ? true : !$scope.view[expand];
                for ( var property in $scope.view ) {
                    $scope.view[property] = expand !== property ? false : $scope.view[expand];
                }

                $scope.$broadcast('EV_INIT'+expand.toUpperCase());
            };

            $scope.topologyCustfunc = function(sigmaIstance, getSlowDownNum, dragListener, resize){

                sigmaIstance.bind('clickStage', function(e){
                  sigmaIstance.killForceAtlas2();
                });

                // Bind the events:
                // sigmaIstance.bind('overNode outNode clickNode doubleClickNode rightClickNode', function(e) {
                //   console.log(e.type, e.data.node.label, e.data.captor);
                // });
                // sigmaIstance.bind('overEdge outEdge clickEdge doubleClickEdge rightClickEdge', function(e) {
                //   console.log(e.type, e.data.edge, e.data.captor);
                // });
                // sigmaIstance.bind('clickStage', function(e) {
                //   console.log(e.type, e.data.captor);
                // });
                // sigmaIstance.bind('doubleClickStage rightClickStage', function(e) {
                //   console.log(e.type, e.data.captor);
                // });

              };

            $scope.setTenant = function() {
                $scope.$broadcast('GBP_TENANT_RELOAD');
                if($scope.selectedTenant) {
                    $scope.loadTopology($scope.topologyType, { tenantId: $scope.selectedTenant.id });
                }
            };

            $scope.loadTenants = function() {
                GBPTenantServices.load(
                    function(tenants) {
                        $scope.tenantList = tenants;
                    },
                    function(){
                        //TODO error
                    });
            };

            $scope.sendReloadEventFromRoot = function(eventName) {
                $scope.$broadcast(eventName);
            };

            $scope.validateMandatory = function(newObj, mandatoryProps){
                var ret = true,
                    notFilledProps = [];

                mandatoryProps.forEach(function(el){
                    if(newObj[el] === '' || newObj[el] === null || newObj[el] === undefined){
                        notFilledProps.push(el);
                        ret = false;
                    }
                });

                return {'status' : ret, 'notFilledProps' : notFilledProps};
            };

            $scope.loadTenants();

            $scope.$on('GBP_GLOBAL_TENANT_RELOAD',function(){
                $scope.loadTenants();
            });
    }]);

    gbp.register.controller('topoDataCtrl',['$scope', 'TopoServices',  function($scope, TopoServices){
        $scope.showTable = false;

        $scope.getConsProvLabel = function(edge){
            return TopoServices.getConsProvLabel(edge, $scope.topologyData);
        };

        $scope.show = function(){
            $scope.showTable = true;
        };

        $scope.close = function(){
            $scope.showTable = false;
        };

    }]);


    gbp.register.controller('crudCtrl',['$scope',  function($scope){
        $scope.selectedObj = null;
        $scope.label = '';

        $scope.add = function() {
            $scope.selectedObj = null;
            $scope.showForm();
        };

        $scope.modify = function() {
            $scope.$emit('PGN_EDIT_ELEM');
        };

        $scope.init = function(label) {
            $scope.label = label;
        };

        $scope.getDisplayLabel = function(obj, labelArray){
            var ret = '';

            if((typeof labelArray) === 'string'){
                ret = obj[labelArray];
            } else if (angular.isFunction(labelArray)) {
                ret = labelArray(obj);
            } else {
                labelArray.some(function(labelParam) {
                    if(angular.isFunction(labelParam)) {
                        ret = labelParam(obj);
                    } else if(obj.hasOwnProperty(labelParam)) {
                        ret = obj[labelParam];
                    }
                    return ret;
                });
            }

            return ret;
        };

        $scope.$on('EV_SET_SEL_CLASS', function(event, selObj){
            $scope.selectedObj = selObj;
        });
    }]);

    gbp.register.controller('contractCtrl', ['$scope','GBPContractServices', '$filter', function($scope, GBPContractServices, $filter){
        $scope.list = [];
        $scope.contractView = false;
        $scope.selectedContract = null;
        $scope.newContractObj = GBPContractServices.createObj();
        $scope.displayLabel = 'id';
        $scope.crudLabel = 'GBP_CONTRACT_LIST';

        var path = null,
            mandatoryProperties = [];

        $scope.init = function() {
            if ( $scope.selectedTenant ) {
                $scope.selectedContract = null;
                path = GBPContractServices.createPathObj($scope.selectedTenant.id);
                
                GBPContractServices.load(path, function(data){
                    $scope.list = data;
                    // $scope.$broadcast('GBP_CONTRACT_RELOAD');
                    $scope.sendReloadEventFromRoot('GBP_CONTRACT_RELOAD');
                }, function(){

                });
            }
        };

        $scope.save = function(){
            var resp = $scope.validateMandatory($scope.newContractObj, mandatoryProperties);
            if(resp.status){
                path = GBPContractServices.createPathObj($scope.selectedTenant.id, $scope.newContractObj.id);
                GBPContractServices.send(path, $scope.newContractObj, function(data){
                    $scope.init();
                    $scope.contractView = false;
                    $scope.reloadNewObj();
                }, function(){
                    //TODO: error cbk
                });
            }else{
                alert($filter('translate')('GBP_MANDATORY_NOT_FILLED')+': '+resp.notFilledProps.join(', '));
            }
        };

        $scope.delete = function() {
            if ( $scope.selectedContract ) {
                path = GBPContractServices.createPathObj($scope.selectedTenant.id, $scope.selectedContract.id);
                GBPContractServices.delete(path, function(data){
                    $scope.init();
                    $scope.selectedContract = null;
                }, function(){
                    //TODO: error cbk
                });
            }
        };

        $scope.reloadNewObj = function() {
            $scope.newContractObj = GBPContractServices.createObj();
        };

        $scope.reload = function(selectedObj) {
            $scope.selectedContract = selectedObj;
            if($scope.contractView) {
                $scope.newContractObj = selectedObj;
            }
            $scope.sendReloadEventFromRoot('GBP_CONTRACT_RELOAD');
        };

        $scope.showForm = function() {
            $scope.reloadNewObj();
            $scope.contractView = true;
            $scope.selectedContract = null;
        };

        $scope.close = function(){
            $scope.contractView = false;
        };

        $scope.$on('PGN_EDIT_ELEM', function(event){
            if(!event.defaultPrevented) {
                if ( $scope.selectedContract ) {
                    $scope.contractView = true;
                    $scope.newContractObj = $scope.selectedContract;
                }
                event.defaultPrevented = true;
            }
        });

        $scope.$on('GBP_TENANT_RELOAD',function(event){
            $scope.init();
        });
    }]);

    gbp.register.controller('clauseCtrl', ['$scope','GBPClauseServices', 'GBPSubjectServices', 
        function($scope, GBPClauseServices, GBPSubjectServices){
        $scope.list = [];
        $scope.selectedClause = null;
        $scope.newClauseObj = GBPClauseServices.createObj();
        $scope.view = {
            clause: false,
            edit: false
        };
        $scope.displayLabel = 'name';
        $scope.subjects = [];
        $scope.crudLabel = 'GBP_CLAUSE_LIST';

        var path = null;

        //move to separate ctrl \/
        $scope.addNewElem = function(templateObj) {
            if($scope.newClauseObj && $scope.newClauseObj['subject-refs']) {
                var objToPush = templateObj || "";
                $scope.newClauseObj['subject-refs'].push(objToPush);
            }
        };

        $scope.deleteElemAt = function(index) {
            if($scope.newClauseObj && $scope.newClauseObj['subject-refs']) {
                $scope.newClauseObj['subject-refs'].splice(index, 1);
            }
        };

        $scope.updateAt = function(index, value) {
            if($scope.newClauseObj && $scope.newClauseObj['subject-refs'] && $scope.newClauseObj['subject-refs'].length >= index) {
                $scope.newClauseObj['subject-refs'][index] = value;
            }
        };
        //move to separate ctrl /\

        var loadSubjects = function() {
            GBPSubjectServices.load(path, function(data){
                $scope.subjects = data;
            }, function(){
                //TODO: error cbk
            });
        };

        $scope.init = function() {
            if ( $scope.selectedContract ) {
                path = GBPClauseServices.createPathObj($scope.selectedTenant.id, $scope.selectedContract.id);
                
                GBPClauseServices.load(path, function(data){
                    console.info('loaded data', data);
                    $scope.list = data;
                }, function(){
                    //TODO: error cbk
                });
            }
        };

        $scope.save = function(){
            path = GBPClauseServices.createPathObj($scope.selectedTenant.id, $scope.selectedContract.id, $scope.newClauseObj.name);
            GBPClauseServices.send(path, $scope.newClauseObj, function(data){
                $scope.init();
                $scope.view.clause = false;
                $scope.reloadNewObj();
            }, function(){
                //TODO: error cbk
            });
        };

        $scope.delete = function() {
            if ( $scope.selectedClause ) {
                path = GBPClauseServices.createPathObj($scope.selectedTenant.id, $scope.selectedContract.id, $scope.selectedClause.name);
                GBPClauseServices.delete(path, function(data){
                    $scope.init();
                    $scope.selectedClause = null;
                }, function(){
                    //TODO: error cbk
                });
            }
        };

        $scope.reloadNewObj = function() {
            $scope.newClauseObj = GBPClauseServices.createObj();
        };

        $scope.reload = function(selectedObj) {
            $scope.selectedClause = selectedObj;
            if($scope.view.clause) {
                $scope.newClauseObj = selectedObj;
            }
        };

        $scope.showForm = function() {
            $scope.reloadNewObj();
            $scope.view.clause = true;
            $scope.view.edit = false;
            $scope.selectedClause = null;
        };

        $scope.close = function(){
            $scope.view.clause = false;
            $scope.view.edit = false;
        };

        $scope.$on('PGN_EDIT_ELEM', function(event){
            if (!event.defaultPrevented) {
                if ( $scope.selectedClause ) {
                    $scope.view.clause = true;
                    $scope.view.edit = true;
                    $scope.newClauseObj = $scope.selectedClause;
                }
                event.defaultPrevented = true;
            }
        });

        $scope.$on('GBP_CONTRACT_RELOAD',function(){
            $scope.init();
        });

        $scope.$on('GBP_SUBJECT_RELOAD',function(){
            loadSubjects();
        });
    }]);

    gbp.register.controller('subjectCtrl', ['$scope','GBPSubjectServices', '$filter', function($scope, GBPSubjectServices, $filter){
        $scope.list = [];
        $scope.selectedSubject = null;
        $scope.newSubjectObj = GBPSubjectServices.createObj();
        $scope.displayLabel = 'name';
        $scope.view = {
            subject : false,
            edit : false
        };
        $scope.crudLabel = 'GBP_SUBJECT_LIST';


        var path = null,
            mandatoryProperties = ['order'];

        $scope.init = function() {
            if ( $scope.selectedContract ) {
                $scope.selectedSubject = null;
                path = GBPSubjectServices.createPathObj($scope.selectedTenant.id, $scope.selectedContract.id);
                
                GBPSubjectServices.load(path, function(data){
                    $scope.list = data;
                    $scope.sendReloadEventFromRoot('GBP_SUBJECT_RELOAD');
                }, function(){
                    //TODO: error cbk
                });
            }
        };

        $scope.save = function(){
            var resp = $scope.validateMandatory($scope.newSubjectObj, mandatoryProperties);
            if(resp.status){
                path = GBPSubjectServices.createPathObj($scope.selectedTenant.id, $scope.selectedContract.id, $scope.newSubjectObj.name);
                GBPSubjectServices.send(path, $scope.newSubjectObj, function(data){
                    $scope.init();
                    $scope.view.subject = false;
                    $scope.reloadNewObj();
                }, function(){
                    //TODO: error cbk
                });
            }else{
                alert($filter('translate')('GBP_MANDATORY_NOT_FILLED')+': '+resp.notFilledProps.join(', '));
            }
        };

        $scope.delete = function() {
            if ( $scope.selectedSubject ) {
                path = GBPSubjectServices.createPathObj($scope.selectedTenant.id, $scope.selectedContract.id, $scope.selectedSubject.name);
                GBPSubjectServices.delete(path, function(data){
                    $scope.init();
                    $scope.selectedSubject = null;
                }, function(){
                    //TODO: error cbk
                });
            }
        };

        $scope.reloadNewObj = function() {
            $scope.newSubjectObj = GBPSubjectServices.createObj();
        };

        $scope.reload = function(selectedObj) {
            $scope.selectedSubject = selectedObj;
            if($scope.view.subject) {
                $scope.newSubjectObj = selectedObj;
            }
            $scope.sendReloadEventFromRoot('GBP_SUBJECT_RELOAD');
        };

        $scope.showForm = function() {
            $scope.reloadNewObj();
            $scope.view.subject = true;
            $scope.view.edit = false;
            $scope.selectedSubject = null;
        };

        $scope.close = function(){
            $scope.view.subject = false;
            $scope.view.edit = false;
        };

        $scope.$on('PGN_EDIT_ELEM', function(event){
            if (!event.defaultPrevented) {
                if ( $scope.selectedSubject ) {
                    $scope.view.subject = true;
                    $scope.view.edit = true;
                    $scope.newSubjectObj = $scope.selectedSubject;
                }
                event.defaultPrevented = true;
            }
        });

        $scope.$on('GBP_CONTRACT_RELOAD',function(){
            $scope.init();
        });
    }]);

    gbp.register.controller('ruleCtrl', ['$scope','GBPRuleServices', '$filter', function($scope, GBPRuleServices, $filter){
        $scope.list = [];
        $scope.selectedRule = null;
        $scope.newRuleObj = GBPRuleServices.createObj();
        $scope.displayLabel = 'name';
        $scope.view = {
            rule : false,
            edit : false
        };
        $scope.crudLabel = 'GBP_RULE_LIST';

        var path = null,
            mandatoryProperties = ['order'];

        $scope.init = function() {
            if ( $scope.selectedSubject ) {
                $scope.selectedRule = null;
                path = GBPRuleServices.createPathObj($scope.selectedTenant.id, $scope.selectedContract.id, $scope.selectedSubject.name);
                
                GBPRuleServices.load(path, function(data){
                    $scope.list = data;
                }, function(){
                    //TODO: error cbk
                });
            }
        };

        $scope.save = function(){
            var resp = $scope.validateMandatory($scope.newRuleObj, mandatoryProperties);
            if(resp.status){
                path = GBPRuleServices.createPathObj($scope.selectedTenant.id, $scope.selectedContract.id, $scope.selectedSubject.name, $scope.newRuleObj.name);
                GBPRuleServices.send(path, $scope.newRuleObj, function(data){
                    $scope.init();
                    $scope.view.rule = false;
                    $scope.reloadNewObj();
                }, function(){
                    //TODO: error cbk
                });
            }else{
                alert($filter('translate')('GBP_MANDATORY_NOT_FILLED')+': '+resp.notFilledProps.join(', '));
            }
        };

        $scope.delete = function() {
            if ( $scope.selectedRule ) {
                path = GBPRuleServices.createPathObj($scope.selectedTenant.id, $scope.selectedContract.id, $scope.selectedSubject.name, $scope.selectedRule.name);
                GBPRuleServices.delete(path, function(data){
                    $scope.init();
                    $scope.selectedRule = null;
                }, function(){
                    //TODO: error cbk
                });
            }
        };

        $scope.reloadNewObj = function() {
            $scope.newRuleObj = GBPRuleServices.createObj();
        };

        $scope.reload = function(selectedObj) {
            $scope.selectedRule = selectedObj;
            if($scope.view.rule) {
                $scope.newRuleObj = selectedObj;
            }
            $scope.$broadcast('GBP_RULE_RELOAD');
        };

        $scope.showForm = function() {
            $scope.reloadNewObj();
            $scope.view.rule = true;
            $scope.view.edit = false;
            $scope.selectedRule = null;
        };

        $scope.close = function(){
            $scope.view.rule = false;
            $scope.view.edit = false;
        };

        $scope.$on('PGN_EDIT_ELEM', function(event){
            if (!event.defaultPrevented) {
                if ( $scope.selectedRule ) {
                $scope.view.rule = true;
                $scope.view.edit = true;
                    $scope.newRuleObj = $scope.selectedRule;
                }
                event.defaultPrevented = true;
            }
        });

        $scope.$on('GBP_SUBJECT_RELOAD',function(){
            $scope.init();
        });
    }]);

    gbp.register.controller('actionRefCtrl', ['$scope','GBPActionRefsServices', 'GBPActionInstanceServices', '$filter', function($scope, GBPActionRefsServices, GBPActionInstanceServices, $filter){
        $scope.list = [];
        $scope.selectedActionRef = null;
        $scope.newActionRefObj = GBPActionRefsServices.createObj();
        $scope.displayLabel = 'name';
        $scope.actionInstanceNames = [];
        $scope.view = {
            actionRef : false,
            edit : false
        };
        $scope.crudLabel = 'GBP_ACTION_LIST';

        var path = null,
            mandatoryProperties = ['order'];

        var actionInstanceNamesLoad = function() {
            var actionInstancePath = GBPActionInstanceServices.createPathObj($scope.selectedTenant.id);
            GBPActionInstanceServices.load(actionInstancePath, function(data){
                $scope.actionInstanceNames = data;
            },function(){
                //TODO: error cbk
            });
        };

        $scope.init = function() {
            if ( $scope.selectedRule ) {
                $scope.selectedActionRef = null;
                path = GBPActionRefsServices.createPathObj($scope.selectedTenant.id, $scope.selectedContract.id, $scope.selectedSubject.name, $scope.selectedRule.name);
                
                GBPActionRefsServices.load(path, function(data){
                    $scope.list = data;
                }, function(){
                    //TODO: error cbk
                });

                actionInstanceNamesLoad();
            }
        };

        $scope.save = function(){
            var resp = $scope.validateMandatory($scope.newActionRefObj, mandatoryProperties);
            if(resp.status){
                path = GBPActionRefsServices.createPathObj($scope.selectedTenant.id, $scope.selectedContract.id, $scope.selectedSubject.name, $scope.selectedRule.name, $scope.newActionRefObj.name);
                GBPActionRefsServices.send(path, $scope.newActionRefObj, function(data){
                    $scope.init();
                    $scope.view.actionRef = false;
                    $scope.reloadNewObj();
                }, function(){
                    //TODO: error cbk
                });
            }else{
                alert($filter('translate')('GBP_MANDATORY_NOT_FILLED')+': '+resp.notFilledProps.join(', '));
            }
        };

        $scope.delete = function() {
            if ( $scope.selectedActionRef ) {
                path = GBPActionRefsServices.createPathObj($scope.selectedTenant.id, $scope.selectedContract.id, $scope.selectedSubject.name, $scope.selectedRule.name, $scope.selectedActionRef.name);
                GBPActionRefsServices.delete(path, function(data){
                    $scope.init();
                    $scope.selectedActionRef = null;
                }, function(){
                    //TODO: error cbk
                });
            }
        };

        $scope.reloadNewObj = function() {
            $scope.newActionRefObj = GBPActionRefsServices.createObj();
        };

        $scope.reload = function(selectedObj) {
            $scope.selectedActionRef = selectedObj;
            if($scope.view.actionRef) {
                $scope.newActionRefObj = selectedObj;
            }
        };

        $scope.showForm = function() {
            $scope.reloadNewObj();
            $scope.view.actionRef = true;
            $scope.view.edit = false;
            $scope.selectedActionRef = null;
        };

        $scope.close = function(){
            $scope.view.actionRef = false;
            $scope.view.edit = false;
        };

        $scope.$on('PGN_EDIT_ELEM', function(event){
            if (!event.defaultPrevented) {
                if ( $scope.selectedActionRef ) {
                    $scope.view.actionRef = true;
                    $scope.view.edit = true;
                    $scope.newActionRefObj = $scope.selectedActionRef;
                }
                event.defaultPrevented = true;
            }
        });

        $scope.$on('GBP_RULE_RELOAD',function(){
            $scope.init();
        });

        $scope.$on('GBP_ACTION_INSTANCE_RELOAD',function(){
            actionInstanceNamesLoad();
        });
    }]);

    gbp.register.controller('classifierRefCtrl', ['$scope','GBPClassifierRefsServices', 'GBPClassifierInstanceServices', '$filter', function($scope, GBPClassifierRefsServices, GBPClassifierInstanceServices, $filter){
        $scope.list = [];
        $scope.selectedClassifierRef = null;
        $scope.newClassifierRefObj = GBPClassifierRefsServices.createObj();
        $scope.displayLabel = 'name';
        $scope.instanceNames = [];
        $scope.view = {
            classifierRef : false,
            edit : false
        };
        $scope.formDirections = ['in', 'out', 'bidirectional'];
        $scope.formConnectionTracking = ['normal', 'reflexive'];
        $scope.crudLabel = 'GBP_CLASSIFIER_LIST';

        var path = null;

        var instanceNamesLoad = function() {
            var classifierInstancePath = GBPClassifierInstanceServices.createPathObj($scope.selectedTenant.id);
            GBPClassifierInstanceServices.load(classifierInstancePath, function(data){
                $scope.instanceNames = data;
            },function(){
                //TODO: error cbk
            });
        };

        $scope.init = function() {
            if ( $scope.selectedRule ) {
                $scope.selectedClassifierRef = null;
                path = GBPClassifierRefsServices.createPathObj($scope.selectedTenant.id, $scope.selectedContract.id, $scope.selectedSubject.name, $scope.selectedRule.name);
                


                GBPClassifierRefsServices.load(path, function(data){
                    $scope.list = data;
                }, function(){
                    //TODO: error cbk
                });

                instanceNamesLoad();
            }
        };

        $scope.save = function(){
            path = GBPClassifierRefsServices.createPathObj($scope.selectedTenant.id, $scope.selectedContract.id, $scope.selectedSubject.name, $scope.selectedRule.name, $scope.newClassifierRefObj.name);
            GBPClassifierRefsServices.send(path, $scope.newClassifierRefObj, function(data){
                $scope.init();
                $scope.view.classifierRef = false;
                $scope.reloadNewObj();
            }, function(){
                //TODO: error cbk
            });
        };

        $scope.delete = function() {
            if ( $scope.selectedClassifierRef ) {
                path = GBPClassifierRefsServices.createPathObj($scope.selectedTenant.id, $scope.selectedContract.id, $scope.selectedSubject.name, $scope.selectedRule.name, $scope.selectedClassifierRef.name);
                GBPClassifierRefsServices.delete(path, function(data){
                    $scope.init();
                    $scope.selectedClassifierRef = null;
                }, function(){
                    //TODO: error cbk
                });
            }
        };

        $scope.reloadNewObj = function() {
            $scope.newClassifierRefObj = GBPClassifierRefsServices.createObj();
        };

        $scope.reload = function(selectedObj) {
            $scope.selectedClassifierRef = selectedObj;
            if($scope.view.classifierRef) {
                $scope.newClassifierRefObj = selectedObj;
            }
        };

        $scope.showForm = function() {
            $scope.reloadNewObj();
            $scope.view.classifierRef = true;
            $scope.view.edit = false;
            $scope.selectedClassifierRef = null;
        };

        $scope.close = function(){
            $scope.view.classifierRef = false;
            $scope.view.edit = false;
        };

        $scope.$on('PGN_EDIT_ELEM', function(event){
            if (!event.defaultPrevented) {
                if ( $scope.selectedClassifierRef ) {
                    $scope.view.classifierRef = true;
                    $scope.view.edit = true;
                    $scope.newClassifierRefObj = $scope.selectedClassifierRef;
                }
                event.defaultPrevented = true;
            }
        });

        $scope.$on('GBP_RULE_RELOAD',function(){
            $scope.init();
        });

        $scope.$on('GBP_CLASSIFIER_INSTANCE_RELOAD',function(){
            instanceNamesLoad();
        });

    }]);

    gbp.register.controller('tenantCtrl', ['$scope', 'GBPTenantServices', '$filter', function($scope, GBPTenantServices, $filter){ 
        $scope.list = [];
        $scope.tenantView = false;
        $scope.selectedTenantObj = null;
        $scope.newTenantObj = GBPTenantServices.createObj();
        $scope.displayLabel = ['name' , 'id'];
        $scope.crudLabel = 'GBP_TENANTS_LIST';

        var mandatoryProperties = ['name'];

        $scope.init = function() {
            GBPTenantServices.load(
                function(data) {
                    $scope.list = data;
                    $scope.newTenantObj = GBPTenantServices.createObj();
                    $scope.selectedTenantObj = null;
                },
                function(){
                    //TODO error
                });
        };

        $scope.save = function(){
            var resp = $scope.validateMandatory($scope.newTenantObj, mandatoryProperties);
            if(resp.status){
                path = GBPTenantServices.createPathObj($scope.newTenantObj.id);
                GBPTenantServices.send(path, $scope.newTenantObj, function(data){
                    $scope.init();
                    $scope.tenantView = false;
                    $scope.$emit('GBP_GLOBAL_TENANT_RELOAD');
                }, function(){
                    //TODO: error cbk
                });
            }else{
                alert($filter('translate')('GBP_MANDATORY_NOT_FILLED')+': '+resp.notFilledProps.join(', '));
            }
        };

         $scope.delete = function() {
            if($scope.selectedTenantObj) {
                path = GBPTenantServices.createPathObj($scope.selectedTenantObj.id);

                GBPTenantServices.delete(path, function(data){
                    $scope.init();
                    $scope.tenantView = false;
                    $scope.$emit('GBP_GLOBAL_TENANT_RELOAD');
                }, function(){
                    //TODO: error cbk
                });
            }
        };

        $scope.reload = function(selectedObj) {
            $scope.selectedTenantObj = selectedObj;
            if ($scope.tenantView) {
                $scope.newTenantObj = selectedObj;
            }
        };

        $scope.showForm = function() {
            $scope.newTenantObj = GBPTenantServices.createObj();
            $scope.tenantView = true;
        };

        $scope.close = function(){
            $scope.tenantView = false;
        };

       $scope.$on('PGN_EDIT_ELEM', function(event){
            if (!event.defaultPrevented) {
                if ( $scope.selectedTenantObj ) {
                    $scope.tenantView = true;
                    $scope.newTenantObj = $scope.selectedTenantObj;
                }
                event.defaultPrevented = true;
            }
        });

        // $scope.$on('GBP_TENANT_RELOAD',function(){
        //     $scope.init();
        // });
    }]);

    gbp.register.controller('epgCtrl',['$scope', 'GBPEpgServices', 'GBPContractServices', '$filter',
        function($scope, GBPEpgServices, GBPContractServices, $filter){
        $scope.list = [];
        $scope.selectedEpg = null;
        $scope.newEpgObj = GBPEpgServices.createObj();
        $scope.epgView = false;
        $scope.displayLabel = ['name', 'id'];
        $scope.crudLabel = 'GBP_GROUP_LIST';

        $scope.igpOpts = ['allow', 'require-contract'];
        $scope.contracts = [];

        var loadContracts = function() {
            GBPContractServices.load(path, function(data){
                $scope.contracts = data;
            }, function(){
                //TODO: error cbk
            });
        };

        var mandatoryProperties = ['name'];

        $scope.init = function() {
            if ($scope.selectedTenant) {
                path = GBPEpgServices.createPathObj($scope.selectedTenant.id);
                
                GBPEpgServices.load(path, function(data){
                    $scope.list = data;
                    // $scope.$broadcast('GBP_EPG_RELOAD');
                    $scope.sendReloadEventFromRoot('GBP_EPG_RELOAD');
                }, function(){
                    //TODO: error cbk
                });

                loadContracts();
            }
        };

        $scope.save = function(){
            var resp = $scope.validateMandatory($scope.newEpgObj, mandatoryProperties);
            if(resp.status){
                path = GBPEpgServices.createPathObj($scope.selectedTenant.id, $scope.newEpgObj.id);
                GBPEpgServices.send(path, $scope.newEpgObj, function(data){
                    $scope.init();
                    $scope.epgView = false;
                    $scope.reloadNewObj();
                }, function(){
                    //TODO: error cbk
                });
            }else{
                alert($filter('translate')('GBP_MANDATORY_NOT_FILLED')+': '+resp.notFilledProps.join(', '));
            }
        };

        $scope.delete = function() {
            if($scope.selectedTenant && $scope.selectedEpg) {
                path = GBPEpgServices.createPathObj($scope.selectedTenant.id, $scope.selectedEpg.id);
                GBPEpgServices.delete(path, function(data){
                    $scope.init();
                }, function(){
                    //TODO: error cbk
                });
            }
        };

        $scope.showForm = function() {
            $scope.epgView = true;
            $scope.reloadNewObj();
            $scope.selectedEpg = null;
        };

        $scope.reloadNewObj = function() {
            $scope.newEpgObj = GBPEpgServices.createObj();
        };

        $scope.reload = function(selectedObj) {
            $scope.selectedEpg = selectedObj;
            if($scope.epgView) {
                $scope.newEpgObj = selectedObj;
            }
            $scope.sendReloadEventFromRoot('GBP_EPG_RELOAD');
        };

        $scope.close = function(){
            $scope.epgView = false;
        };
        $scope.$on('PGN_EDIT_ELEM', function(event){
            if (!event.defaultPrevented) {
                if ( $scope.selectedEpg ) {
                    $scope.epgView = true;
                    $scope.newEpgObj = $scope.selectedEpg;
                }
                event.defaultPrevented = true;
            }
        });

        $scope.$on('GBP_TENANT_RELOAD',function(){
            $scope.init();
        });

        $scope.$on('GBP_CONTRACT_RELOAD',function(){
            loadContracts();
        });
    }]);

    gbp.register.controller('cnsCtrl',['$scope', 'GBPConNamedSelServices', function($scope, GBPConNamedSelServices){
        $scope.list = [];
        $scope.selectedCNS = null;
        $scope.newCNSObj = GBPConNamedSelServices.createObj();
        $scope.view = {
            cns: false,
            edit: false
        };
        $scope.displayLabel = 'name';
        $scope.crudLabel = 'GBP_CNS_LIST';

        //move to separate ctrl \/
        $scope.addNewElem = function(templateObj) {
            if($scope.newCNSObj && $scope.newCNSObj.contract) {
                var objToPush = templateObj || "";
                $scope.newCNSObj.contract.push(objToPush);
            }
        };

        $scope.deleteElemAt = function(index) {
            if($scope.newCNSObj && $scope.newCNSObj.contract) {
                $scope.newCNSObj.contract.splice(index, 1);
            }
        };

        $scope.updateAt = function(index, value) {
            if($scope.newCNSObj && $scope.newCNSObj.contract && $scope.newCNSObj.contract.length >= index) {
                $scope.newCNSObj.contract[index] = value;
            }
        };
        //move to separate ctrl /\

        $scope.init = function() {
            if ($scope.selectedTenant && $scope.selectedEpg) {
                path = GBPConNamedSelServices.createPathObj($scope.selectedTenant.id, $scope.selectedEpg.id);

                GBPConNamedSelServices.load(path, function(data){
                    $scope.list = data;
                }, function(){
                    //TODO: error cbk
                });
            }
        };

        $scope.save = function(){
            path = GBPConNamedSelServices.createPathObj($scope.selectedTenant.id, $scope.selectedEpg.id, $scope.newCNSObj.name);
            GBPConNamedSelServices.send(path, $scope.newCNSObj, function(data){
                $scope.init();
                $scope.view.cns = false;

                $scope.reloadNewObj();
            }, function(){
                //TODO: error cbk
            });
        };

        $scope.delete = function() {
            if($scope.selectedTenant && $scope.selectedEpg && $scope.selectedCNS) {
                path = GBPConNamedSelServices.createPathObj($scope.selectedTenant.id, $scope.selectedEpg.id, $scope.selectedCNS.name);
                GBPConNamedSelServices.delete(path, function(data){
                    $scope.init();
                }, function(){
                    //TODO: error cbk
                });
            }
        };

        $scope.showForm = function() {
            $scope.reloadNewObj();
            $scope.view.cns = true;
            $scope.view.edit = false;
        };

        $scope.reloadNewObj = function() {
            $scope.newCNSObj = GBPConNamedSelServices.createObj();
        };

        $scope.reload = function(selectedObj) {
            $scope.selectedCNS = selectedObj;
            if($scope.view.cns) {
                $scope.newCNSObj = selectedObj;
            }
        };

        $scope.close = function(){
            $scope.view.cns = false;
            $scope.view.edit = false;
        };

        $scope.$on('PGN_EDIT_ELEM', function(event){
            if (!event.defaultPrevented) {
                if ( $scope.selectedEpg ) {
                    $scope.view.cns = true;
                    $scope.view.edit = true;
                    $scope.newCNSObj = $scope.selectedCNS;
                }
                event.defaultPrevented = true;
            }
        });

        $scope.$on('GBP_EPG_RELOAD',function(){
            $scope.init();
        });
    }]);

    gbp.register.controller('pnsCtrl',['$scope', 'GBPProNamedSelServices', function($scope, GBPProNamedSelServices){
        $scope.list = [];
        $scope.selectedPNS = null;
        $scope.newPNSObj = GBPProNamedSelServices.createObj();
        $scope.displayLabel = 'name';
        $scope.crudLabel = 'GBP_PNS_LIST';
        $scope.view = {
            pns: false,
            edit: false
        };

        //move to separate ctrl \/
        $scope.addNewElem = function(templateObj) {
            if($scope.newPNSObj && $scope.newPNSObj.contract) {
                var objToPush = templateObj || "";
                $scope.newPNSObj.contract.push(objToPush);
            }
        };

        $scope.deleteElemAt = function(index) {
            if($scope.newPNSObj && $scope.newPNSObj.contract) {
                $scope.newPNSObj.contract.splice(index, 1);
            }
        };

        $scope.updateAt = function(index, value) {
            if($scope.newPNSObj && $scope.newPNSObj.contract && $scope.newPNSObj.contract.length >= index) {
                $scope.newPNSObj.contract[index] = value;
            }
        };
        //move to separate ctrl /\

        $scope.init = function() {
            if ($scope.selectedTenant && $scope.selectedEpg) {
                path = GBPProNamedSelServices.createPathObj($scope.selectedTenant.id, $scope.selectedEpg.id);
                
                GBPProNamedSelServices.load(path, function(data){
                    $scope.list = data;
                }, function(){
                    //TODO: error cbk
                });
            }
        };

        $scope.save = function(){
            path = GBPProNamedSelServices.createPathObj($scope.selectedTenant.id, $scope.selectedEpg.id, $scope.newPNSObj.name);
            GBPProNamedSelServices.send(path, $scope.newPNSObj, function(data){
                $scope.init();
                $scope.view.pns = false;
                $scope.reloadNewObj();
            }, function(){
                //TODO: error cbk
            });
        };

        $scope.delete = function() {
            if($scope.selectedTenant && $scope.selectedEpg && $scope.selectedPNS) {
                path = GBPProNamedSelServices.createPathObj($scope.selectedTenant.id, $scope.selectedEpg.id, $scope.selectedPNS.name);
                GBPProNamedSelServices.delete(path, function(data){
                    $scope.init();
                }, function(){
                    //TODO: error cbk
                });
            }
        };

        $scope.showForm = function() {
            $scope.reloadNewObj();
            $scope.view.pns = true;
            $scope.view.edit = false;
        };

        $scope.reloadNewObj = function() {
            $scope.newPNSObj = GBPProNamedSelServices.createObj();
        };

        $scope.reload = function(selectedObj) {
            $scope.selectedPNS = selectedObj;
            if($scope.view.pns) {
                $scope.newPNSObj = selectedObj;
            }
        };

        $scope.close = function(){
            $scope.view.pns = false;
            $scope.view.edit = false;
        };
        $scope.$on('PGN_EDIT_ELEM', function(event){
            if (!event.defaultPrevented) {
                if ( $scope.selectedEpg ) {
                    $scope.view.pns = true;
                    $scope.view.edit = true;
                    $scope.newPNSObj = $scope.selectedPNS;
                }
                event.defaultPrevented = true;
            }
        });

        $scope.$on('GBP_EPG_RELOAD',function(){
            $scope.init();
        });
    }]);

    gbp.register.controller('l2FloodCtrl', ['$scope', 'GBPL2FloodDomainServices', 'GBPL2BridgeDomainServices', '$filter', function($scope, GBPL2FloodDomainServices, GBPL2BridgeDomainServices, $filter){ 
        $scope.list = [];
        $scope.l2FloodView = false;
        $scope.selectedL2Flood = null;
        $scope.newL2FloodObj = GBPL2FloodDomainServices.createObj();
        $scope.displayLabel = ['name', 'id'];
        $scope.l2BridgeList = [];
        $scope.crudLabel = 'GBP_L2FLOOD_LIST';


        var path = null,
            mandatoryProperties = ['name'];

        var loadL2BridgeList = function() {
            GBPL2BridgeDomainServices.load(GBPL2BridgeDomainServices.createPathObj($scope.selectedTenant.id), function(data){
                $scope.l2BridgeList = data;
            }, function(){

            });
        };

        $scope.init = function() {
            if ( $scope.selectedTenant ) {
                path = GBPL2FloodDomainServices.createPathObj($scope.selectedTenant.id);
                
                GBPL2FloodDomainServices.load(path, function(data){
                    $scope.list = data;
                    // clear objects
                    $scope.newL2FloodObj = GBPL2FloodDomainServices.createObj();
                    $scope.selectedL2Flood = null;
                }, function(){

                });

                loadL2BridgeList();
            }
        };

        $scope.save = function(){
            var resp = $scope.validateMandatory($scope.newL2FloodObj, mandatoryProperties);
            if(resp.status){
                path = GBPL2FloodDomainServices.createPathObj($scope.selectedTenant.id, $scope.newL2FloodObj.id);
                GBPL2FloodDomainServices.send(path, $scope.newL2FloodObj, function(data){
                    $scope.init();
                    $scope.l2FloodView = false;
                    $scope.sendReloadEventFromRoot('GBP_L2FLOOD_RELOAD');
                }, function(){
                    //TODO: error cbk
                });
            }else{
                alert($filter('translate')('GBP_MANDATORY_NOT_FILLED')+': '+resp.notFilledProps.join(', '));
            }
        };

        $scope.delete = function() {
            if($scope.selectedTenant && $scope.selectedL2Flood) {
                path = GBPL2FloodDomainServices.createPathObj($scope.selectedTenant.id, $scope.selectedL2Flood.id);
                GBPL2FloodDomainServices.delete(path, function(data){
                    $scope.init();
                    $scope.l2FloodView = false;
                    $scope.sendReloadEventFromRoot('GBP_L2FLOOD_RELOAD');
                }, function(){
                    //TODO: error cbk
                });
            }
        };

        $scope.reload = function(selectedObj) {
            $scope.selectedL2Flood = selectedObj;
            if ($scope.l2FloodView) {
                $scope.newL2FloodObj = selectedObj;
            }
            $scope.sendReloadEventFromRoot('GBP_L2FLOOD_RELOAD');
        };

        $scope.showForm = function() {
            $scope.newL2FloodObj = GBPL2FloodDomainServices.createObj();
            $scope.selectedL2Flood = null;
            $scope.l2FloodView = true;
        };

        $scope.close = function(){
            $scope.l2FloodView = false;
        };

        $scope.$on('PGN_EDIT_ELEM', function(event){
            if (!event.defaultPrevented) {
                if ( $scope.selectedL2Flood ) {
                    $scope.l2FloodView = true;
                    $scope.newL2FloodObj = $scope.selectedL2Flood;
                }
                event.defaultPrevented = true;
            }
        });

        $scope.$on('GBP_TENANT_RELOAD',function(){
            $scope.init();
        });

        $scope.$on('GBP_L2BRIDGE_RELOAD',function(){
            loadL2BridgeList();
        });
    }]);

    gbp.register.controller('l2BridgeCtrl', ['$scope', 'GBPL2BridgeDomainServices', 'GBPL3ContextServices', '$filter', function($scope, GBPL2BridgeDomainServices, GBPL3ContextServices, $filter){ 
        $scope.list = [];
        $scope.l2BridgeView = false;
        $scope.selectedL2Bridge = null;
        $scope.newL2BridgeObj = GBPL2BridgeDomainServices.createObj();
        $scope.displayLabel = ['name', 'id'];
        $scope.l3ContextList = [];
        $scope.crudLabel = 'GBP_L2BRIDGE_LIST';


        var path = null,
            mandatoryProperties = ['name'];

        var loadL3ContextList = function() {
            GBPL3ContextServices.load(GBPL3ContextServices.createPathObj($scope.selectedTenant.id), function(data){
                $scope.l3ContextList = data;
                //$scope.$broadcast('GBP_L2BRIDGE_RELOAD');
            }, function(){

            });
        };

        $scope.init = function() {
            if ( $scope.selectedTenant ) {
                path = GBPL2BridgeDomainServices.createPathObj($scope.selectedTenant.id);
                
                GBPL2BridgeDomainServices.load(path, function(data){
                    $scope.list = data;
                    $scope.newL2BridgeObj = GBPL2BridgeDomainServices.createObj();
                    $scope.selectedL2Bridge = null;
                    // $scope.$broadcast('GBP_L2BRIDGE_RELOAD');
                }, function(){

                });

                loadL3ContextList();
            }
        };



        $scope.save = function(){
            var resp = $scope.validateMandatory($scope.newL2BridgeObj, mandatoryProperties);
            if(resp.status){
                path = GBPL2BridgeDomainServices.createPathObj($scope.selectedTenant.id, $scope.newL2BridgeObj.id);
                GBPL2BridgeDomainServices.send(path, $scope.newL2BridgeObj, function(data){
                    $scope.init();
                    $scope.l2BridgeView = false;
                    $scope.sendReloadEventFromRoot('GBP_L2BRIDGE_RELOAD');
                }, function(){
                    //TODO: error cbk
                });
            }else{
                alert($filter('translate')('GBP_MANDATORY_NOT_FILLED')+': '+resp.notFilledProps.join(', '));
            }
        };

        $scope.delete = function() {
            if($scope.selectedTenant && $scope.selectedL2Bridge) {
                path = GBPL2BridgeDomainServices.createPathObj($scope.selectedTenant.id, $scope.selectedL2Bridge.id);
                GBPL2BridgeDomainServices.delete(path, function(data){
                    $scope.init();
                    $scope.l2BridgeView = false;
                    $scope.sendReloadEventFromRoot('GBP_L2BRIDGE_RELOAD');
                }, function(){
                    //TODO: error cbk
                });
            }
        };

        $scope.reload = function(selectedObj) {
            $scope.selectedL2Bridge = selectedObj;
            if ($scope.l2BridgeView) {
                $scope.newL2BridgeObj = selectedObj;
            }
            $scope.sendReloadEventFromRoot('GBP_L2BRIDGE_RELOAD');
        };

        $scope.showForm = function() {
            $scope.newL2BridgeObj = GBPL2BridgeDomainServices.createObj();
            $scope.selectedL2Bridge = null;
            $scope.l2BridgeView = true;
        };

        $scope.close = function(){
            $scope.l2BridgeView = false;
        };

        $scope.$on('PGN_EDIT_ELEM', function(event){
            if (!event.defaultPrevented) {
                if ( $scope.selectedL2Bridge ) {
                    $scope.l2BridgeView = true;
                    $scope.newL2BridgeObj = $scope.selectedL2Bridge;
                }
                event.defaultPrevented = true;
            }
        });

        $scope.$on('GBP_TENANT_RELOAD',function(){
            $scope.init();
        });

        $scope.$on('GBP_L3CONTEXT_RELOAD',function(){
            loadL3ContextList();
        });
    }]);

    gbp.register.controller('l3ContextCtrl', ['$scope', 'GBPL3ContextServices', '$filter', function($scope, GBPL3ContextServices, $filter){ //GBPContractServices
        $scope.list = [];
        $scope.l3ContextView = false;
        $scope.selectedL3Context = null;
        $scope.newL3ContextObj = GBPL3ContextServices.createObj();
        $scope.displayLabel = ['name', 'id'];
        $scope.crudLabel = 'GBP_L3CONTEXT_LIST';

        var path = null,
            mandatoryProperties = ['name'];

        $scope.init = function() {
            if ( $scope.selectedTenant ) {
                path = GBPL3ContextServices.createPathObj($scope.selectedTenant.id);
                
                GBPL3ContextServices.load(path, function(data){
                    $scope.list = data;
                    $scope.newL3ContextObj = GBPL3ContextServices.createObj();
                    $scope.selectedL3Context = null;
                }, function(){

                });
            }
        };

        $scope.save = function(){
            var resp = $scope.validateMandatory($scope.newL3ContextObj, mandatoryProperties);
            if(resp.status){
                path = GBPL3ContextServices.createPathObj($scope.selectedTenant.id, $scope.newL3ContextObj.id);
                GBPL3ContextServices.send(path, $scope.newL3ContextObj, function(data){
                    $scope.init();
                    $scope.l3ContextView = false;
                    $scope.sendReloadEventFromRoot('GBP_L3CONTEXT_RELOAD');
                }, function(){
                    //TODO: error cbk
                });
            }else{
                alert($filter('translate')('GBP_MANDATORY_NOT_FILLED')+': '+resp.notFilledProps.join(', '));
            }
        };

        $scope.delete = function() {
            if($scope.selectedTenant && $scope.selectedL3Context) {
                path = GBPL3ContextServices.createPathObj($scope.selectedTenant.id, $scope.selectedL3Context.id);
                GBPL3ContextServices.delete(path, function(data){
                    $scope.init();
                    $scope.l3ContextView = false;
                    $scope.sendReloadEventFromRoot('GBP_L3CONTEXT_RELOAD');
                }, function(){
                    //TODO: error cbk
                });
            }
        };

        $scope.reload = function(selectedObj) {
            $scope.selectedL3Context = selectedObj;
            if($scope.l3ContextView) {
                $scope.newL3ContextObj = selectedObj;
            }
            $scope.sendReloadEventFromRoot('GBP_L3CONTEXT_RELOAD');
        };

        $scope.showForm = function() {
            $scope.newL3ContextObj = GBPL3ContextServices.createObj();
            $scope.selectedL3Context = null;
            $scope.l3ContextView = true;
        };

        $scope.close = function(){
            $scope.l3ContextView = false;
        };

        $scope.$on('PGN_EDIT_ELEM', function(event){
            if (!event.defaultPrevented) {
                if ( $scope.selectedL3Context ) {
                    $scope.l3ContextView = true;
                    $scope.newL3ContextObj = $scope.selectedL3Context;
                }
                event.defaultPrevented = true;
            }
        });

        $scope.$on('GBP_TENANT_RELOAD',function(){
            $scope.init();
        });
    }]);

    gbp.register.controller('subnetCtrl', ['$scope', 'GBPSubnetServices', 'GBPL2FloodDomainServices', 'GBPL2BridgeDomainServices', 'GBPL3ContextServices', '$filter', function($scope, GBPSubnetServices, GBPL2FloodDomainServices, GBPL2BridgeDomainServices, GBPL3ContextServices, $filter){ 
        $scope.list = [];
        $scope.subnetView = false;
        $scope.selectedSubnet = null;
        $scope.newSubnetObj = GBPSubnetServices.createObj();
        $scope.displayLabel = ['name', 'id'];
        $scope.l2L3List = [];
        $scope.crudLabel = 'GBP_SUBNET_LIST';


        var path = null,
            mandatoryProperties = ['name'];

        var loadL2L3List = function() {
            $scope.l2L3List = [];

            GBPL3ContextServices.load(GBPL3ContextServices.createPathObj($scope.selectedTenant.id), function(l3ContextData){
                angular.forEach(l3ContextData, function(l3ContextItem) {
                     $scope.l2L3List.push(l3ContextItem);
                });
            }, function(){

            });

            GBPL2FloodDomainServices.load(GBPL2FloodDomainServices.createPathObj($scope.selectedTenant.id), function(l2FloodData){
                angular.forEach(l2FloodData, function(l2FloodItem) {
                     $scope.l2L3List.push(l2FloodItem);
                });
            }, function(){

            });

            GBPL2BridgeDomainServices.load(GBPL2BridgeDomainServices.createPathObj($scope.selectedTenant.id), function(l2BridgeData){
                angular.forEach(l2BridgeData, function(l2BridgeItem) {
                     $scope.l2L3List.push(l2BridgeItem);
                });
            }, function(){

            });
        };

        $scope.init = function() {
            if ( $scope.selectedTenant ) {
                path = GBPSubnetServices.createPathObj($scope.selectedTenant.id);
                
                GBPSubnetServices.load(path, function(data){
                    $scope.list = data;
                    $scope.newSubnetObj = GBPSubnetServices.createObj();
                    $scope.selectedSubnet = null;
                    //$scope.sendReloadEventFromRoot('GBP_L2BRIDGE_RELOAD');
                }, function(){

                });

                loadL2L3List();
            }
        };

        $scope.save = function(){
            var resp = $scope.validateMandatory($scope.newSubnetObj, mandatoryProperties);
            if(resp.status){
                path = GBPSubnetServices.createPathObj($scope.selectedTenant.id, $scope.newSubnetObj.id);
                GBPSubnetServices.send(path, $scope.newSubnetObj, function(data){
                    $scope.init();
                    $scope.subnetView = false;
                }, function(){
                    //TODO: error cbk
                });
            }else{
                alert($filter('translate')('GBP_MANDATORY_NOT_FILLED')+': '+resp.notFilledProps.join(', '));
            }
        };

        $scope.delete = function() {
            if($scope.selectedTenant && $scope.selectedSubnet) {
                path = GBPSubnetServices.createPathObj($scope.selectedTenant.id, $scope.selectedSubnet.id);
                GBPSubnetServices.delete(path, function(data){
                    $scope.init();
                    $scope.subnetView = false;
                }, function(){
                    //TODO: error cbk
                });
            }
        };

        $scope.reload = function(selectedObj) {
            $scope.selectedSubnet = selectedObj;
            if($scope.subnetView) {
                $scope.newSubnetObj = selectedObj;
            }
            $scope.sendReloadEventFromRoot('GBP_SUBNET_RELOAD');
        };

        $scope.showForm = function() {
            $scope.newSubnetObj = GBPSubnetServices.createObj();
            $scope.selectedSubnet = null;
            $scope.subnetView = true;
        };

        $scope.close = function(){
            $scope.subnetView = false;
        };

        $scope.$on('PGN_EDIT_ELEM', function(event){
            if (!event.defaultPrevented) {
                if ( $scope.selectedSubnet ) {
                    $scope.subnetView = true;
                    $scope.newSubnetObj = $scope.selectedSubnet;
                }
                event.defaultPrevented = true;
            }
        });

        $scope.$on('GBP_TENANT_RELOAD',function(){
            $scope.init();
        });

        $scope.$on('GBP_GATEWAY_RELOAD',function(){
            $scope.init();
        });
        
        $scope.$on('GBP_L3CONTEXT_RELOAD',function(){
            loadL2L3List();
        });

        $scope.$on('GBP_L2BRIDGE_RELOAD',function(){
            loadL2L3List();
        });

        $scope.$on('GBP_L2FLOOD_RELOAD',function(){
            loadL2L3List();
        });
    }]);

    gbp.register.controller('gatewayCtrl', ['$scope', 'GBPGatewayServices', function($scope, GBPGatewayServices){ 
        $scope.list = [];
        $scope.gatewayView = false;
        $scope.selectedGateway = null;
        $scope.newGatewayObj = GBPGatewayServices.createObj();
        $scope.displayLabel = 'gateway';
        $scope.crudLabel = 'GBP_GATEWAY_LIST';
        $scope.view = {
            gateway: false,
            edit: false
        };


        var path = null;

        $scope.init = function() {
            if ( $scope.selectedTenant && $scope.selectedSubnet ) {
                path = GBPGatewayServices.createPathObj($scope.selectedTenant.id, $scope.selectedSubnet.id);
                
                GBPGatewayServices.load(path, function(data){
                    $scope.list = data;
                    $scope.newGatewayObj = GBPGatewayServices.createObj();
                    $scope.view.gateway = null;
                    $scope.selectedGateway = null;
                }, function(){

                });
            }
        };

        $scope.save = function(){
            path = GBPGatewayServices.createPathObj($scope.selectedTenant.id, $scope.selectedSubnet.id, $scope.newGatewayObj.gateway);
            GBPGatewayServices.send(path, $scope.newGatewayObj, function(data){
                $scope.init();
                $scope.view.gateway = false;
                $scope.sendReloadEventFromRoot('GBP_GATEWAY_RELOAD');
            }, function(){
                //TODO: error cbk
            });
        };

        $scope.delete = function() {
            if($scope.selectedTenant && $scope.selectedSubnet && $scope.selectedGateway) {
                path = GBPGatewayServices.createPathObj($scope.selectedTenant.id, $scope.selectedSubnet.id, $scope.selectedGateway.gateway);
                GBPGatewayServices.delete(path, function(data){
                    $scope.init();
                    $scope.view.gateway = false;
                    $scope.sendReloadEventFromRoot('GBP_GATEWAY_RELOAD');
                }, function(){
                    //TODO: error cbk
                });
            }
        };

        $scope.reload = function(selectedObj) {
            $scope.selectedGateway = selectedObj;
            $scope.newGatewayObj = selectedObj;
            $scope.sendReloadEventFromRoot('GBP_GATEWAY_SET');
        };

        $scope.showForm = function() {
            $scope.newGatewayObj = GBPGatewayServices.createObj();
            $scope.view.gateway = true;
            $scope.view.edit = false;
        };

        $scope.close = function(){
            $scope.view.gateway = false;
        };

        $scope.$on('PGN_EDIT_ELEM', function(event){
            if (!event.defaultPrevented) {
                if ( $scope.selectedGateway ) {
                    $scope.view.gateway = true;
                    $scope.view.edit = true;
                    $scope.newGatewayObj = $scope.selectedGateway;
                }
                event.defaultPrevented = true;
            }
        });

        $scope.$on('GBP_SUBNET_RELOAD',function(){
            $scope.init();
        });

        $scope.$on('GBP_PREFIX_RELOAD',function(){
            $scope.init();
        });
    }]);

    gbp.register.controller('prefixCtrl', ['$scope', 'GBPPrefixServices', function($scope, GBPPrefixServices){ 
        $scope.list = [];
        $scope.selectedPrefix = null;
        $scope.newPrefixObj = GBPPrefixServices.createObj();
        $scope.displayLabel = 'prefix';
        $scope.crudLabel = 'GBP_PREFIX_LIST';
        $scope.view = {
            prefix: false,
            edit: false
        };


        var path = null;

        $scope.init = function() {
            if ( $scope.selectedTenant && $scope.selectedSubnet && $scope.selectedGateway) {
                path = GBPPrefixServices.createPathObj($scope.selectedTenant.id, $scope.selectedSubnet.id, $scope.selectedGateway.gateway);
                
                GBPPrefixServices.load(path, function(data){
                    $scope.list = data;
                    $scope.newPrefixObj = GBPSubnetServices.createObj();
                    $scope.view.prefix = null;
                    $scope.selectedPrefix = null;
                }, function(){

                });
            }
        };

        $scope.save = function(){
            path = GBPPrefixServices.createPathObj($scope.selectedTenant.id, $scope.selectedSubnet.id, $scope.selectedGateway.gateway, $scope.newPrefixObj.prefix);
            GBPPrefixServices.send(path, $scope.newPrefixObj, function(data){
                $scope.init();
                $scope.view.prefix = false;
                $scope.sendReloadEventFromRoot('GBP_PREFIX_RELOAD');
            }, function(){
                //TODO: error cbk
            });
        };

        $scope.delete = function() {
            path = GBPPrefixServices.createPathObj($scope.selectedTenant.id, $scope.selectedSubnet.id, $scope.selectedGateway.gateway, $scope.selectedPrefix.prefix);
            GBPPrefixServices.delete(path, function(data){
                $scope.init();
                $scope.view.prefix = false;
                $scope.sendReloadEventFromRoot('GBP_PREFIX_RELOAD');
            }, function(){
                //TODO: error cbk
            });
        };

        $scope.reload = function(selectedObj) {
            $scope.selectedPrefix = selectedObj;
            $scope.newPrefixObj = selectedObj;
        };

        $scope.showForm = function() {
            $scope.newPrefixObj = GBPPrefixServices.createObj();
            $scope.view.prefix = true;
            $scope.view.edit = false;
        };

        $scope.close = function(){
            $scope.view.prefix = false;
        };

        $scope.$on('PGN_EDIT_ELEM', function(event){
            if (!event.defaultPrevented) {
                if ( $scope.selectedPrefix ) {
                    $scope.view.prefix = true;
                    $scope.view.edit = true;
                    $scope.newPrefixObj = $scope.selectedPrefix;
                }
                event.defaultPrevented = true;
            }
        });

        $scope.$on('GBP_GATEWAY_SET',function(){
            $scope.init();
        });
    }]);

    gbp.register.controller('renderersCtrl', ['$scope', 'GPBServices', function($scope, GPBServices){ //GBPContractServices
        $scope.classifierDefinitions = [];
        $scope.actionDefinitions = [];

        //reload on event?

        var loadDefinitions = function() {
            GPBServices.getDefinitions(function(classifierDefs, actionDefs) {
                $scope.classifierDefinitions = classifierDefs;
                $scope.actionDefinitions = actionDefs;
            });
        };

        loadDefinitions();
    }]);

    gbp.register.controller('paramCtrl', ['$scope', 'GPBServices', function($scope, GPBServices){
        $scope.value = null;

        $scope.init = function(param, paramValues) {
            $scope.parameter = param;

            if(paramValues) {
                paramValues.forEach(function(p) {
                    if($scope.parameter.name === p.name) {
                        $scope.value = GPBServices.getInstanceParamValue(p);
                    }
                });
            }
        };

        $scope.$on('GBP_SAVE_PARAM', function(event){
            if($scope.value !== '' && $scope.value !== null) {
                $scope.addParam($scope.parameter.name, $scope.parameter.type, $scope.value);
            }
        });

        $scope.$on('GBP_SET_PARAM_VALUE', function(event, name, intVal, strVal) {
            console.info($scope.parameter, ' got GBP_SET_PARAM_VALUE', name, intVal, strVal, event);
            
        });
    }]);

    gbp.register.controller('classifiersCtrl', ['$scope', 'GBPClassifierInstanceServices', 'GPBServices', '$filter',
        function($scope, GBPClassifierInstanceServices, GPBServices, $filter){
        $scope.list = [];
        $scope.classifiersView = false;
        $scope.displayLabel = 'name';
        $scope.selectedClassifier = null;
        $scope.crudLabel = 'GBP_CLASSIFIERS';
        $scope.newClassifierObj = GBPClassifierInstanceServices.createObj();
        $scope.edit = false;

        var mandatoryProperties = ['name'];

        $scope.getDefinitionObjParams = function(id){
            return GPBServices.getDefinitionObjParams($scope.classifierDefinitions, id);
        };

        $scope.addParam = function(name, type, value) {
            $scope.newClassifierObj['parameter-value'].push(GPBServices.createParamObj(name, type, value));
        };

        var saveParams = function() {
            $scope.newClassifierObj['parameter-value'] = [];
            $scope.$broadcast('GBP_SAVE_PARAM');
        };


        $scope.init = function() {
            if ( $scope.selectedTenant ) {
                path = GBPClassifierInstanceServices.createPathObj($scope.selectedTenant.id);
                GBPClassifierInstanceServices.load(path, function(data){
                    $scope.list = data;
                }, function(){
                    //TODO: error cbk
                });
            }
        };

        $scope.save = function(){
            var resp = $scope.validateMandatory($scope.newClassifierObj, mandatoryProperties);
            if(resp.status){
                path = GBPClassifierInstanceServices.createPathObj($scope.selectedTenant.id, $scope.newClassifierObj.name);
                saveParams();

                GBPClassifierInstanceServices.send(path, $scope.newClassifierObj, function(data){
                    $scope.init();
                    $scope.classifiersView = false;
                $scope.sendReloadEventFromRoot('GBP_CLASSIFIER_INSTANCE_RELOAD');
                }, function(){
                    //TODO: error cbk
                });
            }else{
                alert($filter('translate')('GBP_MANDATORY_NOT_FILLED')+': '+resp.notFilledProps.join(', '));
            }
        };

        $scope.showForm = function() {
            $scope.newClassifierObj = GBPClassifierInstanceServices.createObj();
            $scope.selectedClassifier = null;
            $scope.classifiersView = true;
            $scope.edit = false;
        };

        $scope.reload = function(selectedObj){
            $scope.selectedClassifier = selectedObj;
            if($scope.classifiersView) {
                $scope.newClassifierObj = selectedObj;
            }
            $scope.sendReloadEventFromRoot('GBP_CLASSIFIER_INSTANCE_RELOAD');
        };

        $scope.close = function(){
            $scope.classifiersView = false;
            $scope.edit = false;
        };

        $scope.$on('PGN_EDIT_ELEM', function(event){
            if (!event.defaultPrevented) {
                if ( $scope.selectedClassifier ) {
                    $scope.classifiersView = true;
                    $scope.newClassifierObj = $scope.selectedClassifier;
                    $scope.edit = true;
                }
                event.defaultPrevented = true;
            }
        });

        $scope.delete = function(){
            path = GBPClassifierInstanceServices.createPathObj($scope.selectedTenant.id, $scope.selectedClassifier.name);
            GBPClassifierInstanceServices.delete(path, function(data){
                $scope.init();
                $scope.classifiersView = false;
                $scope.sendReloadEventFromRoot('GBP_CLASSIFIER_INSTANCE_RELOAD');
            }, function(){
                //TODO: error cbk
            });
        };

        $scope.$on('GBP_TENANT_RELOAD',function(){
            $scope.init();
        });
    }]);

    gbp.register.controller('actionsCtrl', ['$scope', 'GBPActionInstanceServices', 'GPBServices', '$filter',
        function($scope, GBPActionInstanceServices, GPBServices, $filter){
        $scope.list = [];
        $scope.actionsView = false;
        $scope.displayLabel = 'name';
        $scope.selectedAction = null;
        $scope.crudLabel = 'GBP_ACTIONS';
        $scope.newActionObj = GBPActionInstanceServices.createObj();
        $scope.edit = false;

        var mandatoryProperties = ['name'];

        $scope.getDefinitionObjParams = function(id){
            return GPBServices.getDefinitionObjParams($scope.actionDefinitions, id);
        };

        $scope.addParam = function(name, type, value) {
            $scope.newActionObj['parameter-value'].push(GPBServices.createParamObj(name, type, value));
        };

        var saveParams = function() {
            $scope.newActionObj['parameter-value'] = [];
            $scope.$broadcast('GBP_SAVE_PARAM');
        };


        $scope.init = function() {
            if ( $scope.selectedTenant ) {
                path = GBPActionInstanceServices.createPathObj($scope.selectedTenant.id);
                GBPActionInstanceServices.load(path, function(data){
                    $scope.list = data;
                }, function(){
                    //TODO: error cbk
                });
            }
        };

        $scope.save = function(){
            var resp = $scope.validateMandatory($scope.newActionObj, mandatoryProperties);
            if(resp.status){
                path = GBPActionInstanceServices.createPathObj($scope.selectedTenant.id, $scope.newActionObj.name);
                saveParams();

                GBPActionInstanceServices.send(path, $scope.newActionObj, function(data){
                    $scope.init();
                    $scope.actionsView = false;
                $scope.sendReloadEventFromRoot('GBP_ACTION_INSTANCE_RELOAD');
                }, function(){
                    //TODO: error cbk
                });
            }else{
                alert($filter('translate')('GBP_MANDATORY_NOT_FILLED')+': '+resp.notFilledProps.join(', '));
            }
        };

        $scope.showForm = function() {
            $scope.newActionObj = GBPActionInstanceServices.createObj();
            $scope.selectedAction = null;
            $scope.actionsView = true;
            $scope.edit = false;
        };

        $scope.reload = function(selectedObj){
            $scope.selectedAction = selectedObj;
            if($scope.actionsView) {
                $scope.newActionObj = selectedObj;
            }
            $scope.sendReloadEventFromRoot('GBP_ACTION_INSTANCE_RELOAD');
        };

        $scope.close = function(){
            $scope.actionsView = false;
            $scope.edit = false;
        };

        $scope.$on('PGN_EDIT_ELEM', function(event){
            if (!event.defaultPrevented) {
                if ( $scope.selectedAction ) {
                    $scope.actionsView = true;
                    $scope.newActionObj = $scope.selectedAction;
                    $scope.edit = true;
                }
                event.defaultPrevented = true;
            }
        });

        $scope.delete = function(){
            path = GBPActionInstanceServices.createPathObj($scope.selectedTenant.id, $scope.selectedAction.name);
            GBPActionInstanceServices.delete(path, function(data){
                $scope.init();
                $scope.actionsView = false;
                $scope.sendReloadEventFromRoot('GBP_ACTION_INSTANCE_RELOAD');
            }, function(){
                //TODO: error cbk
            });
        };

        $scope.$on('GBP_TENANT_RELOAD',function(){
            $scope.init();
        });
    }]);

    gbp.register.controller('endpointCtrl', ['$scope', 'GBPEndpointServices', 'GPBServices', 'GBPL2FloodDomainServices', 'GBPL2BridgeDomainServices', 'GBPL3ContextServices', 'GBPEpgServices', '$filter',
        function($scope, GBPEndpointServices, GPBServices, GBPL2FloodDomainServices, GBPL2BridgeDomainServices, GBPL3ContextServices, GBPEpgServices, $filter){
        $scope.list = [];
        $scope.selectedEndpoint = null;
        $scope.newEndpointObj = GBPEndpointServices.createObj();
        $scope.endpointView = false;
        $scope.displayLabel = function(obj) {
            return obj['mac-address'] + ':' + obj['l2-context'];
        };
        $scope.crudLabel = 'GBP_ENDPOINT_LIST';
        $scope.l2contextOptions = [];
        $scope.l3contextOptions = [];
        $scope.epgOptions = [];

        var path = null,
            mandatoryProperties = [];

        var loadEpgOptions = function() {
            $scope.epgOptions = [];

            path = GBPEpgServices.createPathObj($scope.selectedTenant.id);
            GBPEpgServices.load(path, function(data){
                $scope.epgOptions = data;
            }, function(){
                //TODO: error cbk
            });
        };

        var loadL2ContextOptions = function() {
            $scope.l2contextOptions = [];

            path = GBPL2FloodDomainServices.createPathObj($scope.selectedTenant.id);
                
            GBPL2FloodDomainServices.load(path, function(data){
                $scope.l2contextOptions = $scope.l2contextOptions.concat(data);
            }, function(){

            });

            path = GBPL2BridgeDomainServices.createPathObj($scope.selectedTenant.id);
            GBPL2BridgeDomainServices.load(path, function(data){
                $scope.l2contextOptions = $scope.l2contextOptions.concat(data);
            }, function(){

            });
        };

        var loadL3ContextOptions = function(){
            $scope.l3contextOptions = [];

            GBPL3ContextServices.load(GBPL3ContextServices.createPathObj($scope.selectedTenant.id), function(data){
                $scope.l3contextOptions = data;
            }, function(){

            });
        };
        
        $scope.init = function() {
            if ($scope.selectedTenant) {

                GBPEndpointServices.load(path, function(data){
                    $scope.list = data;
                }, function(){
                    //TODO: error cbk
                });

                loadEpgOptions();
                loadL2ContextOptions();
                loadL3ContextOptions();
            }
        };

        $scope.addNewL3address = function() {
            if($scope.newEndpointObj) {
                if(!$scope.newEndpointObj['l3-address']){
                    $scope.newEndpointObj['l3-address'] = [];
                }
                var objToPush = {'l3-context' : '', 'ip-address' : ''};
                $scope.newEndpointObj['l3-address'].push(objToPush);
            }
        };

        $scope.deleteNewL3address = function(index){
            if($scope.newEndpointObj) {
                $scope.newEndpointObj['l3-address'].splice(index, 1);
            }
        };

        $scope.addNewLeafListEl = function(prop) {
            if($scope.newEndpointObj) {
                if(!$scope.newEndpointObj[prop]){
                    $scope.newEndpointObj[prop] = [];
                }
                var objToPush = "";
                $scope.newEndpointObj[prop].push(objToPush);
            }
        };

        $scope.updateLeafListEl = function(index, value, prop) {
            if($scope.newEndpointObj && $scope.newEndpointObj[prop] && $scope.newEndpointObj[prop].length >= index) {
                $scope.newEndpointObj[prop][index] = value;
            }
        };

        $scope.deleteNewLeafListEl = function(index, prop){
            if($scope.newEndpointObj) {
                $scope.newEndpointObj[prop].splice(index, 1);
            }
        };

        $scope.save = function(){
            var resp = $scope.validateMandatory($scope.newEndpointObj, mandatoryProperties);
            if(resp.status){
                GBPEndpointServices.send(path, $scope.newEndpointObj, function(data){
                    $scope.init();
                    $scope.endpointView = false;
                    $scope.reloadNewObj();
                }, function(){
                    //TODO: error cbk
                });
            }else{
                alert($filter('translate')('GBP_MANDATORY_NOT_FILLED')+': '+resp.notFilledProps.join(', '));
            }
        };

        $scope.delete = function() {
            if($scope.selectedTenant && $scope.selectedEndpoint) {
                GBPEndpointServices.delete(path, $scope.selectedEndpoint, function(data){
                    $scope.init();
                    $scope.endpointView = false;
                }, function(){
                    //TODO: error cbk
                });
            }
        };

        $scope.showForm = function() {
            $scope.endpointView = true;
            $scope.reloadNewObj();
            $scope.selectedEndpoint = null;
        };

        $scope.reloadNewObj = function() {
            $scope.newEndpointObj = GBPEndpointServices.createObj();
        };

        $scope.reload = function(selectedObj) {
            $scope.selectedEndpoint = selectedObj;
            if($scope.endpointView) {
                $scope.newEndpointObj = selectedObj;
            }
        };

        $scope.close = function(){
            $scope.endpointView = false;
        };

        $scope.$on('PGN_EDIT_ELEM', function(event){
            if (!event.defaultPrevented) {
                if ( $scope.selectedEndpoint ) {
                    $scope.endpointView = true;
                    $scope.newEndpointObj = $scope.selectedEndpoint;
                }
                event.defaultPrevented = true;
            }
        });

        $scope.$on('GBP_TENANT_RELOAD',function(){
            $scope.init();
        });

        $scope.$on('GBP_EPG_RELOAD',function(){
            loadEpgOptions();
        });

        $scope.$on('GBP_L2BRIDGE_RELOAD',function(){
            loadL2ContextOptions();
        });

        $scope.$on('GBP_L2FLOOD_RELOAD',function(){
            loadL2ContextOptions();
        });

        $scope.$on('GBP_L3CONTEXT_RELOAD',function(){
            loadL3ContextOptions();
        });
    }]);

    gbp.register.controller('l3EndpointCtrl', ['$scope', 'GBPEndpointL3Services', 'GPBServices', 'GBPEpgServices', 'GBPL3ContextServices', 'GBPL2FloodDomainServices', 'GBPL2BridgeDomainServices', '$filter',
        function($scope, GBPEndpointL3Services, GPBServices, GBPEpgServices, GBPL3ContextServices, GBPL2FloodDomainServices, GBPL2BridgeDomainServices, $filter){
        $scope.list = [];
        $scope.selectedEndpoint = null;
        $scope.newEndpointObj = GBPEndpointL3Services.createObj($scope.selectedTenant ? $scope.selectedTenant.id : null);
        $scope.endpointView = false;
        $scope.displayLabel = function(obj) {
            return obj['ip-prefix'] + ':' + obj['l3-context'];
        };
        $scope.crudLabel = 'GBP_L3_PREFIX_ENDPOINT_LIST';
        $scope.epgOptions = [];
        $scope.l3contextOptions = [];
        $scope.l2contextOptions = [];

        var path = null,
            mandatoryProperties = [];

        var loadEpgOptions = function() {
            $scope.epgOptions = [];

            path = GBPEpgServices.createPathObj($scope.selectedTenant.id);
            GBPEpgServices.load(path, function(data){
                $scope.epgOptions = data;
            }, function(){
                //TODO: error cbk
            });
        };

        var loadL2ContextOptions = function() {
            $scope.l2contextOptions = [];

            path = GBPL2FloodDomainServices.createPathObj($scope.selectedTenant.id);
                
            GBPL2FloodDomainServices.load(path, function(data){
                $scope.l2contextOptions = $scope.l2contextOptions.concat(data);
            }, function(){

            });

            path = GBPL2BridgeDomainServices.createPathObj($scope.selectedTenant.id);
            GBPL2BridgeDomainServices.load(path, function(data){
                $scope.l2contextOptions = $scope.l2contextOptions.concat(data);
            }, function(){

            });
        };

        var loadL3ContextOptions = function(){
            $scope.l3contextOptions = [];

            GBPL3ContextServices.load(GBPL3ContextServices.createPathObj($scope.selectedTenant.id), function(data){
                $scope.l3contextOptions = data;
            }, function(){

            });
        };
        
        $scope.init = function() {
            if ($scope.selectedTenant) {

                GBPEndpointL3Services.load(path, function(data){
                    $scope.list = data;
                }, function(){
                    //TODO: error cbk
                });

                loadEpgOptions();
                loadL2ContextOptions();
                loadL3ContextOptions();
            }
        };

        $scope.addNewL2gateways = function() {
            if($scope.newEndpointObj) {
                if(!$scope.newEndpointObj['endpoint-l2-gateways']){
                    $scope.newEndpointObj['endpoint-l2-gateways'] = [];
                }
                var objToPush = {'l2-context' : '', 'mac-address' : ''};
                $scope.newEndpointObj['endpoint-l2-gateways'].push(objToPush);
            }
        };

        $scope.deleteNewL2gateways = function(index){
            if($scope.newEndpointObj) {
                $scope.newEndpointObj['endpoint-l2-gateways'].splice(index, 1);
            }
        };

        $scope.addNewL3gateways = function() {
            if($scope.newEndpointObj) {
                if(!$scope.newEndpointObj['endpoint-l3-gateways']){
                    $scope.newEndpointObj['endpoint-l3-gateways'] = [];
                }
                var objToPush = {'l3-context' : '', 'ip-address' : ''};
                $scope.newEndpointObj['endpoint-l3-gateways'].push(objToPush);
            }
        };

        $scope.deleteNewL3gateways = function(index){
            if($scope.newEndpointObj) {
                $scope.newEndpointObj['endpoint-l3-gateways'].splice(index, 1);
            }
        };

        $scope.addNewLeafListEl = function(prop) {
            if($scope.newEndpointObj) {
                if(!$scope.newEndpointObj[prop]){
                    $scope.newEndpointObj[prop] = [];
                }
                var objToPush = "";
                $scope.newEndpointObj[prop].push(objToPush);
            }
        };

        $scope.updateLeafListEl = function(index, value, prop) {
            if($scope.newEndpointObj && $scope.newEndpointObj[prop] && $scope.newEndpointObj[prop].length >= index) {
                $scope.newEndpointObj[prop][index] = value;
            }
        };

        $scope.deleteNewLeafListEl = function(index, prop){
            if($scope.newEndpointObj) {
                $scope.newEndpointObj[prop].splice(index, 1);
            }
        };

        $scope.save = function(){
            var resp = $scope.validateMandatory($scope.newEndpointObj, mandatoryProperties);
            if(resp.status){
                GBPEndpointL3Services.send(path, $scope.newEndpointObj, function(data){
                    $scope.init();
                    $scope.endpointView = false;
                    $scope.reloadNewObj();
                }, function(){
                    //TODO: error cbk
                });
            }else{
                alert($filter('translate')('GBP_MANDATORY_NOT_FILLED')+': '+resp.notFilledProps.join(', '));
            }
        };

        $scope.delete = function() {
            if($scope.selectedTenant && $scope.selectedEndpoint) {
                GBPEndpointL3Services.delete(path, $scope.selectedEndpoint, function(data){
                    $scope.init();
                }, function(){
                    //TODO: error cbk
                });
            }
        };

        $scope.showForm = function() {
            $scope.endpointView = true;
            $scope.reloadNewObj();
            $scope.selectedEndpoint = null;
        };

        $scope.reloadNewObj = function() {
            $scope.newEndpointObj = GBPEndpointL3Services.createObj($scope.selectedTenant.id);
        };

        $scope.reload = function(selectedObj) {
            $scope.selectedEndpoint = selectedObj;
            if($scope.endpointView) {
                $scope.newEndpointObj = selectedObj;
            }
        };

        $scope.close = function(){
            $scope.endpointView = false;
        };

        $scope.$on('PGN_EDIT_ELEM', function(event){
            if (!event.defaultPrevented) {
                if ( $scope.selectedEndpoint ) {
                    $scope.endpointView = true;
                    $scope.newEndpointObj = $scope.selectedEndpoint;
                }
                event.defaultPrevented = true;
            }
        });

        $scope.$on('GBP_TENANT_RELOAD',function(){
            $scope.init();
        });

        $scope.$on('GBP_EPG_RELOAD',function(){
            loadEpgOptions();
        });

        $scope.$on('GBP_L2BRIDGE_RELOAD',function(){
            loadL2ContextOptions();
        });

        $scope.$on('GBP_L2FLOOD_RELOAD',function(){
            loadL2ContextOptions();
        });

        $scope.$on('GBP_L3CONTEXT_RELOAD',function(){
            loadL3ContextOptions();
        });
    }]);

});


