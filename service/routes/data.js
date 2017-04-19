/**
 * Created by haiifeng on 2017/4/4.
 */
var express = require('express');
var router = express.Router();
var fs=require('fs');
var PATH='./public/data/'

//读取数据模块
//data/read?type=it
//data/read?type=it.json
router.get('/read', function(req, res, next) {
    var type=req.query['type']||'';
    fs.readFile(PATH+type+'.json',function (err, data) {
        if(err){
            return res.send({
                status:0,
                info:'读取文件出现异常'
            })
        }
        var COUNT=50;

        //TODO:try
        var obj=[];
        try{
            obj=JSON.parse(data.toString());
        }catch (e){
            obj=[];
        }

        if(obj.length>50){
            obj=obj.slice(0,COUNT);
        }
        return res.send({
            status:1,
            data:obj
        })
    });
});

//数据存储模块
router.post('/write',function (req, res, next) {
    //文件名
    var type=req.body.type||'';
    var url=req.body.url||'';
    var title=req.body.title||'';
    var img=req.body.img ||'';
    if(!type||!url||!title||!img){
        return res.send({
            status:0,
            info:'提交的字段不安全'
        })
    }
    //1)读取文件
    var filepath=PATH+type+'.json';
    fs.readFile(filepath,function (err, data) {
        if(err){
            return res.send({
                status:0,
                info:'读取数据失败'
            })
        }

        var arr=JSON.parse(data.toString());
        //代表每一条数据
        var obj={
          img:img,
            url:url,
            title:title,
            id:guidGenerate(),
            time:new Date()
        };
        arr.splice(0,0,obj);

        var newData=JSON.stringify(arr);
        fs.writeFile(filepath,newData,function (err) {
            if(err){
                return res.send({
                    status:0,
                    info:'文件写入失败'
                })
            }
            return res.send({
                status:1,
                info:'文件写入成功',
                data:obj
            })
        });
    });
    //2)写入文件
});

//阅读模块写入接口
router.post('/write_config',function (req, res, next) {
    //TODO:后期进行提交数据校验
    //防xss攻击
    //npm install xss
    //require('xss');
    //var str=xss(name)
    //TODO:try catch
    var newData=JSON.stringify(req.body);
    //写入
    fs.writeFile(PATH+'config.json',newData,function (err) {
        if(err){
            return res.send({
                status:0,
                info:'写入数据失败'
            })
        }
        return res.send({
            status:1,
            info:'写入数据成功'
        })
    });
});

//登陆接口
router.post('/login',function (req, res, next) {
    var username=req.body.username;
    var password=req.body.password;

    //TODO:对用户名密码进行校验
    // 密码加密（md5）
    if(username==='admin'&&password==='123456'){
        req.session.user={
            username:username
        };
        return res.send({
            status:1,
            info:'登陆成功'
        })
    }
     return res.send({
         status:0,
         info:'登陆失败'
     })
});

//guid
function guidGenerate() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random() * 16 | 0,
            v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    }).toUpperCase();
}

module.exports = router;
