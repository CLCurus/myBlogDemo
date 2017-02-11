'use strict';
var captchapng = require('captchapng');

exports.getPic = function(){
    //获取随机四位数
        var num = parseInt(Math.random()*9000+1000)
        console.log(num);
        var p = new captchapng(80,30,num); // width,height,numeric captcha 
        p.color(0, 0, 0, 0);  // First color: background (red, green, blue, alpha) 
        p.color(80, 80, 80, 255); // Second color: paint (red, green, blue, alpha) 
 
        var img = p.getBase64();
        var imgbase64 = new Buffer(img,'base64');
        
        return {num,imgbase64};
}
        