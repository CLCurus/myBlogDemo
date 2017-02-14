'use strict'
let Article = require('../models/article.js');
let Comment = require('../models/comment.js');
//引入markdown转html的第三方包
const md = require('markdown-it')();
//引入操作事件显示的moment包
const moment = require('moment');

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

    //将反斜杠替换为正斜杠  不该的话会导致渲染的时候双反斜杠被转义
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
    //引入配置文件 获取查看的个数
    let config = require('../config.js');
    //获取合计页，当前页，记录数
    let totalPages = 0;
    let viewCount = config.viewCount;
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
            let pager = new Pager({currentPage,totalPages,Url:'/getPage'})

            //借助第三方模块moment，修改时间数据
            //遍历并修改每一个事件
            moment.locale('zh-cn'); //设置本地语言
            for (var i = articles.length - 1; i >= 0; i--) {
                let article = articles[i];
                article.showTime = moment(article.time).fromNow();//返回事件差
            }
            // console.log(articles);
            // console.log(req.session.user);
            return res.render('index',{articles,pager,user:req.session.user});
        })
    })
}

//模糊搜索
exports.searchArticle = (req,res,next)=>{
    //获取搜索框输入的关键字
    let searchStr = req.body.q || req.query.keyWord; //加上keyWord用于点击搜索分页下标时的请求
    // console.log(searchStr);
    let config = require('../config.js');
    let viewCount = config.viewCount;
    let totalPages = 0;
    let currentPage = req.query.page || 1;
    //查找数据库 获得总数
    Article.searchArticleCount(searchStr,(err,counts)=>{
        if(err) next(err);
        //这里counts传递回来的是一个数组 所以
        let count = counts[0].total;
        //计算合计页
        totalPages = Math.ceil(count/viewCount);
        let offset = (currentPage-1)*viewCount;
        //拿到以上数据 查找数据库 需要多表查询
        Article.searchArticleByLimit(searchStr,offset,viewCount,(err,articles)=>{
            if(err) next(err);
            // console.log(articles);
            let Pager = require('../common/pager.js');
            let pager = new Pager({currentPage,totalPages,Url:'/searchArticle',keyWord:searchStr});
    
            //使用moment第三方模块处理事间
            moment.locale('zh-cn');
            for(var i=0;i<articles.length;i++){
                let article = articles[i];
                article.showTime = moment(article.time).fromNow();//返回事件差
            }
            
            return res.render('index',{articles,pager,user:req.session.user});
        })
    })
}

//显示文章详情
exports.showArticle = (req,res,next)=>{
    //获取url上传递过来的文章id
    let aid = req.params.aid;
    // console.log(aid);
    //通过获取到的aid查找数据库
    Article.findArticleByAid(aid,(err,articles)=>{
        if(err) next(err);
        if(articles.length === 0) {
            return res.render('404');
        }
        //显示文章详情的时候还要获取评论数据，渲染到页面上
        Comment.findCommentByAid(aid,(err,comments)=>{
            if(err) next(err);
            return res.render('article',{article:articles[0],user:req.session.user,comments});
        })
        // console.log(articles);
        
    })
}