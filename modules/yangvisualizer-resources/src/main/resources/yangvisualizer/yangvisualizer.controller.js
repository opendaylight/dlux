define(['app/yangvisualizer/yangvisualizer.module', 'app/yangvisualizer/yangvisualizer.services', 'common/sigmatopology/sigma.directive'], function(yangvisualizer) {

  yangvisualizer.register.controller('yangvisualizerCtrl', ['$scope', '$rootScope', '$http', 'YangConfigRestangular', 'yangUtils','visualizerUtils', 'DesignVisualizerFactory', 'yvConstants',
    function ($scope, $rootScope, $http, Restangular, yangUtils, visualizerUtils, DesignVisualizerFactory, yvConstants) {
      $rootScope['section_logo'] = 'logo_yangvis';

      $scope.currentPath = './assets/views/yangvisualizerCtrl';
      $scope.topologyData = { nodes: [], edges: []};
      $scope.currentTopologyNode = {};
      $scope.filteredNodes = [];
      $scope.selectedProperty = null;
      $scope.selectedNode = null;
      $scope.isSelectedSpecificType = false;
      $scope.childrenNodes = {
        list: [],
        show: true
      };
      $scope.parentNodes = {
        list: [],
        show: true
      };
      $scope.panel = {
        show: false
      };
      $scope.sigma = null;
      $scope.triggerResizeSigma = false;
      $scope.legend = [];

      $scope.sliderValue = 4;
      $scope.sliderSettings = yvConstants.sliderSettings;
      $scope.clickedNodesHistory = [];

      var lastSelectedNode = null,
          maxLvlToSHow = 4,
          getSlowDownNumFun;

      var processingNodesCallback = function() {
          $scope.status = {
              isWorking: true,
              type: 'warning',
              msg: 'PROCESSING_NODES'
          };
      };

      var processingNodesSuccessCallback = function() {
          $scope.status = {
              type: 'success',
              msg: 'PROCESSING_NODES_SUCCESS'
          };
      };

      var processingNodesErrorCallback = function(e) {
          $scope.status = {
              type: 'danger',
              msg: 'PROCESSING_NODES_ERROR',
              rawMsg: e.toString()
          };
      };

      var expandNodeFunc = function(expandNode, mlts){
        var nodeCounter = 0;
        expandNode.expand = false;
        expandNode.size = expandNode.node.parent !== null ? 7 : 20;
        expandNode.label = expandNode.label.substring(expandNode.label.indexOf(']') + 2);
        expandNode.node.children.forEach(function(child){
          var topoData = visualizerUtils.getTopologyData(child, mlts, false, expandNode.lvl),
              edge,
              position = -1;

          nodeCounter = nodeCounter + topoData.nodes.length;

          topoData.nodes.forEach(function(node){
            position = -position;
            node.x = (expandNode.x + (Math.floor(Math.random() * topoData.nodes.length * 5) + 2)) * position;
            node.y = (expandNode.y + (Math.floor(Math.random() * topoData.nodes.length * 5) + 2)) * position;
            node.size = node.node.children.length && node.expand ? 12 : 7;
            node.parent = child.graphId;
            $scope.sigma.graph.addNode(node);
          });

          edge  = visualizerUtils.getEdge(expandNode.node, child);
          $scope.sigma.graph.addEdge(edge);

          topoData.links.forEach(function(edge){
            $scope.sigma.graph.addEdge(edge);
          });
        });

        var configAtlas = {
            adjustSizes: true,
            // scalingRatio: 10,
            gravity: 1,
            slowDown: getSlowDownNumFun(nodeCounter)
        };

        $scope.sigma.startForceAtlas2(configAtlas);
        $scope.setColorScheme(null, $scope.selectedProperty);

      };

      var collapseNodeFunc = function(collapseNode){
        var nodes = $scope.sigma.graph.nodes(),
            nodeChildren = visualizerUtils.getAllChildrenArray(collapseNode);
            

            if ( nodeChildren.nodesArray.length ) {
              nodeChildren.nodesArray.forEach(function(id){
                $scope.sigma.graph.dropNode(id);
              });
              collapseNode.expand = true;
              collapseNode.label = '['+ nodeChildren.numOfChildren + '] ' + (collapseNode.label.length > 20 ? collapseNode.label.substring(0, 17) + '...' : collapseNode.label);
              collapseNode.size = collapseNode.node.parent !== null ? 12 : 20;
              collapseNode.labelToShow = collapseNode.label;

              var configAtlas = {
                  adjustSizes: true,
                  // scalingRatio: 10,
                  gravity: 1,
                  slowDown: getSlowDownNumFun($scope.sigma.graph.nodes().length)
              };
              $scope.sigma.startForceAtlas2(configAtlas);
            }
            
      };

      $scope.selectedNodeColor = null;

      var selectNode = function(node) {
          var selNode = node,
              edges = $scope.sigma.graph.edges();
          if ( lastSelectedNode ) {
              visualizerUtils.clearEdgeColors();
              lastSelectedNode.color = $scope.selectedNodeColor ? $scope.selectedNodeColor : lastSelectedNode.color;
          }

          $scope.selectedNodeColor = selNode.color;
          selNode.color = '#ffffff';
          lastSelectedNode = selNode;
          $scope.selectedNode = selNode.node;
          $scope.childrenNodes.list = selNode.node.children.length ? selNode.node.children : [];
          $scope.parentNodes.list = visualizerUtils.getParentNodes(selNode.node);
          visualizerUtils.updateSelectedEdgesColors(edges, selNode);
          selNode.size = selNode.size === 100 ? 100 : selNode.node.parent !== null ? 10 : 20;
          $scope.sigma.refresh();
          $scope.$apply();
      };

      var setCameraToNode = function(node){
        $scope.sigma.camera.goTo({
            x: node['read_cam0:x'],
            y: node['read_cam0:y']
          });
      };


      $scope.topologyCustfunc = function(sigmaIstance, getSlowDownNum, dragListener, resize){

        if ( resize && lastSelectedNode !== null ) {
          lastSelectedNode = visualizerUtils.setDefaultSigmaValues(sigmaIstance, lastSelectedNode);
        }

        DesignVisualizerFactory.setMainClass();
        
        $scope.sigma = sigmaIstance;
        getSlowDownNumFun = getSlowDownNum;

        sigmaIstance.bind('clickStage', function(e){
          sigmaIstance.killForceAtlas2();
        });

        sigmaIstance.bind('clickNode', function(e) {
            selectNode(e.data.node);
            $scope.clickedNodesHistory = [e.data.node.id];
        });


        sigmaIstance.bind('doubleClickNode', function(e){
          var selNode = e.data.node;
              
          $scope.sigma.killForceAtlas2();


          setTimeout(function(){
            if ( selNode.expand ) {
              expandNodeFunc(selNode, $scope.sliderValue);
            } else {
              collapseNodeFunc(selNode);
            }
          }, 100);
          
        });

        sigmaIstance.bind('overNode', function(e){
          var node = e.data.node;

          if ( node.labelToShow === null ) {
            node.labelToShow = node.label;
          }
          node.label = node.node.label;
          sigmaIstance.refresh();
        });

        sigmaIstance.bind('outNode', function(e){
          var node = e.data.node;
          
          if ( node.labelToShow !== null ) {
            if ( !node.expand && node.labelToShow.indexOf(']') ) {
              node.label = node.labelToShow.substring(node.labelToShow.indexOf(']') + 1);
            } else {
              node.label = node.labelToShow;
            }
            
          }
          
          node.labelToShow = null;
          sigmaIstance.refresh();
          
        });

        if ( $scope.selectedProperty ){
          $scope.setColorScheme(null, $scope.selectedProperty);
        }
      };


      var updateSliderSettings = function(){
        $scope.sliderSettings.to = visualizerUtils.getMaxNodeLvl($scope.currentTopologyNode);
        $scope.sliderValue = 4;
      };


      $scope.loadController = function(){
        
         processingNodesCallback();

         visualizerUtils.getAllnodes(function(allNodes){
            $scope.filteredNodes = allNodes.filter(function(node){
                    return node.nodeType === 1;
            });
            
            $scope.currentTopologyNode = $scope.filteredNodes[0];
            updateSliderSettings();
            $scope.$broadcast('YV_MODEL_CHANGE');

            processingNodesSuccessCallback();
            $scope.topologyData = visualizerUtils.getTopologyData($scope.currentTopologyNode, $scope.sliderValue);
         }, function(e){
            processingNodesErrorCallback(e);
         });
      };
      
      

      $scope.updateTopologyData = function(mlts, modelChanged){
        if ( modelChanged ) {
          updateSliderSettings();
        }

        $scope.topologyData = visualizerUtils.getTopologyData($scope.currentTopologyNode, mlts !== null ? mlts : $scope.sliderValue, true);
        $scope.selectedNode = null;
        $scope.childrenNodes.list = [];
        $scope.parentNodes.list = [];
        lastSelectedNode = null;
        $scope.expandedNodes = !modelChanged ? $scope.expandedNodes : false;
        $scope.legend = [];
        $scope.clickedNodesHistory = [];

        if ( modelChanged ) {
          $scope.selectedProperty = null;
          $('.yangVisualizerWrapper div.viewNav li span').removeClass('active').parent().eq(0).find('span').addClass('active');
          $scope.$broadcast('YV_MODEL_CHANGE');
        }

        $scope.isSelectedSpecificType = false;
      };

      $scope.triggerExpanded = function(nodes,cbk){
        if($('#graph-container').hasClass('col-md-12')){
            $('#graph-container').removeClass('col-md-12').addClass('col-md-6');
        }else{
            $('#graph-container').removeClass('col-md-6').addClass('col-md-12');
        }

        nodes.show = !nodes.show;

        if ( angular.isFunction(cbk) ){
          cbk();
        }
      };

      $scope.setColorScheme = function(e,property){
        $scope.selectedProperty = property !== 'default' ? property : null;

        if ( e !== null ) {
          $('.yangVisualizerWrapper div.viewNav li span').removeClass('active');
          $(e.target).addClass('active');
        }
        
        $scope.legend = visualizerUtils.setNodesColor(property, $scope.sigma.graph.nodes(), $scope.currentTopologyNode);
        $scope.sigma.refresh();
      };

      $scope.clickLegend = function(value, key){

          if($scope.selectedProperty !== 'default'){
              var wasChanged = false;

              $scope.sigma.graph.nodes().forEach(function(node){
                  if(node.node[$scope.selectedProperty] === key){
                      node.size = 100;
                      wasChanged = true;
                  }else{
                      node.size = 10;
                  }
              });

              if(!wasChanged){
                  $scope.resetSize();
                  $scope.isSelectedSpecificType = false;
              }else{
                  $scope.isSelectedSpecificType = true;
              }

              $scope.sigma.refresh();
          }
      };

      $scope.resetSize = function(){
          $scope.sigma.graph.nodes().forEach(function(node){
              node.size = node.parent === null ? 20 : node.expand ? 12 : 7;
          });

          $scope.isSelectedSpecificType = false;
          $scope.sigma.refresh();
      };

      $scope.triggerResize = function(){
        $scope.triggerResizeSigma = !$scope.triggerResizeSigma;
      };

      var selectGraphNode = function(node) {
          selectNode(node);
          setCameraToNode(node);
      };

      $scope.zoomToNode = function(id){
        var nodeToZoom = visualizerUtils.getNodeById($scope.sigma.graph.nodes(), id);
        $scope.sigma.killForceAtlas2();

        $scope.clickedNodesHistory.push(id);

        if( nodeToZoom ) {
          selectGraphNode(nodeToZoom);
        }
      };

      $scope.backToNode =  function(){
        $scope.clickedNodesHistory.pop();

        if ( $scope.clickedNodesHistory.length ){
          var nodeId = $scope.clickedNodesHistory[$scope.clickedNodesHistory.length - 1],
              nodeObjToBack = visualizerUtils.getNodeById($scope.sigma.graph.nodes(), nodeId);

          if ( nodeObjToBack ) {
            selectGraphNode(nodeObjToBack);
          }
        }
      };

      $scope.expandedNodes = false;
      $scope.expandAllNodes = function(){

        if ( !$scope.expandedNodes ) {
          $scope.updateTopologyData(Infinity);
        } else {
          $scope.updateTopologyData(null);
        }

        $scope.expandedNodes = !$scope.expandedNodes;
      };

      $scope.$on('YV_UPDATE_TOPODATA',function(event, data){
        $scope.topologyData = data.topoData;
        $scope.sliderValue = data.sv;
        console.log('data', data);
      });

      $scope.$on('YV_UPDATE_CTN', function(event, slider){
        visualizerUtils.getTopologyData($scope.currentTopologyNode, slider, true);
      });

      $scope.loadController();

      $scope.__test = {
        processingNodesErrorCallback: processingNodesErrorCallback,
        processingNodesSuccessCallback: processingNodesSuccessCallback,
        processingNodesCallback: processingNodesCallback,
        lastSelectedNode: lastSelectedNode,
        expandNodeFunc: expandNodeFunc,
        collapseNodeFunc: collapseNodeFunc
      };
      
  }]);

  yangvisualizer.register.controller('layoutCtrl',['$scope', '$rootScope','VizualiserLayoutFactory', function($scope, $rootScope, VizualiserLayoutFactory){

    $scope.modelLayout = null;

    var configAtlas = {
      adjustSizes: true,
      gravity: 1
    };

    $scope.setLayout = function(node){
      $scope.modelLayout = VizualiserLayoutFactory.loadLayout($scope.currentTopologyNode);
      console.log('$scope.modelLayout', $scope.modelLayout);
    };

    $scope.saveLayout = function(){
      $scope.modelLayout = VizualiserLayoutFactory.saveLayout($scope.currentTopologyNode, $scope.sigma, $scope.sliderValue, $scope.selectedNodeColor);
      console.log('$scope.modelLayout', $scope.modelLayout);
    };

    $scope.loadLayout = function(){
      $scope.$emit('YV_UPDATE_CTN', $scope.modelLayout['slider-value']);
      var topologyData = VizualiserLayoutFactory.getTopoData($scope.currentTopologyNode, $scope.modelLayout);
      $scope.$emit('YV_UPDATE_TOPODATA', { topoData: topologyData, sv: $scope.modelLayout['slider-value'] });
    };

    $scope.resetLayout = function(){
      $scope.sigma.startForceAtlas2(configAtlas);
    };

    $scope.$on('YV_MODEL_CHANGE', function(){
      $scope.setLayout();
    });

  }]);

});