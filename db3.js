let mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/user', { useNewUrlParser: true });  //连接数据库

const mesSchema = new mongoose.Schema({  //schema
    name: String //银行名字
})

module.exports = mongoose.model('list', mesSchema);  // model