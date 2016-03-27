window.onload = function() {

    const colors = {
        nodes: {
            normal: 0x888888,
            path: 'red'
        },
        edges: {
            normal: 0x444444,
            path: 'white'
        }
    };

    var graph = G.graph({
        nodeImageTransparent: true,
        antialias: true,
        bgColor: "black",
        edgeWidth: 2,
        nodeSize: 6
    });

    graph.renderIn("graph");

    var socket = new WebSocket("ws://127.0.0.1:9000");
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

            if (path.length) {
                path_edges = graph.edges().filter(function(edge) {
                    var nodes = edge.nodes();
                    return path.some(function(pEdge) {
                        return ((nodes[0]._id == pEdge[0]) && (nodes[1]._id == pEdge[1])) ||
                               ((nodes[0]._id == pEdge[1]) && (nodes[1]._id == pEdge[0]))
                    });
                });
            }
            path_edges.forEach(function(edge) {
                edge.setColor(colors.edges.path);
            });

            graph.syncDataToFrames();
        } else {
            nodes = data.nodes;
            edges = data.edges;
            redrawGraph(nodes, edges, data.path);
        }

    };
};