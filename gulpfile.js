// gulpfile.js - Gulpfile for automating transpilation task (Capuccino, noud02)

const gulp = require('gulp');
const ts = require('gulp-typescript');
const jsdoc = require('gulp-jsdoc3');
const clean = require('gulp-clean');

gulp.task("default", ["compile", "jsdoc"]);
gulp.task("documentation", ["compile", "jsdoc"]);

gulp.task("clean:docs", () => {
    return gulp.src('./docs', {read:false})
        .pipe(clean());
})

gulp.task("clean:dist", () => {
    return gulp.src('./dist', {read:false})
        .pipe(clean());
})

gulp.task("jsdoc", (cb) => {
    gulp.src(["README.md", "./src/**/*.ts"], {read:false})
        .pipe(jsdoc(require("./.jsdoc.json"), cb));
})

gulp.task('compile', () => {
    return gulp.src('./src/**/*.ts')
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
            noEmitOnError: true,
            strict: true,
            noImplicitAny: true,
            noImplicitThis: true,
            alwaysStrict: true,
            allowSyntheticDefaultImports: true,
            moduleResolution: 'node',
            baseUrl: './',
            typeRoots: [ './types/', './node_modules/@types/']
        }))
        .pipe(gulp.dest('./dist/'));
});
