module.exports = function (grunt) {
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-mocha-test');
    grunt.loadNpmTasks('grunt-contrib-watch');

    grunt.initConfig({
        paths: {
            src: {
                all: [
                    'src/**/*.js'
                ]
            },
            test: [
                '<%= paths.src.all %>',
                'test/**/*.js'
            ]
        },

        jshint: {
            options: {jshintrc: '.jshintrc'},
            all: [
                'Gruntfile.js',
                '<%= paths.src.all %>',
                '<%= paths.test %>'
            ]
        },

        watch: {
            src: {
                files: [
                    '<%= paths.src.all %>',
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
