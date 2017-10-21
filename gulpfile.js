var gulp       = require("gulp");
var browserify = require('browserify');
var babelify   = require('babelify');
var uglify     = require('gulp-uglify');
var rename     = require('gulp-rename');
var source     = require('vinyl-source-stream');
var buffer     = require('vinyl-buffer');

gulp.task("build", function () {
    return browserify('src/index.js', { debug: true }).
        transform(babelify).
        bundle().
        pipe(source('pixi-ae.js')).
        pipe(buffer()).
        //pipe(uglify()).
        pipe(rename('pixi-ae.min.js')).
        pipe(gulp.dest("dist"))
});

gulp.task('watch', function() {
    gulp.watch('src/**/*.js', ['build'])
});
