var enhance_graph = function (graph) {
    'use strict';

    graph.colors = {
        nodes: {
            normal: 0x888888,
            hovered: 'white',
            path_from_socket: 'red',
            path_from_ui: 'orange',
        },
        edges: {
            normal: 0x444444,
            path_from_socket: 'red',
            path_from_ui: 'orange',
        }
    };

    graph.path = {
        from_socket: {
            endpoints: [],
            edges: []
        },
        from_ui: {
            endpoints: [undefined, undefined],
            edges: []
        }
    };

    graph.isPaused = false;

    graph.lastHoveredNode = undefined;

    graph.hover = function(node) {
        if (graph.lastHoveredNode) {
            graph.lastHoveredNode.setColor(graph.colors.nodes.normal);
        }
        node.setColor(graph.colors.nodes.hovered);
        graph.syncDataToFrames();
        graph.lastHoveredNode = node;

        document.getElementById('node_id').innerHTML = node.id();
        ['x', 'y', 'z'].forEach(function(e) {
            document.getElementById('node_' + e).innerHTML = node._pos[e].toFixed(3);
        });
    }

    graph.updateUI = function() {
        window.document.getElementById('auto_endpoint_from').innerHTML = graph.path.from_socket.endpoints[0]._id;
        window.document.getElementById('auto_endpoint_to').innerHTML = graph.path.from_socket.endpoints[1]._id;

        var edgesUl = window.document.getElementById('auto_edges');
        window.document.getElementById('auto_path_length').innerHTML = graph.path.from_socket.edges.length;
        edgesUl.innerHTML = '';
        graph.path.from_socket.edges.forEach(function (edge) {
            edgesUl.innerHTML += '<li>' + edge._nodes[0]._id + ' &lt;=&gt; ' + edge._nodes[1]._id + '</li>';
        });

        window.document.getElementById('node_count').innerHTML = graph._nodes.length;
        window.document.getElementById('edge_count').innerHTML = graph._edges.length;
    }

    graph.pickNode = function(which_endpoint, node) {
        var old_node = graph.path.from_ui.endpoints[which_endpoint];
        if (old_node !== undefined) {
            old_node.setColor(graph.colors.nodes.normal);
        }
        node.setColor(graph.colors.nodes.path_from_ui);
        graph.path.from_ui.endpoints[which_endpoint] = node;

        window.document.getElementById('from_ui_endpoint_'+which_endpoint).innerHTML = node._id;
        console.log(graph.path.from_ui.endpoints);
    }

    graph.togglePause = function() {
        graph.isPaused = !graph.isPaused;
    }

    graph.purgePaths = function (sources, skip_node_recolor, skip_edge_recolor) {
        sources = sources || Object.keys(graph.path);
        sources.forEach(function (source) {
            // if (!skip_node_recolor) {
            //     try {
            //         graph.path[source].endpoints.forEach(function (endpoint) {
            //             endpoint.setColor(graph.colors.nodes.normal);
            //         });
            //     } catch (err) {}
            // }
            // if (!skip_edge_recolor) {
            //     try {
            //         graph.path[source].edges.forEach(function (edge) {
            //             edge.setColor(graph.colors.edges.normal);
            //         });
            //     } catch (err) {}
            // }
            graph.path[source].endpoints.length = 0;
            graph.path[source].edges.length = 0;
            graph.colorize();
            graph.syncDataToFrames();
        });
    };

    graph.colorize = function() {
        console.log('endpoints', graph.path.from_socket.endpoints);

        graph._nodes.forEach(function (node) {
            if (graph.path.from_socket.endpoints.indexOf(node) !== -1) {
                node.setColor(graph.colors.nodes.path_from_socket);
            } else if ((graph.path.from_ui.endpoints.indexOf(node) !== -1)) {
                node.setColor(graph.colors.nodes.path_from_ui);
            } else {
                node.setColor(graph.colors.nodes.normal);
            }
        });
        graph._edges.forEach(function (edge) {
            if (graph.path.from_socket.edges.indexOf(edge) !== -1) {
                console.log('is edge:', edge, graph.path.from_socket.edges);
                edge.setColor(graph.colors.edges.path_from_socket);
            } else if (graph.path.from_ui.edges.indexOf(edge) !== -1) {
                edge.setColor(graph.colors.edges.path_from_ui);
            } else {
                edge.setColor(graph.colors.edges.normal);
            }
        });
        graph.syncDataToFrames();
    }

    graph.redraw = function (new_nodes, new_edges) {
        graph.purgePaths(null, true, true);
        graph.purgeNodes();
        graph.purgeEdges();
        // TODO: purge all other associated vars I've added

        for (var id in new_nodes) {
            graph.addNode(
                G.node( new_nodes[id], {color: graph.colors.nodes.normal, id: id} )
            );
        }

        new_edges.forEach(function (edge) {
            graph.addEdge(
                G.edge( edge, {color: graph.colors.edges.normal} )
            );
        });
        graph.syncDataToFrames();
    };

    graph.getEdges = function(path) {
        if (!path.length) {
            return [];
        } 
        return graph._edges.filter(function(edge) {
            var nodes = edge.nodes();
            var node_ids = [nodes[0]._id, nodes[1]._id].sort();
            return path.some(function(pEdge) {
                var path_nodes = pEdge.sort();
                return (node_ids[0] == path_nodes[0] && node_ids[1] == path_nodes[1]);
            });
        });
    }

    graph.drawPath = function (endpoints, path, from_ui) {
            if (graph.isPaused) {
                return;
            }
            var path_type = ['from_socket', 'from_ui'][(!!from_ui)|0];
            graph.purgePaths([path_type]);

            graph.path[path_type].endpoints = [
                graph._nodeIds[endpoints[0]],
                graph._nodeIds[endpoints[1]]
            ];

            // graph.path[path_type].endpoints.forEach(function(e) {
            //     try {
            //         e.setColor(graph.colors.nodes['path_'+path_type]);
            //     } catch(err) {}
            // });

            graph.path[path_type].edges = graph.getEdges(path);


            // if (graph.path[path_type].edges) {
            //     graph.path[path_type].edges.forEach(function(edge) {
            //         edge.setColor(graph.colors.edges['path_'+path_type]);
            //     });
            // }

            graph.updateUI();
            graph.colorize();

            graph.syncDataToFrames();
    }
};
