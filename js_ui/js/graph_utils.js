var getEdgesForPath = function(graph, path) {
    if (!path.length) {
        return [];
    } 
    return graph._edges.filter(function(edge) {
        var nodes = edge.nodes();
        return path.some(function(pEdge) {
            return ((nodes[0]._id == pEdge[0]) && (nodes[1]._id == pEdge[1])) ||
            ((nodes[0]._id == pEdge[1]) && (nodes[1]._id == pEdge[0]))
        });
    });

}