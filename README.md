# Network path webviewer

## What is it?

It's a tool for displaying an interactive 3d diagram of nodes, linked together.
The data is fed from a ZeroMQ address, in a [NetworkX](https://networkx.github.io/) graph format.
(Note that the nodes need to have an extra attribute, `'position'`, that's a tuple of `(x, y, z)`
co-ordinates)

In addition, via ZeroMQ you can send it path information, i.e. list of consecutive nodes needed
to get from one point on the graph, to another. That information will then be displayed in browser
in real time.

## How do I use it?

First, you need Python 3 (at this time, I have taken no time to make it Python2-compatible, although
that should be fairly straightforward).

Then, you need to install the packages from requirements.txt (no setup.py yet, sorry!).

Once you have it set up, you need to run `websockets_server.py`, which will
set up both the server the web GUI will use to receive data from, and the listener for data coming in
from ZeroMQ.

As a last step, you need a ZeroMQ data provider. You can find an example one, that generates a random
diagram, named `example_sender.py`.

Once that's done, in the `dist` folder you have the index.html file that displays our data thanks to the
magic of websockets. I recommend running it from a local webserver of your choice.

So to recap:

 1. Install python (Python **3** for now!) packages from `requirements.txt`
 2. Run `websockets_server.py`
 3. Run `example_sender.py` as a separate process, or roll your own zeroMQ data provider
 4. run `dist/index.html` in your browser, preferably from a webserver.
 5. (Optional) tweak `settings.py` to match your preferences.

## How do I build the frontend part?

I'm using gulp for the web frontend parts, so to set it up you need node.js and npm.

Once you have that, in the project root do:

`npm install`

`npm install -g gulp bower`

`bower install`

`gulp`

That chain of commands should run Gulp.js, and its associated tasks that will detect file modifications
and rebuild the UI as needed.