let mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/user', { useNewUrlParser: true });  //连接数据库

const mesSchema = new mongoose.Schema({  //schema
    time: String //记录每次点击导出的时间
})

module.exports = mongoose.model('xlsx', mesSchema);  // model