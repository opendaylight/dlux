define(['app/flow/flows.module', 'jquery', 'footable', 'app/flow/flows.services', 'common/general/common.general.filters'], function(flows, $) {

  flows.register.controller('rootFlowCtrl', function($rootScope, $scope) {
    $rootScope['section_logo'] = 'logo_flow';
    $scope.getText = function(text) { // firefox use textContent while chrome use innerText...
      return text.innerText||text.textContent;
    };
  });

  flows.register.controller('ListAllFlowCtrl',  ['$scope', 'FlowSvc', function ($scope, FlowSvc) {

    $scope.svc = FlowSvc;
    FlowSvc.getAll(null).then(function(data) {
      $scope.data = data;
    });

    $('table').footable().on('click', '.row-delete', function(e) {
      e.preventDefault();
      //get the footable object
      var footable = $('table').data('footable');

      //get the row we are wanting to delete
      var row = $(this).parents('tr:first');
      //delete the row
      $scope.svc.delete($scope.getText(row[0].cells[0]), $scope.getText(row[0].cells[3]), $scope.getText(row[0].cells[4]));
        footable.removeRow(row);
      });

      $scope.$on('ngRepeatFinished', function(ngRepeatFinishedEvent) {
        $('table').trigger('footable_setup_paging');
      });
  }]);

  flows.register.controller('ListNodeFlowCtrl', ['$scope', 'FlowSvc', function ($scope, FlowSvc) {
    FlowSvc.nodeflowUrl(null, $scope.$stateParams.nodeType, $scope.$stateParams.nodeId).getList().then(
      function (data) {
        $scope.flow = data.flowConfig;
        }
    );
  }]);

  flows.register.controller('ShowDetailCtrl', ['$scope', 'FlowSvc', '$stateParams', function ($scope, FlowSvc, $stateParams) {

    FlowSvc.staticFlowUrl(null, $stateParams.nodeType, $stateParams.nodeId, $stateParams.flowName).get().then(
      function (data) {
        $scope.flow = data;
      }
    );

  }]);

  flows.register.controller('EditStateCtrl', ['$scope', 'FlowSvc', '$stateParams', 'SwitchSvc', function ($scope, FlowSvc, $stateParams, SwitchSvc) {

            $scope.actionActive = []; //erase the data (does a prevent default behavior)
  $scope.chosedOptions = []; // use for everything

  $scope.setupActions = function() {

    $.each($scope.chosedOptions, function(i, currentItem) {
      if (currentItem.type !== undefined) {
        $scope.flow.actions.push(currentItem.name + "=" + currentItem.value);
      }
      else {
        $scope.flow.actions.push(currentItem.name);
      }
    });
  };
  $scope.changeOptions = function(item) {
    var index = -1;

    $.each($scope.actionOptions, function(i, currentItem) {
      if (currentItem.displayName == item) {
        index = i;
        return false;
      }
    });

    $scope.actionOptions[index].hidden = true;
    $('#actions')[0].selectedIndex = 0;
    $scope.actionActive = "";
    if ($scope.actionOptions[index].type !== undefined) {
      var value = prompt($scope.actionOptions[index].help);
      $scope.actionOptions[index].value = value;

    }
    $scope.chosedOptions.push($scope.actionOptions[index]);
  $scope.setupActions();

  };
            $scope.$watch('nodeString', function(newValue, oldValue, scope) {
    if (!newValue) {
        return;
      }

      // Split the nodeString which contains nodeType and nodeId, this is used
      // in $scope.submit() to construct the URL for the PUT
      var node  = $scope.nodeString.split('/');

      $scope.flow.node = {type: node[0], id: node[1]};

      /* Set nodeConnectorProperties for the selected node
      *
      * When a node is set the ingressPort should be cleared
      */
      delete $scope.flow.ingressPort;
      delete $scope.connectors;

      SwitchSvc.nodeUrl(null, $scope.flow.node.type, $scope.flow.node.id).get().then(
        function (data) {
          $scope.connectors = data;
        });
    });

            SwitchSvc.nodesUrl().getList().then(
            function (data) {
              $scope.nodes = data;
            }
          );
            $scope.actionOptions = [
        {"displayName": "Please add an action"},
        {"name": "DROP", "displayName": "Drop"},
        {"name": "LOOPBACK", "displayName": "Loopback"},
        {"name": "FLOOD", "displayName": "Flood"},
        {"name": "SW_PATH", "displayName": "Software Path"},
        {"name": "HW_PATH", "displayName": "Hardware Path"},
        {"name": "CONTROLLER", "displayName": "Controller"},
        {"name": "OUTPUT", "displayName": "Add Output Ports"},
        {"name": "SET_VLAN_ID", "displayName": "Set VLAN ID", "help": "Set VLAN ID", "type": "text",
        "placeholder": "VLAN Identification Number"},
        {"name": "SET_VLAN_PCP", "displayName": "Set VLAN Priority", "help": "Set VLAN Priority",
        "type": "text", "placeholder": "VLAN Priority"},
        {"name": "POP_VLAN", "displayName": "Strip VLAN Header"},
        {"name": "SET_DL_SRC", "displayName": "Modify Datalayer Source Address", "help": "Set Source MAC Address",
        "type": "text", "placeholder": "Source MAC Address"},
        {"name": "SET_DL_DST", "displayName": "Modify Datalayer Destination Address", "help": "Set Destination MAC Address",
        "type": "text", "placeholder": "Destination MAC Address"},
        {"name": "SET_NW_SRC", "displayName": "Modify Network Source Address", "help": "Set IP Source Address",
        "type": "text", "placeholder": "Source IP Address"},
        {"name": "SET_NW_DST", "displayName": "Modify Network Destination Address", "help": "Set IP Destination Address",
        "type": "text", "placeholder": "Destination IP Address"},
        {"name": "SET_NW_TOS", "displayName": "Modify ToS Bits", "help": "Set IPv4 ToS", "type": "text",
        "placeholder": "IPv4 ToS"},
        {"name": "SET_TP_SRC", "displayName": "Modify Transport Source Port", "help": "Set Transport Source Port",
        "type": "text", "placeholder": "Transport Source Port"},
        {"name": "SET_TP_DST", "displayName": "Set Transport Destination Port", "type": "text", "help": "Set Transport Destination Port",
          "placeholder": "Transport Destination Port"}];
            FlowSvc.staticFlowUrl(null, $stateParams.nodeType, $stateParams.nodeId, $stateParams.flowName).get().then(
              function (data) {
                $scope.flow = data;
              }
            );
            $scope.setupActions();
  }]);


  flows.register.controller('FlowCreateCtrl', function ($scope, $http, FlowSvc, SwitchSvc, $state) {
    // The current flow
    $scope.flow = {installInHw: true};
    // These are the available actions
    $scope.actionOptions = [
        {"displayName": "Please add an action"},
        {"name": "DROP", "displayName": "Drop"},
        {"name": "LOOPBACK", "displayName": "Loopback"},
        {"name": "FLOOD", "displayName": "Flood"},
        {"name": "SW_PATH", "displayName": "Software Path"},
        {"name": "HW_PATH", "displayName": "Hardware Path"},
        {"name": "CONTROLLER", "displayName": "Controller"},
        {"name": "OUTPUT", "displayName": "Add Output Ports"},
        {"name": "SET_VLAN_ID", "displayName": "Set VLAN ID", "help": "Set VLAN ID", "type": "text",
        "placeholder": "VLAN Identification Number"},
        {"name": "SET_VLAN_PCP", "displayName": "Set VLAN Priority", "help": "Set VLAN Priority",
        "type": "text", "placeholder": "VLAN Priority"},
        {"name": "POP_VLAN", "displayName": "Strip VLAN Header"},
        {"name": "SET_DL_SRC", "displayName": "Modify Datalayer Source Address", "help": "Set Source MAC Address",
        "type": "text", "placeholder": "Source MAC Address"},
        {"name": "SET_DL_DST", "displayName": "Modify Datalayer Destination Address", "help": "Set Destination MAC Address",
        "type": "text", "placeholder": "Destination MAC Address"},
        {"name": "SET_NW_SRC", "displayName": "Modify Network Source Address", "help": "Set IP Source Address",
        "type": "text", "placeholder": "Source IP Address"},
        {"name": "SET_NW_DST", "displayName": "Modify Network Destination Address", "help": "Set IP Destination Address",
        "type": "text", "placeholder": "Destination IP Address"},
        {"name": "SET_NW_TOS", "displayName": "Modify ToS Bits", "help": "Set IPv4 ToS", "type": "text",
        "placeholder": "IPv4 ToS"},
        {"name": "SET_TP_SRC", "displayName": "Modify Transport Source Port", "help": "Set Transport Source Port",
        "type": "text", "placeholder": "Transport Source Port"},
        {"name": "SET_TP_DST", "displayName": "Set Transport Destination Port", "type": "text", "help": "Set Transport Destination Port",
          "placeholder": "Transport Destination Port"}];


  $scope.actionActive = []; //erase the data (does a prevent default behavior)
  $scope.chosedOptions = []; // use for everything
  $scope.flow.actions = []; // used for sending data

  $scope.setupActions = function() {
    $scope.flow.actions = [];
    $.each($scope.chosedOptions, function(i, currentItem) {
      if (currentItem.type !== undefined) {
        $scope.flow.actions.push(currentItem.name + "=" + currentItem.value);
      }
      else {
        $scope.flow.actions.push(currentItem.name);
      }
    });
  };
  $scope.changeOptions = function(item) {
    var index = -1;

    $.each($scope.actionOptions, function(i, currentItem) {
      if (currentItem.displayName == item) {
        index = i;
        return false;
      }
    });

    $scope.actionOptions[index].hidden = true;
    $('#actions')[0].selectedIndex = 0;
    $scope.actionActive = "";
    if ($scope.actionOptions[index].type !== undefined) {
      var value = prompt($scope.actionOptions[index].help);
      $scope.actionOptions[index].value = value;

    }
    $scope.chosedOptions.push($scope.actionOptions[index]);
  $scope.setupActions();

  };
  SwitchSvc.nodesUrl().getList().then(
      function (data) {
        $scope.nodes = data;
      }
    );

  $scope.$watch('nodeString', function(newValue, oldValue, scope) {
    if (!newValue) {
        return;
      }

      // Split the nodeString which contains nodeType and nodeId, this is used
      // in $scope.submit() to construct the URL for the PUT
      var node  = $scope.nodeString.split('/');

      $scope.flow.node = {type: node[0], id: node[1]};

      /* Set nodeConnectorProperties for the selected node
      *
      * When a node is set the ingressPort should be cleared
      */
      delete $scope.flow.ingressPort;
      delete $scope.connectors;

      SwitchSvc.nodeUrl(null, $scope.flow.node.type, $scope.flow.node.id).get().then(
        function (data) {
          $scope.connectors = data;
        });
    });

    $scope.submit = function () {
      FlowSvc.staticFlowUrl(null, $scope.flow.node.type, $scope.flow.node.id, $scope.flow.name)
        .customPUT($scope.flow)
        .then(function (data) {
          $state.transitionTo('flow.index', null, { location: true, inherit: true, relative: $state.$current, notify: true });
        }, function(resp) {
          $scope.error = resp.data;
        });
    };
  });

  // Flow composition view controller
  flows.controller('FlowCompositionCtrl', function ($scope, $state) {
    Array.prototype.removeValue = function(name, value){
    var array = $.map(this, function(v,i){
        return v[name] === value ? null : v;
    });
    this.length = 0; //clear original array
    this.push.apply(this, array); //push all elements except the one we want to delete
  };

  Array.prototype.getIndex = function(name, value){
    var index = -1;
    $.each($scope.actionOptions, function(i, currentItem) {
      if (currentItem[name] == value) {
        index = i;
      }
    });
    return index;
  };


    $('table').footable().on('click', '.row-delete', function(e) {
      e.preventDefault();
      //get the footable object
      var footable = $('table').data('footable');

      //get the row we are wanting to delete
      var row = $(this).parents('tr:first');
      $scope.actionOptions[$scope.actionOptions.getIndex("displayName", $scope.getText(row[0].cells[0]))].hidden = false;

      $scope.chosedOptions.removeValue("displayName", $scope.getText(row[0].cells[0]));
      footable.removeRow(row);
      $scope.setupActions();
      $scope.$apply();
    });
  });
});
