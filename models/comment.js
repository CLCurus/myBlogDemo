'use strict';
let db = require('../common/db.js');
//声明评论内容构造函数
function Comment(comment){
    this.content = comment.content;
    this.uid = comment.uid;
    this.aid = comment.aid;
}
//保存评论信息到数据库
Comment.prototype.saveComment = function(callback){
    db.query(`insert into comments (content,time,uid,aid) values (?,now(),?,?)`,
    [this.content,this.uid,this.aid],callback);
}
//通过aid获取评论数据
Comment.findCommentByAid = function(aid,callback){
    db.query(`
    select 
        t1.id AS cid,
            t1.content,
            t1.time,
            t1.uid,
            t1.aid,
            t2.username,
            t2.email,
            t2.pic
        from comments t1 
        left join users t2 on t1.uid = t2.id
        where aid=? order by t1.time desc`,[aid],callback);
}
module.exports = Comment;