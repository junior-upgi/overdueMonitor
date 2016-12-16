var babelify = require('babelify');
var browserify = require('browserify');
var gulp = require('gulp');
var gulpBabel = require('gulp-babel');
var gulpConnection = require('gulp-connect');
var gulpClean = require('gulp-clean');
var gulpNodemon = require('gulp-nodemon');
var vinylSourceStream = require('vinyl-source-stream');

var serverConfig = require('./src/module/serverConfig.js');

gulp.task('connect', function() {
    gulpConnection.server({
        name: 'overdueMonitor',
        host: serverConfig.serverHost.slice(7),
        port: 9999,
        root: './public',
        livereload: true
    });
});

gulp.task('javascript', function() {
    gulp.src('./node_modules/jquery/dist/jquery.min.js').pipe(gulp.dest('./public/js'));
    gulp.src('./node_modules/bootstrap/dist/js/bootstrap.min.js').pipe(gulp.dest('./public/js'));
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

gulp.task('copyServerFiles', function() {
    gulp.src('./src/server.js').pipe(gulp.dest('./build'));
    gulp.src('./src/module/*.js').pipe(gulp.dest('./build/module'));
    gulp.src('./src/frontend/*.png').pipe(gulp.dest('./public'));
    gulp.src('./src/view/*.*').pipe(gulp.dest('./build/view'));
    gulp.src('./node_modules/bootstrap/dist/css/*.min.css').pipe(gulp.dest('./public/css'));
});

gulp.task('server', function() {
    gulpNodemon({
        script: './build/server.js',
        tasks: ['copyServerFiles'],
        verbose: true,
        watch: ['./src'],
        ext: 'js html handlebars',
        ignore: ['frontend']
    });
});

gulp.task('watch', function() {
    gulp.watch('./src/**/*.js', ['javascript']);
    gulp.watch('./src/**/*.html', ['html']);
    gulp.watch('./src/**/*.handlebars', ['handlebars']);
});

gulp.task('default', ['javascript', 'html', 'handlebars', 'copyServerFiles', 'connect', 'watch', 'server'], function() { });
