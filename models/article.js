'use strict';
const db = require('../common/db.js');

//设置文章的构造函数  当controller模块需要调用的数据太多或者挂载的方法也太多的时候就用这个方式，这样做比
//                  直接用exports导出的更加灵活
function Article(article){
    this.id = article.id;
    this.title = article.title;
    this.content = article.content;
    this.time = article.time;
    this.uid = article.uid;
    this.answerCount = article.answerCount;
    //当调用了这个构造函数的时候就会把相应的数据传递到实例里面
}

//往数据库中插入文件   把一些需要拿到数据的方法设置到Article函数的原型里面
Article.prototype.save = function(callback){
    db.query(`insert into articles (title,content,uid,answerCount,time) values (?,?,?,?,now());`
    ,[this.title,this.content,this.uid,this.answerCount],callback);
}

//获取数据库里面文章表的数量  把一些不需要拿到文章数据的方法设置到Article函数当中
Article.getTotalCount=function(callback){
    db.query(`select count(*) as total from articles`,[],callback);
}
Article.getArticlesByLimit = function(offset,viewCount,callback){
    db.query(`
SELECT
    t1.id AS aid,
    t1.title,
    t1.content,
    t1.time,
    t1.uid,
    t1.answerCount,
    t2.username,
    t2.email,
    t2.pic
FROM
    articles t1
LEFT JOIN users t2 ON t1.uid = t2.id 
ORDER BY t1.time DESC 
limit ?,? 
    `,[offset,viewCount],callback);
}

module.exports = Article;

