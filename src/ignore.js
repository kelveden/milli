(function () {
    var matchAnyPlaceholderSubstitution = "*",
        commonJsMode = (typeof module !== 'undefined') && (typeof module.exports !== 'undefined'),
        milli = commonJsMode ? require('./milli') : window.milli;

    function ignore() {
        function argsToArray(args) {
            return Array.prototype.slice.call(args, 0);
        }

        function setResponseContentTypeOn(respondWith, resource) {
            if (!resource.defaultResponse.contentType) {
                if (resource.produces) {
                    respondWith.contentType(resource.produces);
                } else {
                    throw new Error("Either a resource.produces or resource.defaultResponse.contentType must be specified.");
                }
            }
        }

        function createIgnoresFrom(objectOrArray) {
            function shallowClone(resource) {
                var clone = {};
                for (var prop in resource) {
                    if (resource.hasOwnProperty(prop)) {
                        clone[prop] = resource[prop];
                    }
                }

                return clone;
            }

            if (Array.isArray(objectOrArray)) {
                return objectOrArray.map(createIgnoresFrom);

            } else {
                var resource = objectOrArray,
                    substitutionData = {},
                    stubRespondWith;

                substitutionData[matchAnyPlaceholderSubstitution] = "[\\s\\S]+?";

                if (typeof resource === 'string') {
                    resource = new RegExp(resource);
                } else if (!(resource instanceof RegExp) && !(resource.url instanceof RegExp)) {
                    resource = shallowClone(resource);
                    resource.url = new RegExp(resource.url);
                }

                if (resource.defaultResponse) {
                    stubRespondWith = milli.onRequest(null, resource, substitutionData).respondWith(resource.defaultResponse);

                    if (typeof resource.defaultResponse.body !== 'undefined') {
                        setResponseContentTypeOn(stubRespondWith, resource);
                    }
                } else {
                    stubRespondWith = milli.onRequest(null, resource, substitutionData).respondWith(200);
                }

                return stubRespondWith.priority(100);
            }
        }

        function flatten(arrayOfThings) {
            return arrayOfThings.reduce(function (accumulation, thing) {
                if (Array.isArray(thing)) {
                    thing.forEach(function (item) {
                        accumulation.push(item);
                    });
                } else {
                    accumulation.push(thing);
                }
                return accumulation;
            }, []);
        }

        return milli.allow.apply(milli,
            flatten(
                createIgnoresFrom(
                    argsToArray(arguments))));
    }

    milli.ignore = ignore;
})();