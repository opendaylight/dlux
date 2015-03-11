// Math.sign is used a lot here and outdated brownser don't have it.
if (typeof Math.sign !== 'function') {
    Math.sign = function(value) {
        return value ? value < 0 ? -1 : 1 : 0;
    };
}

module.exports = function(stage, graph) {
    // constant TODO: change to use settings
    var MAX_SCALE = 2.0;
    var MIN_SCALE = 0.1;
    //------//

    // pointer options
    var POINTER_DEFAULT = 'auto';
    var POINTER_DRAG = 'all-scroll';

    var event = require('events');
    var emitter = new event.EventEmitter();
    var mouseDown = false;
    var draggedNode = null;

    var camera = stage.camera;
    var oldPos = new PIXI.Point(0, 0);

    // Start dragging the node
    stage.interactionManager.onMouseDown = function(e) {
        mouseDown = true;
        oldPos.set(-1, -1);

        draggedNode = graph.getNodeAt(e.layerX, e.layerY);

        if (draggedNode) {
            emitter.emit('nodeDown', draggedNode);
        }
    };

    // If the node is dragged, update the position
    // otherwise emit a callable event
    stage.interactionManager.onMouseMove = function(e) {
        if (draggedNode) { // drag node
            setPointerStyle(POINTER_DRAG);
            var realPos = camera.transform.inverse().transformPoint(e.layerX, e.layerY);
            draggedNode.pos.x = realPos[0];
            draggedNode.pos.y = realPos[1];
        }
        else if (mouseDown) { // do a pan
            setPointerStyle(POINTER_DRAG);
            if (oldPos.x == -1 && oldPos.y == -1) {
                oldPos.set(e.layerX, e.layerY);
            }

            var pos = new PIXI.Point(0,0);
            var deltaX = e.layerX - oldPos.x;
            var deltaY = e.layerY - oldPos.y;

            pos.set(
                Math.sign(deltaX) * Math.abs(deltaX),
                Math.sign(deltaY) * Math.abs(deltaY)
            );

            oldPos.set(e.layerX, e.layerY);
            camera.transform.translate(pos.x, pos.y);
        }
        else {
            var node = graph.getNodeAt(e.layerX, e.layerY);

            if (node) {
                emitter.emit('nodeOver', node);
                return;
            }

            emitter.emit('mouseMove', e);
        }
    };

    // Stop dragging the node
    stage.interactionManager.onMouseUp = function(e) {
        mouseDown = false;
        setPointerStyle(POINTER_DEFAULT);

        if (draggedNode) {
            emitter.emit('nodeUp', draggedNode);
            draggedNode = null;
        }
    };

    // Release drag or pan if out of the canvas
    stage.interactionManager.onMouseOut = function(e) {
        mouseDown = false;
        draggedNode = null;
        setPointerStyle(POINTER_DEFAULT);
    };

    function setPointerStyle(style) {
        if (document.body.style.cursor != style) {
            document.body.style.cursor = style;
        }
    }

    function zoom(e) {

        // stop scrolling while zooming
        e.preventDefault();

        /* Each brownser on each platform
         * set the wheel distance a different value. That's why the arbitrary value
        */
        var factor = 0.10;
        var sign = Math.sign(e.detail || e.wheelDelta);

        var currentScale = camera.scaleFactor;
        var scale = currentScale + (sign * factor);

        if (scale > MAX_SCALE) {
            scale = MAX_SCALE;
        }
        else if (scale < MIN_SCALE) {
            scale = MIN_SCALE;
        }
        camera.scaleFactor = scale;
    }

    // Mouse wheel to Zoom
    document.getElementById(stage.containerId).addEventListener('mousewheel', zoom, false); // chrome, safari
    document.getElementById(stage.containerId).addEventListener('DOMMouseScroll', zoom, false); // firefox

    return emitter;
};
