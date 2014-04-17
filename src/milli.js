(function (context) {
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

        this.afterWaiting = function (afterWaitingMilliseconds) {
            stub.respondWith.wait = afterWaitingMilliseconds;
            return this;
        };

        this.clone = function () {
            return new StubRespondWith(JSON.parse(JSON.stringify(stub)), status, defaultContentType);
        };

        this.vanilliRequestBody = stub;
    }

    function Milli() {

        var vanilliPort,
            stubs = [],
            self = this,
            Promiser;

        self.apis = {};

        function sendToVanilli(method, url, data, doneOrSync, successBuilder, errorBuilder) {
            var xhr = new XMLHttpRequest(),
                syncMode = ((typeof doneOrSync === 'boolean') && !doneOrSync),
                callbackMode = (typeof doneOrSync === 'function'),
                promiseMode = !callbackMode && !syncMode,
                deferred = promiseMode ? Promiser.defer() : null;

            function reactToCompletedResponse() {
                function success(result) {
                    if (syncMode) {
                        return result;
                    } else if (promiseMode) {
                        deferred.resolve(result);
                    } else {
                        doneOrSync(result);
                    }
                }

                function failure(error) {
                    if (syncMode) {
                        throw error;
                    } else if (promiseMode) {
                        deferred.reject(error);
                    } else {
                        doneOrSync(error);
                    }
                }

                if (xhr.readyState === 4) {
                    if (xhr.status === 200) {
                        var result = successBuilder(xhr);

                        if (result instanceof Error) {
                            failure(result);
                        } else {
                            return success(result);
                        }
                    } else {
                        failure(errorBuilder(xhr));
                    }
                }
            }

            xhr.open(method, url, !syncMode);
            if ((method === "POST") || (method === 'PUT')) {
                xhr.setRequestHeader('Content-Type', 'application/json');
            }

            if (!syncMode) {
                xhr.onreadystatechange = reactToCompletedResponse;
            }

            xhr.send(data);

            if (syncMode) {
                return reactToCompletedResponse();
            } else {
                if (promiseMode) {
                    return deferred.promise;
                }
            }
        }

        function sendStubs(done) {
            var body = JSON.stringify(
                stubs.map(function (stub) {
                    return stub.vanilliRequestBody;
                }));

            stubs.length = 0;

            return sendToVanilli("POST", "http://localhost:" + vanilliPort + "/_vanilli/stubs", body,
                done,
                function (xhr) {
                    return JSON.parse(xhr.responseText);
                },
                function (xhr) {
                    if (xhr.status === 400) {
                        return new Error("One or more stubs were invalid. " + xhr.responseText);
                    } else {
                        return new Error("Could not add stubs. " + xhr.responseText);
                    }
                });
        }

        function clearStubs(done) {
            return sendToVanilli("DELETE", "http://localhost:" + vanilliPort + "/_vanilli/stubs", null,
                done,
                function () {
                    return null;
                },
                function (xhr) {
                    return new Error("Could not clear stubs. " + xhr.responseText);
                });
        }

        function verify(done) {
            return sendToVanilli("GET", "http://localhost:" + vanilliPort + "/_vanilli/stubs/verification", null,
                done,
                function (xhr) {
                    var response = JSON.parse(xhr.responseText);
                    if (response.errors.length === 0) {
                        return null;
                    } else {
                        return new Error("Vanilli expectations were not met:\n\n" + response.errors.join("\n"));
                    }
                },
                function (xhr) {
                    return new Error("Could not verify expectations. " + xhr.responseText);
                });
        }

        function getCapture(captureId, done) {
            return sendToVanilli("GET", "http://localhost:" + vanilliPort + "/_vanilli/captures/" + captureId, null,
                done,
                function (xhr) {
                    return JSON.parse(xhr.responseText);
                },
                function (xhr) {
                    if (xhr.status === 404) {
                        return new Error("Capture could not be found. " + xhr.responseText);
                    } else {
                        return new Error("Capture could not be retrieved. " + xhr.responseText);
                    }
                });
        }

        function addStubs(stubDefinitions) {
            function addStub(stub) {
                if (stub instanceof Stub) {
                    throw new Error("Stub " + JSON.stringify(stub) + " is incomplete - make sure you use a call to 'respondWith' to complete the stub.");
                }

                if (!(stub instanceof StubRespondWith)) {
                    throw new Error("Argument " + JSON.stringify(stub) + " is not a stub - it is a " + typeof stub + ".");
                }

                stubs.push(stub);
            }

            if (stubDefinitions.length === 0) {
                throw new Error("Stub content must be specified.");
            }

            stubDefinitions.forEach(function (stubDefinition) {
                addStub(stubDefinition);
            });

            return stubs;
        }

        function argsToArray(args) {
            return Array.prototype.slice.call(args, 0);
        }

        self.configure = function (config) {
            if (!config) {
                throw new Error("Config must be specified.");
            }

            if (!config.port) {
                throw new Error("config.port must be specified.");
            }

            vanilliPort = config.port;
            Promiser = config.promiser;
            stubs.length = 0;
        };

        self.stub = function () {
            addStubs(argsToArray(arguments));

            return self;
        };

        self.allow = function () {
            addStubs(argsToArray(arguments))
                .forEach(function (stub) {
                    if (!isNaN(stub.vanilliRequestBody.times)) {
                        throw new Error("Stubs cannot be specified with 'times' - use an expectation instead.");
                    }
                });

            return sendStubs(false);
        };

        self.expect = function () {
            var expectations = argsToArray(arguments).map(
                function (stub) {
                    return expectRequest(stub);
                });

            addStubs(expectations);

            return sendStubs(false);
        };

        self.run = function (next) {
            sendStubs(function (err) {
                stubs.length = 0;

                if (err instanceof Error) {
                    throw err;
                } else {
                    next();
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
            return clearStubs(done);
        };

        self.clearStubsSync = function () {
            return clearStubs(false);
        };

        self.getCapture = function (captureId, done) {
            return getCapture(captureId, done);
        };

        self.getCaptureSync = function (captureId) {
            return getCapture(captureId, false);
        };

        self.verifyExpectations = function (done) {
            return verify(done);
        };

        self.verifyExpectationsSync = function () {
            return verify(false);
        };
    }

    function onRequest(method, urlOrResource, substitutionData) {
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
    }

    context.onGet = function (urlOrResource, substitutionData) {
        return onRequest('GET', urlOrResource, substitutionData);
    };

    context.onDelete = function (urlOrResource, substitutionData) {
        return onRequest('DELETE', urlOrResource, substitutionData);
    };

    context.onPut = function (urlOrResource, substitutionData) {
        return onRequest('PUT', urlOrResource, substitutionData);
    };

    context.onPost = function (urlOrResource, substitutionData) {
        return onRequest('POST', urlOrResource, substitutionData);
    };

    context.expectRequest = function (stub, times) {
        function convertToExpectation(stub) {
            if (isNaN(stub.vanilliRequestBody.times)) {
                stub.vanilliRequestBody.times = isNaN(times) ? 1 : times;
            }
            stub.vanilliRequestBody.expect = true;

            return stub;
        }

        return convertToExpectation(stub.clone());
    };

    context.milli = new Milli();
})(window);