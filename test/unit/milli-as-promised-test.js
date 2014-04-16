/* jshint expr:true */
describe("milli promise api", function () {
    var fakeVanilli, vanilliPort = 1234;

    beforeEach(function () {
        fakeVanilli = sinon.fakeServer.create();
        milli.configure({ port: vanilliPort, promiser: Q });
    });

    afterEach(function () {
        fakeVanilli.restore();
    });

    it("can resolve a 'get a capture' promise", function (done) {
        var captureId = "1234",
            captureBody = { some: "data" };

        fakeVanilli.respondWith("GET", "http://localhost:" + vanilliPort + "/_vanilli/captures/" + captureId,
            [ 200, {}, JSON.stringify(captureBody) ]);

        milli.getCapture(captureId).then(function (capture) {
            expect(capture).to.deep.equal(captureBody);
            done();
        });

        fakeVanilli.respond();
    });

    it("can reject a 'get a capture' promise", function (done) {
        var captureId = "1234";

        fakeVanilli.respondWith("GET", "http://localhost:" + vanilliPort + "/_vanilli/captures/" + captureId,
            [ 500, {}, "" ]);

        milli.getCapture(captureId).catch(function (err) {
            expect(err).to.be.instanceof(Error);
            done();
        });

        fakeVanilli.respond();
    });

    it("can resolve a 'clear stubs' promise", function (done) {
        fakeVanilli.respondWith("DELETE", "http://localhost:" + vanilliPort + "/_vanilli/stubs",
            [ 200, {}, "" ]);

        milli.clearStubs().then(function () {
            done();
        });

        fakeVanilli.respond();
    });

    it("can reject a 'clear stubs' promise", function (done) {
        fakeVanilli.respondWith("DELETE", "http://localhost:" + vanilliPort + "/_vanilli/stubs",
            [ 500, {}, "" ]);

        milli.clearStubs().catch(function (err) {
            expect(err).to.be.instanceof(Error);
            done();
        });

        fakeVanilli.respond();
    });

    it("can resolve a 'verify expectations' promise", function (done) {
        var responseBody = { errors: [] };

        fakeVanilli.respondWith("GET", "http://localhost:" + vanilliPort + "/_vanilli/stubs/verification",
            [ 200, {}, JSON.stringify(responseBody) ]);

        milli.verifyExpectations().then(function () {
            done();
        });

        fakeVanilli.respond();
    });

    it("can reject a 'verify expectations' promise", function (done) {
        fakeVanilli.respondWith("GET", "http://localhost:" + vanilliPort + "/_vanilli/stubs/verification",
            [ 500, {}, "" ]);

        milli.verifyExpectations().catch(function (err) {
            expect(err).to.be.instanceof(Error);
            done();
        });

        fakeVanilli.respond();
    });
});