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
        }
    });

    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-bower-task');
    grunt.loadNpmTasks('grunt-karma');
    grunt.loadNpmTasks('grunt-bump');

    grunt.registerTask('tdd', [ 'jshint', 'karma:tdd:start', 'watch' ]);
    grunt.registerTask('tdd_rerun', [ 'jshint', 'karma:tdd:run' ]);

    grunt.registerTask('build', [ 'jshint', 'karma:ci', 'uglify', 'copy' ]);
    grunt.registerTask('ci', [ 'bower', 'build' ]);

    grunt.registerTask('default', [ 'build' ]);

};
