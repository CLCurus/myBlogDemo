'user strict';
//引入models模块的user
const user = require('../models/user');
//引入加密密码的utility模块
const utils = require('utility');
//引入解析图片文件上传解析模块
const formidable = require('formidable');

//主页面显示
exports.showIndex = (req,res,next)=>{
    let user = req.session.user; //当域和path满足条件的情况下，
    //客户端会带connect.sid过来，服务器能获取到该ID，就能从session中辨别各自的session了，
    //从而拿到session中存储的user  
    // console.log(user.username);
    return res.render('index',{user});
}

//注册页面的显示
exports.showRegister = (req,res,next)=>{
    return res.render('register');
}

//注册处理
exports.doRegister = (req,res,next)=>{
    //处理post表单提交的数据，这里使用第三方包body-parse来处理
    // console.log(req.body);
    let username = req.body.username;
    let email = req.body.email;
    let password = req.body.password;
    let vcode = req.body.vcode;

    //先通过session里面的vcode来判断当前输入的vcode是否正确
    if(req.session.vcode != vcode){
        return res.render('register',{msg:'您输入的验证码不正确，请重新输入'})
    }
    //调用models模块里面的方法查找数据库数据
    user.findUserByUsername(username,(err,users)=>{ //这里的users就是db里面的result
        if(err) return next(err);
        //验证用户名是否存在，如果存在length就不为0；
        // console.log(users);
        if(users.length !=0){
            return res.render('register',{msg:'用户名已存在'});
        }
        //加密密码 使用utility模块进行MD5的加密
        password = utils.md5(utils.md5(password));
        // console.log(password);
        // console.log(utils.md5('苏千'));
        //如果用户名不存在就保存用户
        user.saveUser({username,email,password},(err,result)=>{
            if(err) return next(err);
            // console.log(1);
            let msg = `亲爱的用户${username},您好,用户已经注册成功，但还未激活，请点击下方激活按钮进行激活账户！`
            let info = '点击激活';
            let token = utils.md5(utils.md5('itcast_' + username + '_itcast'));
            let href = '/active?username=' + username + '&token=' + token;
            //保存用户信息后，提示用户注册成功
            res.render('showNotice',{msg,info,href}); //显示注册成功，继续激活页面
        })
    })
}

//激活处理
exports.doActive = (req,res,next)=>{
    //获得点击激活a标签请求的数据
    let username = req.query.username;
    let urlToken = req.query.token;
    //比较这次请求过来的token是否和之前服务器发送过去的token值相等
    preToken = utils.md5(utils.md5('itcast_' + username + '_itcast'));
    if(preToken!=urlToken){
        return res.render('showNotice',{msg: '非法激活', info: '去到首页', href: '/' })
    }
    //如果相同，就更新数据激活字段值
    user.updateActiveFlagByUsername(username,(err,result)=>{
        if(err) return next(err);
        return res.render('login');
    })
}

//登录处理
exports.doLogin = (req,res,next)=>{
    //获取登录提交的数据
    let username = req.body.username;
    let password = req.body.password;
    let remember_me = req.body.remember_me;
    //判断是否存在该用户
    user.findUserByUsername(username,(err,users)=>{
        if(err) return next(err);
        //如果用户名不存在，就提示用户
        if(users.length === 0){
            return res.render('login',{msg:'用户名不存在'});
        }
        //由于数据库返回返回来的user是一个数组 
        let thisUser = users[0]; //获取用户
        //判断是否激活，0就是未激活
        if(thisUser.active_flag === 0){
            return res.render('login',{msg:`该用户未激活，请到${thisUser.email}去激活`})
        }
        //判断密码是否正确
        let newPassword = utils.md5(utils.md5(password));
        if(password != thisUser.password && newPassword != thisUser.password){
            return res.render('login',{msg:'密码不正确'});
        }

        //登录成功，就把用户信息保存到session中，用户下次访问，就知道他登陆过了没
        req.session.user = thisUser;

        //如果要给浏览器一个cookie,其实就是通过一个响应头 
        //判断一把，登录的时候如果remember_me === 'on',就保存cookie，否则就情况cookie
        let maxAge = -1 ; //清空cookie
        if (req.body.remember_me === 'on') {
            maxAge = 1000 * 60 * 60 * 24 * 7;//记住我一周
        }

        //set-cookie: xxx = 1;bbb = 2
        let cookieOptions = {
            domain: 'localhost',
            path: '/',
            maxAge
        }
         res.cookie('username', thisUser.username, cookieOptions);
         res.cookie('password', thisUser.password, cookieOptions);
         res.cookie('remember_me', remember_me, cookieOptions);
        //如果都正确，就跳转回到首页
        res.redirect('/');
    })
}

//显示登录页面
exports.showLogin = (req,res,next)=>{
    let loginObj = {};
    // console.log(req.cookies);
    // //显示页面需要从cookie中拿到数据,填写到页面中
    if(typeof req.cookies.remember_me != 'undefind'){
        loginObj.remember_me = req.cookies.remember_me;
        loginObj.username = req.cookies.username;
        loginObj.password = req.cookies.password;
        if(loginObj.remember_me === 'on') loginObj.checked = 'checked'
    }
    res.render('login',loginObj);//{loginObj:loginObj}
}

// 退出
exports.doLogout = (req, res, next) => {
    //清空session中的user数据
    req.session.user = null;
    //显示退出页面
    res.render('logout');
}

//获取数字图片验证码
exports.getPicture = (req,res,next)=>{
    //导入common里面的getPicture文件，调用里面的方法，获得图片和数字
    let imgData = require('../common/getPicture.js').getPic();
    // console.log(imgData.num);
    //拿到数据后,先保存一个数字到session中
    req.session.vcode = imgData.num; //保存到请求头里面的session里面，模块就会自动帮我们把数据
                            //保存到数据库的session里面，在浏览器中不可见
    //在返回一个base64的图片给浏览器
    return res.send(imgData.imgbase64);
}

//显示设置界面
exports.showSetting = (req,res,next)=>{
    let sessionUser = req.session.user;
    // console.log(req.session.user.username);
    //这是获取设置用户信息其实有两种方法，一种是通过session里面的user直接拿到用户信息
    //另一种就是通过路径哪里传递一个username的参数，获得username查找数据库，拿到信息返回页面
    //这里使用第二种方法来做
    let username = req.query.username;
    // console.log(username);
    user.findUserByUsername(username,(err,users)=>{
        if(err) return next(err);
        //判断如果该用户名不存在就404或者其它提示
        if(users.length === 0){
            return res.render('404');
        }
        let thisUser = users[0];
        // console.log(thisUser);
        res.render('setting',{user:sessionUser,thisUser});
    });
}

//上传图片处理
exports.uploadPic = (req,res,next) =>{
    //生成文件解析对象
    let form = new formidable.IncomingForm();
    //设置文件上传存储路径
    form.uploadDir = "./public/img";
    //解析文件
    form.parse(req, function(err, fields, files) {
        if(err) return next(err);
        // console.log(files.pic.path);
        res.send('/'+ files.pic.path);
    });
}

//保存设置处理
exports.doSetting = (req,res,next)=>{
    //获取表单提交的信息
    let userId = req.body.userid;
    let pic = req.body.picpath;
    //获得路径然后存储到数据库中
    user.savePic(pic,userId,(err,result)=>{
        if(err) return next(err);
        // console.log(111);
        //将session中的图片更新一下
        req.session.user.pic = pic; //要注意session和数据库是两块不同的内存区域，两者互不影响
        //跳转首页
        res.redirect('/');
    })
}

