// gulpfile.js - Gulpfile for automating transpilation task (Capuccino, noud02)

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
        emitDecoratorMetadata: true,
        target: 'es6',
        lib: ['es6'],
        outDir: './dist/',
        module: 'commonjs',
        removeComments: false,
        noUnusedParameters: true,
        noImplicitReturns: true,
        noFallthroughCasesInSwitch: true,
        allowJs: false,
        checkJs: false,
        declaration: true,
        importHelpers: true,
        downlevelIteration: true,
        strict: true,
        noImplicitAny: true,
        noImplicitThis: true,
        alwaysStrict: true,
        moduleResolution: 'node',
        baseUrl: './',
        typeRoots: [ './types/', './node_modules/@types/' ]
    }))
    //finally output this shit in dist
    .pipe(gulp.dest('./dist/'));
});