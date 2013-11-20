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
            all: {
                options: {
                    configFile: 'karma.conf.js',
                    autoWatch: false,
                    singleRun: true,
                    keepalive: true
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
        }
    });

    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-karma');
    grunt.loadNpmTasks('grunt-bump');

    grunt.registerTask('ci', [ 'jshint', 'karma:all', 'uglify', 'copy' ]);
    grunt.registerTask('tdd', [ 'jshint', 'karma:all', 'watch' ]);

    grunt.registerTask('default', [ 'ci' ]);
};
