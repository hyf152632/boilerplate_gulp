//引入packages
const gulp        = require('gulp');
const changed     = require('gulp-changed');        //only detect changed file
const notify      = require('gulp-notify');
const concat      = require('gulp-concat');
const rename      = require('gulp-rename');
const connect     = require('gulp-connect');        //live reload
const browserSync = require('browser-sync').create();
const reload      = browserSync.reload();           //页面强制刷新
const del         = require('del');                 //删除文件和文件夹
const watch       = require('gulp-watch');          //让gulp可以watch新的文件和文件夹。
const plumber     = require('gulp-plumber');        //防止因为错误而终止watch
const runSequence = require('run-sequence');        //处理任务的执行顺序

//处理js
const babel       = require('gulp-babel');
const uglify      = require('gulp-uglify');         //js压缩
const sourcemaps  = require('gulp-sourcemaps');     

//处理css
const sass        = require('gulp-sass');
const base64      = require('gulp-base64');
const cleanCSS    = require('gulp-clean-css');      //css压缩
const spritesmith = require('gulp.spritesmith');  //创建精灵图
const autoprefixer = require('gulp-autoprefixer');
//处理html
const htmlmin     = require('gulp-htmlmin');
//图片处理
const imagemin    = require('gulp-imagemin');
const pngmin      = require('imagemin-pngquant');
const jpgmin      = require('imagemin-jpegtran');
//font压缩
const fontmin     = require('gulp-fontmin');

//开发环境相关的路径
const dev = {
    root:       './src',
    sassAll:    './src/sass/**/*.scss',
    sass:       './src/sass' ,
    cssAll:     './src/css/**/*.css',
    css:        './src/css',
    jsAll:      './src/js/**/*.js',
    js:         './src/js',
    jsIndex:    './src/js/index/**/*.js',
    fontsAll:   './src/fonts/**/*.*',
    fonts:      './src/fonts',
    imagesAll:  './src/images/**/*.*',
    images:     './src/images',
    htmlAll:    './src/**/*.html',
    public:     './src/public',
    publicAll:  './src/public/**/*.*'
};

//生产环境相关的路径
const pro = {
    root:    './dist',
    css:     './dist/css',
    js:      './dist/js',
    fonts:   './dist/fonts',
    images:  './dist/images',
    spriteAll: './dist/images/sprite/*.png',
    base64:   './dist/images/base64',
    public:  './dist/public'
}

//run a webserver
gulp.task('connect',function(){
    connect.server({
        root:pro.root,
        livereload: true,
        port:8080
    });
});

//处理并监听sass
gulp.task('sass',function() {
    return watch(dev.sassAll,{ignoreInitial: false})
    .pipe(plumber())                        //防止因插件出错而中断webserver
    .pipe(changed(dev.css))                //same as the directory you put into gulp.dest()
    .pipe(sass())
    .pipe(autoprefixer({
        browsers:['last 2 versions']
    }))
    .pipe(gulp.dest(dev.css))
    .pipe(notify({message:'scss files have been handled!'}))
    .pipe(connect.reload());
});

