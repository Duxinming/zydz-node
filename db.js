let mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/user', { useNewUrlParser: true });  //连接数据库

const articleSchema = new mongoose.Schema({  //schema
    name: String,       //用户名
    password: String,   //密码 
    level: String,      //身份识别  00一级 00二级 00三级
    teacher: Number,    //老师编号  非老师 00
    class: Number,      //班级编号  非学生 00
    num: Number,
    state0: Number,    //中
    state1: Number,    //过
    state2: Number,    //没过
})

module.exports = mongoose.model('info', articleSchema);  // model