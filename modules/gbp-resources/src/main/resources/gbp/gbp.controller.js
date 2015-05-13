var modules = ['app/gbp/gbp.module',
               'app/gbp/gbp.services'
               ];


define(modules, function(gbp) {

    gbp.register.controller('gbpCtrl', ['$scope', '$rootScope', '$http', '$timeout', 'PGNServices', 'TopoServices', 'GBPTenantServices', 'GBPConstants', 'DesignGbpFactory',
        function ($scope, $rootScope, $http, $timeout, PGNServices, TopoServices, GBPTenantServices, GBPConstants, DesignGbpFactory) {
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

                DesignGbpFactory.setMainClass();
            };

            $scope.sendReloadEventFromRoot = function(eventName) {
                $scope.$broadcast(eventName);
            };

            $scope.getDisplayLabelsFromCtrl = function(eventName, val) {
                $scope.$broadcast(eventName, val);
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

            $scope.validateForm = function(form) {
                return form.$valid;
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
        $scope.crudLabel = 'Contract list';

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
                angular.copy(selectedObj, $scope.newContractObj);
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
                    angular.copy($scope.selectedContract, $scope.newContractObj);
                }
                event.defaultPrevented = true;
            }
        });

        $scope.$on('GBP_TENANT_RELOAD',function(event){
            $scope.init();
        });

        $scope.$on('GBP_CONTRACTS_LABEL', function(event, obj){
            obj.labels = $scope.displayLabel;
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
        $scope.crudLabel = 'Clause list';

        $scope.subjects = {'options' : [], 'labels' : null};
        $scope.getDisplayLabelsFromCtrl('GBP_SUBJECTS_LABEL', $scope.subjects);

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
            $scope.getDisplayLabelsFromCtrl('GBP_SUBJECTS_LABEL', $scope.subjects);

            GBPSubjectServices.load(path, function(data){
                $scope.subjects.options = data;
            }, function(){
                //TODO: error cbk
            });
        };

        $scope.init = function() {
            if ( $scope.selectedContract ) {
                path = GBPClauseServices.createPathObj($scope.selectedTenant.id, $scope.selectedContract.id);
                
                GBPClauseServices.load(path, function(data){
                    $scope.list = data;
                }, function(){
                    //TODO: error cbk
                });
            }
        };

        $scope.save = function(){
            if($scope.validateForm($scope.clauseForm)){
                path = GBPClauseServices.createPathObj($scope.selectedTenant.id, $scope.selectedContract.id, $scope.newClauseObj.name);
                GBPClauseServices.send(path, $scope.newClauseObj, function(data){
                    $scope.init();
                    $scope.view.clause = false;
                    $scope.reloadNewObj();
                }, function(){
                    //TODO: error cbk
                });
            }
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
                angular.copy(selectedObj, $scope.newClauseObj);
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
                    angular.copy($scope.selectedClause, $scope.newClauseObj);
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
        $scope.crudLabel = 'Subject list';


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
            if($scope.validateForm($scope.subjectForm)){
                path = GBPSubjectServices.createPathObj($scope.selectedTenant.id, $scope.selectedContract.id, $scope.newSubjectObj.name);
                GBPSubjectServices.send(path, $scope.newSubjectObj, function(data){
                    $scope.init();
                    $scope.view.subject = false;
                    $scope.reloadNewObj();
                }, function(){
                    //TODO: error cbk
                });
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
                angular.copy(selectedObj, $scope.newSubjectObj);
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
                    angular.copy($scope.selectedSubject, $scope.newSubjectObj);
                }
                event.defaultPrevented = true;
            }
        });

        $scope.$on('GBP_CONTRACT_RELOAD',function(){
            $scope.init();
        });

        $scope.$on('GBP_SUBJECTS_LABEL', function(event, obj){
            obj.labels = $scope.displayLabel;
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
        $scope.crudLabel = 'Rule list';

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
            if($scope.validateForm($scope.rulesForm)){
                path = GBPRuleServices.createPathObj($scope.selectedTenant.id, $scope.selectedContract.id, $scope.selectedSubject.name, $scope.newRuleObj.name);
                GBPRuleServices.send(path, $scope.newRuleObj, function(data){
                    $scope.init();
                    $scope.view.rule = false;
                    $scope.reloadNewObj();
                }, function(){
                    //TODO: error cbk
                });
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
                angular.copy(selectedObj, $scope.newRuleObj);
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
                    angular.copy($scope.selectedRule, $scope.newRuleObj);
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
        $scope.view = {
            actionRef : false,
            edit : false
        };
        $scope.crudLabel = 'Action ref list';

        $scope.actionInstanceNames = {'options' : [], 'labels' : $scope.displayLabel};

        var path = null,
            mandatoryProperties = ['order'];

        var actionInstanceNamesLoad = function() {
            var actionInstancePath = GBPActionInstanceServices.createPathObj($scope.selectedTenant.id);
            GBPActionInstanceServices.load(actionInstancePath, function(data){
                $scope.actionInstanceNames.options = data;
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
            if($scope.validateForm($scope.actionRefForm)){
                path = GBPActionRefsServices.createPathObj($scope.selectedTenant.id, $scope.selectedContract.id, $scope.selectedSubject.name, $scope.selectedRule.name, $scope.newActionRefObj.name);
                GBPActionRefsServices.send(path, $scope.newActionRefObj, function(data){
                    $scope.init();
                    $scope.view.actionRef = false;
                    $scope.reloadNewObj();
                }, function(){
                    //TODO: error cbk
                });
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
                angular.copy(selectedObj, $scope.newActionRefObj);
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
                    angular.copy($scope.selectedActionRef, $scope.newActionRefObj);
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
        $scope.view = {
            classifierRef : false,
            edit : false
        };

        $scope.instanceNames = {'options' : [], 'labels' : $scope.displayLabel};

        $scope.formDirections = ['in', 'out', 'bidirectional'];
        $scope.formConnectionTracking = ['normal', 'reflexive'];

        $scope.crudLabel = 'Classifier ref list';

        var path = null;

        var instanceNamesLoad = function() {
            var classifierInstancePath = GBPClassifierInstanceServices.createPathObj($scope.selectedTenant.id);
            GBPClassifierInstanceServices.load(classifierInstancePath, function(data){
                $scope.instanceNames.options = data;
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
            if($scope.validateForm($scope.classifierRefForm)){
                path = GBPClassifierRefsServices.createPathObj($scope.selectedTenant.id, $scope.selectedContract.id, $scope.selectedSubject.name, $scope.selectedRule.name, $scope.newClassifierRefObj.name);
                GBPClassifierRefsServices.send(path, $scope.newClassifierRefObj, function(data){
                    $scope.init();
                    $scope.view.classifierRef = false;
                    $scope.reloadNewObj();
                }, function(){
                    //TODO: error cbk
                });
            }
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
                angular.copy(selectedObj, $scope.newClassifierRefObj);
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
                    angular.copy($scope.selectedClassifierRef, $scope.newClassifierRefObj);
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
        $scope.crudLabel = 'Tenants list';

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
            if($scope.validateForm($scope.tenantForm)){
                path = GBPTenantServices.createPathObj($scope.newTenantObj.id);
                GBPTenantServices.send(path, $scope.newTenantObj, function(data){
                    $scope.init();
                    $scope.tenantView = false;
                    $scope.$emit('GBP_GLOBAL_TENANT_RELOAD');
                }, function(){
                    //TODO: error cbk
                });
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
                angular.copy(selectedObj, $scope.newTenantObj);
            }
        };

        $scope.showForm = function() {
            $scope.newTenantObj = GBPTenantServices.createObj();
            $scope.selectedTenantObj = null;
            $scope.tenantView = true;
        };

        $scope.close = function(){
            $scope.tenantView = false;
        };

       $scope.$on('PGN_EDIT_ELEM', function(event){
            if (!event.defaultPrevented) {
                if ( $scope.selectedTenantObj ) {
                    $scope.tenantView = true;
                    angular.copy($scope.selectedTenantObj, $scope.newTenantObj);
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
        $scope.selectedEpg = null;
        $scope.newEpgObj = GBPEpgServices.createObj();
        $scope.epgView = false;
        $scope.displayLabel = ['name', 'id'];
        $scope.crudLabel = 'Group list';

        $scope.igpOpts = ['allow', 'require-contract'];

        $scope.contracts = {'options' : [], 'labels' : null};
        $scope.getDisplayLabelsFromCtrl('GBP_CONTRACTS_LABEL', $scope.contracts);

        $scope.list = [];

        var loadContracts = function() {
            GBPContractServices.load(path, function(data){
                $scope.contracts.options = data;
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
            if($scope.validateForm($scope.epgForm)){
                path = GBPEpgServices.createPathObj($scope.selectedTenant.id, $scope.newEpgObj.id);
                GBPEpgServices.send(path, $scope.newEpgObj, function(data){
                    $scope.init();
                    $scope.epgView = false;
                    $scope.reloadNewObj();
                }, function(){
                    //TODO: error cbk
                });
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
                angular.copy(selectedObj, $scope.newEpgObj);
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
                    angular.copy($scope.selectedEpg, $scope.newEpgObj);
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

        $scope.$on('GBP_EPG_LABEL', function(event, obj){
            obj.labels = $scope.displayLabel;
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
        $scope.crudLabel = 'Consumer named selectors list';

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
            if($scope.validateForm($scope.cnsForm)){
                path = GBPConNamedSelServices.createPathObj($scope.selectedTenant.id, $scope.selectedEpg.id, $scope.newCNSObj.name);
                GBPConNamedSelServices.send(path, $scope.newCNSObj, function(data){
                    $scope.init();
                    $scope.view.cns = false;

                    $scope.reloadNewObj();
                }, function(){
                    //TODO: error cbk
                });
            }
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
            $scope.selectedCNS = null;
            $scope.view.cns = true;
            $scope.view.edit = false;
        };

        $scope.reloadNewObj = function() {
            $scope.newCNSObj = GBPConNamedSelServices.createObj();
        };

        $scope.reload = function(selectedObj) {
            $scope.selectedCNS = selectedObj;
            if($scope.view.cns) {
                angular.copy(selectedObj, $scope.newCNSObj);
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
                    angular.copy($scope.selectedCNS, $scope.newCNSObj);
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
        $scope.crudLabel = 'Provider named selectors list';
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
            if($scope.validateForm($scope.pnsForm)){
                path = GBPProNamedSelServices.createPathObj($scope.selectedTenant.id, $scope.selectedEpg.id, $scope.newPNSObj.name);
                GBPProNamedSelServices.send(path, $scope.newPNSObj, function(data){
                    $scope.init();
                    $scope.view.pns = false;
                    $scope.reloadNewObj();
                }, function(){
                    //TODO: error cbk
                });
            }
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
            $scope.selectedPNS = null;
        };

        $scope.reloadNewObj = function() {
            $scope.newPNSObj = GBPProNamedSelServices.createObj();
        };

        $scope.reload = function(selectedObj) {
            $scope.selectedPNS = selectedObj;
            if($scope.view.pns) {
                angular.copy(selectedObj, $scope.newPNSObj);
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
                    angular.copy($scope.selectedPNS, $scope.newPNSObj);
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
        $scope.crudLabel = 'L2 Flood Domain list';

        $scope.l2bridge = {'options' : [], 'labels' : null};
        $scope.getDisplayLabelsFromCtrl('GBP_L2BRIDGE_LABEL', $scope.l2bridge);

        var path = null;

        var loadL2BridgeList = function() {
            GBPL2BridgeDomainServices.load(GBPL2BridgeDomainServices.createPathObj($scope.selectedTenant.id), function(data){
                $scope.l2bridge.options = data;
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
            if($scope.validateForm($scope.l2FloodForm)){
                path = GBPL2FloodDomainServices.createPathObj($scope.selectedTenant.id, $scope.newL2FloodObj.id);
                GBPL2FloodDomainServices.send(path, $scope.newL2FloodObj, function(data){
                    $scope.init();
                    $scope.l2FloodView = false;
                    $scope.sendReloadEventFromRoot('GBP_L2FLOOD_RELOAD');
                }, function(){
                    //TODO: error cbk
                });
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
                angular.copy(selectedObj, $scope.newL2FloodObj);
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
                    angular.copy($scope.selectedL2Flood, $scope.newL2FloodObj);
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

        $scope.$on('GBP_L2FLOOD_LABEL', function(event, obj){
            obj.labels = $scope.displayLabel;
        });
    }]);

    gbp.register.controller('l2BridgeCtrl', ['$scope', 'GBPL2BridgeDomainServices', 'GBPL3ContextServices', '$filter', function($scope, GBPL2BridgeDomainServices, GBPL3ContextServices, $filter){ 
        $scope.list = [];
        $scope.l2BridgeView = false;
        $scope.selectedL2Bridge = null;
        $scope.newL2BridgeObj = GBPL2BridgeDomainServices.createObj();
        $scope.displayLabel = ['name', 'id'];
        $scope.crudLabel = 'L2 Bridge Domain list';

        $scope.l3context = {'options' : [], 'labels' : null};
        $scope.getDisplayLabelsFromCtrl('GBP_L3CONTEXT_LABEL', $scope.l3context);

        var path = null;

        var loadL3ContextList = function() {
            GBPL3ContextServices.load(GBPL3ContextServices.createPathObj($scope.selectedTenant.id), function(data){
                $scope.l3context.options = data;
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
            if($scope.validateForm($scope.l2BridgeForm)){
                path = GBPL2BridgeDomainServices.createPathObj($scope.selectedTenant.id, $scope.newL2BridgeObj.id);
                GBPL2BridgeDomainServices.send(path, $scope.newL2BridgeObj, function(data){
                    $scope.init();
                    $scope.l2BridgeView = false;
                    $scope.sendReloadEventFromRoot('GBP_L2BRIDGE_RELOAD');
                }, function(){
                    //TODO: error cbk
                });
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
                angular.copy(selectedObj, $scope.newL2BridgeObj);
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
                    angular.copy($scope.selectedL2Bridge, $scope.newL2BridgeObj);
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

        $scope.$on('GBP_L2BRIDGE_LABEL', function(event, obj){
            obj.labels = $scope.displayLabel;
        });
    }]);

    gbp.register.controller('l3ContextCtrl', ['$scope', 'GBPL3ContextServices', '$filter', function($scope, GBPL3ContextServices, $filter){ //GBPContractServices
        $scope.list = [];
        $scope.l3ContextView = false;
        $scope.selectedL3Context = null;
        $scope.newL3ContextObj = GBPL3ContextServices.createObj();
        $scope.displayLabel = ['name', 'id'];
        $scope.crudLabel = 'L3 Context list';

        var path = null;

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
             if($scope.validateForm($scope.l3ContextForm)){
                path = GBPL3ContextServices.createPathObj($scope.selectedTenant.id, $scope.newL3ContextObj.id);
                GBPL3ContextServices.send(path, $scope.newL3ContextObj, function(data){
                    $scope.init();
                    $scope.l3ContextView = false;
                    $scope.sendReloadEventFromRoot('GBP_L3CONTEXT_RELOAD');
                }, function(){
                    //TODO: error cbk
                });
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
                angular.copy(selectedObj, $scope.newL3ContextObj);
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
                    angular.copy($scope.selectedL3Context, $scope.newL3ContextObj);
                }
                event.defaultPrevented = true;
            }
        });

        $scope.$on('GBP_TENANT_RELOAD',function(){
            $scope.init();
        });

        $scope.$on('GBP_L3CONTEXT_LABEL', function(event, obj){
            obj.labels = $scope.displayLabel;
        });
    }]);

    gbp.register.controller('subnetCtrl', ['$scope', 'GBPSubnetServices', 'GBPL2FloodDomainServices', 'GBPL2BridgeDomainServices', 'GBPL3ContextServices', '$filter', function($scope, GBPSubnetServices, GBPL2FloodDomainServices, GBPL2BridgeDomainServices, GBPL3ContextServices, $filter){ 
        $scope.list = [];
        $scope.subnetView = false;
        $scope.selectedSubnet = null;
        $scope.newSubnetObj = GBPSubnetServices.createObj();
        $scope.displayLabel = ['name', 'id'];
        $scope.crudLabel = 'Subnet list';

        $scope.l2L3List = {'options' : [], 'labels' : null};
        $scope.getDisplayLabelsFromCtrl('GBP_L2FLOOD_LABEL', $scope.l2L3List);


        var path = null;

        var loadL2L3List = function() {
            $scope.l2L3List.options = [];

            GBPL3ContextServices.load(GBPL3ContextServices.createPathObj($scope.selectedTenant.id), function(l3ContextData){
                $scope.l2L3List.options = $scope.l2L3List.options.concat(l3ContextData);
            }, function(){

            });

            GBPL2FloodDomainServices.load(GBPL2FloodDomainServices.createPathObj($scope.selectedTenant.id), function(l2FloodData){
                $scope.l2L3List.options = $scope.l2L3List.options.concat(l2FloodData);
            }, function(){

            });

            GBPL2BridgeDomainServices.load(GBPL2BridgeDomainServices.createPathObj($scope.selectedTenant.id), function(l2BridgeData){
                $scope.l2L3List.options = $scope.l2L3List.options.concat(l2BridgeData);
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
           if($scope.validateForm($scope.subnetForm)){
                path = GBPSubnetServices.createPathObj($scope.selectedTenant.id, $scope.newSubnetObj.id);
                GBPSubnetServices.send(path, $scope.newSubnetObj, function(data){
                    $scope.init();
                    $scope.subnetView = false;
                }, function(){
                    //TODO: error cbk
                });
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
                angular.copy(selectedObj, $scope.newSubnetObj);
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
                    angular.copy($scope.selectedSubnet, $scope.newSubnetObj);
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

        $scope.$on('GBP_PREFIX_RELOAD',function(){
            $scope.init();
        });
        
    }]);

    gbp.register.controller('gatewayCtrl', ['$scope', 'GBPGatewayServices', function($scope, GBPGatewayServices){ 
        $scope.list = [];
        $scope.gatewayView = false;
        $scope.selectedGateway = null;
        $scope.newGatewayObj = GBPGatewayServices.createObj();
        $scope.displayLabel = 'gateway';
        $scope.crudLabel = 'Gateway list';
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
                    $scope.view.gateway = false;
                    $scope.selectedGateway = null;
                }, function(){

                });
            }
        };

        $scope.save = function(){
            if($scope.validateForm($scope.gatewayForm)){
                path = GBPGatewayServices.createPathObj($scope.selectedTenant.id, $scope.selectedSubnet.id, $scope.newGatewayObj.gateway);
                GBPGatewayServices.send(path, $scope.newGatewayObj, function(data){
                    $scope.init();
                    $scope.view.gateway = false;
                    $scope.sendReloadEventFromRoot('GBP_GATEWAY_RELOAD');
                }, function(){
                    //TODO: error cbk
                });
            }
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
            angular.copy(selectedObj, $scope.newGatewayObj);
            $scope.sendReloadEventFromRoot('GBP_GATEWAY_SET');
        };

        $scope.showForm = function() {
            $scope.newGatewayObj = GBPGatewayServices.createObj();
            $scope.view.gateway = true;
            $scope.view.edit = false;
            $scope.selectedGateway = null;
        };

        $scope.close = function(){
            $scope.view.gateway = false;
        };

        $scope.$on('PGN_EDIT_ELEM', function(event){
            if (!event.defaultPrevented) {
                if ( $scope.selectedGateway ) {
                    $scope.view.gateway = true;
                    $scope.view.edit = true;
                    angular.copy($scope.selectedGateway, $scope.newGatewayObj);
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
        $scope.crudLabel = 'Prefix list';
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
                    $scope.newPrefixObj = GBPPrefixServices.createObj();
                    $scope.view.prefix = false;
                    $scope.selectedPrefix = null;
                }, function(){

                });
            }
        };

        $scope.save = function(){
            if($scope.validateForm($scope.prefixForm)){
                path = GBPPrefixServices.createPathObj($scope.selectedTenant.id, $scope.selectedSubnet.id, $scope.selectedGateway.gateway, $scope.newPrefixObj.prefix);
                GBPPrefixServices.send(path, $scope.newPrefixObj, function(data){
                    $scope.init();
                    $scope.view.prefix = false;
                    $scope.sendReloadEventFromRoot('GBP_PREFIX_RELOAD');
                }, function(){
                    //TODO: error cbk
                });
            }
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
            angular.copy(selectedObj, $scope.newPrefixObj);
        };

        $scope.showForm = function() {
            $scope.newPrefixObj = GBPPrefixServices.createObj();
            $scope.view.prefix = true;
            $scope.view.edit = false;
            $scope.selectedPrefix = null;
        };

        $scope.close = function(){
            $scope.view.prefix = false;
        };

        $scope.$on('PGN_EDIT_ELEM', function(event){
            if (!event.defaultPrevented) {
                if ( $scope.selectedPrefix ) {
                    $scope.view.prefix = true;
                    $scope.view.edit = true;
                    angular.copy($scope.selectedPrefix, $scope.newPrefixObj);
                }
                event.defaultPrevented = true;
            }
        });

        $scope.$on('GBP_GATEWAY_SET',function(){
            $scope.init();
        });
    }]);

    gbp.register.controller('renderersCtrl', ['$scope', 'GPBServices', function($scope, GPBServices){ //GBPContractServices
        $scope.classifierDefinitions = {'options' : [], 'labels' : null};
        $scope.actionDefinitions = {'options' : [], 'labels' : null};

        //reload on event?

        var loadDefinitions = function() {
            GPBServices.getDefinitions(function(classifierDefs, actionDefs) {
                $scope.classifierDefinitions.options = classifierDefs;
                $scope.getDisplayLabelsFromCtrl('GBP_CLASSIFIERS_LABEL', $scope.classifierDefinitions);

                $scope.actionDefinitions.options = actionDefs;
                $scope.getDisplayLabelsFromCtrl('GBP_ACTIONS_LABEL', $scope.actionDefinitions);
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
        $scope.crudLabel = 'Classifiers';
        $scope.newClassifierObj = GBPClassifierInstanceServices.createObj();
        $scope.edit = false;

        var mandatoryProperties = ['name'];

        $scope.getDefinitionObjParams = function(id){
            return GPBServices.getDefinitionObjParams($scope.classifierDefinitions.options, id);
        };

        $scope.reloadDefs = function(){
            $scope.defs = angular.copy($scope.getDefinitionObjParams($scope.newClassifierObj['classifier-definition-id']));
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
                    $scope.reloadDefs();
                }, function(){
                    //TODO: error cbk
                });
            }
        };

        $scope.save = function(){
            if($scope.validateForm($scope.classifierForm)){
                path = GBPClassifierInstanceServices.createPathObj($scope.selectedTenant.id, $scope.newClassifierObj.name);
                saveParams();
                GBPClassifierInstanceServices.send(path, $scope.newClassifierObj, function(data){
                    $scope.init();
                    $scope.classifiersView = false;
                $scope.sendReloadEventFromRoot('GBP_CLASSIFIER_INSTANCE_RELOAD');
                }, function(){
                    //TODO: error cbk
                });
            }
        };

        $scope.showForm = function() {
            $scope.newClassifierObj = GBPClassifierInstanceServices.createObj();
            $scope.selectedClassifier = null;
            $scope.classifiersView = true;
            $scope.edit = false;
            $scope.reloadDefs();
        };

        $scope.reload = function(selectedObj){
            $scope.selectedClassifier = selectedObj;
            if($scope.classifiersView) {
                angular.copy(selectedObj, $scope.newClassifierObj);
            }
            $scope.sendReloadEventFromRoot('GBP_CLASSIFIER_INSTANCE_RELOAD');
            $scope.reloadDefs();
        };

        $scope.close = function(){
            $scope.classifiersView = false;
            $scope.edit = false;
        };

        $scope.$on('PGN_EDIT_ELEM', function(event){
            if (!event.defaultPrevented) {
                if ( $scope.selectedClassifier ) {
                    $scope.classifiersView = true;
                    angular.copy($scope.selectedClassifier, $scope.newClassifierObj);
                    $scope.edit = true;
                    $scope.reloadDefs();
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

        $scope.$on('GBP_CLASSIFIERS_LABEL', function(event, obj){
            obj.labels = $scope.displayLabel;
        });
    }]);

    gbp.register.controller('actionsCtrl', ['$scope', 'GBPActionInstanceServices', 'GPBServices', '$filter',
        function($scope, GBPActionInstanceServices, GPBServices, $filter){
        $scope.list = [];
        $scope.actionsView = false;
        $scope.displayLabel = 'name';
        $scope.selectedAction = null;
        $scope.crudLabel = 'Actions';
        $scope.newActionObj = GBPActionInstanceServices.createObj();
        $scope.edit = false;

        var mandatoryProperties = ['name'];

        $scope.getDefinitionObjParams = function(id){
            return GPBServices.getDefinitionObjParams($scope.actionDefinitions.options, id);
        };

        $scope.reloadDefs = function(){
            $scope.defs = angular.copy($scope.getDefinitionObjParams($scope.newActionObj['action-definition-id']));
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
                    $scope.reloadDefs();
                }, function(){
                    //TODO: error cbk
                });
            }
        };

        $scope.save = function(){
            if($scope.validateForm($scope.actionsForm)){
                path = GBPActionInstanceServices.createPathObj($scope.selectedTenant.id, $scope.newActionObj.name);
                saveParams();

                GBPActionInstanceServices.send(path, $scope.newActionObj, function(data){
                    $scope.init();
                    $scope.actionsView = false;
                $scope.sendReloadEventFromRoot('GBP_ACTION_INSTANCE_RELOAD');
                }, function(){
                    //TODO: error cbk
                });
            }
        };

        $scope.showForm = function() {
            $scope.newActionObj = GBPActionInstanceServices.createObj();
            $scope.selectedAction = null;
            $scope.actionsView = true;
            $scope.edit = false;
            $scope.reloadDefs();
        };

        $scope.reload = function(selectedObj){
            $scope.selectedAction = selectedObj;
            if($scope.actionsView) {
                angular.copy(selectedObj, $scope.newActionObj);
            }
            $scope.sendReloadEventFromRoot('GBP_ACTION_INSTANCE_RELOAD');
            $scope.reloadDefs();
        };

        $scope.close = function(){
            $scope.actionsView = false;
            $scope.edit = false;
        };

        $scope.$on('PGN_EDIT_ELEM', function(event){
            if (!event.defaultPrevented) {
                if ( $scope.selectedAction ) {
                    $scope.actionsView = true;
                    angular.copy($scope.selectedAction, $scope.newActionObj);
                    $scope.edit = true;
                    $scope.reloadDefs();
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

        $scope.$on('GBP_ACTIONS_LABEL', function(event, obj){
            obj.labels = $scope.displayLabel;
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
        $scope.crudLabel = 'Endpoint list';

        $scope.l2context = {'options' : [], 'labels' : null};
        $scope.getDisplayLabelsFromCtrl('GBP_L2FLOOD_LABEL', $scope.l2context);

        $scope.l3context = {'options' : [], 'labels' : null};
        $scope.getDisplayLabelsFromCtrl('GBP_L3CONTEXT_LABEL', $scope.l3context);

        $scope.epg = {'options' : [], 'labels' : null};
        $scope.getDisplayLabelsFromCtrl('GBP_EPG_LABEL', $scope.epg);

        var path = null,
            mandatoryProperties = [];

        var loadEpgOptions = function() {
            $scope.epg.options = [];

            path = GBPEpgServices.createPathObj($scope.selectedTenant.id);
            GBPEpgServices.load(path, function(data){
                $scope.epg.options = data;
            }, function(){
                //TODO: error cbk
            });
        };

        var loadL2ContextOptions = function() {
            $scope.l2context.options = [];

            path = GBPL2FloodDomainServices.createPathObj($scope.selectedTenant.id);
                
            GBPL2FloodDomainServices.load(path, function(data){
                $scope.l2context.options = $scope.l2context.options.concat(data);
            }, function(){

            });

            path = GBPL2BridgeDomainServices.createPathObj($scope.selectedTenant.id);
            GBPL2BridgeDomainServices.load(path, function(data){
                $scope.l2context.options = $scope.l2context.options.concat(data);
            }, function(){

            });
        };

        var loadL3ContextOptions = function(){
            $scope.l3context.options = [];

            GBPL3ContextServices.load(GBPL3ContextServices.createPathObj($scope.selectedTenant.id), function(data){
                $scope.l3context.options = data;
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
            if($scope.validateForm($scope.endpointForm)){
                GBPEndpointServices.send(path, $scope.newEndpointObj, function(data){
                    $scope.init();
                    $scope.endpointView = false;
                    $scope.reloadNewObj();
                }, function(){
                    //TODO: error cbk
                });
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
                angular.copy(selectedObj, $scope.newEndpointObj);
            }
        };

        $scope.close = function(){
            $scope.endpointView = false;
        };

        $scope.$on('PGN_EDIT_ELEM', function(event){
            if (!event.defaultPrevented) {
                if ( $scope.selectedEndpoint ) {
                    $scope.endpointView = true;
                    angular.copy($scope.selectedEndpoint, $scope.newEndpointObj);
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
        $scope.crudLabel = 'L3 Prefix endpoint list';

        $scope.l2context = {'options' : [], 'labels' : null};
        $scope.getDisplayLabelsFromCtrl('GBP_L2FLOOD_LABEL', $scope.l2context);

        $scope.l3context = {'options' : [], 'labels' : null};
        $scope.getDisplayLabelsFromCtrl('GBP_L3CONTEXT_LABEL', $scope.l3context);

        $scope.epg = {'options' : [], 'labels' : null};
        $scope.getDisplayLabelsFromCtrl('GBP_EPG_LABEL', $scope.epg);


        var path = null,
            mandatoryProperties = [];

        var loadEpgOptions = function() {
            $scope.epg.options = [];

            path = GBPEpgServices.createPathObj($scope.selectedTenant.id);
            GBPEpgServices.load(path, function(data){
                $scope.epg.options = data;
            }, function(){
                //TODO: error cbk
            });
        };

        var loadL2ContextOptions = function() {
            $scope.l2context.options = [];

            path = GBPL2FloodDomainServices.createPathObj($scope.selectedTenant.id);
                
            GBPL2FloodDomainServices.load(path, function(data){
                $scope.l2context.options = $scope.l2context.options.concat(data);
            }, function(){

            });

            path = GBPL2BridgeDomainServices.createPathObj($scope.selectedTenant.id);
            GBPL2BridgeDomainServices.load(path, function(data){
                $scope.l2context.options = $scope.l2context.options.concat(data);
            }, function(){

            });
        };

        var loadL3ContextOptions = function(){
            $scope.l3context.options = [];

            GBPL3ContextServices.load(GBPL3ContextServices.createPathObj($scope.selectedTenant.id), function(data){
                $scope.l3context.options = data;
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
            if($scope.validateForm($scope.l3EndpointForm)){
                GBPEndpointL3Services.send(path, $scope.newEndpointObj, function(data){
                    $scope.init();
                    $scope.endpointView = false;
                    $scope.reloadNewObj();
                }, function(){
                    //TODO: error cbk
                });
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
                angular.copy(selectedObj, $scope.newEndpointObj);
            }
        };

        $scope.close = function(){
            $scope.endpointView = false;
        };

        $scope.$on('PGN_EDIT_ELEM', function(event){
            if (!event.defaultPrevented) {
                if ( $scope.selectedEndpoint ) {
                    $scope.endpointView = true;
                    angular.copy($scope.selectedEndpoint, $scope.newEndpointObj);
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


