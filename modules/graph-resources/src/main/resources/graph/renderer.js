var defaultConfig = {
    width: 800,
    height: 600,
    switch: {
        src : '../assets/images/Device_switch_3062_unknown_64.png',
        width: 64,
        height: 64
    },
    host: {
        src : '../assets/images/Device_pc_3045_default_64.png',
        width: 64,
        height: 64
    }
};
module.exports = function(id, graph, config) {
    var merge = require('ngraph.merge');
    var Matrix = require('transformatrix');
    var container = validateContainer(id);

    // merge current config with default
    config = merge(config, defaultConfig);

    var stage = new PIXI.Stage(0xFFFFFF, true);

    // use to keep a reference of the node
    // and not always search in the layout.
    var nodes = {}, links = {};

    var width = config.width;
    var height = config.height;

    var renderer = PIXI.autoDetectRenderer(width, height);
    stage['containerId'] = id;
    stage['camera'] = {
        transform :new Matrix(),
        scaleFactor: 1
    };

    container.appendChild(renderer.view);

    var emitter = require('./eventListener.js')(stage, graph);
    var switchTexture = new PIXI.Texture.fromImage(config.switch.src);
    var hostTexture = new PIXI.Texture.fromImage(config.host.src);

    // add a physic layout to place the node in the screen
    var layoutCreator = require('ngraph.forcelayout'),
        physics = require('ngraph.physics.simulator');

    var layout = layoutCreator(graph, physics({
        springLength: 100,
        springCoeff: 0.0008,
        dragCoeff: 0.01,
        gravity: -1.2,
        theta: 1
    }));

    // link renderer
    var graphics = new PIXI.Graphics();

    graph.forEachNode(initializeNode);
    graph.forEachLink(initializeLink);

    // loop into the graph to find a node with his position.
    // certainly a better way to do it
    graph.getNodeAt = function(x, y) {
        var half = config.switch.width * 0.5 * stage.camera.scaleFactor;
        for (var key in nodes) {
            if (nodes.hasOwnProperty(key)) {
                var node = nodes[key];
                var pos = stage.camera.transform.transformPoint(node.pos.x, node.pos.y);
                var inside = pos[0] - half < x && x < pos[0] + half &&
                             pos[1] - half < y && y < pos[1] + half;
                if (inside) {
                    return nodes[key];
                }
            }
        }
    };

    // public API
    return {
        run : function() {
            // step the layout to make a good looking graph
            // remove after cause it's heavy for nothing
            for (var i = 0; i < 1000; ++i) {
                layout.step();
            }
            layout.dispose();
            centerGraph();
            requestAnimFrame(loop);
        }
    };

    // add the node sprite to the stage
    // and add it to the ref array
    function initializeNode(node) {
        var nodeSprite = null;

        if (node.data.group === 'switch') {
            nodeSprite = new PIXI.Sprite(switchTexture);
        } else if (node.data.group === 'host') {
            nodeSprite = new PIXI.Sprite(hostTexture);
        }

        var textOffset = 10;
        var text = new PIXI.Text(node.data.label, {
            font : '11px Arial'
        });

        var centerWidth = width * 0.5;
        var centerHeight = height * 0.5;

        nodeSprite.anchor.set(0.5, 0.5);

        layout.setNodePosition(node.id, Math.random() * centerWidth, Math.random() * centerHeight);
        nodeSprite.position.set(centerWidth, centerHeight);

        // text is a child of the sprite, we don't need to apply a transform
        text.anchor.set(0.5, 0.5);

        text.position.y = config.switch.width * 0.5 + textOffset;

        nodes[node.id] = {
            sprite: nodeSprite,
            pos: layout.getNodePosition(node.id)
        };

        nodeSprite.addChild(text);
        stage.addChild(nodeSprite);
    }

    // set the link into the ref array
    function initializeLink(link) {
        links[link.id] = {
            from: layout.getNodePosition(link.fromId),
            to : layout.getNodePosition(link.toId)
        };
        stage.addChild(graphics);
    }

    // update node position
    function updateNode(node) {
        var transPos = stage.camera.transform.transformPoint(node.pos.x, node.pos.y);
        var scale = stage.camera.scaleFactor;
        node.sprite.position.set(transPos[0], transPos[1]);
        node.sprite.scale.set(scale, scale);
    }

    // draw the link
    function updateLink(link) {
        var transFrom = stage.camera.transform.transformPoint(link.from.x, link.from.y);
        var transTo = stage.camera.transform.transformPoint(link.to.x, link.to.y);
        graphics.lineStyle(1, 0x000000, 1);
        graphics.moveTo(transFrom[0], transFrom[1]);
        graphics.lineTo(transTo[0], transTo[1]);
    }

    // render loop
    function loop() {
        graphics.clear();
        var key;

        // update link
        for (key in links) {
            if (links.hasOwnProperty(key)) {
                updateLink(links[key]);
            }
        }

        // update positions
        for (key in nodes) {
            if (nodes.hasOwnProperty(key)) {
                updateNode(nodes[key]);
            }
        }

        // render everything
        renderer.render(stage);

        // loop
        requestAnimFrame(loop);
    }

    // Move the graph near the center.
    // TODO : use a better algorithm like finding the centroid and move based on that position
    function centerGraph() {
        var size = getGraphSize();
        var moveX = Math.abs(config.width - size[0]) * 0.5;
        var moveY = Math.abs(config.height - size[1]) * 0.5;
        stage.camera.transform.translate(moveX, moveY);
    }

    // get the size of the graph by finding min and max pos
    function getGraphSize() {
        var minX = 10000,
            minY = 10000,
            maxX = -1,
            maxY = -1;

        for (var key in nodes) {
            var node = nodes[key];
            if (node.pos.x < minX) {
                minX = node.pos.x;
            } else if (node.pos.x > maxX) {
                maxX = node.pos.x;
            }
            if (node.pos.y < minY) {
                minY = node.pos.y;
            } else if (node.pos.y > maxY) {
                maxY = node.pos.y;
            }
        }

        return [maxX - minX, maxY - minY];
    }

    // check if the given id exist
    function validateContainer(id) {
        var container = document.getElementById(id);
        if (!container) {
            throw new NotFoundException('No container found for the givent id ' + id);
        }
        return container;
    }

    // custom exception
    // TODO : Move to another file
    function NotFoundException(message) {
        this.message = message;
        this.name = 'NotFoundException';
    }

};
