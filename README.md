milli
=====
[![Build Status](https://travis-ci.org/kelveden/milli.png?branch=master)](https://travis-ci.org/kelveden/milli)
[![Dependencies Status](https://david-dm.org/kelveden/milli.png?branch=master)](https://david-dm.org/kelveden/milli)

A Javascript fluent API for use with https://github.com/kelveden/vanilli.

Installation
------------
milli is a single library with no dependencies. You can either pull the latest from the source `build` folder or install with bower:

	bower install milli

Usage
-----
milli manifests itself as a global singleton `milli`.

As milli talks to vanilli via the latter's REST API, milli is used in an asynchronous manner. A high-level view of usage (Mocha is the test framework that is used but milli has no explicit ties to it):

	beforeEach(function (done) {
		milli.clearStubs(done);
	});

	afterEach(function (done) {
		milli.verifyExpectations(done);
	});

	...

	it("does something", function (done) {
		milli
			.stub(stub1, stub2, ... , stubX)
			.expect(expectation1, expectation2, ... , expectationX)
			.run(function () {
				// Test stuff
			});
	});

	...

So, what's going on here? You can probably spot that there are 4 distinct steps:

1) Setup zero or more stubs
2) Setup zero or more expectations
3) Run test code
4) Verify that milli expectations have been met

API
---
### milli.stub(s1, s2, ..., sX)
TODO
### milli.expect(e1, e2, ..., eX)
TODO

### milli.run(callback)
Causes milli to submit all stubs and expectations setup via `stub` and `expect` to vanilli. The specified callback is then executed.

### milli.verifyExpectations([doneCallback])
Verifies that all expectations setup via `expect` have been met. If expectations have not been met, the doneCallback argument is called passing in a new Error object to it as the first argument; otherwise the doneCallback is called with no arguments.

#### Promise mode
In promise mode milli will not expect a `doneCallback` argument and will instead propagates the result via a promise `resolve` or `reject` as appropriate. E.g.

	milli.verifyExpectations()
		.then(function () {
			// Everything is OK
		}, function (err) {
			throw err;
		});

### milli.configure(config)
Allows the configuration of milli. The `config` parameter is an object with the following available fields:

* `port` (mandatory): The port on which Vanilli is running.
* `deferrer` (optional): An object implementing the "defer" API described in the Promises/B specification. E.g. `Q`. If specified it changes the behaviour of milli to provide promise-based responses.

### milli.registerApi(restServiceName, restServiceApi)
Provides a convenience mechanism for sharing RESTful service URLs across tests. Simply tell milli about the API of the REST service that you will be stubbing out and then milli will expose the URLs for that API for specifying in calls to `milli.stub` and `milli.expect`. E.g.

	milli.registerApi("myRestService", {
		restResource1: "some/url/or/other",
		restResource2: "some/.+/pattern",
		restResource3: "some/url/with/parameters/:param1"
	});

	...

	milli.stub(
		onGet(milli.apis.myRestService.restResource3, { param1: "somevalue" })
			.respondWith(200));


### milli.clearStubs(doneCallback)
Tells vanilli to clear down all stubs and expectations. After this is done, the specified `doneCallback` is executed.

#### Promise mode
In promise mode milli will not expect a `doneCallback` argument and will instead propagates the result via a promise `resolve` or `reject` as appropriate. E.g.

	milli.clearStubs()
		.then(function () {
			// Everything is OK
		}, function (err) {
			throw err;
		});

### milli.getCapture(captureId, doneCallback)
TODO

Configuration
-------------
See the `configure` function described in the API above.