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
                lastHoveredNode.setColor(colors.nodes.normal);
            }
            node.setColor(colors.nodes.hovered);
            graph.syncDataToFrames();
            lastHoveredNode = node;

            document.getElementById('node_id').innerHTML = node.id();
            ['x', 'y', 'z'].forEach(function(e) {
                document.getElementById('node_' + e).innerHTML = node._pos[e];
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

    var nodes;
    var edges;

    var endpoint_nodes = [];
    var path_edges = [];

    function redrawGraph(nodes, edges) {
        graph.purgeNodes();
        graph.purgeEdges();
        for (var id in nodes) {
            nodes[id] = G.node(nodes[id], {color: colors.nodes.normal, id: id});
            graph.addNode(nodes[id]);
        }

        edges.forEach(function (edge) {
            var to_add = G.edge( edge, {color: colors.edges.normal} );
            graph.addEdge(to_add);
        });
    }

    socket.onopen = function() {
        socket.send('g?');
    };

    socket.onmessage = function(e) {
        var data = JSON.parse(e.data);
        if (data.hasOwnProperty('path')) {
            var path = data.path;

            endpoint_nodes.forEach(function(e) {
                try {
                    e.setColor(colors.nodes.normal);
                } catch(err) {} // shh it's okay, sometimes we just get invalid nodes.
            });
            path_edges.forEach(function(e) {
                try {
                    e.setColor(colors.edges.normal);
                } catch(err) {}
            });
            path_edges.length = 0;
            endpoint_nodes.length = 0;

            endpoint_nodes = [
            graph._nodeIds[data.endpoints[0]],
            graph._nodeIds[data.endpoints[1]]
            ];

            endpoint_nodes.forEach(function(e) {
                try {
                    e.setColor(colors.nodes.path);
                } catch(err) {}
            });

            path_edges = getEdgesForPath(graph, path);

            if (path_edges) {
                path_edges.forEach(function(edge) {
                    edge.setColor(colors.edges.path);
                });
            }

            graph.syncDataToFrames();
        } else {
            nodes = data.nodes;
            edges = data.edges;
            redrawGraph(nodes, edges, data.path);
        }

    };
};