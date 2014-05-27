/* jshint expr:true */
describe("milli in node", function () {
    var request = require('superagent'),
        expect = require('chai').expect,
        vanilliPort = 14000,
        milli = require('../../src/milli');

    before(function (done) {
        milli.configure({ port: vanilliPort });
        milli.clearStubs(function (err) {
            done(err);
        });
    });

    it("works", function (done) {
        var expectedResponseBody = { myfield: "myvalue" };

        milli.stub(milli.onGet('/my/url').respondWith(234)
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

    it("can load ignores module", function () {
        require('../../src/ignore');
        expect(milli.ignore).to.be.defined;
    });
});