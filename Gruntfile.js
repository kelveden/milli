/*globals module*/
module.exports = function (grunt) {
    "use strict";

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        copy: {
            main: {
                files: [
                    {
                        src: 'src/<%= pkg.name %>.js',
                        dest: 'build/<%= pkg.name %>.js'
                    }
                ]
            }
        },
        uglify: {
            options: {
                banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n',
                preserveComments: 'some'
            },
            build: {
                src: 'src/<%= pkg.name %>.js',
                dest: 'build/<%= pkg.name %>.min.js'
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
                autoWatch: false,
                singleRun: true,
                keepalive: true
            },
            unit: {
                options: {
                    configFile: 'karma.conf.js'
                }
            },
            e2e: {
                options: {
                    configFile: 'karma-e2e.conf.js',
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
                tasks: [ 'tdd' ],
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
        }
    });

    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-bower-task');
    grunt.loadNpmTasks('grunt-karma');
    grunt.loadNpmTasks('grunt-bump');

    grunt.registerTask('tdd', [ 'jshint', 'karma:unit', 'karma:e2e', 'watch' ]);
    grunt.registerTask('build', [ 'jshint', 'karma:unit', 'uglify', 'copy' ]);
    grunt.registerTask('ci', [ 'bower', 'build' ]);

    grunt.registerTask('default', [ 'build' ]);

};
