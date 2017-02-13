'use strict'
let Article = require('../models/article');
//引入markdown转html的第三方包
const md = require('markdown-it')();
//引入操作事件显示的moment包
// const moment = require('moment');

//声明一个用于替换字符串的方法
function replaceAll(str,oldStr,newStr) {
    while(str.indexOf(oldStr) !=-1){
        str = str.replace(oldStr,newStr);
    }
    return str;
}

//显示文章发布页面
exports.showPublish = (req,res,next)=>{
    let sessionUser = req.session.user;
    return res.render('publish',{user:sessionUser});
}

//保存文章处理
exports.saveArticle = (req,res,next)=>{
    //获取提交上来的数据
    let title = req.body.title;
    let content = req.body.content;
    let uid = req.session.user.id;
    let answerCount = 0;

    //将反斜杠替换为正斜杠
    content = replaceAll(content,'\\','/');
    //使用markdown转换md到html
    content = md.render(content);
    let newArticle = new Article({
        title,content,uid,answerCount
    });
    //保存文章
    newArticle.save((err,result)=>{
        if(err) return next(err);
        //先临时跳到首页，未来需要跳到该文章的详情页
        return res.redirect('/');
    })
}