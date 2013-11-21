/* jshint expr:true */
describe("milli", function () {
    var request = superagent;

    before(function (done) {
        milli.configure({ vanilliPort: 8081, vanilliFakePort: 8082 });
        done();
    });

    it("can clear down the stubs", function (done) {
        request.del("http://localhost:8081/expect")
            .end(function (err, res) {
                if (err) return done(err);

                expect(res.status).to.equal(200);
                done();
            });
    });

    it("can record a stub", function (done) {
        request.post("http://localhost:8081/expect")
            .send({
                criteria: {
                    url: "/my/url"
                },
                respondWith: {
                    status: 234,
                    entity: { something: "else" },
                    contentType: "application/json"
                }
            })
            .end(function (err, res) {
                if (err) return done(err);

                expect(res.status).to.equal(200);

                request.get("http://localhost:8082/my/url")
                    .end(function (err, res) {
                        if (err) return done(err);

                        expect(res.status).to.equal(234);
                        done();
                    });
            });
    });
});