module.exports = function() {
    var Graph = require('ngraph.graph');
    var GraphRenderer = require('./renderer.js');
    var topology = null;

    function _load(nodes, links) {
        nodes.forEach(function (node) {
            topology.addNode(node.id, {
                title:node.title,
                group:node.group,
                label:node.label,
                value:node.value
            });
        });
        links.forEach(function (link) {
            topology.addLink(link.from, link.to, {
                id: link.id,
                title: link.title
            });
        });
    }

    // public API
    return {
        start : function(id) {
            try {
                if (!topology) {
                    throw new Error('Cannot create a graph, you need to load one first');
                }

                renderer = new GraphRenderer(id, topology);
                renderer.run();
            } catch(e) {
                console.error(e.name, e.message);
            }
        },
        refresh: function(nodes, links) {
            //tmp
            topology.beginUpdate();
            topology.clear();
            _load(nodes, links);
            topology.endUpdate();
            renderer.refresh(topology);
        },
        loadGraph: function(nodes, links) {
            topology = new Graph();
            _load(nodes, links);
        }
    };
};
