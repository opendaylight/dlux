/**
 * D3.js Drag and Drop, Zoomable, Panning, Collapsible Tree with auto-sizing: http://bl.ocks.org/robschmuecker/7880033
 */

angular.module('common.sfc.nodestopology', [])

  .directive('serviceNodesTopology', function () {

    return {
      restrict: 'E',
      scope: {
        treeViewData: '=',

      },
      link: function ($scope, iElm, Iattrs, controller) {

        var margin = {top: 40, right: 20, bottom: 0, left: 100},
          width = 320 - margin.right - margin.left,
          height = 170 - margin.top - margin.bottom;

        var i = 0,
          duration = 600,
          root;

        var svg = d3.select(iElm[0]).append('svg')
          .attr("width", width + margin.right + margin.left)
          .attr("height", height + margin.top + margin.bottom)
          .attr("class", "overlay")
          .append("g")
          .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        var tree = d3.layout.tree()
          .size([height, width]);

        var diagonal = d3.svg.diagonal()
          .projection(function (d) {
            return [d.x, d.y];
          });

        $scope.$watch('treeViewData', function (newVal, dluxVal) {
          //svg.selectAll('*').remove();

          if (newVal === undefined) {
            return;
          }

          //TODO: dont delete children, instead of somehow request new data
          if (newVal.children[0] === undefined) {
            delete newVal.children;
          }

          root = newVal;
          root.x0 = width / 2;
          root.y0 = 0;

          _.each(root.children, function (children) {
            delete children.id;
          });

          //root.children.forEach(collapse);
          update(root);
        });


        function update(source) {

          // Compute the new tree layout.
          var nodes = tree.nodes(root),
            links = tree.links(nodes);

          // Normalize for fixed-depth.
          nodes.forEach(function (d) {
            d.y = d.depth * 80;
          });

          // Update the nodes…
          var node = svg.selectAll("g.node")
            .data(nodes, function (d) {
              return d.id || (d.id = ++i);
            });

          var div = d3.select("body").append("div")
            .attr("class", "tooltip")
            .style("opacity", 0);

          // Enter any new nodes at the parent's previous position.
          var nodeEnter = node.enter().append("g")
            .attr("class", "node")
            .attr("transform", function (d) {
              return "translate(" + source.x0 + "," + source.y0 + ")";
            })
            .on("click", click)
            .on("mouseover", function (d) {
              div.transition()
                .duration(200)
                .style("opacity", 0.9);

              if (d.type !== undefined) {
                div.html(
                    "Name: " + d.name + "<br/>" +
                    "IP: " + d['ip-mgmt-address'] + "<br/>" +
                    "Type: " + d.type + "<br/>"
                )
                  .style("left", (d3.event.pageX) + "px")
                  .style("top", (d3.event.pageY - 28) + "px");
              }
              else {
                div.html(
                    "<p style='text-align: center;'>" + d.name + "</p>" +
                    "IP: " + d['ip-mgmt-address'] + "<br/>"
                )
                  .style("left", (d3.event.pageX) + "px")
                  .style("top", (d3.event.pageY - 28) + "px");
              }


            })
            .on("mouseout", function (d) {
              div.transition()
                .duration(600)
                .style("opacity", 0);
            });

          nodeEnter.append("image")
            .attr("xlink:href", "assets/images/Device_switch_3062_unknown_64.png")
            .attr("x", -20)
            .attr("y", -20)
            .attr("width", 40)
            .attr("height", 40);

          nodeEnter.append("div")
            .attr("x", -40)
            .attr("y", -40)
            .attr("dy", ".35em")
            .attr("text-anchor", 'middle')
            .text("delete")
            .style("fill-opacity", 1);

          //TODO: allow to delete serviceNode
          nodeEnter.append("text")
            .attr("y", function (d) {
              return d.children || d._children ? -30 : 30;
            })
            .attr("dy", ".35em")
            .attr("text-anchor", 'middle')
            .text(function (d) {
              return d.name;
            })
            .style("fill-opacity", 1);


          // Transition nodes to their new position.
          var nodeUpdate = node.transition()
            .duration(duration)
            .attr("transform", function (d) {
              return "translate(" + d.x + "," + d.y + ")";
            });


          nodeUpdate.select("text")
            .style("fill-opacity", 1);

          // Transition exiting nodes to the parent's new position.
          var nodeExit = node.exit().transition()
            .duration(duration)
            .attr("transform", function (d) {
              return "translate(" + source.x + "," + source.y + ")";
            })
            .remove();


          nodeExit.select("text")
            .style("fill-opacity", 1e-6);

          // Update the links…
          var link = svg.selectAll("path.link")
            .data(links, function (d) {
              return d.target.id;
            });

          // Enter any new links at the parent's previous position.
          link.enter().insert("path", "g")
            .attr("class", "link")
            .attr("d", function (d) {
              var o = {x: source.x0, y: source.y0};
              return diagonal({source: o, target: o});
            });

          // Transition links to their new position.
          link.transition()
            .duration(duration)
            .attr("d", diagonal);

          // Transition exiting nodes to the parent's new position.
          link.exit().transition()
            .duration(duration)
            .attr("d", function (d) {
              var o = {x: source.x, y: source.y};
              return diagonal({source: o, target: o});
            })
            .remove();

          // Stash the old positions for transition.
          nodes.forEach(function (d) {
            d.x0 = d.x;
            d.y0 = d.y;
          });

        }

        // Toggle children on click.
        function click(d) {
          if (d.children) {
            d._children = d.children;
            d.children = null;
          } else {
            d.children = d._children;
            d._children = null;
          }
          update(d);
        }

        function collapse(d) {
          if (d.children) {
            d._children = d.children;
            d._children.forEach(collapse);
            d.children = null;
          }
        }
      }
    };
  });
