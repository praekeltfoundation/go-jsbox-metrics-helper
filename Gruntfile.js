module.exports = function (grunt) {
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-mocha-test');
    grunt.loadNpmTasks('grunt-contrib-watch');

    grunt.initConfig({
        paths: {
            src: [
                'lib/**/*.js',
                ],
            test: [
                '<%= paths.src %>',
                'test/**/*.js'
            ]
        },

        jshint: {
            options: {jshintrc: '.jshintrc'},
            all: [
                'Gruntfile.js',
                '<%= paths.src %>',
                '<%= paths.test %>'
            ]
        },

        watch: {
            src: {
                files: [
                    '<%= paths.src %>',
                    '<%= paths.test %>'
                ],
                tasks: ['default'],
                options: {
                    atBegin: true
                }
            }
        },

        mochaTest: {
            test: {
                src: ['<%= paths.test %>'],
                options: {
                    reporter: 'spec'
                }
            }
        }
    });

    grunt.registerTask('test', [
        'jshint',
        'mochaTest'
    ]);

    grunt.registerTask('default', [
        'test'
    ]);
};
