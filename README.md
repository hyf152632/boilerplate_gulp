说明：    
这是一个基于gulp的前端自动化脚手架工具。

使用：     
npm install    
npm start

功能：    
livereload    
模块化开发    
js转化，合并，压缩    
图片压缩，字体压缩    
使用css预处理器scss，图片自动转化base64,合并精灵图,自动添加前缀，css压缩    
自动引入css初始化文件normalize.css,特性检测文件modernizr.min.js和jquery。    
自动打包


注意事项    
在sass文件夹下编写样式文件；    
所有的css文件会被打包成一个文件：index.min.css  
在js/index文件夹下的js文件会被打包合并为一个文件：index.min.js  
在js文件夹，但是非index文件夹下写其他js文件  
可以实时监听文件的添加，但是不会监听文件的删除，所以如果删除了src文件夹下的文件，同时也需要手动删除dist文件夹下对应的文件  

图片的注意事项：  
  1.图片转dataUrl时候要注意，只有在images/base64文件夹下的并且大小<10K的图片才会自动转换，而且引用的文件不需要加前缀，直接引用文件名就可以了；  
    如果转换失败，可能的原因是：  
       1.引用的图片加入了路径；  
       2.引用的图片的大小超过了限制（10k）,这时如果需要，可以更改这个限制的大小。  
  2.sprite文件夹下的图片会被转换为一张sprite图，如果需要转换X2的高清图，可以参考gulp-spritesmith插件的说明，  
    引用的时候需要:  
    先在html文件中添加sprite.css文件，它默认放在'dist/css/'文件夹中；  
    然后在主css文件设置一个'.icon'类，设置其display:inline-block;------这是因为sprite.css中有设置它里面的以'icon-'开头的项目的宽高。  
    然后在需要添加的html元素上设置class='icon icon-图片名';  
  3.将不需要转换dataUrl和合成精灵图的图片放置在'dist/images/others/'文件夹下。  
