var gulp = require("gulp");
var babel = require("gulp-babel");
var exec = require('child_process').exec;
gulp.task("default",["js","html","twister", "input"] );
gulp.task("js", function () {
  var jsCode = gulp.src(["./src/**/*.js","!./src/twister/*.js"])
    .pipe(babel())
    .pipe(gulp.dest("dist"));
});
gulp.task("twister", function () {
  exec("git clone https://github.com/Sable/ostrich-twister-prng.js ./dist/twister");
});
gulp.task("input", function () {
 return gulp.src('./src/input/**').pipe(gulp.dest('./dist/input'));
});
gulp.task('html',function()
{
    return gulp.src(["src/public/run.html"])
    .pipe(gulp.dest("dist/public"));
});
