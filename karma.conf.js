// https://github.com/Nikku/karma-browserify
module.exports = function(config) {
    config.set({
        browsers: [
            // 'Chrome',
            'PhantomJS'
        ],
        frameworks: ['browserify', 'mocha'],
        files: ['src/**/*.test.js'],
        reporters: ['spec'],
        preprocessors: { 'src/**/*.test.js': ['browserify'] },
        browserify: {
            debug: true,
            // needed to enable mocks
            plugin: [require('proxyquireify').plugin]
        },
        // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
        logLevel: config.LOG_INFO,
        autoWatch: false,
        singleRun: true,
        concurrency: Infinity
    });
};
