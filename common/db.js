'use strict';
const db = {};
const mysql = require('mysql');
let pool = mysql.createPool({
    connectionLimit : 10,
    host            : '127.0.0.1',
    user            : 'root',
    password        : 'root',
    database        : 'itcast',
});

//封装自己的jquery
db.query = function(sql,parmas,callback){
    pool.query(sql,parmas,(err,result,fields)=>{
        callback(err,result);
    })
}
module.exports = db;