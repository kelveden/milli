/* jshint expr:true */
describe("milli", function () {
    var server, vanilliPort = 1234,
        dummyDone = function () {},
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

    describe("stub addition", function () {
        it("does not result in an error response for a valid stub", function (done) {
            server.respondWith("POST", "http://localhost:" + vanilliPort + "/_vanilli/expect", [ 200, {}, "" ]);

            milli.stub(onGetTo('/some/url').respondWith(200), function (err) {
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