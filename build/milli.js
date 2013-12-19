(function (context) {
    function StubRespondWith(stub, status, defaultContentType) {
        stub.respondWith.status = status;

        this.entity = function (body, contentType) {
            stub.respondWith.body = body;
            stub.respondWith.contentType = contentType;
            return this;
        };

        this.body = function (body) {
            stub.respondWith.body = body;
            if (!stub.respondWith.contentType && defaultContentType) {
                stub.respondWith.contentType = defaultContentType;
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

    function Stub(method, url, defaultRequestContentType, defaultResponseContentType) {

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
            return new StubRespondWith(stub, status, defaultResponseContentType);
        };

        this.capture = function (captureId) {
            stub.capture = captureId;
            return this;
        };

        var stub = {
            criteria: {
                method: method
            },
            respondWith: {}
        };

        stub.criteria.url = url;
    }

    function Milli() {
        var vanilliPort, xhr,
            stubs = [],
            self = this,
            deferrer;

        self.apis = {};

        function deferredPromise() {
            if (deferrer) {
                return deferrer();
            } else {
                return {
                    promise: null
                };
            }
        }

        function resolve(done, deferred, result) {
            if (done) {
                done(result);
            } else if (deferrer) {
                deferred.resolve(result);
            } else {
                throw new Error("No 'done' callback was specified nor a deferrer in the configuration.");
            }
        }

        function reject(done, deferred, err) {
            if (done) {
                done(err);
            } else if (deferrer) {
                deferred.reject(err);
            } else {
                throw new Error("No 'done' callback was specified nor a deferrer in the configuration.");
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
            var deferred = deferredPromise();

            xhr.open("DELETE", "http://localhost:" + vanilliPort + "/_vanilli/stubs", true);

            xhr.onreadystatechange = function () {
                if (xhr.readyState === 4) {
                    if (xhr.status === 200) {
                        resolve(done, deferred);
                    } else {
                        reject(done, deferred, new Error("Could not clear stubs. " + xhr.responseText));
                    }
                }
            };

            xhr.send();

            return deferred.promise;
        }

        function verify(done) {
            var deferred = deferredPromise();

            xhr.open("GET", "http://localhost:" + vanilliPort + "/_vanilli/stubs/verification", true);

            xhr.onreadystatechange = function () {
                if (xhr.readyState === 4) {
                    if (xhr.status === 200) {
                        var response = JSON.parse(xhr.responseText);
                        if (response.errors.length === 0) {
                            resolve(done, deferred);
                        } else {
                            reject(done, deferred, new Error("Vanilli expectations were not met:\n\n" + response.errors.join("\n")));
                        }
                    } else {
                        reject(done, deferred, new Error("Could not verify expectations. " + xhr.responseText));
                    }
                }
            };

            xhr.send();

            return deferred.promise;
        }

        function getCapture(captureId, done) {
            var deferred = deferredPromise();

            xhr.open("GET", "http://localhost:" + vanilliPort + "/_vanilli/captures/" + captureId, true);

            xhr.onreadystatechange = function () {
                if (xhr.readyState === 4) {
                    if (xhr.status === 200) {
                        resolve(done, deferred, JSON.parse(xhr.responseText));
                    } else {
                        reject(done, deferred, new Error("Capture could not be found. " + xhr.responseText));
                    }
                }
            };

            xhr.send();

            return deferred.promise;
        }

        self.configure = function (config) {
            if (!config) {
                throw new Error("Config must be specified.");
            }

            if (!config.port) {
                throw new Error("config.port must be specified.");
            }

            vanilliPort = config.port;
            xhr = new XMLHttpRequest();
            deferrer = config.deferrer;
        };

        self.stub = function () {
            function addStub(stub) {
                if (stub instanceof Stub) {
                    throw new Error("Stub " + JSON.stringify(stub) + " is incomplete - make sure you use a call to 'respondWith' to complete the stub.");
                }

                if (!(stub instanceof StubRespondWith)) {
                    throw new Error("Argument " + JSON.stringify(stub) + " is not a stub - it is a " + typeof stub + ".");
                }

                if (!stub.vanilliRequestBody.times && (stub.vanilliRequestBody.times !== 0)) {
                    stub.vanilliRequestBody.times = 1;
                }

                stubs.push(stub);
            }

            if (arguments.length === 0) {
                throw new Error("Stub content must be specified.");
            }

            for (var i = 0; i < arguments.length; i++) {
                addStub(arguments[i]);
            }

            return self;
        };

        self.expect = function () {
            self.stub.apply(self, arguments);

            for (var i = 0; i < arguments.length; i++) {
                arguments[i].vanilliRequestBody.expect = true;
            }

            return self;
        };

        self.run = function (next) {
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
        };

        self.registerApi = function (apiName, resources) {
            if (!apiName) {
                throw new Error("An API name must be specified.");
            }

            for (var resourceName in resources) {
                if (resources.hasOwnProperty(resourceName)) {
                    var resource = resources[resourceName],
                        api = self.apis[apiName];

                    if ((typeof resource !== 'string') && (!resource.url)) {
                        throw new Error("A uri template must be specified for the resource.");
                    }

                    if (!api) {
                        api = self.apis[apiName] = {};
                    }

                    api[resourceName] = resource;
                }
            }
        };

        self.clearStubs = function (done) {
            if (done) {
                clearStubs(done);
            } else {
                return clearStubs;
            }
        };

        self.getCapture = function (captureId, done) {
            if (done) {
                getCapture(captureId, done);
            } else {
                return function () {
                    return getCapture(captureId);
                };
            }
        };

        self.verifyExpectations = function (done) {
            if (done) {
                verify(done);
            } else {
                return verify;
            }
        };
    }

    context.onRequest = function (method, urlOrResource, substitutionData) {
        var substitutedPlaceholders = {};

        function substituteTemplatePlaceholders(uriTemplate, substitutionData) {
            return uriTemplate.replace(/:[a-zA-Z][0-9a-zA-Z]+/g, function (placeholder) {
                var paramName = placeholder.substr(1),
                    paramValue = substitutionData[paramName];

                if (paramValue === undefined) {
                    throw new Error("Could not find substitution for placeholder '" + placeholder + "'.");
                }

                substitutedPlaceholders[paramName] = paramValue;

                return paramValue;
            });
        }

        function addLeftoverSubstitutionsAsQueryParameters(stub, substitutionData) {
            if (substitutionData) {
                for (var paramName in substitutionData) {
                    if (!substitutedPlaceholders[paramName]) {
                        stub.param(paramName, substitutionData[paramName]);
                    }
                }
            }
        }

        if (!urlOrResource) {
            throw new Error("The stub url must be specified.");
        }

        var stub, url;

        if (typeof urlOrResource !== 'string') {
            url = substituteTemplatePlaceholders(urlOrResource.url, substitutionData || {});
            stub = new Stub(method, url, urlOrResource.consumes, urlOrResource.produces);
        } else {
            url = substituteTemplatePlaceholders(urlOrResource, substitutionData || {});
            stub = new Stub(method, url);
        }

        addLeftoverSubstitutionsAsQueryParameters(stub, substitutionData);

        return stub;
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

    context.milli = new Milli();

})(window.exports ? window.exports : window);