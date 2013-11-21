/* jshint expr:true */
describe("milli", function () {
    var request = superagent;

    before(function (done) {
        milli.configure({ port: 8081 });
        done();
    });

    it("can clear down the stubs", function (done) {
        request.del("http://localhost:8081/_vanilli/expect")
            .end(function (err, res) {
                if (err) return done(err);

                expect(res.status).to.equal(200);
                done();
            });
    });

    it("can record a stub", function (done) {

        milli.onGetTo("/my/url")
            .respondWith(234, {
                body: { some: "data" },
                contentType: "application/json"
            });

        request.get("http://localhost:8082/my/url")
            .end(function (err, res) {
                if (err) return done(err);

                expect(res.status).to.equal(234);
                done();
            });
    });
});