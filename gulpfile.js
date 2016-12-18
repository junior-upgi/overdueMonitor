const babelify = require('babelify');
const browserify = require('browserify');
const browserSync = require('browser-sync');
const del = require('del');
const gulp = require('gulp');
const $ = require('gulp-load-plugins')({
    lazy: true,
    camelize: true
});
const vinylSourceStream = require('vinyl-source-stream');
const yargs = require('yargs').argv;

const serverConfig = require('./src/backend/module/serverConfig.js');

gulp.task('removePublic', function() {
    let dir = './public';
    log('cleaning: ' + $.util.colors.blue(dir));
    return del.sync(dir);
});

gulp.task('removeBuild', function() {
    let dir = './build';
    log('cleaning: ' + $.util.colors.blue(dir));
    return del.sync(dir);
});

gulp.task('removeTemp', function() {
    let dir = './temp';
    log('cleaning: ' + $.util.colors.blue(dir));
    return del.sync(dir);
});

gulp.task('cleanUp', ['removePublic', 'removeBuild', 'removeTemp'], function() {
    return;
});

gulp.task('lint', function() {
    log('code analysation with Eslint and JSCS');
    fileList = [
        './src/**/*.js',
        './*.js'
    ];
    return gulp
        .src(fileList)
        .pipe($.if(yargs.verbose, $.print()))
        .pipe($.jscs())
        .pipe($.jscsStylish())
        .pipe($.jscs.reporter('fail'))
        .pipe($.eslint())
        .pipe($.eslint.format())
        .pipe($.eslint.failAfterError());
});

gulp.task('transpile', function() {
    log('transpile frontend javascript');
    let entryScript = './src/frontend/js/entry.js';
    let destDir = './public/js';
    return browserify(entryScript)
        .transform(babelify, { presets: ['es2015'] })
        .bundle()
        .pipe(vinylSourceStream('bundle.js'))
        .pipe(gulp.dest(destDir));
});

gulp.task('bootstrapCss', function() {
    log('processing bootstrap css files');
    let destDir = './public/css';
    return gulp
        .src('./node_modules/bootstrap/dist/css/*.min.*')
        .pipe(gulp.dest(destDir));
});

gulp.task('bootstrapFont', function() {
    log('processing bootstrap font files');
    let destDir = './public/fonts';
    return gulp.src('./node_modules/bootstrap/dist/fonts/*.*').pipe(gulp.dest(destDir));
});

gulp.task('staticHtml', function() {
    log('processing static HTML files');
    let destDir = './public';
    return gulp.src('./src/frontend/*.html').pipe(gulp.dest(destDir));
});

gulp.task('favicon', function() {
    log('processing the favicon');
    let destDir = './public';
    return gulp.src('./src/frontend/*.png').pipe(gulp.dest(destDir));
});

gulp.task('jqueryScript', function() {
    log('import jquery dependency...');
    let destDir = './public/js';
    return gulp.src('./node_modules/jquery/dist/jquery.min.*').pipe(gulp.dest(destDir));
});

gulp.task('bootstrapScript', function() {
    log('import bootstrap dependency...');
    let destDir = './public/js';
    return gulp.src('./node_modules/bootstrap/dist/js/*.min.js').pipe(gulp.dest(destDir));
});

gulp.task('staticFrontendFiles', ['bootstrapCss', 'bootstrapFont', 'staticHtml', 'favicon', 'jqueryScript', 'bootstrapScript'], function() {
    return;
});

gulp.task('startWatcher', ['staticFrontendFiles', 'transpile'], function() {
    let watchList = {
        frontendFileList: ['./src/frontend/**/*.js'],
        staticFrontendFileList: ['./src/frontend/**/*.html']
    };
    gulp.watch(watchList.frontendFileList, ['transpile']);
    gulp.watch(watchList.staticFrontendFileList, ['staticFrontendFiles']);
});

gulp.task('buildBackend', function() {
    log('building backend server files...');
    return gulp
        .src('./src/backend/**/*.js')
        .pipe(gulp.dest('./build'));
});

gulp.task('startServer', ['cleanUp', 'buildBackend', 'startWatcher'], function() {
    let nodemonOption = {
        script: './build/server.js',
        delayTime: 1,
        env: {
            'PORT': serverConfig.serverPort,
            'NODE_ENV': serverConfig.development ? 'development' : 'production'
        },
        verbose: false,
        watch: ['./src/backend'],
        tasks: ['removeBuild', 'buildBackend']
    };
    return $.nodemon(nodemonOption)
        .on('start', function() {
            log('*** server started on: ' + serverConfig.serverUrl);
            startBrowserSync();
        })
        .on('restart', function(event) {
            log('*** server restarted and operating on: ' + serverConfig.serverUrl);
            log('files triggered the restart:\n' + event);
        })
        .on('crash', function() {
            log('*** server had crashed...');
        })
        .on('shutdown', function() {
            log('*** server had been shutdown...');
        });
});

function startBrowserSync() {
    if (browserSync.active) {
        return;
    }
    let option = {
        proxy: 'http://localhost:' + serverConfig.serverPort + '/overdueMonitor/mobileReport.html',
        port: 9999,
        files: ['./src/frontend/**/*.*'],
        ghostMode: {
            clicks: true,
            location: false,
            forms: true,
            scroll: true
        },
        injectChanges: true,
        logFileChanges: true,
        logLevel: 'debug',
        logPrefix: 'gulp-output',
        notify: true,
        reloadDelay: 1000
    };
    browserSync(option);
    log('start browserSync on port: ' + serverConfig.serverPort);
}

function log(msg) {
    if (typeof (msg) === 'object') {
        for (let item in msg) {
            if (msg.hasOwnProperty(item)) {
                $.util.log($.util.colors.blue(msg[item]));
            }
        }
    } else {
        $.util.log($.util.colors.blue(msg));
    }
}
