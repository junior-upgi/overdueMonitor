var gulp = require('gulp');
var gulpBabel = require('gulp-babel');
var gulpConnection = require('gulp-connect');
var gulpNodemon = require('gulp-nodemon');
var browserify = require('browserify');
var babelify = require('babelify');
var vinylSourceStream = require('vinyl-source-stream');

var serverConfig = require('./src/module/serverConfig.js');

gulp.task('connect', function() {
    gulpConnection.server({
        base: serverConfig.serverHost,
        port: 9998,
        root: './public',
        livereload: true
    });
});

gulp.task('javascript', function() {
    browserify('./src/frontend/js/entry.js')
        .transform(babelify, { presets: ['es2015'] })
        .bundle()
        .pipe(vinylSourceStream('all.js'))
        .pipe(gulp.dest('./public/js'))
        .pipe(gulpConnection.reload());
});

gulp.task('html', function() {
    gulp.src('./src/frontend/*.html')
        .pipe(gulp.dest('./public'))
        .pipe(gulpConnection.reload());
});

gulp.task('handlebars', function() {
    gulp.src('./src/view/*.handlebars')
        .pipe(gulp.dest('./build/view'))
        .pipe(gulpConnection.reload());
});

gulp.task('server', function() {
    gulpNodemon({
        script: './src/server.js',
        verbose: true,
        watch: ['./src'],
        ext: 'js html handlebars',
        ignore: ['node_modules', 'frontend']
    });
});

gulp.task('watch', function() {
    gulp.watch('./src/**/*.js', ['javascript']);
    gulp.watch('./src/**/*.html', ['html']);
    gulp.watch('./src/**/*.handlebars', ['handlebars']);
});

gulp.task('default', ['javascript', 'html', 'handlebars', 'connect', 'watch', 'server'], function() { });
