let mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/user', { useNewUrlParser: true });  //连接数据库

const mesSchema = new mongoose.Schema({  //schema
    name: String,       //用户名
    password: String,   //密码 
    flag: String
})

module.exports = mongoose.model('admin', mesSchema);  // model