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
      var svg = d3.select(iElm[0]).append('svg')
        //.attr("pointer-events", "all")
        .attr('width', width)
        .attr('height', height);

      $scope.$watch('topologyData', function (newVal, dluxVal) {
        svg.selectAll('*').remove();

        if(!newVal) {
            return;
        }

        var topo = d3.layout.force()
          .charge(-300)
          .distance(100)
          .nodes(newVal.nodes)
          .links(newVal.links)
          .size([width, height])
          .start();

        var link = svg.selectAll(".link")
          .data(newVal.links)
          .enter().append("line")
          .attr("class", "link");

        /*ar node = svg.append("svg:g").selectAll("circle.node")
          .data(newVal.nodes)
          .enter().append("svg:circle")
          .attr("class", "node")
          .attr("r", 15)
          .style("fill", function(d) { return fill(d.group); })
          .attr("cx", function(d) { return d.x; })
          .attr("cy", function(d) { return d.y; })
          .call(topo.drag);*/
        
        var node = svg
          .selectAll('.node')
          .data(newVal.nodes)
          .enter()
          .append('g')
          .attr("class", "node")
          .call(topo.drag);
        
        node
          .append("image")
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
        //node.append("title")

        /*var text = svg.append("svg:g").selectAll("g")
          .data(topo.nodes())
          .enter().append("svg:g");

        text.append("svg:text")
          .text(function(d) { return d.id; })
          .attr('x', -50)
          .attr('y', 25);
          //.attr("x", function(d) { return d.x; })
          //.attr("y", function(d) { return d.y; })
        
        svg.style("opacity", 1e-6)
          .transition()
          .duration(1000)
          .style("opacity", 2);*/

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
