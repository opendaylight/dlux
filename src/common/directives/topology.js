/*
Directive to create a simple topology

Partially based on https://github.com/fredhsu/dlux-scripts/tree/master/python/ from Fred Hsu and many angular bits.
*/

angular.module('dlux.directives.topology', [])

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
      var svg = d3.select(iElm[0]).append('svg')
        .attr('width', width)
        .attr('height', height);

      $scope.$watch('topologyData', function (newVal, dluxVal) {
        svg.selectAll('*').remove();

        if(!newVal) {
            return;
        }

        var topo = d3.layout.force()
          .charge(-300)
          .linkDistance(100)
          .nodes(newVal.nodes)
          .links(newVal.links)
          .size([width, height])
          .start();

        var link = svg.append("svg:g").selectAll("line.link")
          .data(newVal.links)
          .enter().append("svg:line")
          .attr("class", "link")
          .style("stroke-width", function(d) { return Math.sqrt(d.value); })
          .attr("x1", function(d) { return d.source.x; })
          .attr("y1", function(d) { return d.source.y; })
          .attr("x2", function(d) { return d.target.x; })
          .attr("y2", function(d) { return d.target.y; });

        var node = svg.append("svg:g").selectAll("circle.node")
          .data(newVal.nodes)
          .enter().append("svg:circle")
          .attr("class", "node")
          .attr("r", 15)
          .style("fill", function(d) { return fill(d.group); })
          .attr("cx", function(d) { return d.x; })
          .attr("cy", function(d) { return d.y; })
          .call(topo.drag);

        var text = svg.append("svg:g").selectAll("g")
          .data(topo.nodes())
          .enter().append("svg:g");

        text.append("svg:text")
          .text(function(d) { return d.id; });
          //.attr("x", function(d) { return d.x; })
          //.attr("y", function(d) { return d.y; })

        svg.style("opacity", 1e-6)
          .transition()
          .duration(1000)
          .style("opacity", 2);

        topo.on("tick", function() {
          link.attr("x1", function(d) { return d.source.x; })
          .attr("y1", function(d) { return d.source.y; })
          .attr("x2", function(d) { return d.target.x; })
          .attr("y2", function(d) { return d.target.y; });

        //text.attr("x", function(d) { return d.x; })
          //.attr("y", function(d) { return d.y; });
          text.attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });

        node.attr("cx", function(d) { return d.x; })
          .attr("cy", function(d) { return d.y; });
        });
      });
    }
  };
});