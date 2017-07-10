var gulp = require("gulp");
var babel = require("gulp-babel");

gulp.task("default",["js","html","twister"] );
gulp.task("js", function () {
  var jsCode = gulp.src(["./src/**/*.js","!./src/twister/*.js"])
    .pipe(babel())
    .pipe(gulp.dest("dist"));
});
gulp.task("twister", function () {
  return gulp.src(["./src/twister/**/*.js"])
    .pipe(gulp.dest("dist/twister"));
});
gulp.task('html',function()
{
    return gulp.src(["src/public/run.html"])
    .pipe(gulp.dest("dist/public"));
});
