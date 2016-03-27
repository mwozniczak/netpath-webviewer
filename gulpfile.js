var concat = require('gulp-concat'),
    connect = require('gulp-connect'),
    gulp = require('gulp'),
    jade = require('gulp-jade'),
    prettify = require('gulp-prettify'),
    stylus = require('gulp-stylus'),
    typogr = require('gulp-typogr'),
    useref = require('gulp-useref');

var devserverPort = 8080;

gulp.task("templates", ['styles'], function() {
    var my_locals = {
        pretty: true
    };

    return gulp.src('js_ui/*.jade')
        .pipe(jade())
        .pipe(typogr())
        .pipe(prettify({indent_size: 2})) // Necessary. Otherwise useref flips out.
        .pipe(useref())
        .pipe(gulp.dest('dist'))
        .pipe(connect.reload());
});

gulp.task("styles", function() {
    return gulp.src('js_ui/styles/*.styl')
        .pipe(stylus({'include css': true}))
        .pipe(concat('styles.css'))
        .pipe(gulp.dest('dist/styles/'))
        .pipe(connect.reload());
});

gulp.task('connect', function() {
    connect.server({
        root: 'dist',
        port: devserverPort,
        livereload: true
    });
});

gulp.task("watch", function() {
    gulp.watch("js_ui/*.jade", ['templates']);
    gulp.watch("js_ui/js/*.js", ['templates']);
    gulp.watch("js_ui/styles/*.styl", ['styles']);
});

gulp.task("default", [
    'templates',
    'connect',
    'watch']);
