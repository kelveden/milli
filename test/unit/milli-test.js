/* jshint expr:true */
describe("milli", function () {
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
});