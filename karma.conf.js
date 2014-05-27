module.exports = function(config) {
    config.set({
        frameworks: [ 'mocha', 'chai' ],
        browsers: [ 'PhantomJS' ],
        autoWatch: true,
        files: [
            {
                pattern: 'bower_components/sinon/lib/sinon.js',
                watch: false
            },
            {
                pattern: 'bower_components/sinon/lib/sinon/util/*.js',
                watch: false
            },
            {
                pattern: 'bower_components/sinon/lib/sinon/call.js',
                watch: false
            },
            {
                pattern: 'bower_components/sinon/lib/sinon/spy.js',
                watch: false
            },
            {
                pattern: 'bower_components/superagent/superagent.js',
                watch: false
            },
            {
                pattern: 'bower_components/q/q.js',
                watch: false
            },
            'src/milli.js',
            'src/ignore.js',
            'test/unit/*.js',
            'test/e2e/*.js'
        ]
    });
};