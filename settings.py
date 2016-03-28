"""Settings for the application:

DEFAULT_SUBSCRIBE_ADDRESS: String.
                           ZeroMQ address to subscribe to, unless overriden in commandline.
DEFAULT_SUBSCRIBE_ADDRESS: String.
                           ZeroMQ address to publish to (used in the example).
REBROADCAST_INTERVAL: Dict containing datetime.timedelta-compatible params.
                      Currently not in use, aim was to enable Observables to periodically rebroadcast their current
                      value
WEBSOCKETS_ADDRESS: Tuple containing address and port from which to broadcast to websockets.
"""


DEFAULT_SUBSCRIBE_ADDRESS = 'tcp://localhost:5677'
DEFAULT_PUBLISH_ADDRESS = "tcp://*:5677"
REBROADCAST_INTERVAL = {'seconds': 5}

WEBSOCKETS_ADDRESS = ('0.0.0.0', 9000)