//处理并监听css
gulp.task('css',['images:first'],function () {
    return watch(dev.cssAll,{ignoreInitial: false},function() {
        gulp.src(dev.cssAll)
        .pipe(plumber())
        .pipe(changed(pro.css))
        .pipe(base64({
            baseDir: pro.base64,            //在sass文件中，只需要输入位于这个路径中的图片文件的文件名就可以了，不需要输路径。
            extensions: ['svg', 'png', /\.jpg#datauri$/i],
            exclude:    [/\.server\.(com|net)\/dynamic\//, '--live.jpg'],
            maxImageSize: 10*1024, // bytes 
            debug: true
        })) 
        .pipe(concat('allInOne.css'))
        .pipe(cleanCSS({compatibility:'ie8'}))
        .pipe(rename('index.min.css'))
        .pipe(gulp.dest(pro.css))
        .pipe(notify({message:'css files have been handled!'}))
        .pipe(connect.reload());
    });
});

//处理并监听index相关的js
gulp.task('js:index',function() {
        return watch(dev.jsIndex,{ignoreInitial: false},function() {       
            gulp.src(dev.jsIndex)
            .pipe(sourcemaps.init())
            .pipe(plumber())
            .pipe(babel({
                presets:['es2015']
            }))
            .pipe(concat('allInOne.js'))
            .pipe(uglify())
            .pipe(rename('./index.min.js'))
            .pipe(sourcemaps.write())
            .pipe(gulp.dest(pro.js))
            // .pipe(reload({stream:true}))
            .pipe(notify({message:'indexjs files have been handled!'}))
            .pipe(connect.reload());
        });
                
    });

//处理并监听其他js文件
gulp.task('js:others',function() {
    return watch([dev.jsAll,'!./src/js/index/**/*.js'],{ignoreInitial: false},function() {
        gulp.src([dev.jsAll,'!./src/js/index/**/*.js'])
            .pipe(changed(pro.js))
            .pipe(sourcemaps.init())
            .pipe(plumber())
            .pipe(babel({
                presets:['es2015']
            }))
            .pipe(uglify())
            .pipe(sourcemaps.write())
            .pipe(gulp.dest(pro.js))
            .pipe(notify({message:'otherjs files have been handled!'}))
            .pipe(connect.reload());
    });
});

//处理并监听html文件
gulp.task('html',function() {
    return watch(dev.htmlAll,{ignoreInitial: false},function() {
        gulp.src(dev.htmlAll)
            .pipe(changed(pro.root))
            .pipe(plumber())
            .pipe(htmlmin({collapseWhitespace: true}))
            .pipe(gulp.dest(pro.root))
            .pipe(notify({message: 'html files have been handled!'}))
            .pipe(connect.reload());
    })
});

//用在gulp-css中，保证图片转化的时候使用的是压缩过的大小
gulp.task('images:first',function() {
    return gulp.src(dev.images + '/**/*.+(jpg|png)')
        .pipe(changed(pro.images))
        .pipe(plumber())
        .pipe(notify({message: 'images:first begain to compress images files, please waiting...'}))
        .pipe((imagemin({
        use:[pngmin(),jpgmin()]
        })))
        .pipe(gulp.dest(pro.images))
        .pipe(notify({message:'images:first images files have been compressed!'}))
        // .pipe(connect.reload());
});

//处理并监听images文件夹下的文件
gulp.task('images',function() {
    return watch(dev.images + '/**/*.+(jpg|png)',{ignoreInitial: false},function() {
        gulp.src(dev.images + '/**/*.+(jpg|png)')
            .pipe(changed(pro.images))
            .pipe(plumber())
            .pipe(notify({message: 'begain to compress images files, please waiting...'}))
            .pipe((imagemin({
                use:[pngmin(),jpgmin()]
            })))
            .pipe(gulp.dest(pro.images))
            .pipe(notify({message:'images files have been compressed!'}))
            .pipe(connect.reload());
    });

});

//生成并监听sprite
gulp.task('sprite',function() {
    return watch(pro.spriteAll,{ignoreInitial: false},function() {
        var spriteData = gulp.src(pro.spriteAll)
                            .pipe(plumber())
                            .pipe(spritesmith({
                            imgName: 'sprite.png',
                            cssName: 'sprite.css',
                            imgPath: '../images/sprite.png',
                            padding: 2
                        }));
        var imgStream = spriteData.img
                                  .pipe(gulp.dest(pro.images))
                                  .pipe(connect.reload());
        var cssStream = spriteData.css
                                  .pipe(gulp.dest(pro.css))
                                  .pipe(notify({message:'sprite have been handled.'}))
                                  .pipe(connect.reload());
    });
});

//处理并监听fonts文件夹下的文件
gulp.task('fonts',function() {
    return watch(dev.fontsAll,{ignoreInitial: true},function() {
            gulp.src(dev.fontsAll)
            .pipe(changed(pro.fonts))
            .pipe(plumber())            
            .pipe(fontmin({
                text: 'whatever'
            }))
            .pipe(gulp.dest(pro.fonts))
            .pipe(notify({message:'fonts files have been handled!'}))
            .pipe(connect.reload());
    });
});

//处理并监听public文件夹下的文件
gulp.task('public',function() {
    return watch(dev.publicAll,{ignoreInitial: false})
            .pipe(changed(pro.public))
            .pipe(gulp.dest(pro.public))
            .pipe(notify({message:'public folder have been copied!'}));
});

//从node_modules中拷贝jquery.js
gulp.task('copy:jquery',function(){
    return gulp.src(['node_modules/jquery/dist/jquery.min.js'])
                .pipe(gulp.dest(dev.public));
});

//从node_modules中拷贝normalize.css
gulp.task('copy:normalize',function(){
    return gulp.src('node_modules/normalize.css/normalize.css')
                .pipe(gulp.dest(dev.public));
});

//一键删除dist文件夹及其中的所有文件，慎用。
gulp.task('build:clean',function(){
   del([
       pro.root
   ]) 
});

//版本控制相关
//
gulp.task('rev',function() {
    console.log('come soon.');
});

gulp.task('default',['connect','copy:jquery','copy:normalize'],function() {
       runSequence([
           'public',
           'fonts',
           'sass',
           'css',
           'js:index',
           'js:others',
           'html',
           'images',
           'sprite'
        ]);
    
});

