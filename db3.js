let mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/user', { useNewUrlParser: true });  //连接数据库

const mesSchema = new mongoose.Schema({  //schema
    name: String, //银行名字
    default: String,//银行默认价格

    ifname: String,//
    ifcard: String,//
    renumber: String,//手机号是否可以重复
    ifid: String,  //是否需要输入身份证
    ban: Boolean
})

module.exports = mongoose.model('list', mesSchema);  // model