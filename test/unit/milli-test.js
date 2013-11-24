/* jshint expr:true */
describe("milli", function () {
    var server, vanilliPort = 1234,
        dummyDone = function () {
        },
        dummyStubContent = onGetTo("/some/url").respondWith(200);

    beforeEach(function () {
        server = sinon.fakeServer.create();
        milli.configure({ port: vanilliPort });
    });

    afterEach(function () {
        server.restore();
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
        var dummyUrl = "/some/url",
            dummyStatus = 234,
            dummyContentType = "some/contenttype",
            dummyEntity = { some: "data" };

        it("assigns the response body to the stub response", function () {
            var entity = { myfield: "myvalue" },
                stub = onGetTo(dummyUrl)
                    .respondWith(dummyStatus).body(entity, dummyContentType);

            expect(stub._addStubRequestBody.respondWith.body).to.deep.equal(entity);
        });

        it("assigns the response content type to the stub response", function () {
            var contentType = "my/contenttype",
                stub = onGetTo(dummyUrl)
                    .respondWith(dummyStatus).body(dummyEntity, contentType);

            expect(stub._addStubRequestBody.respondWith.contentType).to.deep.equal(contentType);
        });

        it("assigns the response status to the stub response", function () {
            var status = 234,
                stub = onGetTo(dummyUrl).respondWith(status);

            expect(stub._addStubRequestBody.respondWith.status).to.equal(status);
        });

        it("assigns the response headers to the stub response", function () {
            var headerValue = "myvalue",
                stub = onGetTo(dummyUrl).respondWith(dummyStatus)
                    .header('My-Header', headerValue);

            expect(stub._addStubRequestBody.respondWith.headers['My-Header']).to.equal(headerValue);
        });

        it("assigns the URL to the stub criteria", function () {
            var url = "/my/url",
                stub = onGetTo(url).respondWith(dummyStatus);

            expect(stub._addStubRequestBody.criteria.url).to.equal(url);
        });

        it("assigns the correct HTTP method to the stub criteria", function () {
            var method = "MYMETHOD",
                stub = onRequestTo('MYMETHOD', dummyUrl).respondWith(dummyStatus);

            expect(stub._addStubRequestBody.criteria.method).to.equal(method);
        });

        it("assigns the body to the stub criteria", function () {
            var body = { myfield: "myvalue" },
                stub = onGetTo(dummyUrl).body(body, dummyContentType).respondWith(dummyStatus);

            expect(stub._addStubRequestBody.criteria.body).to.deep.equal(body);
        });

        it("assigns the content type to the stub criteria", function () {
            var contentType = "my/contenttype",
                stub = onGetTo(dummyUrl).body(dummyEntity, contentType).respondWith(dummyStatus);

            expect(stub._addStubRequestBody.criteria.contentType).to.equal(contentType);
        });

        it("assigns the headers to the stub criteria");
        it("assigns the correct number of times that the stub can respond");
    });

    describe("stub adder", function () {
        it("can be used to add a single stub", function (done) {
            server.respondWith("POST", "http://localhost:" + vanilliPort + "/_vanilli/expect", [ 200, {}, "" ]);

            milli.stub(onGetTo('/some/url').respondWith(200), function (err) {
                expect(err).to.not.exist;
                done();
            });

            server.respond();
        });

        it("can be used to add multiple stubs", function (done) {
            server.respondWith("POST", "http://localhost:" + vanilliPort + "/_vanilli/expect", [ 200, {}, "" ]);

            milli.stub([
                onGetTo('/some/url').respondWith(200),
                onGetTo('/some/other/url').respondWith(200)
            ], function (err) {
                expect(err).to.not.exist;
                done();
            });

            server.respond();
        });

        it("results in an error response for an invalid stub", function (done) {
            server.respondWith("POST", "http://localhost:" + vanilliPort + "/_vanilli/expect", [ 400, {}, "" ]);

            milli.stub(onGetTo().respondWith(200), function (err) {
                expect(err).to.exist;
                expect(err.message).to.match(/invalid/i);
                done();
            });

            server.respond();
        });

        it("throws an error if the stub content is missing", function () {
            expect(function () {
                milli.stub(null, dummyDone);
            }).to.throw(/stub content/i);
        });

        it("throws an error if the done callback is missing", function () {
            expect(function () {
                milli.stub(dummyStubContent);
            }).to.throw(/done callback/i);
        });
    });

    describe('stub clearance', function () {
        it("does not result in an error response if successful", function (done) {
            server.respondWith("DELETE", "http://localhost:" + vanilliPort + "/_vanilli/expect", [ 200, {}, "" ]);

            milli.clearStubs(function (err) {
                expect(err).to.not.exist;
                done();
            });

            server.respond();
        });

        it("does result in an error response if unsuccessful", function (done) {
            server.respondWith("DELETE", "http://localhost:" + vanilliPort + "/_vanilli/expect", [ 500, {}, "Error!" ]);

            milli.clearStubs(function (err) {
                expect(err).to.exist;
                expect(err).to.match(/Error!/);
                done();
            });

            server.respond();
        });
    });
});