var modules = [
  'common/sigmatopology/sigmatopology.module',
  'sigma', 
  'sigma-parsers-gexf', 
  'sigma-forceAtlas2', 
  'sigma-dragNodes',
  'sigma-customShapes'
];

define(modules, function(topologyModule) {
  topologyModule.register.directive('sigmaTopology', function() {
    // constants
    return {
      restrict: 'E',
      scope: {
          topologyData: '=topologyData',
          topologyOptions: '=topologyOptions',
          topologyCustfunc: '=topologyCustfunc',
          panel: '=panel',
          customShapes: '=customShapes',
          dragNodes: '=dragNodes',
          settings: '=settingsSigma',
          settingsAtlas: '=settingsAtlas',
          triggerResizeSigma: '=triggerResizeSigma'
      },
      templateUrl: 'src/common/sigmatopology/sigma.tpl.html',
      link: function($scope, iElm, iAttrs, controller) {

          var sigmaIstance = null,
              getSlowDownNum = function(numOfNodes){
                  // return 1/numOfNodes;
                  x = 10;
              switch(true){
                case (numOfNodes < 20):
                  x = 15;
                  break;
                case (numOfNodes < 50):
                  x = 5;
                  break;
                case (numOfNodes < 100):
                  x = 2;
                  break;
                case (numOfNodes < 250):
                  x = 1;
                  break;
                case (numOfNodes < 500):
                  x = 0.8;
                  break;
                case (numOfNodes < 1000):
                  x = 0.4;
                  break;
                case (numOfNodes < 2000):
                  x = 0.3;
                  break;
                // case (numOfNodes < 5000):
                //   x = 0.1;
                //   break;
                case (numOfNodes < 10000):
                  x = 0.1;
                  break;
              }


              return x;
            },
            Sigma = sigma,
            defaulSettings = {
              defaultLabelColor: '#fff',
              doubleClickEnabled: false,
              labelThreshold: 8
            };

          $scope.$watch('topologyData', function (ntdata) {

            if(ntdata){

              if ( sigmaIstance !== null ) {
                sigmaIstance.kill();
              }
              var timeToStopAtlas;

              // Instantiate sigma:
              sigma.renderers.def = sigma.renderers.canvas;

              // console.info('sigma topology data', ntdata, $scope.topologyData);
              sigmaIstance = new Sigma({
                graph: {
                  nodes: $scope.topologyData.nodes ? $scope.topologyData.nodes : [],
                  edges: $scope.topologyData.links
                },
                container: 'graph-container',
                settings: $scope.settings ? $scope.settings : defaulSettings
              });

              if ( $scope.settingsAtlas ) {
                $scope.settingsAtlas.slowDown = getSlowDownNum($scope.topologyData.nodes.length);
              }

              var defaultConfigAtlas = {
                    adjustSizes: true,
                    // scalingRatio: 10,
                    gravity: 1,
                    slowDown: getSlowDownNum($scope.topologyData.nodes.length)
                  },
                  configAtlas = $scope.settingsAtlas ? $scope.settingsAtlas : defaultConfigAtlas;

              if ( $scope.customShapes ) {
                CustomShapes.init(sigmaIstance);
                sigmaIstance.refresh();
              }

              var dragListener = null;

              if ( $scope.dragNodes ) {
                dragListener = Sigma.plugins.dragNodes(sigmaIstance, sigmaIstance.renderers[0]);
              }

              if ( !$scope.topologyData.disabledAtlas ) {
              sigmaIstance.startForceAtlas2(configAtlas);
              }

              if ( $scope.topologyCustfunc && angular.isFunction($scope.topologyCustfunc) ) {
                $scope.topologyCustfunc(sigmaIstance, getSlowDownNum, dragListener);
              }

            }
          });

          $scope.$watch('triggerResizeSigma', function () {

              var topoData = {
                    nodes: [],
                    links: []
                  };

              if ( sigmaIstance !== null ) {
                topoData.nodes = sigmaIstance.graph.nodes();
                topoData.links = sigmaIstance.graph.edges();
                sigmaIstance.kill();
              }

              // Instantiate sigma:
              sigma.renderers.def = sigma.renderers.canvas;

              sigmaIstance = new Sigma({
                graph: {
                  nodes: topoData ? topoData.nodes : [],
                  edges: topoData ? topoData.links : []
                },
                container: 'graph-container',
                settings: $scope.settings ? $scope.settings : defaulSettings
              });

              if ( $scope.customShapes ) {
                CustomShapes.init(sigmaIstance);
                sigmaIstance.refresh();
              }

              var dragListener = null;

              if ( $scope.dragNodes ) {
                dragListener = Sigma.plugins.dragNodes(sigmaIstance, sigmaIstance.renderers[0]);
              }

              if ( $scope.topologyCustfunc && angular.isFunction($scope.topologyCustfunc) ) {
                var resize = true;
                $scope.topologyCustfunc(sigmaIstance, getSlowDownNum, dragListener, resize);
              }

          });

      }
    };
  });
});
