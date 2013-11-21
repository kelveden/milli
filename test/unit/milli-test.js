/* jshint expr:true */
describe("milli", function () {
    it("can be configured", function () {
        milli.configure({ vanilliPort: 1234, vanilliFakePort: 5678 });
    });

    describe("configuration", function () {
        it("throws an error if no config object is specified", function () {
            expect(function () {
                milli.configure();
            }).to.throw(/config /i);
        });

        it("throws an error if no vanilliPort is specified", function () {
            expect(function () {
                milli.configure({ vanilliFakePort: 5678 });
            }).to.throw(/vanilliPort/i);
        });

        it("throws an error if no vanilliFakePort is specified", function () {
            expect(function () {
                milli.configure({ vanilliPort: 1234 });
            }).to.throw(/vanilliFakePort/i);
        });
    });
});