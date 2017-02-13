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

//处理文章显示分页
exports.getPage = (req,res,next)=>{
    //获取合计页，当前页，记录数
    let totalPages = 0;
    let viewCount = 2;
    let currentPage = req.query.page || 1;
    //查询数据库里面的文章记录总数
    Article.getTotalCount((err,result)=>{
        if(err) return next(err);
        //拿到记录总数
        let total = result[0].total;
        //计算在该viewCount下的页面数量
        totalPages = Math.ceil(total/viewCount); //向上取整
        //获取查询数据库分页是的起始位置offser
        let offset = (currentPage-1)*viewCount;
        //查找数据库调用相应位置相应数量的数据
        Article.getArticlesByLimit(offset,viewCount,(err,articles)=>{
            if(err) return next(err);

            //创建文章页面对象 用于传递数据给主页面分页的js代码
            let Pager = require('../common/pager.js');
            let pager = new Pager({currentPage,totalPages})

            // console.log(articles);
            return res.render('index',{articles,pager});
        })
    })
}