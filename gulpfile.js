/**
* @file Gulpfile for automating transpilation tasks. fk u noud\
* @author Capuccino
**/

const gulp = require('gulp');
const ts = require('gulp-typescript');

//transpile task 
gulp.task('compile', () => {
    //gulp.src() locates your file, I made it resolve through every fucking thing.
    return gulp.src('./src/**/*.ts')
    //I'm lazy so i'm rusing tsconfig.json
    .pipe(ts({
        rootDir: './src',
        experimentalDecorators: true,
        target: 'es5',
        outDir: './dist/',
        module: 'commonjs',
        removeComments: true
    }))
    //finally output this shit in dist
    .pipe(gulp.dest('./dist/'));
});