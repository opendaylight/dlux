define(['app/topology/topology.module', 'vis'], function(topology, vis) {

  topology.register.directive('topologySimple', function() {
    // constants
    var width = 800,
      height = 800;

    return {
      restrict: 'E',
      scope: {
          topologyData: '='
      },
      link: function($scope, iElm, iAttrs, controller) {

          $scope.$watch('topologyData', function (ntdata) {
              if(ntdata){
                  //   visinit(inNodes, inEdges, container, inOptions) {
                  var inNodes = $scope.topologyData.nodes;
                  var inEdges = $scope.topologyData.links;
                  var container = iElm[0];

                  // legend moved to topology controller

                  var data = {
                      nodes: inNodes,
                      edges: inEdges
                  };

                  var color = '#66FFFF',
                      hl = '#0066FF',
                      hover = '#33CC33',
                      BLACK = '#2B1B17';

                  var options =
                  {
                      width:  '80%',
                      height: '500px',
                      nodes: {
                          widthMin: 20,
                          widthMax: 64,
                          fontColor: BLACK
                      },
                      edges: {
                          length: 80,
                          color: {
                              color: '#070707',
                              highlight: hl,
                              hover: hover
                          }
                      },
                      physics: {
                          barnesHut: {
                              gravitationalConstant: -7025
                          }
                      },
                      hover: true,
                      groups: {
                          'switch': {
                              shape: 'image',
                              image: 'assets/images/Device_switch_3062_unknown_64.png'
                          },
                          'host': {
                              shape: 'image',
                              image: 'assets/images/Device_pc_3045_default_64.png'
                          }
                      },
                      keyboard:true,
                      tooltip: {
                          delay: 300,
                          fontColor: "black",
                          fontSize: 14, // px
                          fontFace: "verdana",
                          color: {
                              border: "#666",
                              background: "#FFFFC6"
                          }
                      }
                      //smoothCurves: false,
                      //stabilizationIterations: (inNodes.length > 30 ? inNodes.length * 10 : 1000),
                      //freezeForStabilization: true
                  };

                  var graph = new vis.Graph(container, data, options);
                  return graph;
              }
          });

      }
    };
  });
});
