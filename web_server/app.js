//加载第三方模块
const express = require('express');
const cors = require('cors');
const path = require('path');
const jwt = require('jsonwebtoken');
const expressJWT = require('express-jwt');
const session = require('express-session');
const multer = require('multer');
const upload = multer({
    dest: 'uploads/'
})
const db = require(path.join(__dirname, 'utils', 'db.js'));
//创建app对象
const app = express();
//中间件 跨域
app.use(cors());
// 开发静态资源
app.use(express.static(path.join(__dirname, 'uploads')))
//设置token
const secretKey = 'cheng-long';
// 解密模块
app.use(expressJWT({
    secret: secretKey
}).unless({
    path: [/^\/api\//]
}));
// app.use(expressJWT({
//     secret: secretKey
// }).unless({
//     path: [/^\/api\//]
// }));
//设置请求体
app.use(express.urlencoded({
    extended: false
}));

//开启服务
app.listen(3006, () => console.log('服务器已开启'));



// 注册接口
app.post('/api/reguser', (req, res) => {
    // console.log(req.body);
    //删除验证码
    delete req.body.verify;
    //sql语句
    let sql = 'insert into user set ?'
    //执行数据库
    db(sql, req.body, (err, result) => {
        // console.log(result);
        if (err || result.affectedRows > 0) {
            res.json({
                status: 0,
                message: '注册成功'
            });
        } else {
            res.json({
                status: 1,
                message: '注册失败'
            });
        }
    });
})


//用户登录接口
app.post('/api/login', (req, res) => {
    // console.log(req.body);

    let sql = 'select * from user where username=? and password=?';
    // console.log(req.body.username, req.body.password);

    db(sql, [req.body.username, req.body.password], (err, result) => {

        // console.log(err)
        if (err) return console.log(err);
        if (result.length > 0) {
            res.json({
                status: 0,
                message: '登录成功',
                token: 'Bearer ' + jwt.sign({
                    username: req.body.username
                }, secretKey, {
                    expiresIn: '2h'
                })
            });
        } else {
            res.json({
                status: 1,
                message: '账号或密码错误',
            })
        };
    })
})


//添加英雄接口
app.post('/my/addhero', upload.single('heroIcon'), (req, res) => {
    // console.log(req.body);
    // console.log(req.file);

    let sql = 'insert into heroes set ?';
    let values = {
        heroname: req.body.heroName,
        nickname: req.body.heroNickName,
        skill: req.body.skillName,
        img_url: req.file.filename
    }
    db(sql, values, (err, result) => {
        if (err || result.affectedRows > 0) {
            res.json({
                status: 0,
                message: '添加成功'
            })
        } else {
            res.json({
                status: 1,
                message: '添加失败'
            })
        }
    });

});


// 获取信息接口
app.get('/my/heroeslist', (req, res) => {
    let pagenum = req.query.pagenum || 1;
    let pagesize = req.query.pagesize || 2;
    let state = req.query.state || '';
    let sql = 'select count(*) cc from heroes';
    db(sql, null, (err, result) => {
        // console.log(result);
        if (err) return console.log(err);
        let total = Math.ceil(result[0].cc / pagesize);
        // console.log(total);
        let sql = 'select * from heroes order by id';

        db(sql, null, (err, result) => {
            if (err) return console.log(err);
            res.json({
                status: 0,
                message: '获取英雄列表成功',
                data: result,
                total: total
            })
        })

    });
})

// 报错处理中间件
app.use((err, req, res, next) => {
    // console.log(err);
    if (err.name === 'UnauthorizedError') {
        res.json({
            status: 1,
            message: '身份认证失败'
        })
    }
});