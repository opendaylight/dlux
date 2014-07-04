/*
Directive to create a simple topology

Partially based on https://github.com/fredhsu/dlux-scripts/tree/master/python/ from Fred Hsu and many angular bits.
*/

angular.module('common.topology', [])

.directive('topologySimple', function() {
  // constants
  var width = 800,
      height = 800,
      fill = d3.scale.category20();

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

                // legend
                var x = - container.clientWidth / 2 + 50;
                var y = - container.clientHeight / 2 + 50;
                var step = 30;
                inNodes.push({id: 1001, x: x, y: y + step, label: 'Switch', group: 'switch',value:20});
                inNodes.push({id: 1003, x: x, y: y + 3 * step, label: 'Computer', group: 'desktop',value:20});

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
                    nodes: {
                        widthMin: 20,
                        widthMax: 64,
                        fontColor: BLACK
                    },
                    edges: {
                        style: 'arrow',
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
                        'desktop': {
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
