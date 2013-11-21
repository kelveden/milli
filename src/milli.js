(function (context) {
    function Milli() {
        var vanilliPort, vanilliFakePort;

        this.configure = function (config) {
            if (!config) {
                throw new Error("Config must be specified.");
            }

            if (!config.vanilliPort) {
                throw new Error("config.vanilliPort must be specified.");
            }

            if (!config.vanilliFakePort) {
                throw new Error("config.vanilliFakePort must be specified.");
            }

            vanilliPort = config.vanilliPort;
            vanilliFakePort = config.vanilliFakePort;
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