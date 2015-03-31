define(['app/yangvisualizer/yangvisualizer.module', 'app/yangvisualizer/yangvisualizer.services', 'common/sigmatopology/sigma.directive'], function(yangvisualizer) {

  yangvisualizer.register.controller('yangvisualizerCtrl', ['$scope', '$rootScope', '$http', 'YangConfigRestangular', 'yangUtils','visualizerUtils', 'DesignVisualizerFactory',
    function ($scope, $rootScope, $http, Restangular, yangUtils, visualizerUtils, DesignVisualizerFactory) {
      $rootScope['section_logo'] = 'logo_yangui';

      $scope.currentPath = './assets/views/yangvisualizerCtrl';
      $scope.topologyData = { nodes: [], edges: []};
      $scope.currentTopologyNode = {};
      $scope.filteredNodes = [];
      $scope.selectedProperty = null;
      $scope.selectedNode = null;
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
      $scope.legend = [];


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

      var selectNode = function(node) {
          var selNode = node,
              edges = $scope.sigma.graph.edges();
          if ( lastSelectedNode ) {
              visualizerUtils.clearEdgeColors();
          }

          lastSelectedNode = selNode;
          $scope.selectedNode = selNode.node;
          $scope.childrenNodes.list = selNode.node.children.length ? selNode.node.children : [];
          $scope.parentNodes.list = visualizerUtils.getParentNodes(selNode.node);
          visualizerUtils.updateSelectedEdgesColors(edges, selNode);
          selNode.size = selNode.node.parent !== null ? 10 : 20;
          $scope.sigma.refresh();
          $scope.$apply();
      };

      $scope.topologyCustfunc = function(sigmaIstance, getSlowDownNum){

        DesignVisualizerFactory.setMainClass();
        
        $scope.sigma = sigmaIstance;
        getSlowDownNumFun = getSlowDownNum;

        sigmaIstance.bind('clickStage', function(e){
          sigmaIstance.killForceAtlas2();
        });

        sigmaIstance.bind('clickNode', function(e) {
            selectNode(e.data.node);
        });


        sigmaIstance.bind('doubleClickNode', function(e){
          var selNode = e.data.node;
              
          $scope.sigma.killForceAtlas2();


          setTimeout(function(){
            if ( selNode.expand ) {
              expandNodeFunc(selNode, maxLvlToSHow);
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


      $scope.loadController = function(){
        
         processingNodesCallback();

         visualizerUtils.getAllnodes(function(allNodes){
            $scope.filteredNodes = allNodes.filter(function(node){
                    return node.nodeType === 1;
            });
            
        $scope.currentTopologyNode = $scope.filteredNodes[0];
            processingNodesSuccessCallback();
            $scope.topologyData = visualizerUtils.getTopologyData($scope.currentTopologyNode, maxLvlToSHow);
         }, function(e){
            processingNodesErrorCallback(e);
         });
      };
      
      

      $scope.updateTopologyData = function(mlts, modelChanged){
        $scope.topologyData = visualizerUtils.getTopologyData($scope.currentTopologyNode, mlts !== null ? mlts : maxLvlToSHow, true);
        $scope.selectedNode = null;
        $scope.childrenNodes.list = [];
        $scope.parentNodes.list = [];
        lastSelectedNode = null;
        $scope.expandedNodes = !modelChanged ? $scope.expandedNodes : false;
        $scope.legend = [];

        if ( modelChanged ) {
          $scope.selectedProperty = null;
          $('.yangVisualizerWrapper div.viewNav li span').removeClass('active').parent().eq(0).find('span').addClass('active');
        }
      };

      $scope.triggerExpanded = function(nodes){
        nodes.show = !nodes.show;
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

      $scope.zoomToNode = function(id){
        var nodeToZoom = $scope.sigma.graph.nodes().filter(function(node){
                            return node.node.graphId === id;
                          });
        $scope.sigma.killForceAtlas2();

        if(nodeToZoom.length > 0) {
          selectNode(nodeToZoom[0]);
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

});