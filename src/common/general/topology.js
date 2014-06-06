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

        //Creates the parent svg element
        var svg = d3.select(iElm[0]).append('svg')
        //.attr("pointer-events", "all")
        .attr('width', width)
        .attr('height', height)
        .attr("viewBox", "0 0 " + width + " " + height)
        .attr("preserveAspectRatio", "xMidYMid meet")
        .attr("pointer-events", "all")
        .call(d3.behavior.zoom().on("zoom", redraw));

        //Creates a container g element for the svg, all the visualization elements are under vis
        var vis = svg.append('svg:g');

        function redraw() {
            vis.attr("transform","translate(" + d3.event.translate + ")" + " scale(" + d3.event.scale + ")");
        }

        $scope.$watch('topologyData', function (newVal, dluxVal) {
            vis.selectAll('*').remove();

        if(!newVal) {
            return;
        }

        var topo = d3.layout.force()
            .charge(-300)
            .distance(150)
            .nodes(newVal.nodes)
            .links(newVal.links)
            .size([width, height])
            .start();

        var link = vis.selectAll(".link")
            .data(newVal.links)
            .enter().append("line")
            .attr("class", "link");

        var node = vis
            .selectAll('.node')
            .data(newVal.nodes)
            .enter()
            .append('g')
            .attr("class", "node")
            .call(topo.drag);
        
        node.append("image")
            .attr("xlink:href", "/assets/images/Device_switch_3062_unknown_64.png")
            .attr("x", -25)
            .attr("y", -25)
            .attr("width", 50)
            .attr("height", 50);

        node.append("text")
            .attr("dx", -55)
            .attr("dy", "-10")
            .text(function(d) {
                console.log(d);
                return d.id; });
        topo.on("tick", function() {
            link.attr("x1", function(d) { return d.source.x; })
            .attr("y1", function(d) { return d.source.y; })
            .attr("x2", function(d) { return d.target.x; })
            .attr("y2", function(d) { return d.target.y; });

            node.attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });
            });
        
        });
    }
  };
});
