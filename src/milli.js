(function (context) {
    function Milli(vanilliPort, vanilliFakePort) {

    }

    context.milli = {
        create: function (config) {
            if (!config) {
                throw new Error("Config must be specified.");
            }

            if (!config.vanilliPort) {
                throw new Error("config.vanilliPort must be specified.");
            }

            if (!config.vanilliFakePort) {
                throw new Error("config.vanilliFakePort must be specified.");
            }

            return new Milli(config.vanilliPort, config.vanilliFakePort);
        }
    };
})(window);