from itertools import tee
from threading import RLock
import settings
from datetime import datetime, timedelta


def pairwise(iterable):
    a, b = tee(iterable)
    next(b, None)
    return zip(a, b)


class ObservableValue():
    def __init__(self, original_value=None):
        self.value = original_value
        self.observers = []
        self.lock = RLock()
        self.last_emit = datetime.now()
        self.emit_every = timedelta(**settings.REBROADCAST_INTERVAL)

    def add_observers(self, *observers):
        self.observers.extend(observers)

    def emit_value(self):
        for observer in self.observers:
            observer(self.value)
        self.last_emit = datetime.now()

    def overwrite(self, newval):
        with self.lock:
            if newval == self.value:
                # if datetime.now() - self.last_emit >= self.emit_every:
                #     self.emit_value()
                return
            self.value = newval
            self.emit_value()
