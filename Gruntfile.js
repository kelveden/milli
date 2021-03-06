/*globals module*/
module.exports = function (grunt) {
    "use strict";

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        complexity: {
            generic: {
                src: ['src/**/*.js'],
                options: {
                    cyclometric: 5,
                    halstead: 16,
                    maintainability: 100
                }
            }
        },
        copy: {
            src: {
                files: [
                    {
                        expand: true,
                        flatten: true,
                        src: 'src/*.js',
                        dest: '.'
                    }
                ]
            }
        },
        jshint: {
            all: [
                'Gruntfile.js',
                'src/**/*.js',
                'test/**/*.js'
            ],
            options: {
                jshintrc: '.jshintrc'
            }
        },
        karma: {
            options: {
                configFile: 'karma.conf.js'
            },
            tdd: {
                options: {
                    background: true,
                    singleRun: false
                }
            },
            ci: {
                options: {
                    background: false,
                    singleRun: true
                }
            }
        },
        bump: {
            options: {
                files: [ 'package.json', 'bower.json' ],
                commitFiles: [ 'package.json', 'bower.json' ],
                pushTo: "origin"
            }
        },
        watch: {
            js: {
                files: [ '**/*.js', '!node_modules/**/*.js' ],
                tasks: [ 'tdd_rerun' ],
                options: {
                    nospawn: true
                }
            }
        },
        bower: {
            install: {
                options: {
                    copy: false
                }
            }
        },
        vanilli: {
            options: {
                port: 14000,
                logLevel: "warn"
            }
        },
        mochaTest: {
            nodetest: {
                src: [ 'test/node/**/*.js' ],
                options: {
                    reporter: 'spec'
                }
            }
        },
        bunyan: {
            output: 'short'
        }
    });

    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-bower-task');
    grunt.loadNpmTasks('grunt-vanilli');
    grunt.loadNpmTasks('grunt-karma');
    grunt.loadNpmTasks('grunt-bump');
    grunt.loadNpmTasks('grunt-bunyan');
    grunt.loadNpmTasks('grunt-complexity');
    grunt.loadNpmTasks('grunt-mocha-test');

    grunt.registerTask('tdd', [ 'jshint', 'vanilli:start', 'karma:tdd:start', 'watch' ]);
    grunt.registerTask('tdd_rerun', [ 'jshint', 'karma:tdd:run' ]);

    grunt.registerTask('build', [ 'jshint', 'bunyan', 'vanilli:start', 'karma:ci', 'mochaTest', 'vanilli:stop', 'copy:src' ]);
    grunt.registerTask('ci', [ 'bower', 'build' ]);

    grunt.registerTask('default', [ 'build' ]);
};
