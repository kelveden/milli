(function (context) {
    var vanilliPort, xhr, stubs = [];

    function Stub(method, urlOrResource) {
        function RespondWith(status) {
            stub.respondWith.status = status;

            this.entity = function (body, contentType) {
                stub.respondWith.body = body;
                stub.respondWith.contentType = contentType;
                return this;
            };

            this.body = function (body) {
                stub.respondWith.body = body;
                if (!stub.respondWith.contentType && defaultResponseContentType) {
                    stub.respondWith.contentType = defaultResponseContentType;
                }
                return this;
            };

            this.contentType = function (contentType) {
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

        this.entity = function (body, contentType) {
            stub.criteria.body = body;
            stub.criteria.contentType = contentType;
            return this;
        };

        this.body = function (body) {
            stub.criteria.body = body;
            if (!stub.criteria.contentType && defaultRequestContentType) {
                stub.criteria.contentType = defaultRequestContentType;
            }
            return this;
        };

        this.contentType = function (contentType) {
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
                    method: method
                },
                respondWith: {}
            },
            defaultRequestContentType,
            defaultResponseContentType;

        if (typeof urlOrResource === 'string') {
            stub.criteria.url = urlOrResource;
        } else {
            stub.criteria.url = urlOrResource.url;
            defaultRequestContentType = urlOrResource.consumes;
            defaultResponseContentType = urlOrResource.produces;
        }
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
        },
        registerResources: function (resources) {
            for (var resourceName in resources) {
                if (resources.hasOwnProperty(resourceName)) {
                    var resource = resources[resourceName];

                    if ((typeof resource !== 'string') && (!resource.url)) {
                        throw new Error("A uri template must be specified for the resource.");
                    }

                    context[resourceName] = resource;
                }
            }
        }
    };

    context.onRequest = function (method, urlOrResource, substitutionData) {
        function substituteTemplatePlaceholders(uriTemplate, substitutionData) {
            return uriTemplate.replace(/:[a-zA-Z][0-9a-zA-Z]+/g, function (placeholder) {
                var paramName = placeholder.substr(1),
                    paramValue = substitutionData[paramName];

                if (paramValue === undefined) {
                    throw new Error("Could not find substitution for placeholder '" + placeholder + "'.");
                }

                return paramValue;
            });
        }

        if (!urlOrResource) {
            throw new Error("The stub url must be specified.");
        }

        if (typeof urlOrResource !== 'string') {
            urlOrResource.url = substituteTemplatePlaceholders(urlOrResource.url, substitutionData || {});
        } else {
            urlOrResource = substituteTemplatePlaceholders(urlOrResource, substitutionData || {});
        }

        return new Stub(method, urlOrResource);
    };

    context.onGet = function (urlOrResource, substitutionData) {
        return context.onRequest('GET', urlOrResource, substitutionData);
    };

    context.onDelete = function (urlOrResource, substitutionData) {
        return context.onRequest('DELETE', urlOrResource, substitutionData);
    };

    context.onPut = function (urlOrResource, substitutionData) {
        return context.onRequest('PUT', urlOrResource, substitutionData);
    };

    context.onPost = function (urlOrResource, substitutionData) {
        return context.onRequest('POST', urlOrResource, substitutionData);
    };

})(window.exports ? window.exports : window);