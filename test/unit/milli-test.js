/* jshint expr:true */
describe("milli", function () {
    var server, vanilliPort = 1234,
        dummyUrl = "/some/url",
        dummyStatus = 234,
        milli;

    beforeEach(function () {
        server = sinon.fakeServer.create();
        milli = new Milli({ port: vanilliPort });
    });

    afterEach(function () {
        server.restore();
    });

    it("can be configured", function () {
        new Milli({ port: 1234 });
    });

    describe("configuration", function () {
        it("throws an error if no config object is specified", function () {
            expect(function () {
                new Milli();
            }).to.throw(/config /i);
        });

        it("throws an error if no port is specified", function () {
            expect(function () {
                new Milli({});
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

        it("assigns the correct HTTP method to the stub criteria", function () {
            var method = "MYMETHOD",
                stub = onRequest('MYMETHOD', dummyUrl).respondWith(dummyStatus);

            expect(stub.vanilliRequestBody.criteria.method).to.equal(method);
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
    });

    describe("stub adder", function () {
        it("can be used to add a single stub", function (done) {
            server.respondWith("POST", "http://localhost:" + vanilliPort + "/_vanilli/stubs", [ 200, {}, "" ]);

            milli.stub(onGet('/some/url').respondWith(200)).run(done);

            server.respond();
        });

        it("can be used to add a single expectation", function (done) {
            server.respondWith("POST", "http://localhost:" + vanilliPort + "/_vanilli/stubs", [ 200, {}, "" ]);

            milli.expect(onGet('/some/url').respondWith(200)).run(done);

            server.respond();
        });

        it("sets the 'times' of an expectation to 1 if not explicitly specified", function (done) {
            var request = onGet('/some/url').respondWith(200);
            server.respondWith("POST", "http://localhost:" + vanilliPort + "/_vanilli/stubs", [ 200, {}, "" ]);

            milli.expect(request).run(function () {
                expect(request.vanilliRequestBody.times).to.equal(1);
                done();
            });

            server.respond();
        });

        it("can be used to chain multiple stubs together so that only one call is made to Vanilli", function (done) {
            var vanilliSpy = sinon.spy(server, "handleRequest");
            server.respondWith("POST", "http://localhost:" + vanilliPort + "/_vanilli/stubs", [ 200, {}, "" ]);

            milli
                .stub(onGet('/some/url').respondWith(200))
                .stub(onGet('/some/other/url').respondWith(200)).run(function () {
                    expect(vanilliSpy.calledOnce).to.be.truthy;
                    done();
                });

            server.respond();
        });

        it("can be used to chain a combination of stubs AND expectations together so that only one call is made to Vanilli", function (done) {
            var vanilliSpy = sinon.spy(server, "handleRequest");
            server.respondWith("POST", "http://localhost:" + vanilliPort + "/_vanilli/stubs", [ 200, {}, "" ]);

            milli
                .stub(onGet('/some/url').respondWith(200))
                .expect(onGet('/some/other/url').respondWith(200).times(2))
                .stub(onGet('/yet/another/url').respondWith(200)).run(function () {
                    expect(vanilliSpy.calledOnce).to.be.truthy;
                    done();
                });

            server.respond();
        });

        it("throws an error for a missing url", function () {
            expect(function () {
                milli.stub(onGet().respondWith(200)).run();
            }).to.throw(/url/i);
        });

        it("throws an error if the stub content is missing", function () {
            expect(function () {
                milli.stub(null);
            }).to.throw(/stub content/i);
        });
    });

    describe('stub clearance', function () {
        it("does not result in an error response if successful", function (done) {
            server.respondWith("DELETE", "http://localhost:" + vanilliPort + "/_vanilli/stubs", [ 200, {}, "" ]);

            milli.clearStubs(function (err) {
                expect(err).to.not.exist;
                done();
            });

            server.respond();
        });

        it("does result in an error response if unsuccessful", function (done) {
            server.respondWith("DELETE", "http://localhost:" + vanilliPort + "/_vanilli/stubs", [ 500, {}, "Error!" ]);

            milli.clearStubs(function (err) {
                expect(err).to.exist;
                expect(err).to.match(/Error!/);
                done();
            });

            server.respond();
        });
    });

    describe('verifier', function () {
        it("causes error in callback if result contains verification errors", function (done) {
            server.respondWith("GET", "http://localhost:" + vanilliPort + "/_vanilli/stubs/verification", [ 200, {},
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

            server.respond();
        });

        it("does not cause error in callback if result contains no verification errors", function (done) {
            server.respondWith("GET", "http://localhost:" + vanilliPort + "/_vanilli/stubs/verification", [ 200, {},
                JSON.stringify({
                    errors: []
                })
            ]);

            milli.verifyExpectations(function (err) {
                expect(err).to.not.exist;
                done();
            });

            server.respond();
        });
    });
});