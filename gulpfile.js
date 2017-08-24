/**
* @file Gulpfile for automating transpilation tasks. fk u noud\
* @author Capuccino
**/

const gulp = require('gulp');
const fs = require('fs');
const ts = require('gulp-typescript');
const compileOptions = fs.readFileSync('./tsconfig.json');

//transpile task 
gulp.task('compile', () => {
    //gulp.src() locates your file, I made it resolve through every fucking thing.
    return gulp.src('./src/**/*.ts')
    //I'm lazy so i'm rusing tsconfig.json
    .pipe(ts(compileOptions))
    //finally output this shit in dist
    .pipe(gulp.dest('./dist/'));
});