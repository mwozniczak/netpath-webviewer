window.onload = function() {
    'use strict';

    var lastHoveredNode;

    var graph = G.graph({
        nodeImageTransparent: true,
        antialias: true,
        bgColor: "black",
        edgeWidth: 2,
        nodeSize: 6,
        hover: function(node) {
            if (lastHoveredNode) {
                lastHoveredNode.setColor(graph.colors.nodes.normal);
            }
            node.setColor(graph.colors.nodes.hovered);
            graph.syncDataToFrames();
            lastHoveredNode = node;

            document.getElementById('node_id').innerHTML = node.id();
            ['x', 'y', 'z'].forEach(function(e) {
                document.getElementById('node_' + e).innerHTML = node._pos[e].toFixed(3);
            });
        },
        //click: nodeClick
    });

    graph.renderIn("graph");

    var hostname = window.location.hostname || '127.0.0.1';
    var socket = new WebSocket(
        "ws://"+ hostname +":9000"
        );
    socket.binaryType = "arraybuffer";

    enhance_graph(graph);

    socket.onopen = function() {
        socket.send('g?');
    };

    socket.onmessage = function(e) {
        var data = JSON.parse(e.data);
        if (data.hasOwnProperty('path')) {
            graph.drawPath(data.endpoints, data.path);
        } else {
            graph.redraw(data.nodes, data.edges, data.path);
        }

    };
};