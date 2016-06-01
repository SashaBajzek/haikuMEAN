module.exports = function(grunt) {

  grunt.initConfig({

    // Project configuration
    pkg: grunt.file.readJSON('package.json'),

    // Compile Sass
    sass: {
			options: {
				/*sourcemap: 'none'*/
			},
      dist: {
//				 options: {
//					 sourcemap: none;
//				 },
        files: {
          'public/stylesheets/css/styleconverted.css': 'public/stylesheets/style2.scss'
        }
      }
    },
		
		scsslint: {
			dist: {
				dist: {
					src: ['public/stylesheets/style2.scss']
				}
			}
		},

    // Watch and build
    watch: {
      sass: {
        files: 'public/stylesheets/style2.scss',
        tasks: ['sass']
      }
    }

  });

  // Load dependencies
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-sass');
	grunt.loadNpmTasks('grunt-scss-lint');

  // Run tasks
  grunt.registerTask('default', ['sass']);
//	grunt.registerTask('default', ['scsslint']);

};