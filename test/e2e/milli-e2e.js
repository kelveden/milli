/* jshint expr:true */
describe("milli", function () {
    var request = superagent,
        vanilliPort = 14000;

    before(function (done) {
        milli.configure({ port: vanilliPort });
        done();
    });

    describe("stubs", function () {
        beforeEach(function (done) {
            milli.clearStubs(function (err) {
                done(err);
            });
        });

        it("can be cleared down", function (done) {
            milli.clearStubs(function (err) {
                expect(err).to.not.exist;
                done();
            });
        });

        it("can be recorded", function (done) {
            milli.stub(onGet('/my/url')
                .respondWith(234)).run(done);
        });

        it("can be used to verify expectations", function (done) {
            milli
                .stub(
                    expectRequest(onGet('/my/url').respondWith(234))
                        .times(2))
                .run(function () {
                    milli.verifyExpectations(function (err) {
                        expect(err).to.exist;
                        expect(err.message).to.match(/GET \/my\/url/);
                        done();
                    });
                });
        });

        it("will be used to serve the response for matching GET requests", function (done) {
            var expectedResponseBody = { myfield: "myvalue" };

            milli.stub(onGet('/my/url').respondWith(234)
                    .entity(expectedResponseBody, "application/json")).run(
                function () {
                    request.get("http://localhost:" + vanilliPort + "/my/url")
                        .end(function (err, res) {
                            if (err) return done(err);

                            expect(res.status).to.equal(234);
                            expect(res.body).to.deep.equal(expectedResponseBody);
                            expect(res.header['content-type']).to.equal("application/json");
                            done();
                        });
                });
        });

        it("will be used to serve the response for matching DELETE requests", function (done) {
            var expectedResponseBody = { myfield: "myvalue" };

            milli.stub(onDelete('/my/url').respondWith(234)
                    .entity(expectedResponseBody, "application/json")).run(
                function () {
                    request.del("http://localhost:" + vanilliPort + "/my/url")
                        .end(function (err, res) {
                            if (err) return done(err);

                            expect(res.status).to.equal(234);
                            expect(res.body).to.deep.equal(expectedResponseBody);
                            expect(res.header['content-type']).to.equal("application/json");
                            done();
                        });
                });
        });

        it("will be used to serve the response for matching PUT requests", function (done) {
            var expectedRequestBody = { myfield1: "myvalue1" },
                expectedResponseBody = { myfield2: "myvalue2" };

            milli.stub(onPut('/my/url')
                    .entity(expectedRequestBody, "application/json")
                    .respondWith(234)
                    .entity(expectedResponseBody, "application/json")).run(
                function () {
                    request.put("http://localhost:" + vanilliPort + "/my/url")
                        .send(expectedRequestBody)
                        .end(function (err, res) {
                            if (err) return done(err);

                            expect(res.status).to.equal(234);
                            expect(res.body).to.deep.equal(expectedResponseBody);
                            expect(res.header['content-type']).to.equal("application/json");
                            done();
                        });
                });
        });

        it("will be used to serve the response for matching POST requests", function (done) {
            var expectedRequestBody = { myfield1: "myvalue1" },
                expectedResponseBody = { myfield2: "myvalue2" };

            milli.stub(onPost('/my/url')
                    .entity(expectedRequestBody, "application/json")
                    .respondWith(234)
                    .entity(expectedResponseBody, "application/json")).run(
                function () {
                    request.post("http://localhost:" + vanilliPort + "/my/url")
                        .send(expectedRequestBody)
                        .end(function (err, res) {
                            if (err) return done(err);

                            expect(res.status).to.equal(234);
                            expect(res.body).to.deep.equal(expectedResponseBody);
                            expect(res.header['content-type']).to.equal("application/json");
                            done();
                        });
                });
        });

        it("will be used to serve the response for matching requests with an indeterminate method", function (done) {
            var expectedRequestBody = { myfield1: "myvalue1" },
                expectedResponseBody = { myfield2: "myvalue2" };

            milli.stub(onRequest(null, '/my/url')
                    .entity(expectedRequestBody, "application/json")
                    .respondWith(234)
                    .entity(expectedResponseBody, "application/json")).run(
                function () {
                    request.post("http://localhost:" + vanilliPort + "/my/url")
                        .send(expectedRequestBody)
                        .end(function (err, res) {
                            if (err) return done(err);

                            expect(res.status).to.equal(234);
                            expect(res.body).to.deep.equal(expectedResponseBody);
                            expect(res.header['content-type']).to.equal("application/json");
                            done();
                        });
                });
        });

        it("will NOT be used to serve responses for requests that do not match", function (done) {
            milli.stub(onGet('/my/url').respondWith(234)).run(
                function () {
                    request.del("http://localhost:" + vanilliPort + "/my/url")
                        .end(function (err, res) {
                            if (err) return done(err);

                            expect(res.status).to.equal(404);
                            done();
                        });
                });
        });
    });

    describe("captures", function () {
        beforeEach(function (done) {
            milli.clearStubs(function (err) {
                done(err);
            });
        });

        it("can be served", function (done) {
            var expectedResponseBody = { myfield: "myvalue" },
                captureId = "mycapture";

            milli.stub(onPost('/my/url').capture(captureId).respondWith(234))
                .run(function () {
                    request.post("http://localhost:" + vanilliPort + "/my/url")
                        .send(expectedResponseBody)
                        .end(function (err) {
                            if (err instanceof Error) return done(err);

                            milli.getCapture(captureId, function (capture) {
                                if (capture instanceof Error) {
                                    done(capture);
                                }

                                expect(capture.body).to.deep.equal(expectedResponseBody);
                                expect(capture.headers['content-type']).to.equal("application/json");

                                done();
                            });
                        });
                });

        });
    });
});