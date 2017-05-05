module.exports = function(grunt) {
    require("matchdep").filterDev("grunt-*").forEach(grunt.loadNpmTasks);

    var pkg = grunt.file.readJSON('package.json');

    /**
     * Major Version and Version Number
     *
     * @description
     * Increase the version number to the desired version for css and javascript
     * files. This will also create a version directory in the /cdn folder in the structure
     * of /cdn/<major_version/<version>/ that contains the javascript and css.
     */
    var major_version = "2";
    var version = "2.0.0-beta";

    grunt.initConfig({
        pkg: pkg,
        version: version,
        major_version: major_version,

        mkdir: {
            prod: {
                options: {
                    mode: 0777,
                    create: ['cdn/<%= major_version %>/<%= version %>/css']
                }
            }
        },

        sass: {
            dev: {
                options: {
                    outputStyle: 'nested',
                    sourceMap: true,
                },
                files: {
                    'tophat.css': 'source/sass/topcat.scss'
                }
            },
            prod: {
                options: {
                    outputStyle: 'compressed',
                    sourceMap: false,
                },
                files: {
                    'cdn/<%= major_version %>/<%= version %>/css/tophat.css': 'source/sass/tophat.scss',
                }
            }
        },

        copyFiles: '**/*.{eot,svg,ttf,woff,pdf}',

        copy: {
            dev: {
                files: [
                    // includes files within path
                    {
                        expand: true,
                        cwd: 'source/',
                        src: ['<%= copyFiles %>'],
                        dest: '/',
                        filter: 'isFile'
                    }
                ]
            },
            prod: {
                files: [
                    {
                        expand: true,
                        cwd: 'source/',
                        src: ['<%= copyFiles %>'],
                        dest: 'cdn/<%= major_version %>/<%= version %>/'
                    }
                ]
            }
        },

        // Symlink creates a cdn/latest
        symlink: {
            options: {
                overwrite: true
            },
            expanded: {
                files: [
                    // All child directories in "source" will be symlinked into the "build"
                    // directory, with the leading "source" stripped off.
                    {
                        src: ['cdn/<%= major_version %>/<%= version %>'],
                        dest: 'cdn/<%= major_version %>/latest',
                        filter: 'isDirectory'
                    }
                ]
            },
        },

        // Watch options: what tasks to run when changes to files are saved
        watch: {
            options: {},
            html: {
                files: ['source/**/*.html'], // Watch for changes to these html files to run htmlhint (validation) task
                tasks: ['css'],
                options: {
                    spawn: false
                }
            },
            css: {
                files: ['source/sass/*.scss'],
                tasks: ['css'] // Compile with Compass when Sass changes are saved
            },
            copy: {
                files: ['source/<%= copyFiles %>'],
                tasks: ['copy']
            }
        }

    });

    /**
     * CSS tasks
     */
    grunt.registerTask('css', [
        'sass:dev'
    ]);

    /**
     * Dev tasks
     */
    grunt.registerTask('dev', [
        'copy:dev',
        'css'
    ]);

    /**
     * Production tasks
     */
    grunt.registerTask('prod', [
        'mkdir:prod',
        'sass:prod',
        'symlink',
        'copy:prod'
    ]);

    /**
     * DeployBot Task
     */
    grunt.registerTask('deploybot', [
        // 'css',
        'sass:dev',
        'copy'
    ]);



    /**
     * Default Tasks
     */
    grunt.registerTask('default', ['dev', 'watch']);

    /**
     * Staging Tasks
     */
    grunt.registerTask('staging', ['dev']);

};
