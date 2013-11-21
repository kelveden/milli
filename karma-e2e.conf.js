module.exports = function(config) {
    config.set({
        frameworks: [ 'mocha', 'chai' ],
        browsers: [ 'PhantomJS' ],
        autoWatch: true,
        files: [
            {
                pattern: 'bower_components/superagent/superagent.js',
                watch: false
            },
            'src/**/*.js',
            'test/e2e/*.js',
        ]
    });
};