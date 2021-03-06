/* jshint expr:true */
describe("milli", function () {
    var request = superagent,
        vanilliPort = 14000;

    before(function () {
        milli.configure({ port: vanilliPort });
        milli.addDslTo(window);
    });

    after(function () {
        milli.removeDslFrom(window);
    });

    beforeEach(function (done) {
        milli.clearStubs(done);
    });

    it("can clear down stubs synchronously", function (done) {
        milli.allow(
            onGet('/my/url').respondWith(234));

        request.get("http://localhost:" + vanilliPort + "/my/url")
            .end(function (err, res) {
                if (err) return done(err);
                expect(res.status).to.equal(234);

                milli.clearStubsSync();

                request.get("http://localhost:" + vanilliPort + "/my/url")
                    .end(function (err, res) {
                        if (err) return done(err);
                        expect(res.status).to.equal(404);
                        done();
                    });
            });
    });

    it("can verify expectations synchronously", function () {
        milli.expect(onGet('/my/url').respondWith(234));

        expect(milli.verifyExpectationsSync).to.throw(/Vanilli expectations were not met/);
    });

    it("can add stubs synchronously", function (done) {
        milli.allow(
            onGet('/my/url').respondWith(234),
            onGet('/another/url').respondWith(222));

        request.get("http://localhost:" + vanilliPort + "/my/url")
            .end(function (err, res) {
                if (err) return done(err);
                expect(res.status).to.equal(234);
                done();
            });
    });

    it("can add expectations synchronously", function (done) {
        milli.expect(
            onGet('/my/url').respondWith(234));

        request.get("http://localhost:" + vanilliPort + "/my/url")
            .end(function (err, res) {
                if (err) return done(err);
                expect(res.status).to.equal(234);
                done();
            });
    });

    it("can get body capture synchronously", function (done) {
        var expectedResponseBody = { myfield: "myvalue" },
            captureId = "mycapture";

        milli.expect(onPost('/my/url').capture(captureId).respondWith(234));

        request.post("http://localhost:" + vanilliPort + "/my/url")
            .send(expectedResponseBody)
            .end(function (err) {
                if (err instanceof Error) return done(err);

                var capture = milli.getCaptureSync(captureId);

                if (capture instanceof Error) {
                    done(capture);
                }

                expect(capture.body).to.deep.equal(expectedResponseBody);

                done();
            });
    });
});