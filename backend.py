"""Backend for retrieving data from ZeroMQ and doing some initial massaging

   The most relevant bits are:

   Observables:
       graph_obj: containing the networkx diagram
       chart_dict: containing the diagram's structure, in a format
                   suitable for consumption by the websockets frontend
       path_dict: containing the preprocessed path retrieved from
                  ZeroMQ

   Functions:
       receive_loop: the main thread of the backend.
"""

import networkx
import pickle
import settings
import zmq

from utils import ObservableValue, pairwise

graph_obj = ObservableValue()
chart_dict = ObservableValue()
path_dict = ObservableValue()


def graph_to_dicts(graph):
    """Converts the networkx graph to a format suitable for the websockets frontend,
       and writes it to the chart_dict observable.

       Format:
       {'nodes': dictionary, where the keys are node IDs, and values are
                 tuples of (x,y,z) coordinates,
        'edges': list of edge definitions (i.e. [node_1_ID, node_2_ID]).
                 The nodes are sorted for cheaper lookup in the websockets frontend
    """
    global chart_dict

    chart_dict.overwrite({
        'nodes': {x: tuple(networkx.get_node_attributes(graph, 'position')[x]) for x in graph},
        'edges': [sorted(x) for x in graph.edges()]
    })


graph_obj.add_observers(graph_to_dicts)


def path_to_dict(path):
    """Converts the path data (which is a list of node IDs) from point A to point B,
       to list of edges (i.e. pairs of nodes) corresponding to the path. That data is then
       written to the path_dict observable for consumption by the websockets frontend.

       Format:
        {'path': list of node pairs,
         'endpoints': tuple: (start point ID, end point ID)}
    """
    global path_dict
    path_dict.overwrite({
        'path': [sorted(x) for x in pairwise(path)],
        'endpoints': (path[0], path[-1])
    })


def receive_loop(zmq_address=settings.DEFAULT_SUBSCRIBE_ADDRESS):
    """Main thread for receiving data from ZeroMQ, and passing it on to relevant observables:
       graph_obj (which then sends to the graph_to_dicts function), and path_dict.

       The data received from ZeroMQ is either a networkx graph (if so, it's written to the
       graph_obj observable), or a path (in which case, it's sent to path_to_dict function).
       As the ZeroMQ source is assumed to be secure, the type of object in a simple manner:
       if it's a list, it's a path. Otherwise, it's a graph.
    """
    global graph_obj
    global path_dict

    socket = zmq.Context().socket(zmq.SUB)
    socket.setsockopt(zmq.SUBSCRIBE, "".encode('ascii'))
    socket.connect(zmq_address)

    while True:
        received = pickle.loads(socket.recv())
        if type(received) == list:
            path_to_dict(received)
        else:
            graph_obj.overwrite(received)
