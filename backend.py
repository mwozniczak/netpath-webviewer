import networkx
import pickle
import settings
import zmq

from io import BytesIO
from utils import ObservableValue, pairwise

graph_obj = ObservableValue()
chart_dict = ObservableValue()
path_dict = ObservableValue()


def graph_to_dicts(graph):
    global chart_dict

    to_write = {}

    try:
        to_write['nodes'] = {x: tuple(networkx.get_node_attributes(graph, 'position')[x]) for x in graph}
    except AttributeError:
        print(graph)
    to_write['edges'] = [sorted(x) for x in graph.edges()]

    chart_dict.overwrite(to_write)

graph_obj.add_observers(graph_to_dicts)

def path_to_dict(path):
    global path_dict
    path_dict.overwrite({
        'path': [sorted(x) for x in pairwise(path)],
        'endpoints': (path[0], path[-1])
    })


def receive_loop(zmq_address=settings.DEFAULT_SUBSCRIBE_ADDRESS):
    global graph_obj
    global path_dict

    socket = zmq.Context().socket(zmq.SUB)
    socket.setsockopt(zmq.SUBSCRIBE, "".encode('ascii'))
    socket.connect(zmq_address)

    while True:
        pickled_graph = socket.recv()
        pickled_path = socket.recv()

        raw_graph = BytesIO(pickled_graph)
        graph = networkx.read_gpickle(raw_graph)
        path = pickle.loads(pickled_path)

        graph_obj.overwrite(graph)

        # and likewise here
        path_to_dict(path)


