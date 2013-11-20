/* jshint expr:true */
describe("milli", function () {
    it("can be initialised", function () {
        expect(milli.create({ vanilliPort: 1234, vanilliFakePort: 5678 })).to.exist;
    });

    it("throws an error if no config is specified", function () {
        expect(function () {
            milli.create();
        }).to.throw(/config /i);
    });

    it("throws an error if no vanilliPort is specified", function () {
        expect(function () {
            milli.create({ vanilliFakePort: 5678 });
        }).to.throw(/vanilliPort/i);
    });

    it("throws an error if no vanilliFakePort is specified", function () {
        expect(function () {
            milli.create({ vanilliPort: 1234 });
        }).to.throw(/vanilliFakePort/i);
    });
});