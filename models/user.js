'use strict';

//引入数据库对象；
const db = require('../common/db');

//查找用户名
exports.findUserByUsername = function(username,callback){
    db.query(`select * from users where username = ?;`,[username],callback);
}

//保存用户信息
exports.saveUser = function(userObj,callback){
    db.query(`insert into users (username,password,email,active_flag) values(?,?,?,0);`
    // db.query(`insert into user (username,password,email,active_flag) values(3,?,?,?,0);`
    ,[userObj.username,userObj.password,userObj.email],callback);
}

//激活成功 更新激活的字段状态
exports.updateActiveFlagByUsername = function(username,callback){
    db.query(`update users set active_flag = 1 where username = ?;`,
    [username],callback);
}
exports.savePic = function(pic,userId,callback){
    db.query(`update users set pic = ? where id = ?;`,
    [pic,userId],callback);
}
