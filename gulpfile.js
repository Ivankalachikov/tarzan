var gulp = require('gulp'),
less = require('gulp-less'),
browserSync = require('browser-sync').create(),
cssnano     = require('gulp-cssnano'),
rename      = require('gulp-rename'),
concatCss = require('gulp-concat-css'),
autoprefixer = require('gulp-autoprefixer'),
notify = require("gulp-notify"),
mmq = require('gulp-merge-media-queries')
uglify = require('gulp-uglify'),
concat = require('gulp-concat'),
del         = require('del'),
imagemin    = require('gulp-imagemin'),
pngquant    = require('imagemin-pngquant'),
cache       = require('gulp-cache'),
spritesmith = require('gulp.spritesmith'),
htmlmin = require('gulp-htmlmin'),



gulp.task('less', function () {
  return gulp.src('app/less/style.less')
    .pipe(less().on( 'error', notify.onError(
      {
        message: "<%= error.message %>",
        title  : "Less Error!"
      } ) ))
    .pipe(gulp.dest('app/css'))
});


gulp.task('sprite', function() {
    var spriteData = 
        gulp.src('app/img/sprite/*.*') // путь, откуда берем картинки для спрайта
            .pipe(spritesmith({
                imgName: 'sprite.png',
                imgPath: '../img/sprite.png',
                cssTemplate: 'app/less/sprite.less.template.mustache',
                cssName: 'sprite.less',
                cssFormat: 'less',
                algorithm: 'binary-tree',
            }));

    spriteData.img.pipe(gulp.dest('app/img/')); // путь, куда сохраняем картинку
    spriteData.css.pipe(gulp.dest('app/less/')); // путь, куда сохраняем стили
});




gulp.task('css-libs', ['less'], function() {
     return gulp.src('app/css/style.css')
     .pipe(mmq({
     	log: true
     }))
     		.pipe(autoprefixer({
					browsers: ['last 3 version', '> 3%'],
					cascade: false
				}).on( 'error', notify.onError(
            {
            message: "<%= error.message %>",
            title  : "Autoprefixer Error!"
             } ) ))


            
        .pipe(cssnano().on( 'error', notify.onError(
     		{
        	message: "<%= error.message %>",
        	title  : "Cssnano Error!"
     		 } ) ))
        .pipe(rename({suffix: '.min'}))
        .pipe(gulp.dest('app/css')) 
        browserSync.reload
        notify ({
		      message: "Done",
		      title  : "Sass ok!"
		    });
});

gulp.task('scripts', function() {
  return gulp.src(['app/js/*.js','!app/js/all.js'])
  	// del(['all.js'])
    .pipe(concat('all.js'))
    .pipe(uglify())
    .pipe(gulp.dest('app/js/'));
});


gulp.task('serve', function() {
    browserSync.init({
    	reloadDelay: 1000,
    	server:'app'
    })
    browserSync.watch('app/**/*.*') .on('change',browserSync.reload);
});



gulp.task('watch', ['serve'], function() {
    gulp.watch('app/less/**/*.less', ['css-libs']);
});


// --Задачи для продакшена

gulp.task('clean', function() {
    return del.sync('dist'); // Удаляем папку dist перед сборкой
});

gulp.task('img', function() {
    return gulp.src(['app/img/**/*','!app/img/sprite/','!app/img/sprite/**']) // Берем все изображения из app
        .pipe(cache(imagemin({  // Сжимаем их с наилучшими настройками с учетом кеширования
            interlaced: true,
            progressive: true,
            svgoPlugins: [{removeViewBox: false}],
            use: [pngquant()]
        })))
        .pipe(gulp.dest('dist/img')); // Выгружаем на продакшен
});

gulp.task('clear', function () {
    return cache.clearAll();
})

gulp.task('minhtml', function() {
  return gulp.src('app/*.html')
    .pipe(rename({suffix: '.min'}))
    .pipe(htmlmin({collapseWhitespace: true}))
    .pipe(gulp.dest('app'))
});


///////////  -- Непосредственно сам продакшен

gulp.task('build', ['clean', 'img', 'less', 'css-libs', 'scripts'], function() {

    var buildCss = gulp.src([ // Переносим библиотеки в продакшен
        'app/css/style.min.css'
        ])
    .pipe(gulp.dest('dist/css'))

    var buildFonts = gulp.src('app/fonts/**/*') // Переносим шрифты в продакшен
    .pipe(gulp.dest('dist/fonts'))

    var buildJs = gulp.src(['app/js/all.js']) // Переносим скрипты в продакшен
    .pipe(gulp.dest('dist/js'))

    var buildHtml = gulp.src('app/*.html') // Переносим HTML в продакшен
    .pipe(gulp.dest('dist'));

});


gulp.task('default', ['watch']);  /// Таск по умолчанию