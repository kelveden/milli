(function (context) {
    function Milli() {
        var vanilliPort;

        this.configure = function (config) {
            if (!config) {
                throw new Error("Config must be specified.");
            }

            if (!config.port) {
                throw new Error("config.port must be specified.");
            }

            vanilliPort = config.vanilliPort;
        };

        this.onGetTo = function (url) {
            return {
                respondWith: function (status, data) {

                }
            };
        };
    }

    context.milli = new Milli();
})(window);