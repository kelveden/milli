module.exports = function(config) {
    config.set({
        frameworks: [ 'mocha', 'chai' ],
        browsers: [ 'PhantomJS' ],
        autoWatch: true,
        files: [
            'src/**/*.js',
            'test/**/*-test.js'
        ]
    });
};