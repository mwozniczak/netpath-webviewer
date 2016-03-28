from io import BytesIO
from random import choice
import networkx as nx
import pickle
import settings
import sys
import time
import zmq


def main(address=None):
    address = address or settings.DEFAULT_PUBLISH_ADDRESS
    socket = zmq.Context().socket(zmq.PUB)
    socket.bind(address)

    graph = nx.cycle_graph(500)
    nodes = graph.nodes()
    nx.set_node_attributes(graph, 'position', nx.spring_layout(graph, dim=3))
    start_node = choice(nodes)

    fileobj = BytesIO()
    nx.write_gpickle(graph, fileobj)
    pickled_graph = fileobj.getvalue()

    while True:
        socket.send(pickled_graph)
        path = nx.shortest_path(graph, choice(nodes), choice(nodes))
        socket.send(pickle.dumps(path))
        time.sleep(0.1)

if __name__ == '__main__':
    main()