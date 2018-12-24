// Load gulp and gulp-load-plugin
const gulp = require('gulp');
const plugins = require('gulp-load-plugins')();

// Load utility npm modules
const del = require('del');
const browsersync = require('browser-sync').create();
plugins.sass.compiler = require('node-sass');

// PostCSS processors
const presetEnv = require('postcss-preset-env');

// Path config
const paths = {
  src: {
    root: 'app',
    html: 'app/**/*.{html,pug}',
    styles: 'app/**/*.{css,scss}',
    js: 'app/**/*.js',
    images: 'app/**/*.{png,jpg,jpeg,gif,svg}',
  },
  tmp: {
    root: '.tmp',
    html: '.tmp',
    css: '.tmp',
    js: '.tmp',
    images: '.tmp',
  },
  dist: {
    root: 'dist',
    html: 'dist',
    css: 'dist',
    js: 'dist',
    images: 'dist',
  },
};

/* ----------------- */
// Development Tasks
/* ----------------- */

// Clean `.tmp` folder
gulp.task('clean:tmp', (done) => {
  del.sync(['.tmp/**/*']);
  done();
});

// Preprocess and copy HTML files to `.tmp` folder
gulp.task('prep:html', () => gulp
  .src(paths.src.html)
  .pipe(plugins.plumber())
  .pipe(plugins.if('*.pug', plugins.pug({ pretty: true })))
  .pipe(gulp.dest(paths.tmp.html))
  .pipe(browsersync.stream())); // reload

// Preprocess and copy SCSS/CSS files to `.tmp` folder
gulp.task('prep:styles', () => gulp
  .src(paths.src.styles)
  .pipe(plugins.plumber())
  .pipe(plugins.if('*.scss', plugins.sass().on('error', plugins.sass.logError)))
  .pipe(plugins.postcss([presetEnv]))
  .pipe(gulp.dest(paths.tmp.css))
  .pipe(browsersync.stream())); // inject

// Preprocess and copy JS files to `.tmp` folder
gulp.task('prep:js', () => gulp
  .src(paths.src.js)
  .pipe(plugins.plumber())
  .pipe(
    plugins.babel({
      presets: ['@babel/env'],
    }),
  )
  .pipe(gulp.dest(paths.tmp.js))
  .pipe(browsersync.stream())); // reload

// Preprocess and copy image files to `.tmp` folder
gulp.task('prep:images', () => gulp
  .src(paths.src.images)
  .pipe(plugins.plumber())
  .pipe(gulp.dest(paths.tmp.images))
  .pipe(browsersync.stream())); // reload

// Start development server and watch for source changes
gulp.task(
  'serve',
  gulp.series('prep:html', 'prep:styles', 'prep:js', 'prep:images', () => {
    browsersync.init({
      host: '192.168.1.10',
      server: {
        baseDir: paths.tmp.root,
      },
      reloadOnRestart: true,
      reloadDelay: 1000,
      notify: false,
      open: false,
    });

    // Watch for changed and new source HTML files
    plugins.watch(paths.src.html, gulp.series('prep:html'));

    // Watch for changed and new source SCSS/CSS files
    plugins.watch(paths.src.styles, gulp.series('prep:styles'));

    // Watch for changed and new source JS files
    plugins.watch(paths.src.js, gulp.series('prep:js'));

    // Watch for changed and new source image files
    plugins.watch(paths.src.images, gulp.series('prep:images'));
  }),
);

/* ----------------- */
// Production Tasks
/* ----------------- */

// Clean `dist` folder
gulp.task('clean:dist', (done) => {
  del.sync(['dist/**/*']);
  done();
});

// Optimize and copy image files from `.tmp` to `dist` folder
gulp.task(
  'opt:images',
  gulp.series('prep:images', () => gulp
    .src(`${paths.tmp.images}/**/*.{png,jpg,jpeg,gif,svg}`)
    .pipe(plugins.plumber())
    .pipe(
      plugins.imagemin([
        plugins.imagemin.gifsicle({ interlaced: true }),
        plugins.imagemin.jpegtran({ progressive: true }),
        plugins.imagemin.optipng({ optimizationLevel: 5 }),
        plugins.imagemin.svgo({
          plugins: [{ removeViewBox: true }, { cleanupIDs: false }],
        }),
      ]),
    )
    .pipe(gulp.dest(paths.dist.images))),
);

// Optimize and copy HTML, CSS, and JS files from `.tmp` to `dist` folder
gulp.task(
  'opt:all',
  gulp.series('prep:html', 'prep:styles', 'prep:js', 'opt:images', () => gulp
    .src(`${paths.tmp.html}/*.html`)
    .pipe(plugins.plumber())
    .pipe(plugins.useref())
    .pipe(plugins.if('*.css', plugins.csso({ comments: false }))) // Optimize linked CSS files
    .pipe(plugins.if('*.js', plugins.uglify())) // Optimize linked JS files
    .pipe(
      plugins.if(
        '*.html',
        plugins.htmlmin({
          collapseWhitespace: true,
          minifyCSS: true,
        }),
      ),
    ) // Optimize HTML files
    .pipe(gulp.dest(paths.dist.root))),
);

/* ----------------- */
// Main tasks
/* ----------------- */

gulp.task('default', gulp.series('clean:tmp', 'serve'));

gulp.task('build', gulp.series('clean:dist', 'opt:all'));
