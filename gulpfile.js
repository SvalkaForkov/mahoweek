'use strict';


// Packages
//------------------------------------------------------------------------------

var gulp = require('gulp');
var concat = require('gulp-concat');
var htmlmin = require('gulp-html-minifier');
var csso = require('gulp-csso');
var less = require('gulp-less');
var autoprefixer = require('gulp-autoprefixer');
var uglify = require('gulp-uglify');
var wrap = require("gulp-wrap");
var del = require('del');
var csscomb = require('gulp-csscomb');
var fileinclude = require('gulp-file-include');
var multipipe = require('multipipe');
var browserSync = require('browser-sync').create();
var gulpsync = require('gulp-sync')(gulp);
var gulpHtmlVersion = require('gulp-html-version');
var typograf = require('gulp-typograf');


// Paths
//------------------------------------------------------------------------------

var paths = {
	docs: 'docs/',
	dist: {
		base: 'dist/',
		css: 'dist/css/',
		img: 'dist/img/',
		js: 'dist/js/'
	},
	src: {
		base: [
			'src/*.*',
			'src/CNAME'
		],
		html: [
			'src/*.html'
		],
		img: [
			'src/img/**/*.{jpg,jpeg,gif,png,svg}'
		],
		css: {
			libs: [
				'node_modules/normalize.css/normalize.css',
				'node_modules/cartonbox/docs/css/cartonbox.min.css'
			],
			main: [
				'src/less/main.less'
			]
		},
		js: {
			libs: [
				'node_modules/firebase/firebase-app.js',
				'node_modules/firebase/firebase-auth.js',
				'node_modules/firebase/firebase-database.js',
				'node_modules/jquery/dist/jquery.min.js',
				'node_modules/cartonbox/docs/js/cartonbox.min.js',
				'node_modules/sortablejs/Sortable.min.js'
			],
			app: [
				'src/js/app.js'
			]
		}
	},
	watch: {
		html: [
			'src/inc/*.html',
			'src/*.html'
		],
		css: [
			'src/blocks/**/*.less',
			'src/less/*.less'
		],
		js: [
			'src/blocks/**/*.js',
			'src/js/*.js'
		]
	}
};


// Build
//------------------------------------------------------------------------------

gulp.task('base', function() {
	return multipipe(
		gulp.src(paths.src.base),
		gulp.dest(paths.dist.base)
	);
});

gulp.task('html', function() {
	return multipipe(
		gulp.src(paths.src.html),
		fileinclude(),
		gulpHtmlVersion(),
		typograf({
			locale: ['ru', 'en-US']
		}),
		htmlmin({
			collapseWhitespace: true,
			removeComments: true
		}),
		gulp.dest(paths.dist.base),
		browserSync.stream()
	);
});

gulp.task('img', function() {
	return multipipe(
		gulp.src(paths.src.img),
		gulp.dest(paths.dist.img)
	);
});

gulp.task('css:libs', function() {
	return multipipe(
		gulp.src(paths.src.css.libs),
		concat('libs.min.css'),
		csso({
			restructure: false
		}),
		gulp.dest(paths.dist.css)
	);
});

gulp.task('css:main', function() {
	return multipipe(
		gulp.src(paths.src.css.main),
		concat('main.min.css'),
		less(),
		autoprefixer(),
		csscomb(),
		csso(),
		gulp.dest(paths.dist.css),
		browserSync.stream()
	);
});

gulp.task('js:libs', function() {
	return multipipe(
		gulp.src(paths.src.js.libs),
		concat('libs.min.js'),
		uglify({
			mangle: false
		}),
		gulp.dest(paths.dist.js)
	);
});

gulp.task('js:app', function() {
	return multipipe(
		gulp.src(paths.src.js.app),
		fileinclude(),
		concat('app.min.js'),
		wrap("(function($){'use strict';<%= contents %>}(jQuery));"),
		uglify(),
		gulp.dest(paths.dist.js),
		browserSync.stream()
	);
});


// Build Docs
//------------------------------------------------------------------------------

gulp.task('docs', ['clean:docs', 'default'], function() {
	return multipipe(
		gulp.src(paths.dist.base + '**'),
		gulp.dest(paths.docs)
	);
});


// Watch
//------------------------------------------------------------------------------

gulp.task('watch', ['default'], function() {
	browserSync.init({
		server: {
			baseDir: paths.dist.base
		},
		notify: false
	});

	gulp.watch(paths.watch.html, ['html']);
	gulp.watch(paths.watch.css, ['css:main']);
	gulp.watch(paths.watch.js, ['js:app']);
});


// Clean
//------------------------------------------------------------------------------

gulp.task('clean:dist', function() {
	return del.sync(['dist/**', '!dist']);
});

gulp.task('clean:docs', function() {
	return del.sync(['docs/**', '!docs']);
});


// Default
//------------------------------------------------------------------------------

gulp.task('default', gulpsync.sync(['clean:dist', 'base', 'html', 'img', 'css:libs', 'css:main', 'js:libs', 'js:app']));
