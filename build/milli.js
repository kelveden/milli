(function (context) {
    var vanilliPort, xhr, stubs = [];

    function Stub(method, url) {
        function RespondWith(status) {
            stub.respondWith.status = status;

            this.body = function (body, contentType) {
                stub.respondWith.body = body;
                stub.respondWith.contentType = contentType;
                return this;
            };

            this.header = function (name, value) {
                stub.respondWith.headers = stub.respondWith.headers || {};
                stub.respondWith.headers[name] = value;
                return this;
            };

            this.times = function (times) {
                stub.times = times;
                return this;
            };

            this.vanilliRequestBody = stub;
        }

        this.body = function (body, contentType) {
            stub.criteria.body = body;
            stub.criteria.contentType = contentType;
            return this;
        };

        this.header = function (name, value) {
            stub.criteria.headers = stub.criteria.headers || {};
            stub.criteria.headers[name] = value;
            return this;
        };

        this.param = function (name, value) {
            stub.criteria.query = stub.criteria.query || {};
            stub.criteria.query[name] = value;
            return this;
        };

        this.respondWith = function (status) {
            return new RespondWith(status);
        };

        var stub = {
            criteria: {
                url: url,
                method: method
            },
            respondWith: {}
        };
    }

    function sendStubs(stub, done) {
        xhr.open("POST", "http://localhost:" + vanilliPort + "/_vanilli/stubs", true);

        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4) {
                if (xhr.status === 200) {
                    done();
                } else if (xhr.status === 400) {
                    done(new Error("One or more stubs were invalid. " + xhr.responseText));
                } else {
                    done(new Error("Could not add stubs. " + xhr.responseText));
                }
            }
        };

        xhr.setRequestHeader('Content-Type', 'application/json');
        xhr.send(JSON.stringify(stub));
    }

    function clearStubs(done) {
        xhr.open("DELETE", "http://localhost:" + vanilliPort + "/_vanilli/stubs", true);

        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4) {
                if (xhr.status === 200) {
                    done();
                } else {
                    done(new Error("Could not clear stubs. " + xhr.responseText));
                }
            }
        };

        xhr.send();
    }

    function verify(done) {
        xhr.open("GET", "http://localhost:" + vanilliPort + "/_vanilli/stubs/verification", true);

        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4) {
                if (xhr.status === 200) {
                    var response = JSON.parse(xhr.responseText);
                    if (response.errors.length > 0) {
                        done(new Error("Vanilli expectations were not met:\n\n" + response.errors.join("\n")));
                    } else {
                        done();
                    }
                } else {
                    done(new Error("Could not verify expectations. " + xhr.responseText));
                }
            }
        };

        xhr.send();
    }

    context.milli = {
        configure: function (config) {
            if (!config) {
                throw new Error("Config must be specified.");
            }

            if (!config.port) {
                throw new Error("config.port must be specified.");
            }

            vanilliPort = config.port;
            xhr = new XMLHttpRequest();
        },
        stub: function (stub) {
            if (!stub) {
                throw new Error("Stub content must be specified.");
            }

            if (!stub.vanilliRequestBody.times && (stub.vanilliRequestBody.times !== 0)) {
                stub.vanilliRequestBody.times = 1;
            }

            stubs.push(stub);

            return this;
        },
        expect: function (stub) {
            stub.vanilliRequestBody.expect = true;
            return this.stub(stub);
        },
        clearStubs: function (done) {
            clearStubs(done);
        },
        verifyExpectations: function (done) {
            verify(done);
        },
        run: function (next) {
            sendStubs(stubs.map(function (stub) {
                return stub.vanilliRequestBody;

            }), function (err) {
                stubs.length = 0;

                if (err instanceof Error) {
                    throw err;
                } else if (err) {
                    throw new Error(err);
                } else {
                    next(err);
                }
            });
        }
    };

    context.onRequestTo = function (method, url) {
        return new Stub(method, url);
    };

    context.onGetTo = function (url) {
        return context.onRequestTo('GET', url);
    };

    context.onDeleteTo = function (url) {
        return context.onRequestTo('DELETE', url);
    };

    context.onPutTo = function (url) {
        return context.onRequestTo('PUT', url);
    };

    context.onPostTo = function (url) {
        return context.onRequestTo('POST', url);
    };

})(window.exports ? window.exports : window);