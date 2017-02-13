'use strict';

const express = require('express');
let app = express();
const handlebars = require('express-handlebars');
//引入路由部分模块
let router = require('./router.js');
//引入解析post数据请求的模块
let bodyParser = require('body-parser');
//引入express-session对象
const session = require('express-session');
//引入cookie-parser对象
const cookieParser = require('cookie-parser');

//设置模板信息 修改默认值和文件的后缀
app.engine('.hbs', handlebars({defaultLayout: 'layout',extname: '.hbs'}));
app.set('view engine', '.hbs');

//路由部分

//处理静态文件的请求
app.use('/public',express.static('public'));

//解析请求
app.use(bodyParser.urlencoded({ extended: false }))
//加入session处理中间件
app.use(session({
  secret: 'myblog',
  resave: false,  //不再没有发生修改的时候保存
  saveUninitialized: true  //只要发生连接就创建session
}));
//加入解析cookie中间件
app.use(cookieParser()); //加入这个中间件以后，我们可以通过req.cookies.key获取

//把路由中间件关联到应用中间件上去
app.use(router);

//处理错误请求url的时候的跳转页面
// app.all('*',(req,res,next)=>{
//     return res.render('404');
// })

//错误处理
app.use((err,req,res,next)=>{
    console.log(err);
    return next();
})
//设置端口监听
app.listen(8088,()=>{
    console.log('Server is running...');
})