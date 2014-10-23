var modules = [
  'app/yangvisualizer/yangvisualizer.module', 
  'sigma', 
  'sigma-parsers-gexf', 
  'sigma-forceAtlas2', 
  'sigma-dragNodes'
];

define(modules, function(yangvisualizer) {

  yangvisualizer.register.directive('sigmaTopology', function() {
    // constants
    return {
      restrict: 'E',
      scope: {
          topologyData: '=topologyData',
          topologyOptions: '=topologyOptions',
          topologyCustfunc: '=topologyCustfunc',
          panel: '=panel'
      },
      templateUrl: 'src/app/yangvisualizer/sigma.tpl.html',
      // template: '<div id="graph-container" class="'+ $scope.panel ? 'col-md-6' : 'col-md-12' +'"</div>',
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
            };

          $scope.$watch('topologyData', function (ntdata) {

            if(ntdata){

              if ( sigmaIstance !== null ) {
                sigmaIstance.kill();
              }
              

              
              var configSigma = {
                autoResize : false,
                zoomMax: 5,
                labelThreshold: 0
              },
              timeToStopAtlas;

              // Instantiate sigma:
              // sigma.renderers.def = sigma.renderers.canvas;
              var Sigma = sigma;
              sigmaIstance = new Sigma({
                graph: {
                  nodes: $scope.topologyData.nodes ? $scope.topologyData.nodes : [],
                  edges: $scope.topologyData.links
                },
                container: 'graph-container',
                settings: {
                  defaultLabelColor: '#fff',
                  doubleClickEnabled: false,
                  labelThreshold: 8
                }
              });

              var configAtlas = {
                adjustSizes: true,
                // scalingRatio: 10,
                gravity: 1,
                slowDown: getSlowDownNum($scope.topologyData.nodes.length)
              };

              sigmaIstance.startForceAtlas2(configAtlas);

              if ( $scope.topologyCustfunc && angular.isFunction($scope.topologyCustfunc) ) {
                $scope.topologyCustfunc(sigmaIstance, getSlowDownNum);
              }

            }
          });

      }
    };
  });
});
