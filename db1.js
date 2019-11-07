let mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/user', { useNewUrlParser: true });  //连接数据库

const mesSchema = new mongoose.Schema({  //schema
    user: String,       //用户
    name: String,       //姓名
    number: String,     //电话
    card: String,       //车牌号
    base: Array,        //图片路径
    date: String,        //日期
    state: String,
    time: String,
    class: String,
    res: String,     //审核未通过的通知
    ls: String,     //银行s
    id: String,     //身份证号
    money: Number,
    endtime: String //结算时间
})

module.exports = mongoose.model('message', mesSchema);  // model