describe("ignore adder", function () {
    function parseRequestBodyFrom(vanilliSpy, call) {
        return JSON.parse(vanilliSpy.getCall(call || 0).args[0].requestBody);
    }

    var fakeVanilli,
        vanilliPort = 1234,
        dummyVanilliResponse = JSON.stringify([ "someid" ]);

    after(function () {
        milli.removeDslFrom(window);
    });

    beforeEach(function () {
        milli.addDslTo(window);
        fakeVanilli = sinon.fakeServer.create();
        milli.configure({ port: vanilliPort });
    });

    afterEach(function () {
        fakeVanilli.restore();
    });

    it("creates a loose stub in response to a request for an ignored path", function () {
        var vanilliSpy = sinon.spy(fakeVanilli, "handleRequest");
        fakeVanilli.respondWith("POST", "http://localhost:" + vanilliPort + "/_vanilli/stubs", [ 200, {}, JSON.stringify([ "myid" ]) ]);

        milli.ignore("/my/url");

        expect(parseRequestBodyFrom(vanilliSpy).length).to.equal(1);
    });

    it("creates many loose stubs in response to a request for many ignored paths", function () {
        var vanilliSpy = sinon.spy(fakeVanilli, "handleRequest");
        fakeVanilli.respondWith("POST", "http://localhost:" + vanilliPort + "/_vanilli/stubs", [ 200, {}, dummyVanilliResponse ]);

        milli.ignore("/my/url", "/some/other/url", "/a/url/with/regex/.+");

        expect(parseRequestBodyFrom(vanilliSpy).length).to.equal(3);
    });

    it("creates many loose stubs in response to a request for an array of ignored paths", function () {
        var vanilliSpy = sinon.spy(fakeVanilli, "handleRequest");
        fakeVanilli.respondWith("POST", "http://localhost:" + vanilliPort + "/_vanilli/stubs", [ 200, {}, dummyVanilliResponse ]);

        milli.ignore(["/my/url", "/some/other/url", "/a/url/with/regex/.+"]);

        expect(parseRequestBodyFrom(vanilliSpy).length).to.equal(3);
    });

    it("creates many loose stubs in response to a request for a combination of arrays and single ignored paths", function () {
        var vanilliSpy = sinon.spy(fakeVanilli, "handleRequest");
        fakeVanilli.respondWith("POST", "http://localhost:" + vanilliPort + "/_vanilli/stubs", [ 200, {}, dummyVanilliResponse ]);

        milli.ignore(["/my/url", "/some/other/url" ], "/another/url");

        expect(parseRequestBodyFrom(vanilliSpy).length).to.equal(3);
    });

    it("creates a loose stub with the default response for an ignored rest resource", function () {
        var vanilliSpy = sinon.spy(fakeVanilli, "handleRequest");
        fakeVanilli.respondWith("POST", "http://localhost:" + vanilliPort + "/_vanilli/stubs", [ 200, {}, dummyVanilliResponse ]);

        // Given
        var myResource = {
            url: "/my/url"
        };

        // When
        milli.ignore(myResource);

        // Then
        expect(parseRequestBodyFrom(vanilliSpy)[0].criteria.url).to.deep.equal({ regex: "/my/url" });
    });

    it("creates a loose stub with the canned response specified in the rest registry for an ignored rest resource", function () {
        var vanilliSpy = sinon.spy(fakeVanilli, "handleRequest");
        fakeVanilli.respondWith("POST", "http://localhost:" + vanilliPort + "/_vanilli/stubs", [ 200, {}, dummyVanilliResponse ]);

        // Given
        var myResource = {
            url: "/my/url",
            produces: "text/plain",
            defaultResponse: {
                status: 234,
                body: "something"
            }
        };

        // When
        milli.ignore(myResource);

        // Then
        var stub = parseRequestBodyFrom(vanilliSpy)[0];
        expect(stub.respondWith.body).to.equal("something");
        expect(stub.respondWith.contentType).to.equal("text/plain");
    });

    it("throws an error if an ignored rest resource is specified with no contentType in 'produces' AND 'defaultResponse'", function () {
        // Given
        var myResource = {
            url: "/my/url",
            defaultResponse: {
                status: 234,
                body: "something"
            }
        };

        // Then
        expect(function () {
                milli.ignore(myResource);
            }
        ).to.throw(/contentType/);
    });

    it("uses the content type specified in the rest registry for an ignored rest resource", function () {
        var vanilliSpy = sinon.spy(fakeVanilli, "handleRequest");
        fakeVanilli.respondWith("POST", "http://localhost:" + vanilliPort + "/_vanilli/stubs", [ 200, {}, dummyVanilliResponse ]);

        // Given
        var myResource = {
            url: "/my/url",
            produces: "my/contenttype",
            defaultResponse: {
                status: 200,
                body: "something"
            }
        };

        // When
        milli.ignore(myResource);

        // Then
        expect(parseRequestBodyFrom(vanilliSpy)[0].respondWith.contentType).to.equal("my/contenttype");
    });

    it("uses the content type specified in the defaultResponse (if specified) for an ignored rest resource", function () {
        var vanilliSpy = sinon.spy(fakeVanilli, "handleRequest");
        fakeVanilli.respondWith("POST", "http://localhost:" + vanilliPort + "/_vanilli/stubs", [ 200, {}, dummyVanilliResponse ]);

        // Given
        var myResource = {
            url: "/my/url",
            produces: "my/contenttype",
            defaultResponse: {
                status: 234,
                body: "something",
                contentType: "text/plain"
            }
        };

        // When
        milli.ignore(myResource);

        // Then
        expect(parseRequestBodyFrom(vanilliSpy)[0].respondWith.contentType).to.equal("text/plain");
    });

    it("substitutes placeholders in ignored rest resource with [\\s\\S]+?", function () {
        var vanilliSpy = sinon.spy(fakeVanilli, "handleRequest");
        fakeVanilli.respondWith("POST", "http://localhost:" + vanilliPort + "/_vanilli/stubs", [ 200, {}, dummyVanilliResponse ]);

        // Given
        var resource = {
            url: "/:my/url/with/:placeholder"
        };

        // When
        milli.ignore(resource);

        // Then
        expect(parseRequestBodyFrom(vanilliSpy)[0].criteria.url).to.deep.equal({ regex: "/[\\s\\S]+?/url/with/[\\s\\S]+?" });
    });

    it("is able to add the same ignore twice", function () {
        var vanilliSpy = sinon.spy(fakeVanilli, "handleRequest");
        fakeVanilli.respondWith("POST", "http://localhost:" + vanilliPort + "/_vanilli/stubs", [ 200, {}, dummyVanilliResponse ]);

        // Given
        var resource = {
            url: "/:my/url/with/:placeholder"
        };

        // When
        milli.ignore(resource);
        milli.ignore(resource);

        // Then
        expect(parseRequestBodyFrom(vanilliSpy)[0].criteria.url).to.deep.equal({ regex: "/[\\s\\S]+?/url/with/[\\s\\S]+?" });
        expect(parseRequestBodyFrom(vanilliSpy)[0].criteria.url, 1).to.deep.equal({ regex: "/[\\s\\S]+?/url/with/[\\s\\S]+?" });
    });

    it("assigns a priority of 999 to an ignore stub", function () {
        var vanilliSpy = sinon.spy(fakeVanilli, "handleRequest");
        fakeVanilli.respondWith("POST", "http://localhost:" + vanilliPort + "/_vanilli/stubs", [ 200, {}, dummyVanilliResponse ]);

        milli.ignore("/my/url");

        expect(parseRequestBodyFrom(vanilliSpy)[0].priority).to.equal(100);
    });
});