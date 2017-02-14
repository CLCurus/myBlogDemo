'use strict';
let Comment = require('../models/comment.js');
let Article = require('../models/article.js');

//保存评论到数据库并且显示到页面
exports.saveComment = (req,res,next)=>{
    //获取请求体数据
    let uid = req.body.uid;
    let aid = req.body.aid;
    let content = req.body.content;
    //拿到数据 保存到数据库
    let comment = new Comment({uid,aid,content});
    comment.saveComment((err,result)=>{
        if(err) next(err);
        // console.log(111);
        //保存数据成功后还要更新评论数
        Article.updateAnswerCount(aid,(err,result)=>{
            if(err) next(err);
            // console.log(111);
        })

        return res.redirect('/showArticle/'+aid);
    })
}