from autobahn.asyncio.websocket import WebSocketServerProtocol, WebSocketServerFactory
import asyncio
import backend
import threading
import json
import sys


class GraphProtocol(WebSocketServerProtocol):
    valid_messages = {
        b'g?': backend.chart_dict.emit_value
    }

    def onConnect(self, request):
        print("Client connecting: {0}".format(request.peer))

    def onMessage(self, payload, isBinary):
        if isBinary: return
        self.valid_messages.get(payload, print)()

    def __init__(self):
        def _process_value(value):
            self.sendMessage(json.dumps(value).encode('utf-8'), isBinary=False)

        super(GraphProtocol, self).__init__()
        backend.chart_dict.add_observers(_process_value)
        backend.path_dict.add_observers(_process_value)



def main(*args):
    receive_loop = threading.Thread(target=backend.receive_loop, args=args)
    receive_loop.start()

    factory = WebSocketServerFactory()
    factory.protocol = GraphProtocol

    loop = asyncio.get_event_loop()
    coro = loop.create_server(factory, '127.0.0.1', 9000)
    server = loop.run_until_complete(coro)

    try:
        loop.run_forever()
    except KeyboardInterrupt:
        pass
    finally:
        print('Closing down the websockets server')
        server.close()
        loop.close()
        sys.exit(0)
if __name__ == '__main__':
    main(*sys.argv[1:])
