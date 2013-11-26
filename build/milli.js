(function (context) {
    var vanilliPort, xhr, stubRequests = [];

    function AddStubRequest(method, url) {
        function StubRespondWith(status) {
            request.respondWith.status = status;

            this.body = function (body, contentType) {
                request.respondWith.body = body;
                request.respondWith.contentType = contentType;
                return this;
            };

            this.header = function (name, value) {
                request.respondWith.headers = request.respondWith.headers || {};
                request.respondWith.headers[name] = value;
                return this;
            };

            this.times = function (times) {
                request.times = times;
                return this;
            };

            this._addStubRequestBody = request;
        }

        var request = {
            criteria: {
                url: url,
                method: method
            },
            respondWith: {}
        };

        this.body = function (body, contentType) {
            request.criteria.body = body;
            request.criteria.contentType = contentType;
            return this;
        };

        this.header = function (name, value) {
            request.criteria.headers = request.criteria.headers || {};
            request.criteria.headers[name] = value;
            return this;
        };

        this.respondWith = function (status) {
            return new StubRespondWith(status);
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
        stub: function (request) {
            if (!request) {
                throw new Error("Stub content must be specified.");
            }

            stubRequests.push(request);

            return this;
        },
        expect: function (request) {
            if (!request._addStubRequestBody.times && (request._addStubRequestBody.times !== 0)) {
                request._addStubRequestBody.times = 1;
            }

            return this.stub(request);
        },
        clearStubs: function (done) {
            clearStubs(done);
        },
        verifyExpectations: function (done) {
            verify(done);
        },
        run: function (next) {
            sendStubs(stubRequests.map(function (stubRequest) {
                return stubRequest._addStubRequestBody;

            }), function (err) {
                stubRequests.length = 0;
                next(err);
            });
        }
    };

    context.onRequestTo = function (method, url) {
        return new AddStubRequest(method, url);
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