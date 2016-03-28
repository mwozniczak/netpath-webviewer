from itertools import tee
from threading import RLock
# import settings
# from datetime import datetime, timedelta


def pairwise(iterable):
    """Turns an iterable into a zip of value pairs: [i[n], i[n+1]
       Basically straight from the Python docs."""
    a, b = tee(iterable)
    next(b, None)
    return zip(a, b)


class ObservableValue():
    """
    A poor man's thread-safe implementation of the observer pattern, to
    the extent it was needed for this project.

    Granted, it could've been implemented with magic methods, but in this
    particular use case that would have probably been overkill.
    """
    def __init__(self, original_value=None):
        self.value = original_value
        self.observers = []
        self.lock = RLock()
        # self.last_emit = datetime.now()
        # self.emit_every = timedelta(**settings.REBROADCAST_INTERVAL)

    def add_observers(self, *observers):
        """
        Adds functions that will be notified when the value is overwritten
        Functions must take 1 parameter: the new value
        """
        self.observers.extend(observers)

    def emit_value(self):
        """
        Sends the new value to all observing functions, added via add_observers.
        """
        for observer in self.observers:
            observer(self.value)
        # self.last_emit = datetime.now()

    def overwrite(self, newval):
        """
        Detects whether the new value provided is different from the old one
        (via a simple == comparison). If so, this function then replaces the current
        value with a new one. Then calls self.emit_value, notifying all the observers.
        """
        with self.lock:
            if newval == self.value:
                # if datetime.now() - self.last_emit >= self.emit_every:
                #     self.emit_value()
                return
            self.value = newval
            self.emit_value()
