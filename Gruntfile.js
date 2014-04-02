module.exports = function(grunt) {

    grunt.initConfig({
        uglify: {
            options: {
                // mangle: false
            },
            js: {
                files: {
                    'build/oop.min.js': ['src/oop.js']
                }
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-uglify');

    grunt.registerTask('min', ['uglify']);

};