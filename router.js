'use strict';

const express = require('express');
const router = express.Router();
//引入控制器模块
let userControllers = require('./controllers/userController');

//设置主页面请求处理
// router.get('/',(req,res,next)=>{
//     userControllers.showIndex(req,res,next);
       //由于这里嵌套的两个函数所传递的参数一样，所以可以合并起来
// })

router.get('/',userControllers.showIndex)//还可以链式编程
.get('/register',userControllers.showRegister) //显示注册页面
.post('/doRegister',userControllers.doRegister) //注册处理
.get('/active',userControllers.doActive) //激活处理
.post('/login',userControllers.doLogin) //登录处理
.get('/showLogin',userControllers.showLogin)  //显示登录页面
.get('/logout',userControllers.doLogout)//退出
.get('/getPicture',userControllers.getPicture) //获取验证码图片
.get('/showSetting',userControllers.showSetting) // 显示设置用户界面
.post('/uploadPic',userControllers.uploadPic) //上传图片处理
.post('/doSetting',userControllers.doSetting) //保存设置处理

module.exports = router;