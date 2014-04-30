/* jshint expr:true */
describe("milli", function () {
    function parseRequestBodyFrom(vanilliSpy) {
        return JSON.parse(vanilliSpy.getCall(0).args[0].requestBody);
    }

    var fakeVanilli, vanilliPort = 1234,
        dummyUrl = "/some/url",
        dummyStatus = 234;

    beforeEach(function () {
        fakeVanilli = sinon.fakeServer.create();
        milli.configure({ port: vanilliPort });
    });

    afterEach(function () {
        fakeVanilli.restore();
    });

    it("can be configured", function () {
        milli.configure({ port: 1234 });
    });

    describe("configuration", function () {
        it("throws an error if no config object is specified", function () {
            expect(function () {
                milli.configure();
            }).to.throw(/config /i);
        });

        it("throws an error if no port is specified", function () {
            expect(function () {
                milli.configure({});
            }).to.throw(/port/i);
        });
    });

    describe("stub builder", function () {
        it("assigns the response entity to the stub response", function () {
            var body = { myfield: "myvalue" },
                contentType = "my/contenttype",
                stub = onGet(dummyUrl)
                    .respondWith(dummyStatus).entity(body, contentType);

            expect(stub.vanilliRequestBody.respondWith.body).to.deep.equal(body);
            expect(stub.vanilliRequestBody.respondWith.contentType).to.deep.equal(contentType);
        });

        it("assigns the response body to the stub response", function () {
            var body = { myfield: "myvalue" },
                stub = onGet(dummyUrl)
                    .respondWith(dummyStatus).body(body);

            expect(stub.vanilliRequestBody.respondWith.body).to.deep.equal(body);
        });

        it("assigns the response content type to the stub response", function () {
            var contentType = "my/contenttype",
                stub = onGet(dummyUrl)
                    .respondWith(dummyStatus).contentType(contentType);

            expect(stub.vanilliRequestBody.respondWith.contentType).to.deep.equal(contentType);
        });

        it("assigns the response status to the stub response", function () {
            var status = 234,
                stub = onGet(dummyUrl).respondWith(status);

            expect(stub.vanilliRequestBody.respondWith.status).to.equal(status);
        });

        it("assigns the response headers to the stub response", function () {
            var headerValue1 = "myvalue1",
                headerValue2 = "myvalue2",
                stub = onGet(dummyUrl).respondWith(dummyStatus)
                    .header('My-Header1', headerValue1)
                    .header('My-Header2', headerValue2);

            expect(stub.vanilliRequestBody.respondWith.headers['My-Header1']).to.equal(headerValue1);
            expect(stub.vanilliRequestBody.respondWith.headers['My-Header2']).to.equal(headerValue2);
        });

        it("assigns the URL to the stub criteria", function () {
            var url = "/my/url",
                stub = onGet(url).respondWith(dummyStatus);

            expect(stub.vanilliRequestBody.criteria.url).to.equal(url);
        });

        it("assigns the entity to the stub criteria", function () {
            var contentType = "my/contenttype",
                body = { myfield: "myvalue" },
                stub = onGet(dummyUrl).entity(body, contentType).respondWith(dummyStatus);

            expect(stub.vanilliRequestBody.criteria.body).to.deep.equal(body);
            expect(stub.vanilliRequestBody.criteria.contentType).to.equal(contentType);
        });

        it("assigns the body to the stub criteria", function () {
            var body = { myfield: "myvalue" },
                stub = onGet(dummyUrl).body(body).respondWith(dummyStatus);

            expect(stub.vanilliRequestBody.criteria.body).to.deep.equal(body);
        });

        it("assigns the content type to the stub criteria", function () {
            var contentType = "my/contenttype",
                stub = onGet(dummyUrl).contentType(contentType).respondWith(dummyStatus);

            expect(stub.vanilliRequestBody.criteria.contentType).to.equal(contentType);
        });

        it("assigns the headers to the stub criteria", function () {
            var headerValue1 = "myvalue1",
                headerValue2 = "myvalue2",
                stub = onGet(dummyUrl)
                    .header('My-Header1', headerValue1)
                    .header('My-Header2', headerValue2)
                    .respondWith(dummyStatus);

            expect(stub.vanilliRequestBody.criteria.headers['My-Header1']).to.equal(headerValue1);
            expect(stub.vanilliRequestBody.criteria.headers['My-Header2']).to.equal(headerValue2);
        });

        it("assigns the query params to the stub criteria", function () {
            var param1 = "myvalue1",
                param2 = "myvalue2",
                stub = onGet(dummyUrl)
                    .param('param1', param1)
                    .param('param2', param2)
                    .respondWith(dummyStatus);

            expect(stub.vanilliRequestBody.criteria.query.param1).to.equal(param1);
            expect(stub.vanilliRequestBody.criteria.query.param2).to.equal(param2);
        });

        it("assigns the correct number of times that the stub can respond", function () {
            var times = 3,
                stub = onGet(dummyUrl).respondWith(dummyStatus).times(times);

            expect(stub.vanilliRequestBody.times).to.equal(times);
        });

        it("substitutes template placeholders if present", function () {
            var stub = onGet("my/url/with/:myparam", {
                myparam: "myvalue"
            }).respondWith(dummyStatus);

            expect(stub.vanilliRequestBody.criteria.url).to.equal("my/url/with/myvalue");
        });

        it("throws an error if a template placeholder has no substitution", function () {
            expect(function () {
                onGet("my/url/with/:myparam", {});
            }).to.throw(/:myparam/);
        });

        it("considers template placeholders case-sensitively", function () {
            expect(function () {
                onGet("my/url/with/:myparam", { MYPARAM: "myvalue" });
            }).to.throw(/myparam/);
        });

        it("adds in the capture id to the stub request body", function () {
            var stub = onGet(dummyUrl).capture("mycapture").respondWith(dummyStatus);

            expect(stub.vanilliRequestBody.capture).to.equal("mycapture");
        });

        it("sets the response wait interval for the stub response based on respondWith.afterWaiting", function () {
            var stub = onGet(dummyUrl).capture("mycapture").respondWith(dummyStatus).afterWaiting(2000);

            expect(stub.vanilliRequestBody.respondWith.wait).to.equal(2000);
        });
    });

    it("stub cloner can clone a stub", function () {
        var stub = onGet('/some/url').respondWith(200),
            clonedStub = stub.clone();

        expect(JSON.stringify(stub)).to.equal(JSON.stringify(clonedStub));

        clonedStub.times(3);

        expect(JSON.stringify(stub)).to.not.equal(JSON.stringify(clonedStub));
    });

    describe("stub adder", function () {
        var dummyVanilliResponse = JSON.stringify([ "someid" ]);

        it("can be used to add a single stub", function (done) {
            fakeVanilli.respondWith("POST", "http://localhost:" + vanilliPort + "/_vanilli/stubs", [ 200, {}, dummyVanilliResponse ]);

            milli.stub(onGet('/some/url').respondWith(200)).run(done);

            fakeVanilli.respond();
        });

        it("can be used to add a single expectation (asynchronously)", function (done) {
            var vanilliSpy = sinon.spy(fakeVanilli, "handleRequest");
            fakeVanilli.respondWith("POST", "http://localhost:" + vanilliPort + "/_vanilli/stubs", [ 200, {}, dummyVanilliResponse ]);

            milli.stub(
                expectRequest(onGet('/some/url').respondWith(200)).times(3)
            ).run(done);

            fakeVanilli.respond();

            expect(parseRequestBodyFrom(vanilliSpy).times).to.equal(3);
        });

        it("can be used to add a single expectation (synchronously)", function () {
            // Given
            var vanilliSpy = sinon.spy(fakeVanilli, "handleRequest");
            fakeVanilli.respondWith("POST", "http://localhost:" + vanilliPort + "/_vanilli/stubs", [ 200, {}, dummyVanilliResponse ]);

            // When
            milli.expect(
                onGet('/some/url').respondWith(200).times(3)
            );

            fakeVanilli.respond();

            // Then
            var requestBody = parseRequestBodyFrom(vanilliSpy);

            expect(requestBody[0].times).to.equal(3);
        });

        it("will clone the stub used as an expectation", function (done) {
            fakeVanilli.respondWith("POST", "http://localhost:" + vanilliPort + "/_vanilli/stubs", [ 200, {}, dummyVanilliResponse ]);

            var stub = onGet('/some/url').respondWith(200);

            milli.stub(
                expectRequest(stub).times(3)
            ).run(done);

            fakeVanilli.respond();

            var vanilliRequest = fakeVanilli.requests[0];

            expect(stub.vanilliRequestBody.times).to.be.undefined;
            expect(vanilliRequest.vanilliRequestBody.times).to.equal(3);
        });

        it("sets the 'times' of an expectation to 1 if not explicitly specified (asynchronously)", function (done) {

            // Given
            var vanilliSpy = sinon.spy(fakeVanilli, "handleRequest");
            fakeVanilli.respondWith("POST", "http://localhost:" + vanilliPort + "/_vanilli/stubs", [ 200, {}, dummyVanilliResponse ]);

            // When
            milli.stub(
                expectRequest(onGet('/some/url').respondWith(200))
            ).run(done);

            fakeVanilli.respond();

            // Then
            var requestBody = parseRequestBodyFrom(vanilliSpy);

            expect(requestBody[0].times).to.equal(1);
        });

        it("sets the 'times' of an expectation to 1 if not explicitly specified (synchronously)", function () {

            // Given
            var vanilliSpy = sinon.spy(fakeVanilli, "handleRequest");
            fakeVanilli.respondWith("POST", "http://localhost:" + vanilliPort + "/_vanilli/stubs", [ 200, {}, dummyVanilliResponse ]);

            // When
            milli.expect(
                onGet('/some/url').respondWith(200)
            );

            fakeVanilli.respond();

            // Then
            var requestBody = parseRequestBodyFrom(vanilliSpy);

            expect(requestBody[0].times).to.equal(1);
        });

        it("throws an error if 'times' is specified against a standard stub (synchronously)", function () {
            expect(function () {
                milli.allow(onGet('/some/url').respondWith(200).times(3));
            }).to.throw(/times/);
        });

        it("can be used to chain multiple stubs together so that only one call is made to Vanilli", function (done) {
            var vanilliSpy = sinon.spy(fakeVanilli, "handleRequest");
            fakeVanilli.respondWith("POST", "http://localhost:" + vanilliPort + "/_vanilli/stubs", [ 200, {}, dummyVanilliResponse ]);

            milli
                .stub(onGet('/some/url').respondWith(200))
                .stub(onGet('/some/other/url').respondWith(200))
                .run(function () {
                    expect(vanilliSpy.calledOnce).to.be.truthy;

                    var call = vanilliSpy.getCall(0),
                        requestBody = JSON.parse(call.args[0].requestBody);

                    expect(requestBody[0].criteria.url).to.equal('/some/url');
                    expect(requestBody[1].criteria.url).to.equal('/some/other/url');

                    done();
                });

            fakeVanilli.respond();
        });

        it("can be used to chain a combination of stubs AND expectations together so that only one call is made to Vanilli", function (done) {
            // Given
            var vanilliSpy = sinon.spy(fakeVanilli, "handleRequest");
            fakeVanilli.respondWith("POST", "http://localhost:" + vanilliPort + "/_vanilli/stubs", [ 200, {}, dummyVanilliResponse ]);

            // When
            milli
                .stub(onGet('/some/url').respondWith(200))
                .stub(expectRequest(onGet('/some/other/url').respondWith(200)).times(2))
                .stub(onGet('/yet/another/url').respondWith(200)).run(function () {
                    expect(vanilliSpy.calledOnce).to.be.true;

                    done();
                });

            fakeVanilli.respond();

            // Then
            expect(vanilliSpy.calledOnce).to.be.true;

            var call = vanilliSpy.getCall(0),
                requestBody = JSON.parse(call.args[0].requestBody);

            expect(requestBody.length).to.equal(3);
        });

        it("throws an error for a missing url", function () {
            expect(function () {
                milli.stub(onGet().respondWith(200)).run();
            }).to.throw(/url/i);
        });

        it("throws an error if the stub content is missing", function () {
            expect(function () {
                milli.stub();
            }).to.throw(/stub content/i);
        });

        it("can accept multiple stubs in one call", function (done) {
            var vanilliSpy = sinon.spy(fakeVanilli, "handleRequest");
            fakeVanilli.respondWith("POST", "http://localhost:" + vanilliPort + "/_vanilli/stubs", [ 200, {}, dummyVanilliResponse ]);

            milli
                .stub(
                    onGet('/some/url').respondWith(200),
                    onGet('/another/url').respondWith(200),
                    onGet('/yet/another/url').respondWith(200)
                )
                .run(function () {
                    expect(vanilliSpy.calledOnce).to.be.truthy;

                    var call = vanilliSpy.getCall(0),
                        requestBody = JSON.parse(call.args[0].requestBody);

                    expect(requestBody[0].criteria.url).to.equal('/some/url');
                    expect(requestBody[1].criteria.url).to.equal('/another/url');
                    expect(requestBody[2].criteria.url).to.equal('/yet/another/url');

                    done();
                });

            fakeVanilli.respond();
        });

        it("can accept multiple expectations in one call", function (done) {
            var vanilliSpy = sinon.spy(fakeVanilli, "handleRequest");
            fakeVanilli.respondWith("POST", "http://localhost:" + vanilliPort + "/_vanilli/stubs", [ 200, {}, dummyVanilliResponse ]);

            milli
                .stub(
                    expectRequest(onGet('/some/url').respondWith(200)),
                    expectRequest(onGet('/another/url').respondWith(200)),
                    expectRequest(onGet('/yet/another/url').respondWith(200))
                )
                .run(function () {
                    expect(vanilliSpy.calledOnce).to.be.truthy;

                    var call = vanilliSpy.getCall(0),
                        requestBody = JSON.parse(call.args[0].requestBody);

                    expect(requestBody[0].criteria.url).to.equal('/some/url');
                    expect(requestBody[1].criteria.url).to.equal('/another/url');
                    expect(requestBody[2].criteria.url).to.equal('/yet/another/url');

                    done();
                });

            fakeVanilli.respond();
        });

        it("will reject an incomplete stub", function () {
            expect(function () {
                milli.stub(
                    onGet('/some/url').respondWith(200),
                    onGet('/some/other/url'),
                    onGet('/yet/another/url').respondWith(200)
                );
            }).to.throw(/is incomplete/);
        });

        it("will reject a non-stub", function () {
            expect(function () {
                milli.stub(
                    onGet('/some/url').respondWith(200),
                    { thisThing: "is not a stub" },
                    onGet('/yet/another/url').respondWith(200)
                );
            }).to.throw(/not a stub/);
        });

        it("will add the specified priority to the submitted stub", function () {
            var vanilliSpy = sinon.spy(fakeVanilli, "handleRequest");
            fakeVanilli.respondWith("POST", "http://localhost:" + vanilliPort + "/_vanilli/stubs", [ 200, {}, dummyVanilliResponse ]);

            milli.allow( onGet('/some/url').respondWith(200).priority(3));

            expect(parseRequestBodyFrom(vanilliSpy)[0].priority).to.equal(3);
        });

        it("does not assign a priority if one is not explicitly specified", function () {
            var vanilliSpy = sinon.spy(fakeVanilli, "handleRequest");
            fakeVanilli.respondWith("POST", "http://localhost:" + vanilliPort + "/_vanilli/stubs", [ 200, {}, dummyVanilliResponse ]);

            milli.allow(onGet('/some/url').respondWith(200));

            expect(parseRequestBodyFrom(vanilliSpy)[0].priority).to.be.undefined;
        });
    });

    describe('ignore adder', function () {
        var dummyVanilliResponse = JSON.stringify([ "someid" ]);

        it("creates a loose stub in response to a request for an ignored path", function () {
            var vanilliSpy = sinon.spy(fakeVanilli, "handleRequest");
            fakeVanilli.respondWith("POST", "http://localhost:" + vanilliPort + "/_vanilli/stubs", [ 200, {}, JSON.stringify([ "myid" ]) ]);

            milli.ignoreCallsTo("/my/url");

            expect(parseRequestBodyFrom(vanilliSpy).length).to.equal(1);
        });

        it("creates many loose stubs in response to a request for many ignored paths", function () {
            var vanilliSpy = sinon.spy(fakeVanilli, "handleRequest");
            fakeVanilli.respondWith("POST", "http://localhost:" + vanilliPort + "/_vanilli/stubs", [ 200, {}, dummyVanilliResponse ]);

            milli.ignoreCallsTo("/my/url", "/some/other/url", "/a/url/with/regex/.+");

            expect(parseRequestBodyFrom(vanilliSpy).length).to.equal(3);
        });

        it("creates many loose stubs in response to a request for an array of ignored paths", function () {
            var vanilliSpy = sinon.spy(fakeVanilli, "handleRequest");
            fakeVanilli.respondWith("POST", "http://localhost:" + vanilliPort + "/_vanilli/stubs", [ 200, {}, dummyVanilliResponse ]);

            milli.ignoreCallsTo(["/my/url", "/some/other/url", "/a/url/with/regex/.+"]);

            expect(parseRequestBodyFrom(vanilliSpy).length).to.equal(3);
        });

        it("creates many loose stubs in response to a request for a combination of arrays and single ignored paths", function () {
            var vanilliSpy = sinon.spy(fakeVanilli, "handleRequest");
            fakeVanilli.respondWith("POST", "http://localhost:" + vanilliPort + "/_vanilli/stubs", [ 200, {}, dummyVanilliResponse ]);

            milli.ignoreCallsTo(["/my/url", "/some/other/url" ], "/another/url");

            expect(parseRequestBodyFrom(vanilliSpy).length).to.equal(3);
        });

        it("creates a loose stub with the default response for an ignored rest resource", function () {
            var vanilliSpy = sinon.spy(fakeVanilli, "handleRequest");
            fakeVanilli.respondWith("POST", "http://localhost:" + vanilliPort + "/_vanilli/stubs", [ 200, {}, dummyVanilliResponse ]);

            // Given
            var myResource = {
                url: "/my/url"
            };

            // When
            milli.ignoreCallsTo(myResource);

            // Then
            expect(parseRequestBodyFrom(vanilliSpy)[0].criteria.url).to.equal("/my/url");
        });

        it("creates a loose stub with the canned response specified in the rest registry for an ignored rest resource", function () {
            var vanilliSpy = sinon.spy(fakeVanilli, "handleRequest");
            fakeVanilli.respondWith("POST", "http://localhost:" + vanilliPort + "/_vanilli/stubs", [ 200, {}, dummyVanilliResponse ]);

            // Given
            var myResource = {
                url: "/my/url",
                produces: "text/plain",
                defaultResponse: {
                    status: 234,
                    body: "something"
                }
            };

            // When
            milli.ignoreCallsTo(myResource);

            // Then
            var stub = parseRequestBodyFrom(vanilliSpy)[0];
            expect(stub.respondWith.body).to.equal("something");
            expect(stub.respondWith.contentType).to.equal("text/plain");
        });

        it("throws an error if an ignored rest resource is specified with no contentType in 'produces' AND 'defaultResponse'", function () {
            // Given
            var myResource = {
                url: "/my/url",
                defaultResponse: {
                    status: 234,
                    body: "something"
                }
            };

            // Then
            expect(function () {
                    milli.ignoreCallsTo(myResource);
                }
            ).to.throw(/contentType/);
        });

        it("uses the content type specified in the rest registry for an ignored rest resource", function () {
            var vanilliSpy = sinon.spy(fakeVanilli, "handleRequest");
            fakeVanilli.respondWith("POST", "http://localhost:" + vanilliPort + "/_vanilli/stubs", [ 200, {}, dummyVanilliResponse ]);

            // Given
            var myResource = {
                url: "/my/url",
                produces: "my/contenttype",
                defaultResponse: {
                    status: 200,
                    body: "something"
                }
            };

            // When
            milli.ignoreCallsTo(myResource);

            // Then
            expect(parseRequestBodyFrom(vanilliSpy)[0].respondWith.contentType).to.equal("my/contenttype");
        });

        it("uses the content type specified in the defaultResponse (if specified) for an ignored rest resource", function () {
            var vanilliSpy = sinon.spy(fakeVanilli, "handleRequest");
            fakeVanilli.respondWith("POST", "http://localhost:" + vanilliPort + "/_vanilli/stubs", [ 200, {}, dummyVanilliResponse ]);

            // Given
            var myResource = {
                url: "/my/url",
                produces: "my/contenttype",
                defaultResponse: {
                    status: 234,
                    body: "something",
                    contentType: "text/plain"
                }
            };

            // When
            milli.ignoreCallsTo(myResource);

            // Then
            expect(parseRequestBodyFrom(vanilliSpy)[0].respondWith.contentType).to.equal("text/plain");
        });

        it("substitutes placeholders in ignored rest resource with [\\s\\S]+?", function () {
            var vanilliSpy = sinon.spy(fakeVanilli, "handleRequest");
            fakeVanilli.respondWith("POST", "http://localhost:" + vanilliPort + "/_vanilli/stubs", [ 200, {}, dummyVanilliResponse ]);

            // Given
            var resource = {
                url: "/:my/url/with/:placeholder"
            };

            // When
            milli.ignoreCallsTo(resource);

            // Then
            expect(parseRequestBodyFrom(vanilliSpy)[0].criteria.url).to.equal("/[\\s\\S]+?/url/with/[\\s\\S]+?");
        });

        it("assigns a priority of 999 to an ignore stub", function () {
            var vanilliSpy = sinon.spy(fakeVanilli, "handleRequest");
            fakeVanilli.respondWith("POST", "http://localhost:" + vanilliPort + "/_vanilli/stubs", [ 200, {}, dummyVanilliResponse ]);

            milli.ignoreCallsTo("/my/url");

            expect(parseRequestBodyFrom(vanilliSpy)[0].priority).to.equal(100);
        });
    });

    describe('clearing stubs', function () {
        it("does not result in an error response if successful", function (done) {
            fakeVanilli.respondWith("DELETE", "http://localhost:" + vanilliPort + "/_vanilli/stubs", [ 200, {}, "" ]);

            milli.clearStubs(function (err) {
                expect(err).to.not.exist;
                done();
            });

            fakeVanilli.respond();
        });

        it("does result in an error response if unsuccessful", function (done) {
            fakeVanilli.respondWith("DELETE", "http://localhost:" + vanilliPort + "/_vanilli/stubs", [ 500, {}, "Error!" ]);

            milli.clearStubs(function (err) {
                expect(err).to.exist;
                expect(err).to.match(/Error!/);
                done();
            });

            fakeVanilli.respond();
        });
    });

    describe('expectation verifier', function () {
        it("causes error in callback if result contains verification errors", function (done) {
            fakeVanilli.respondWith("GET", "http://localhost:" + vanilliPort + "/_vanilli/stubs/verification", [ 200, {},
                JSON.stringify({
                    errors: [ "myerror1", "myerror2" ]
                })
            ]);

            milli.verifyExpectations(function (err) {
                expect(err).to.exist;
                expect(err).to.match(/myerror1/);
                expect(err).to.match(/myerror2/);
                done();
            });

            fakeVanilli.respond();
        });

        it("does not cause error in callback if result contains no verification errors", function (done) {
            fakeVanilli.respondWith("GET", "http://localhost:" + vanilliPort + "/_vanilli/stubs/verification", [ 200, {},
                JSON.stringify({
                    errors: []
                })
            ]);

            milli.verifyExpectations(function (err) {
                expect(err).to.not.exist;
                done();
            });

            fakeVanilli.respond();
        });
    });

    describe('REST resource definition', function () {
        it("can be used to default a response content type for a stub", function () {
            var myResource1 = {
                    url: "/my/url",
                    produces: "my/contenttype"
                };

            var stub = onGet(myResource1).respondWith(dummyStatus).body("somebody");

            expect(stub.vanilliRequestBody.respondWith.contentType).to.equal("my/contenttype");
        });

        it("can be used to default a request content type for a stub", function () {
            var myResource1 = {
                    url: "/my/url",
                    consumes: "my/contenttype"
                };

            var stub = onPut(myResource1).body("somebody").respondWith(dummyStatus);

            expect(stub.vanilliRequestBody.criteria.contentType).to.equal("my/contenttype");
        });

        it("can be used to substitute a uri template with its placeholders", function () {
            var myResource1 = {
                    url: "/my/url/:param1/:param2"
                };

            var stub = onGet(myResource1, {
                param1: "value1", param2: "value2"
            }).respondWith(dummyStatus).body("somebody");

            expect(stub.vanilliRequestBody.criteria.url).to.equal("/my/url/value1/value2");
        });

        it("uses the parameters not matched against uri template placeholders as querystring param expectations", function () {
            var myResource = {
                    url: "/my/url/:param1"
                };

            var stub = onGet(myResource, {
                param1: "value1", param2: "value2"
            }).respondWith(dummyStatus).body("somebody");

            expect(stub.vanilliRequestBody.criteria.url).to.equal("/my/url/value1");
            expect(stub.vanilliRequestBody.criteria.query.param2).to.equal("value2");
            expect(stub.vanilliRequestBody.criteria.query.param1).to.not.exist;
        });
    });
});