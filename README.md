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

1. Setup zero or more stubs
2. Setup zero or more expectations
3. Run test code
4. Verify that any expectations specified have been met

API
---
### milli.stub(s1, s2, ..., sX)
Tells milli about one or more stubs. A simple stub might look like:

    milli.stub(
        onGet("my/url")
            .param("queryparam1", "matchthisvalue")
            .respondWith(200)
            .entity("some content", "text/plain");

This stub would only be matched against a GET request to "/my/url" that included the query parameter `queryparam1=matchthisvalue`. For more information see the section on
"Stubs and Expectations" below.

### milli.expect(e1, e2, ..., eX)
Tells milli about one or more expectations. Setting up an expectation looks exactly the same as setting up a stub except that there is the extra option of
specifying the number of times that the stub is expected to be invoked.

### milli.run(callback)
Causes milli to submit all stubs and expectations setup via `stub` and `expect` to vanilli. The specified callback is then executed.

### milli.verifyExpectations([doneCallback])
Verifies that all expectations setup via `expect` have been met. If expectations have not been met, the doneCallback argument is called passing in a new Error object to it as the first argument; otherwise the doneCallback is called with no arguments.

### milli.configure(config)
Allows the configuration of milli. See the 'Configuration' section below for more information.

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

### milli.getCapture(captureId, doneCallback)
Retrieves the details of the specified capture. The result is passed to the specified `doneCallback`.

Stubs
-----
A stub contains all the information that vanilli needs to match against an incoming HTTP request. If vanilli matches an
incoming HTTP request against a stub it will respond with the response specified against that stub.

The matching algorithm is lazy in the sense that whilst ALL criteria specifed in the stub MUST be matched against a request, beyond that
it is irrelevant what other data is in the request. E.g. if there are querystring parameters in the request that are not
explicitly mentioned in the stub, the stub will still match.

A new stub is created via one of the `onXXX` functions exposed globally by milli - where 'XXX' is
an HTTP method (e.g. `onGet`). Each one of these functions returns a new stub builder that exposes a fluent API for crafting HTTP request
criteria to match the stub against.

The minimum that milli/vanilli need to know is the URL to match against and what status code to respond with; e.g.:

    milli.stub(onGet("my/url")).respondWith(200));

However, there are plenty of other criteria to match against on the stub builder API:

### Stub Builder API
#### Stub.body(body)
Match against a specific request body regex.

#### Stub.contentType(contentType)
Match against a specific Content-Type header; equivalent to `Stub.header("Content-Type", value)`;

#### Stub.entity(body, contentType)
Convenience function equivalent to `Stub.body(body).contentType(contentType)`;

#### Stub.header(name, value)
Match against a specific header with value regex.

#### Stub.param(name, value)
Match against a specific querystring parameter with value regex.

#### Stub.capture(captureId)
Instructs milli to capture the content of the request matched against the stub by logging it with the specified `captureId`. This id can
then be used with `milli.getCapture(captureId)` to retrieve the captured details.

#### Stub.respondWith(status)
Instructs milli to respond with the specified status when an incoming request matched against the stub. Returns a builder that
can be used to flesh out the stub response further:

### Stub Response Builder API
#### StubRespondWith.body(body)
The entity body to respond with.

#### StubRespondWith.contentType(contentType)
The entity content type; equivalent to `StubRespondWith.header("Content-Type", value)`.

#### StubRespondWith.entity(body, contentType)
Convenience function equivalent to `StubRespondWith.body(body).contentType(contentType)`;

#### StubRespondWith.header(name, value)
Add the specified header to the response.

#### StubRespondWith.times(numberOfTimes)
Instructs vanilli to only match against this stub the specified number of times.

Expectations
------------
By default, milli stubs are simply that - stubs. If one wants to actually assert that a specified stub is called a specific number of times then an expectation can be used instead.
They are simply stubs with the one subtle difference:

* The `StubRespondWith.times` function has a different effect - 1) the stub will match ANY number of times, regardless of the number specified; 2) BUT `milli.verifyExpectations` will
fail if the number of times the stub was called differs the number of times specified against the stub.

Captures
--------
For more sophisticated matching of a stub against a request it might be necessary to let the stub match "loosely", capture the details of the actual request that matches against it
and then assert against that captured request. One does by telling milli to capture the request matched against a stub with `Stub.capture`
and then retrieving the captured request with `milli.getCapture`. E.g.:

      milli.stub(onGet("/my/url").capture("mycaptureid").respondWith(200))
      ...
      milli.getCapture("mycaptureid", function(capturedEntity) {
        // Assert against the captured request.
      });

NOTE: If the stub is matched multiple times then the capture will be of the LAST match.

Callback Mode vs Promise Mode
-----------------------------
All the async milli functions act in "callback mode" by default - that is, they take a `doneCallback` argument. However, they can also act in "promise mode" instead. In promise mode
milli will instead propagate the result of the async function via a promise `resolve` or `reject` as appropriate. E.g.

	milli.clearStubs()
		.then(function () {
			// Everything is OK
		}, function (err) {
			throw err;
		});

To be able to use "promise mode" you will need to do 2 things:

* Specify a `deferrer` in the Milli configuration (see documentation on `milli.configure` above).
* Do NOT pass a `doneCallback` into the function - if one is passed in then "callback mode" will be assumed.

Configuration
-------------
Configuration is specified via `milli.configure(config)`. The `config` parameter is an object with the following available fields:

* `port` (mandatory): The port on which Vanilli is running.
* `deferrer` (optional): An object implementing the `defer` API as described in the Promises/B specification. E.g. `Q`. If specified
it allows milli to operate in "promise mode". (See "Callback Mode vs Promise Mode" above.)
