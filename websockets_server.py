""" Websocket server for graph data pulled from ZeroMQ

Usage: websocket_server.py [ZeroMQ address] [-h|--help]

    [ZeroMQ address] - ZeroMQ address to connect to.
                       ( e.g.: tcp://127.0.0.1:1234 )
                       If not specified, the one in settings.py
                       is used instead.
    [-h|--help]      - Show this message and exit.

"""

from autobahn.asyncio.websocket import WebSocketServerProtocol, WebSocketServerFactory
import asyncio
import backend
import threading
import json
import sys

import settings


class GraphProtocol(WebSocketServerProtocol):
    valid_messages = {
        b'g?': backend.chart_dict.emit_value
    }

    def onConnect(self, request):
        """Shows the address of the client connecting"""
        print('Client connecting: {0}'.format(request.peer))

    def onMessage(self, payload, isBinary):
        """When receiving a message, compare it against our list of
           valid messages, then if it's there, call the function therein.
           Otherwise just print the message"""
        if isBinary: return
        self.valid_messages.get(payload, print)()

    def __init__(self):
        """
        Instantiates the protocol, and binds sending the serialized JSON data
        to the following observables:
         - chart_dict
         - path_dict
        """
        def _process_value(value):
            self.sendMessage(json.dumps(value).encode('utf-8'), isBinary=False)

        super(GraphProtocol, self).__init__()
        backend.chart_dict.add_observers(_process_value)
        backend.path_dict.add_observers(_process_value)



def main(*args):
    """
    Starts the autobahn websockets server, and the receive loop for zeroMQ.
    Defaults for the ZeroMQ address (also overridable via commandline) and the
    websockets server can be overridden in the settings module.
    """
    receive_loop = threading.Thread(target=backend.receive_loop, args=args)
    receive_loop.start()

    factory = WebSocketServerFactory()
    factory.protocol = GraphProtocol

    loop = asyncio.get_event_loop()
    coro = loop.create_server(factory, *settings.WEBSOCKETS_ADDRESS)
    server = loop.run_until_complete(coro)

    try:
        print('Starting the websockets server on %s:%d' % settings.WEBSOCKETS_ADDRESS)
        loop.run_forever()
    except KeyboardInterrupt:
        pass
    finally:
        print('Closing down the websockets server')
        server.close()
        loop.close()
        sys.exit(0)

if __name__ == '__main__':
    if any([x.lower() in ('-h', '--help') for x in sys.argv[1:]]):
        print(__doc__)
        sys.exit()
    main(*sys.argv[1:])
