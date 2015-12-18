define(['app/yangvisualizer/yangvisualizer.module', 'common/yangutils/yangutils.services'], function(yangvisualizer) {

  yangvisualizer.register.factory('YangConfigRestangular', function(Restangular, ENV) {
    return Restangular.withConfig(function(RestangularConfig) {
      RestangularConfig.setBaseUrl(ENV.baseURL);
    });
  });

  yangvisualizer.register.factory('visualizerUtils', function(YangUtilsRestangular, yangUtils, $http){
    var visualizerUtils = {},
        nodeArray = [],
        linkArray = [],
        propertyNodesArray = [],
        lastNodesId = null,
        lastEdgesId = null,
        edgesToClear = {node: {}, edges: []},
        monochromeColorsArray = [],
        colors = {
            edges: '#856700',
            monochrome: '#f39222',
            edgeParent: '#BE3E3B',
            edgeChild: '#3ea64d'
        },
        findParentByChildId = function(edges, nodeId, parentArray){
            var filteredEdge = edges.filter(function(edge){
                return edge.target === nodeId;
            })[0];

            if(filteredEdge) {
                parentArray.push(filteredEdge);
                findParentByChildId(edges, filteredEdge.source, parentArray);
            }
        },
        getAllEdgesByNodeId = function(edges, nodeId){
            return edges.filter(function(edge){
                return edge.source === nodeId;
            });
        },
        getParentsByNode = function(node, parentsArray){
            if ( node.parent !== null ) {
                parentsArray.push(node.parent);
                return getParentsByNode(node.parent, parentsArray);
            } else {
                return parentsArray;
            }
        },
        generateColor = function(id) {
            var n = id * Math.PI;
            var colorCode = '#'+(Math.floor((n - Math.floor(n)) * 16777215)).toString(16);
            return colorCode;
        },
        getColors = function(array){
            var colors = {};
            if ( array.length ) {
                for(var index in array) {
                    var item = array[index];
                    if(!colors.hasOwnProperty(item)) {
                        colors[item] = generateColor(array.indexOf(item) + 1);
                    }
                } 
                return colors;
            } else {
                return null;
            }
            
        },
        getPropertyNodes = function(property, node){
            if ( propertyNodesArray.indexOf(node[property]) === -1 && node[property] !== undefined ) {
                propertyNodesArray.push(node[property]);
            }

            if ( node.children.length ) {
                node.children.forEach(function(child){
                    getPropertyNodes(property, child);
                });
            }
            return propertyNodesArray;
        },
        updateNodesColor = function(property, nodes, colorsArray, monochromeColorsArray, defaultColor){
            nodes.forEach(function(node){
                // console.log(node.node[property], colorsArray);
                node.color = !defaultColor ? colorsArray[node.node[property]] : monochromeColorsArray[node.lvl];//'#f39222';
            });
        },
        maxMClvl = 0,
        getMaxLvl = function(node, lvl){
            if ( node.children.length > 0 ) {
                lvl++;
                maxMClvl = maxMClvl > lvl ? maxMClvl : lvl;
                node.children.forEach(function(child){
                    getMaxLvl(child, lvl);
                });
            } 
            return maxMClvl;
        },
        getMonochromeColors = function(hex, lvls, reverse, node){
            var monochromeColors = [],
                hexToRgb = function(hex) {
                    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
                    return result ? {
                        r: parseInt(result[1], 16),
                        g: parseInt(result[2], 16),
                        b: parseInt(result[3], 16)
                    } : null;
                },
                componentToHex = function(c) {
                    var hex = c.toString(16);
                    return hex.length == 1 ? "0" + hex : hex;
                },
                rgbToHex = function(r, g, b) {
                    return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
                };

            if ( lvls === Infinity ) {
                maxMClvl = 0;
                getMaxLvl(node, 0);
                lvls = maxMClvl + 2;
            }

            var lvlSteps = Math.round(lvls / 2),
                tintStep = 0.4 / lvlSteps,
                tint = 0.3,
                shadeStep = 0.6 / lvlSteps,
                shade = 0.9,
                rgb = hexToRgb(hex),
                ra, ga, ba, i;

                if ( rgb ) {
                    for ( i=1; i < lvlSteps; i++ ) {
                        ra=Math.round(rgb.r+(255-rgb.r)*tint);
                        ga=Math.round(rgb.g+(255-rgb.g)*tint);
                        ba=Math.round(rgb.b+(255-rgb.b)*tint);
                        tint = tint - tintStep;
                        monochromeColors.push(rgbToHex(ra, ga, ba));
                    }
                    
                    monochromeColors.push(hex);

                    for ( i=1; i < lvlSteps; i++ ) {
                        ra=Math.round(rgb.r*shade);
                        ga=Math.round(rgb.g*shade);
                        ba=Math.round(rgb.b*shade);
                        shade = shade - shadeStep;
                        monochromeColors.push(rgbToHex(ra, ga, ba));
                    }

                    return reverse ? monochromeColors.reverse() : monochromeColors;
                } else {
                    return null;
                }
                

        },
        getNumberOfChildren = function(node){
            var numOfChild = 0,
                numOfChildFunc = function(parentNode){
                    parentNode.children.forEach(function(child){
                        numOfChild++;
                        numOfChildFunc(child);
                    });
                };
            
            numOfChildFunc(node);
            return numOfChild;
        },
        getAllChildrenByNode = function(parentNode){
            var childrenArray = [],
                getChildrenArray = function(node){
                    node.children.forEach(function(child){
                        getChildrenArray(child);
                        if ( child.hasOwnProperty('graphId') ) {
                            childrenArray.push(child.graphId);
                            delete child['graphId'];
                        }
                    });
                };
            getChildrenArray(parentNode);
            return childrenArray;
            
        },
        getNodeById = function(nodes, id){
            var node = nodes.filter(function(item){
                    return item.id === id;
                });

            return node.length ? node[0] : null;
        };


    visualizerUtils.getMaxNodeLvl = function(node){
        var maxLvl = 0,
            getLvl = function(node, lvl){
            if ( node.children.length > 0 ) {
                lvl++;
                maxLvl = maxLvl > lvl ? maxLvl : lvl;
                node.children.forEach(function(child){
                    getLvl(child, lvl);
                });
            }
        };

        getLvl(node, 0);
        return maxLvl;
    };

    visualizerUtils.getTopologyData = function(node, lts, newModel, fromLvl){
        var topologyData = [],
            // topologyNodeSize = 10,
            topologyNodeId = 0,
            topologyLinkId = 0,
            transformData = function(node, nodeArray, linkArray, parentId, lvl){
                topologyNodeId++;
                // topologyNodeSize--;
                node.graphId = 'n'+topologyNodeId;
                var currentNodeId = topologyNodeId,
                    nodeLabel = node.label.length > 20 ? node.label.substring(0, 17) + '...' : node.label,
                    nodeData = {
                        'id': 'n'+currentNodeId,
                        'label': lts > lvl ? nodeLabel : getNumberOfChildren(node) !== 0 ? '[' + getNumberOfChildren(node
                        ) + '] ' + nodeLabel : nodeLabel,//node.label,
                        x: Math.random(),
                        y: Math.random(),
                        size: parentId === null ? 20 : lts > lvl ? 7 : 12,
                        color: monochromeColorsArray[lvl],
                        node: node,
                        type: node.type,
                        lvl: lvl,
                        parent: parentId,
                        expand: lts > lvl ? false : true,
                        labelToShow: null
                    },
                    linkData = {};


                if ( node.children.length > 0 && lts > lvl ) {
                    lvl++;
                    maxMClvl = maxMClvl > lvl ? maxMClvl : lvl;
                    node.children.forEach(function(child){
                        transformData(child, nodeArray, linkArray, currentNodeId, lvl);
                    });
                } 

                if ( parentId !== null ) {
                    topologyLinkId++;
                    linkData = {
                        id: 'l'+topologyLinkId,
                        'source': 'n'+parentId,
                        'target': 'n'+currentNodeId,
                        color: colors.edges
                    };
                    linkArray.push(linkData);
                }

                nodeArray.push(nodeData);

            };

        nodeArray = [];
        linkArray = [];

        topologyNodeId = lastNodesId && !newModel ? lastNodesId : 0;
        topologyLinkId = lastEdgesId && !newModel ? lastEdgesId : 0;

        //adding +1 for monochrome colors to get color for parent node too
        monochromeColorsArray = getMonochromeColors(colors.monochrome, lts + 1, false, node);
        transformData(node, nodeArray, linkArray, null, fromLvl ? fromLvl : 0);
        lastNodesId = topologyNodeId;
        lastEdgesId = topologyLinkId;

        return { nodes: nodeArray, links: linkArray };
    };

    visualizerUtils.setDefaultSigmaValues = function(sigmaInstance, lastSelectedNode){
        var lsn = getNodeById(sigmaInstance.graph.nodes(), lastSelectedNode.id);
            

        if ( edgesToClear ){
            var parentsEdgesArray = [],
                childEdges = getAllEdgesByNodeId(sigmaInstance.graph.edges(),edgesToClear.node.id),
                nodeToClear = getNodeById(sigmaInstance.graph.nodes(), edgesToClear.node.id);

            findParentByChildId(sigmaInstance.graph.edges(), edgesToClear.node.id, parentsEdgesArray);

            edgesToClear.node = nodeToClear ? nodeToClear : edgesToClear.node;
            edgesToClear.edges = childEdges.concat(parentsEdgesArray);
        }

        return lsn ? lsn : lastSelectedNode;
    };

    visualizerUtils.updateSelectedEdgesColors = function(edges, node){
        var parentsEdgesArray = [],
            childEdges = getAllEdgesByNodeId(edges,node.id);

        findParentByChildId(edges, node.id, parentsEdgesArray);

        edgesToClear.node = node;

        parentsEdgesArray.forEach(function(edge){
            edge.color = colors.edgeParent;
            edgesToClear.edges.push(edge);
        });

        childEdges.forEach(function(edge){
            edge.color = colors.edgeChild;
            edgesToClear.edges.push(edge);
        });

    };

    visualizerUtils.clearEdgeColors = function(edgesObj){

        edgesTC = edgesObj ? edgesObj : edgesToClear;
        
        edgesTC.node.size = edgesTC.node.size === 100 ? 100 : edgesTC.node.parent === null ? 20 : edgesTC.node.expand ? 12 : 7;

        edgesTC.edges.forEach(function(edge){
            edge.color = colors.edges;
        });

    };

    visualizerUtils.getEdgesToClear = function(){
        return {
            node: edgesToClear.node,
            edges: edgesToClear.edges.map(function(e){
                        return e.id;
                    })
        };
    };

    visualizerUtils.getParentNodes = function(node){
        var parentsArray = [];
        return node ? getParentsByNode(node, parentsArray) : [];
    };

    visualizerUtils.getAllnodes = function(callback, errorCbk){
        $http.get(YangUtilsRestangular.configuration.baseUrl+'/restconf/modules/').success(function (data) {
            yangUtils.processModules(data.modules, function(result) {
                callback(result);
            });
        }).error(function(result) {
            errorCbk(result);
        });
    };

    visualizerUtils.setNodesColor = function(property, nodes, currentNode){
        propertyNodesArray = [];
        var colorsArray = [];
        if ( property !== 'default' ) {
            getPropertyNodes(property, currentNode);
            colorsArray = getColors(propertyNodesArray);
            if ( colorsArray ) {
                updateNodesColor(property, nodes, colorsArray, monochromeColorsArray);
            }
            return colorsArray;
        } else {
            updateNodesColor(property, nodes, colorsArray, monochromeColorsArray, true);
            return null;
        }
        
    };

    visualizerUtils.getEdge = function(node, child){
        lastEdgesId++;
        return {
                id: 'l'+lastEdgesId,
                'source': node.graphId,
                'target': child.graphId,
                color: colors.edges
            };
    };

    visualizerUtils.getAllChildrenArray = function(parentNode){
        return {
            numOfChildren : getNumberOfChildren(parentNode.node),
            nodesArray : getAllChildrenByNode(parentNode.node)
        };
    };

    visualizerUtils.getNodeById = function(nodes, id){
        var nodesArray = nodes.filter(function(node){
            return node.node.graphId === id;
          });

        return nodesArray.length ? nodesArray[0] : null;
    };

    visualizerUtils.__test = {
        findParentByChildId: findParentByChildId,
        getAllEdgesByNodeId: getAllEdgesByNodeId,
        getParentsByNode: getParentsByNode,
        nodeArray: nodeArray,
        edgesToClear: edgesToClear,
        generateColor: generateColor,
        getPropertyNodes: getPropertyNodes,
        updateNodesColor: updateNodesColor,
        getColors: getColors,
        getMonochromeColors: getMonochromeColors,
        getMaxLvl: getMaxLvl
    };

    return visualizerUtils;
  });

    yangvisualizer.register.factory('VizualiserLayoutFactory', ['visualizerUtils', function(visualizerUtils){
        var vl = {},
            removeNodesObj = function(nodes){
                var changedNodes = [];
                nodes.forEach(function(n){
                    var nodeObj = n.node,
                        copyN = {};
                    n.node = n.node.localeLabel;
                    angular.copy(n, copyN);
                    changedNodes.push(copyN);
                    n.node = nodeObj;
                });
                return changedNodes;
            },
            clearNode = function(node, lnodes, color){
                var nodeTCHC = lnodes.filter(function(ln){
                                    return ln.id === node.id;
                                });

                if ( nodeTCHC.length ){
                    nodeTCHC[0].color = color;
                    nodeTCHC[0].size = nodeTCHC[0].parent === null ? 20 : nodeTCHC[0].expand ? 12 : 7;
                }
            },
            clearEdges = function(edges, edgesIds){
                var edgesTC = edges.filter(function(e){
                        return edgesIds.indexOf(e.id) !== -1;
                    }),
                    obj = {
                        node: {},
                        edges: edgesTC
                    };

                visualizerUtils.clearEdgeColors(obj);
            };

        vl.loadLayout = function(node){
            if(typeof(Storage) !== "undefined") {
                var lList = JSON.parse(localStorage.getItem("modelLayouts"));
                lList = lList !== null ? lList : {};
                return lList[node.label] ? lList[node.label] : null;
            } else {
                return null;
            }
        };

        vl.getTopoData = function(node, model){
            var topoNodes = [],
                topoLinks = [],
                modelCopy = {},
                createNodes = function(n){
                    var findNode = function(){
                            var node = modelCopy.nodes.filter(function(i){
                                            return (i.id === n.graphId) && (i.node === n.localeLabel);
                                        });
                            return node.length ? node[0] : null;
                        },
                        gNode = findNode();

                    if ( n.children.length ){
                        n.children.forEach(function(child){
                            createNodes(child);
                        });
                    }

                    if ( gNode ) {
                        gNode.node = n;
                        topoNodes.push(gNode);
                    }
                },
                createEdges = function(){
                    var nodes = [],
                        verifyNode = function(node){
                            var addNode = function(nodeId){
                                nodes.push(nodeId);
                                return true;
                            };

                            if ( nodes.indexOf(node) !== -1 ){
                                return true;
                            } else {
                                var nd = topoNodes.filter(function(n){
                                            return n.id === node;
                                        });

                                return nd.length ? addNode(node) : false;
                            }
                        };

                    modelCopy.edges.forEach(function(e){
                        if ( verifyNode(e.source) && verifyNode(e.target) ){
                            topoLinks.push(e);
                        } 
                    });
                };

            angular.copy(model, modelCopy);

            createNodes(node);
            createEdges();

            return {
                nodes: topoNodes,
                links: topoLinks,
                disabledAtlas: true
            };
        };

        vl.saveLayout = function(node, sigma, sliderValue, nodeColor){
            var edgesCopy = [];

            angular.copy(sigma.graph.edges(), edgesCopy);

            var layout = {
                    nodes: sigma.graph.nodes(),
                    edges: edgesCopy,
                    'slider-value': sliderValue
                },
                edgesToClearObj = visualizerUtils.getEdgesToClear();

            clearEdges(layout.edges, edgesToClearObj.edges);
            layout.nodes = removeNodesObj(layout.nodes);
            clearNode(edgesToClearObj.node, layout.nodes, nodeColor);

            if(typeof(Storage) !== "undefined") {
                var lList = JSON.parse(localStorage.getItem("modelLayouts"));
                lList = lList !== null ? lList : {};
                lList[node.label] = layout;

                console.log('lList', lList);

                try {
                    localStorage.setItem("modelLayouts", JSON.stringify(lList));
                    return lList[node.label];
                } catch(e) {
                    console.info('DataStorage error:', e);
                }
            } else {
                return null;
            }
        };

        return vl;
    }]);

    yangvisualizer.register.factory('DesignVisualizerFactory', function(){

        var dvf = {};

        dvf.setMainClass = function(){
            if ( $('.yangVisualizer').length ) {
                $('.yangVisualizer').closest('.col-xs-12').addClass('yangVisualizerWrapper');

                $('#graph-container').height($(window).height() - 206);

                $(window).resize(function(){
                    $('#graph-container').height($(window).height() - 206);
                });
              }
        };

        return dvf;

    });

    yangvisualizer.register.factory('yvConstants', function(){
        var yvc = {};

        yvc.sliderSettings = {
                                from: 1,
                                to: 10,
                                step: 1,
                                dimension: ' lvl',
                                vertical: false,
                                css: {
                                    background: {'background-color': '#fff'},
                                    before: {'background-color': '#f6a000'},
                                    default: {'background-color': 'white'},
                                    after: {'background-color': '#f6a000'},
                                    pointer: {'background-color': '#fff'}
                                }
                            };

        return yvc;
    });

});