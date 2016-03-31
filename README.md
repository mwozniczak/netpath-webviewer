# Network path webviewer

## What is it?

It's a tool for displaying an interactive 3d diagram of nodes, linked together.

[It looks like this.](http://imgur.com/gallery/4aNVJsB)

The data is fed from a ZeroMQ address, in a [NetworkX](https://networkx.github.io/) graph format.
(Note that the nodes need to have an extra attribute, `'position'`, that's a tuple of `(x, y, z)`
co-ordinates)

In addition, via ZeroMQ you can send it path information, i.e. list of consecutive nodes needed
to get from one point on the graph, to another. That information will then be displayed in browser
in real time.

## How do I use it?

You need to install the packages from requirements.txt (no setup.py yet, sorry!):

`pip install -r requirements.txt`

If you're running it on Python 2.x, you also need to:

`pip install trollius`

Once you have it set up, you need to run `websockets_server.py`, which will
set up both the websockets server from which the GUI part will receive data.
It will also listen for data coming in from ZeroMQ

As a last step, you need a ZeroMQ data provider. There is one named `example_sender.py`
you can use as a tech demo or a reference if you want to roll your own.

Note that if you want to use `example_sender.py` you will also need to

`pip install numpy`

Once that's done, in the `dist` folder you have the index.html file that displays
the data provided from ZeroMQ and processed by the server, all thanks to the
magic of websockets.

I recommend serving it from a local webserver of your choice, but it will also work
if you just open the file in your browser directly.

So to recap:

 1. Install python packages from `requirements.txt` and, if you're on Python 2, `trollius`.
 2. Run `websockets_server.py`
 3. Run `example_sender.py` as a separate process, or roll your own compatible zeroMQ data provider.
    Note that if you want to use `example_sender.py`, you also need to install numpy.
 4. Run `dist/index.html` in your browser, preferably from a webserver. (Note: see the 'How do I build'
    section for quick way to set up a temporary local dev-quality server)
 5. (Optional) tweak `settings.py` to match your preferences.

## How do I build the frontend part?

I'm using gulp for the web frontend parts, so to set it up you need node.js and npm.

Once you have that, in the project root do:

`npm install`

`npm install -g gulp bower`

`bower install`

`gulp`

That chain of commands should run Gulp.js, and its associated tasks that will detect file modifications
and rebuild the UI as needed. After the build tasks are done, the gulp build process will keep alive a
local dev webserver on http://localhost:8080 you can use. The server will autoreload on rebuild.