# OL3 FOSS4G FR 2016

## Set up

Dependencies pulled in with [npm](https://npmjs.org/).

After cloning the repo (and installing Node):

    npm install

## Examples

The examples all share the same basic layout, so they are built from templates.  To facilitate rebuilding of examples during development, a simple server and watch task are included.  This can be fired up with the following:

    npm start

This will build the examples, copy over files that don't need pre-processing, start a static file server rooted in the `.grunt/self` directory, and launch a file watcher task that will re-build/copy when files change.

While this task is running, the slideshow is available at http://localhost:4000/ and examples are at http://localhost:4000/examples/.  When the slides are deployed, the examples will have the same relative path to the slides (e.g. slides can link to examples with './examples/hello-world.html').

## Deploying

To publish the slides (with dependencies) to the `gh-pages` branch on GitHub, run the following:

    npm run deploy
