module.exports = function(grunt) {
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-contrib-sass');
	grunt.initConfig({
		uglify: { //task
			blueberry: { //target
				files: {
					'gallery.js': ['components/js/*.js']
				},
				options: {
					'preserveComments': 'some'
				}
			}
		},
		sass: { //task
			strawberry: { //target
				options: { //options
					style: 'compressed'
				},
				files: [{
					expand: true,
					cwd: 'components/sass',
					src: ['**/*.scss'],
					dest: '',
					ext: '.css'
				}]
			}
		},
		watch: {
			options: {
				livereload: true
			},
			scripts: {
				files: ['components/js/*.js'],
				tasks: ['uglify:blueberry'] 
			},
			sass: {
				files: ['components/sass/*.scss'],
				tasks: ['sass:strawberry']
			},
			html: {
				files: ['*.html']
			}
		} 
	})
	grunt.registerTask('default', 'watch');
}