window.onload = function() {
    'use strict';

    // var lastHoveredNode;

    var graph = G.graph({
        nodeImageTransparent: true,
        antialias: true,
        bgColor: "black",
        edgeWidth: 2,
        nodeSize: 6,
        hover: function(node) {
            graph.hover(node);
        },
        click: function(node) {
            graph.pickNode(0, node);
        },
        rightClick: function(node) {
            graph.pickNode(1, node);
        }
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