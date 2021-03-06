milli
=====
[![Build Status](https://travis-ci.org/kelveden/milli.png?branch=master)](https://travis-ci.org/kelveden/milli)

> *IMPORTANT*: DEPRECATED. Milli has been deprecated and ownership of vanilli has been handed over to the good folks at [MixRadio](https://github.com/mixradio/vanilli).

Installation
------------
milli is a single library with no dependencies.

If you intend to use milli javascript running in a browser, install with bower:

	bower install milli --save-dev

alternatively, for server-side use, use npm:

    npm install milli --save-dev

(You could, of course, install with npm and then use from client-side code via some sort of browserify-type package.)

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

So, what's going on here? You can probably spot that there are several distinct steps:

1. Clear down any stubs from previous tests
2. Setup zero or more stubs
3. Setup zero or more expectations
4. Run test code
5. Verify that any expectations specified have been met

API
---
### milli.configure(config)
Allows the configuration of milli. See the 'Configuration' section below for more information.

### Asynchronous
#### milli.stub(s1, s2, ..., sX)
Tells milli about one or more stubs. A simple stub might look like:

    milli.stub(
        onGet("my/url")
            .param("queryparam1", "matchthisvalue")
            .respondWith(200)
            .entity("some content", "text/plain"))
        .run(function () {
            // Do stuff and assert...
        });

This stub would only be matched against a GET request to "/my/url" that included the query parameter `queryparam1=matchthisvalue`. For more information see the section on
"Stubs and Expectations" below.

#### milli.expectRequest(e1, e2, ..., eX)
Tells milli about one or more expectations. Setting up an expectation looks exactly the same as setting up a stub except that there is the extra option of
specifying the number of times that the stub is expected to be invoked.

#### milli.run(callback)
Causes milli to submit all stubs and expectations setup via the asynchronous `stub` to vanilli. The specified callback is then executed. It is not necessary to run this when using milli synchronously.

#### milli.verifyExpectations([doneCallback])
Verifies that all expectations setup via `expect` have been met. If expectations have not been met, the doneCallback argument is called passing in a new Error object to it as the first argument; otherwise the doneCallback is called with no arguments.

#### milli.clearStubs(doneCallback)
Tells vanilli to clear down all stubs and expectations. After this is done, the specified `doneCallback` is executed.

#### milli.getCapture(captureId, doneCallback)
Retrieves the details of the specified capture. The result is passed to the specified `doneCallback`.

### Synchronous
Synchronous versions of the asynchronous API above exist that are identical to their asynchronous versions apart from being
(duh) synchronous and therefore returning the operation result as the return value of the function itself: `verifyExpectationsSync`, `clearStubsSync`, `getCaptureSync`.

Setting up stubs themselves makes use of synchronous functions that in turn make use of the same `onGet` et al functions as the async versions.

To synchronously store one or more stubs to vanilli, instead of using `stub` use `allow`:

    milli.allow(
        onGet(...),
        onPost(...),
        ...);

To synchronously store one or more expectations, instead of using `expectRequest` use `expect`:

    milli.expect(
        onGet(...),
        onPost(...),
        ...);

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

(Note that the url specified may be a string or a RegExp.) However, there are plenty of other criteria to match against on the stub builder API:

### Stub Builder API
#### Stub.body(body)
Match against a specific request body regex.

#### Stub.contentType(contentType)
Match against a specific Content-Type header; equivalent to `Stub.header("Content-Type", value)`;

#### Stub.entity(body, contentType)
Convenience function equivalent to `Stub.body(body).contentType(contentType)`;

#### Stub.header(name, value)
Match against a specific header with value. (Value may be a RegExp.)

#### Stub.param(name, value)
Match against a specific querystring parameter with value. (Value may be a RegExp.)

#### Stub.query(name, value)
Synnoym for `stub.param`. See above.

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

#### StubRespondWith.afterWaiting(numberOfMilliseconds)
Instructs vanilli to only respond with the stub after waiting the specified number of milliseconds. Useful for simulating potential race conditions or latency issues.

### Example
Here is an example of a more complex stub that makes use of the entire Stub API:

    milli.stub(
        onPost("/my/url")
            .entity("some submitted content", "text/plain")
            .param("queryparam1", "value1")
            .header("myheader", "myheadervalue")
            .capture("mycapture")
            .respondWith(200)
                .entity("my response", "text/plain")
                .header("myresponseheader", "some value")
                .afterWaiting(2000)
                .times(2));

This will match against any request that:

* Has the URL "/my/url" AND
* Has an entity body of "some submitted content" AND a Content-Type header "text/plain" AND
* Includes the querystring parameter "queryparam1" with value "value1"

NOTE: It will ONLY match 2 times at most.
NOTE: The last request matching the stub will be stored under the id "mycapture" for future reference with `milli.getCapture`.
NOTE: The response will only be completed after waiting 2000 milliseconds.

When the stub is matched, vanilli will respond with:

* Status 200 AND
* A body "my response" AND Content-Type header "text/plain" AND
* A header "myresponseheader" with the value "some value".

Expectations
------------
By default, milli stubs are simply that - stubs. If one wants to actually assert that a specified stub is called a specific number of times then an expectation can be used instead.
They are simply stubs with the one subtle difference:

* The `StubRespondWith.times` function has a different effect - 1) the stub will match ANY number of times, regardless of the number specified; 2) BUT `milli.verifyExpectations` will
fail if the number of times the stub was called differs the number of times specified against the stub.

Referring to a pre-defined REST API instead of plain urls
---------------------------------------------------------
Instead of specifying a url (e.g. `onGet('/my/url')`) one can also define a templated REST API ahead of time and reference that instead. The format of a single resource is crude:

    var myApi.myResource = {
        url: "/some/url/:param1",
        produces: "application/json"
    };

One can then simply reference the resource instead of a url in milli; e.g.:

	milli.allow(
		onGet(myApi.myResource, { param1: "whatever" }).respondWith(200)
	);

Note the substitution object that will be used to substitute values in the URI template of the resource. So, in the example above, the url that would actually be matched against by
milli would be `/some/url/whatever`.

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

* Specify a `promiser` in the Milli configuration (see documentation on `milli.configure` below).
* Do NOT pass a `doneCallback` into the function - if one is passed in then "callback mode" will be assumed.

Synchronous mode
----------------
All async operations have a corresponding synchronous operation: `milli.clearStubsSync`, `milli.verifyExpectationsSync` and `milli.getCaptureSync`. Stubs themselves can also be stored synchronously by using
the `milli.storeStubs` function instead of `milli.stub`. E.g.:

    function myTest() {
        milli.clearStubsSync();

        milli.storeStubs(
            onGet('/my/url').respondWith(234),
            onGet('/another/url').respondWith(222));

        ...Do somethng with the SUT...

        milli.verifyExpectationsSync();
    }

For more examples see the milli-sync-e2e.js test file.

Configuration
-------------
Configuration is specified via `milli.configure(config)`. The `config` parameter is an object with the following available fields:

* `port` (mandatory): The port on which Vanilli is running.
* `promiser` (optional): A reference to a promises library that MUST include `then` AND `defer` functions as described in the [Promises/B specification](http://wiki.commonjs.org/wiki/Promises/B).
(E.g. `{ promiser: Q }` to use Kris Kowal's Q library.) If specified it allows milli to operate in "promise mode". (See "Callback Mode vs Promise Mode" above.)

NOTE: milli just uses duck-typing on the promise library - so the library doesn't *have* to be Promises/B compatible: only to include the functions mentioned above.
