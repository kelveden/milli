/* jshint expr:true */
describe("milli", function () {
    var request = superagent;

    before(function (done) {
        milli.configure({ port: 8081 });
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
            milli.stub(onGetTo('/my/url')
                .respondWith(234), function (err) {

                done(err);
            });
        });

        it("will be used to serve the response for matching GET requests", function (done) {
            var expectedResponseBody = { myfield: "myvalue" };

            milli.stub(onGetTo('/my/url')
                .respondWith(234)
                .body(expectedResponseBody, "application/json"), function (err) {
                if (err) done(err);

                request.get("http://localhost:8081/my/url")
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

            milli.stub(onDeleteTo('/my/url')
                .respondWith(234)
                .body(expectedResponseBody, "application/json"), function (err) {
                if (err) done(err);

                request.del("http://localhost:8081/my/url")
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

            milli.stub(onPutTo('/my/url')
                .body(expectedRequestBody, "application/json")
                .respondWith(234)
                .body(expectedResponseBody, "application/json"), function (err) {
                if (err) done(err);

                request.put("http://localhost:8081/my/url")
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

            milli.stub(onPostTo('/my/url')
                .body(expectedRequestBody, "application/json")
                .respondWith(234)
                .body(expectedResponseBody, "application/json"), function (err) {
                if (err) done(err);

                request.post("http://localhost:8081/my/url")
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
            milli.stub(onGetTo('/my/url')
                .respondWith(234), function (err) {
                if (err) done(err);

                request.del("http://localhost:8081/my/url")
                    .end(function (err, res) {
                        if (err) return done(err);

                        expect(res.status).to.equal(404);
                        done();
                    });
            });
        });
    });
});