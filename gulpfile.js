"use strict";

let gulp = require("gulp"),
  postcss = require("gulp-postcss"),
  watch = require("gulp-watch"),
  babel = require("gulp-babel"),
  del = require('del'),
  concat = require("gulp-concat"),
  cssmin = require("gulp-cssmin"),
  uglify = require("gulp-uglify"),
  sourcemaps = require("gulp-sourcemaps"),
  rigger = require("gulp-rigger"),
  gcmq = require("gulp-group-css-media-queries"),
  imagemin = require("gulp-imagemin"),
  pngquant = require("imagemin-pngquant"),
  recompress = require("imagemin-jpeg-recompress"),
  rimraf = require("rimraf"),
  browserSync = require("browser-sync"),

  rev = require('gulp-rev'),
  revReplace = require('gulp-rev-replace'),
  reload = browserSync.reload;

const purgecss = require("@fullhuman/postcss-purgecss");

let path = {
  build: {
    html: "build/",
    js: "build/static/js/",
    css: "build/static/css/",
    img: "build/static/img/",
    fonts: "build//static/fonts/"
  },
  src: {
    html: "src/*.html",
    js: "src/js/*.js",
    style: "src/style/tailwind.css",
    img: "src/img/**/*.*",
    fonts: "src/fonts/**/*.*"
  },
  watch: {
    html: "src/**/*.html",
    js: "src/js/**/*.js",
    style: "src/style/**/*.css",
    img: "src/img/**/*.*",
    fonts: "src/fonts/**/*.*"
  },
  clean: "./build"
};

let config = {
  server: {
    baseDir: "./build"
  },
  // tunnel: true,
  host: "localhost",
  port: 3001,
  logPrefix: "frontend"
};

gulp.task("webserver", () => {
  browserSync(config);
});

gulp.task('clean', function (cb) {
  del.sync(['./build']);
  cb()
});

gulp.task("html:build", () => {
  return gulp
    .src(path.src.html, { allowEmpty: true })
    .pipe(rigger())
    .pipe(gulp.dest(path.build.html))
    .pipe(reload({ stream: true }));
});

gulp.task("js:dev", () => {
  return gulp
    .src(path.src.js, { allowEmpty: true })
    .pipe(rigger())
    .pipe(babel())
    .pipe(sourcemaps.init())
    .pipe(concat('main.js'))
    .pipe(sourcemaps.write())
    .pipe(gulp.dest(path.build.js))
    .pipe(reload({ stream: true }));
});
gulp.task("js:build:min", () => {
  return gulp
    .src(path.src.js, { allowEmpty: true })
    .pipe(rigger())
    .pipe(babel())
    .pipe(sourcemaps.init())
    .pipe(concat('main.js'))
    .pipe(uglify())
    .pipe(sourcemaps.write())
    .pipe(gulp.dest(path.build.js))
    .pipe(reload({ stream: true }));
});
class TailwindExtractor {
  static extract(content) {
    return content.match(/[\w-/:]+(?<!:)/g);
  }
}
gulp.task("style:dev", () => {
  return gulp
    .src(path.src.style)
    .pipe(
      postcss([
        require("postcss-import"),
        require("tailwindcss"),
        require("postcss-nested"),
        purgecss({
          content: ["./build/*.html"],
          extractors: [{ extractor: TailwindExtractor, extensions: ["html"] }]
        }),
        require("autoprefixer")
      ])
    )
    .pipe(gulp.dest(path.build.css))
    .pipe(reload({ stream: true }));
});
gulp.task("style:build", () => {
  return gulp
    .src(path.src.style)

    .pipe(
      postcss([
        require("postcss-import"),
        require("tailwindcss"),
        require("postcss-nested"),
        purgecss({
          content: ["./build/*.html"],
          extractors: [{ extractor: TailwindExtractor, extensions: ["html"] }]
        }),
        require("autoprefixer")
      ])
    )
    .pipe(gcmq())
    .pipe(cssmin())
    .pipe(gulp.dest(path.build.css))
    .pipe(reload({ stream: true }));
});

gulp.task("image:dev", () => {
  return gulp
    .src(path.src.img, { allowEmpty: true })

    .pipe(gulp.dest(path.build.img))
    .pipe(reload({ stream: true }));
});
gulp.task("image:build", () => {
  return gulp
    .src(path.src.img, { allowEmpty: true })
    .pipe(
      imagemin([
        pngquant(),
        recompress({
          loops: 1,
          min: 95,
          max: 95,
          quality: "high"
        }),
        imagemin.gifsicle(),
        imagemin.optipng(),
        imagemin.svgo()
      ])
    )
    .pipe(gulp.dest(path.build.img))
    .pipe(reload({ stream: true }));
});

gulp.task("fonts:build", () => {
  return gulp
    .src(path.src.fonts, { allowEmpty: true })
    .pipe(gulp.dest(path.build.fonts));
});

gulp.task('revision', () => {
  return gulp
    .src(['./build/static/**/*.css', './build/static/**/*.js'])
    .pipe(rev())
    .pipe(gulp.dest('./build/static'))
    .pipe(rev.manifest())
    .pipe(gulp.dest('./build/static'))
})
gulp.task('revisionReplace', () => {
  var manifest = gulp.src('./build/static/rev-manifest.json')
  return gulp
    .src('./build/*.html')
    .pipe(revReplace({ manifest: manifest }))
    .pipe(gulp.dest('./build'))
})
gulp.task('build', gulp.series(
  'clean',
  'html:build',
  'js:build:min',
  'style:build',
  'fonts:build',
  'image:build',
  'revision',
  'revisionReplace'

)
)
gulp.task(
  "dev", gulp.series(
    'clean',
    gulp.parallel(
      "html:build",
      "js:dev",
      "style:dev",
      "fonts:build",
      "image:dev"
    )
  )
);
gulp.task("watch", () => {
  watch(path.watch.html, gulp.parallel("html:build"));
  watch(path.watch.style, gulp.parallel("style:build"));
  watch(path.watch.js, gulp.parallel("js:build"));
  watch(path.watch.img, gulp.parallel("image:build"));
  watch(path.watch.fonts, gulp.parallel("fonts:build"));
});

gulp.task("default", gulp.parallel("build", "webserver", "watch"));
