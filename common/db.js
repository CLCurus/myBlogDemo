'use strict';
const db = {};
const mysql = require('mysql');
//引入配置文件
const config = require('../config.js');

let pool = mysql.createPool({
    connectionLimit : config.connectionLimit,
    host            : config.host,
    user            : config.user,
    password        : config.password,
    database        : config.database,
});

//封装自己的jquery
db.query = function(sql,parmas,callback){
    pool.query(sql,parmas,(err,result,fields)=>{
        callback(err,result);
    })
}
module.exports = db;