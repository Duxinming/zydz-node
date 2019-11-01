let express = require('express');  //引入 express 框架
var multer = require('multer');
let bodyParser = require('body-parser'); // 引入 body-parser 中间件
let fs = require('fs');
let User = require('./db'); // 引入数据库
let Mes = require('./db1');
let Adm = require('./db2');
let Ls = require('./db3');

var upload = multer({
    dest: './uploads'
});//定义图片上传的临时目录

let app = express();  // 把 express 实例化

app.use(express.static('uploads'));
app.use(bodyParser.json()); // 使用中间件
app.use(bodyParser.urlencoded({ extended: false }));//解析post请求数据



app.all('*', function (req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Content-Length, Authorization, Accept, X-Requested-With , yourHeaderFeild');
    res.header('Access-Control-Allow-Methods', 'PUT, POST, GET, DELETE, OPTIONS');

    if (req.method == 'OPTIONS') {
        res.send(200); /让options请求快速返回/
    }
    else {
        next();
    }
});

app.post('/add', function (req, res) {
    Ls.find({ name: req.body.name }, (err, doc) => {
        if (doc.length == 1) {
            res.send('no')
        } else {
            Ls.create({ name: req.body.name, ifid: req.body.ifid, ifname: req.body.ifname, ifcard: req.body.ifcard, renumber: req.body.renumber, ban: false }, (err, doc) => {
                if (err) {
                    console.log(err)
                } else {
                    res.send('ok')
                }
            })
        }
    })

})

app.post('/getls', function (res, res) {
    Ls.find({}, (err, doc) => {
        if (err) {
            console.log(err)
        } else {
            res.json(doc)
        }
    })
})

app.post('/addinfo', function (req, res) {  // 新建的路由，以及此路由实现的功能

    console.log(req.body)
    User.find({ name: req.body.name }, (err, doc) => {
        console.log(doc);
        if (err) {
            res.end(err)
        }
        if (doc.length === 1) {
            res.send('no')
        }
        if (doc.length === 0) {
            User.create({ name: req.body.name, password: req.body.password, level: req.body.level, teacher: req.body.teacher, class: req.body.class, num: 0, state0: 0, state1: 0, state2: 0, state3: 0, total: 0, ban: false }, (err, doc) => {
                if (err) {
                    res.end('no')
                } else {
                    res.end('ok');
                }
            });
        }
    })

})

app.post('/loginfo', function (req, res) {  // 新建的路由，以及此路由实现的功能

    User.find({ name: req.body.name, password: req.body.password, ban: false }, (err, doc) => {
        if (err) {
            res.end('err')
        } else {
            console.log(doc)
            if (doc.length === 0) {
                res.end('no')
            }
            if (doc.length === 1) {
                if (doc[0].level === '1') {
                    res.json(doc)
                }
                if (doc[0].level === '2') {
                    res.json(doc)
                }
                if (doc[0].level === '3') {
                    res.json(doc)
                }
            }
        }
    });

})

app.post('/beforesubmit', upload.array("file", 5), async (req, res) => {
    console.log(req.body.card);
    Mes.find({ card: req.body.card, $or: [{ state: "已通过" }, { state: "已结算" }], user: req.body.user }, (err, doc) => {
        if (doc.length !== 0) {
            res.send('no')
        }
        if (doc.length == 0) {
            Mes.find({ card: req.body.card, $or: [{ state: "未通过" }, { state: "审核中" }] }, (err, doc) => {
                console.log(doc);
                res.json(doc)
            })
        }

    })
})

app.post('/submit', upload.array("file", 5), async (req, res) => {  // 新建的路由，以及此路由实现的功能
    Ls.findOne({ name: req.body.ls }, (err, doc) => {
        console.log(doc);
        if (doc.renumber == '是') {
            Mes.findOne({ card: req.body.card, ls: req.body.ls }, (err, doc) => {
                if (err) {
                    console.log(err);
                } else {
                    console.log(doc)
                    if (doc == null) {
                        var path = []
                        for (var i = 0; i < req.files.length; i++) {
                            // 图片会放在uploads目录并且没有后缀，需要自己转存，用到fs模块
                            // 对临时文件转存，fs.rename(oldPath, newPath,callback);
                            fs.rename(req.files[i].path, "uploads/" + req.body.time + req.files[i].originalname, function (err) {
                                if (err) {
                                    console.log(err);
                                }
                                console.log('done!');
                            })
                            // path[i] = "http://localhost:3000/" + req.body.time + req.files[i].originalname
                            path[i] = "http://tongji.oovovv.cn/" + req.body.time + req.files[i].originalname

                        }
                        Mes.create({
                            user: req.body.user,
                            name: req.body.name,
                            number: req.body.number,
                            card: req.body.card,
                            base: path,
                            date: req.body.date,
                            state: req.body.state,
                            time: req.body.time,
                            class: req.body.class,
                            ls: req.body.ls,
                            id: req.body.id
                        }, (err, doc) => {
                            console.log(err)
                            res.json(doc)
                        });
                        User.findOne({ name: req.body.class }, function (err, doc) {
                            doc.num++
                            doc.state0++
                            doc.save()
                        })
                    } else {
                        res.send('no')
                    }
                }
            })
        }
        if (doc.renumber == '否') {
            Mes.findOne({ number: req.body.number, ls: req.body.ls }, (err, doc) => {
                if (err) {
                    console.log(err);
                } else {
                    console.log(doc)
                    if (doc == null) {
                        var path = []
                        for (var i = 0; i < req.files.length; i++) {
                            // 图片会放在uploads目录并且没有后缀，需要自己转存，用到fs模块
                            // 对临时文件转存，fs.rename(oldPath, newPath,callback);
                            fs.rename(req.files[i].path, "uploads/" + req.body.time + req.files[i].originalname, function (err) {
                                if (err) {
                                    console.log(err);
                                }
                                console.log('done!');
                            })
                            path[i] = "http://localhost:3000/" + req.body.time + req.files[i].originalname

                        }
                        Mes.create({
                            user: req.body.user,
                            name: req.body.name,
                            number: req.body.number,
                            card: req.body.card,
                            base: path,
                            date: req.body.date,
                            state: req.body.state,
                            time: req.body.time,
                            class: req.body.class,
                            ls: req.body.ls,
                            id: req.body.id
                        }, (err, doc) => {
                            console.log(err)
                            res.json(doc)
                        });
                        User.findOne({ teacher: req.body.class }, function (err, doc) {
                            doc.num++
                            doc.state0++
                            doc.save()
                        })
                    } else {
                        res.send('no1')
                    }
                }
            })
        }
    })
})

app.post('/fixpwd', function (req, res) {
    console.log(req.body)
    User.findOne({ name: req.body.fuser, password: req.body.fpwd }, function (err, doc) {
        console.log(doc)
        if (err) {
            console.log(err)
        }
        if (doc == null) {
            res.send('no')
        }
        if (doc !== null) {
            doc.password = req.body.npwd
            doc.save()
            res.send('ok')
        }
    })
})

app.post('/fix', function (req, res) {
    Mes.find({ _id: req.body._id }, (err, doc) => {
        res.json(doc)
    })
})

app.post('/surefix', upload.array("file", 5), function (req, res) {
    console.log(req.body)
    var path = []
    for (var i = 0; i < req.files.length; i++) {
        // 图片会放在uploads目录并且没有后缀，需要自己转存，用到fs模块
        // 对临时文件转存，fs.rename(oldPath, newPath,callback);
        fs.rename(req.files[i].path, "uploads/" + req.body.time + req.files[i].originalname, function (err) {
            if (err) {
                console.log(err);
            }
            console.log('done!');
        })
        path[i] = req.body.time + req.files[i].originalname

    }

    Mes.updateOne({ _id: req.body._id }, {
        user: req.body.user,
        name: req.body.name,
        number: req.body.number,
        card: req.body.card,
        base: path,
        date: req.body.date,
        state: req.body.state,
        time: req.body.time,
        id: req.body.id
    }, (err, doc) => {
        console.log(err)
        res.json(doc)
    })
})

//删
app.post('/del', function (req, res) {
    Mes.remove({ _id: req.body._id }, function (err) {
        if (err) {
            console.log(err)
        }
        else {
            res.send('ok')
        }
    })
})
app.post('/dells', function (req, res) {
    Ls.remove({ _id: req.body._id }, (err, doc) => {
        if (err) {
            console.log(err);
        } else {
            res.send('ok')
        }
    })
})
app.post('/delteam', function (req, res) {
    User.remove({ _id: req.body._id }, (err, doc) => {
        if (err) {
            console.log(err);
        } else {
            res.send('ok')
        }
    })
})
//查

app.post('/findteacher', function (req, res) {
    User.find({ level: '2' }, (err, doc) => {
        if (err) {
            res.end(err)
        }
        if (!err) {
            res.json(doc)
        }
    })
})
app.post('/findstudent', function (req, res) {
    User.find({ level: '3' }, (err, doc) => {
        if (err) {
            res.end(err)
        }
        if (!err) {
            res.json(doc)
        }
    })
})

app.post('/findmes', function (req, res) {
    Mes.find({ user: req.body.user }, (err, doc) => {
        res.json(doc)
    })
})

app.post('/search', function (req, res) {
    console.log(req.body);
    var reg = new RegExp(req.body.date, 'g');
    Mes.find({ date: reg, user: req.body.user, state: req.body.state }, function (err, doc) {
        if (err) {
            console.log(err)
        } else {
            console.log(doc)
            res.json(doc)
        }
    })
})

app.post('/tsearchall', function (req, res) {

    Mes.find({ class: req.body.class }, function (err, doc) {
        if (err) {
            console.log(err)
        } else {
            console.log(doc)
            res.json(doc)
        }
    })
})

app.post('/tsearch', function (req, res) {

    let reg = new Date(req.body.date).getTime()
    let reg1 = new Date(req.body.date1).getTime()
    console.log(reg)
    if (req.body.ls == '') {
        Mes.find({
            time: { $gte: reg },
            time: { $lte: reg1 },
            state: req.body.state
        }, function (err, doc) {
            if (err) {
                console.log(err)
            } else {
                console.log(doc)
                res.json(doc)
            }
        })
    } else {
        Mes.find({
            ls: req.body.ls,
            time: { $gte: reg },
            time: { $lte: reg1 },
            state: req.body.state

        }, function (err, doc) {
            if (err) {
                console.log(err)
            } else {
                console.log(doc)
                res.json(doc)
            }
        })
    }
})

app.post('/findinfo', function (req, res) {
    User.find({ level: 2 }, function (err, doc) {
        if (err) {
            console.log(err)

        } else {
            res.json(doc)
        }
    })
})


app.post('/searchadmin', function (req, res) {
    console.log(req.body);
    let reg = new Date(req.body.date).getTime()
    let reg1 = new Date(req.body.date1).getTime()

    let query = { time: { $gte: reg, $lte: reg1 } }
    if (req.body.name !== '') {
        query.name = req.body.name
    }
    if (req.body.card !== "") {
        query.card = req.body.card
    }
    if (req.body.number !== "") {
        query.number = req.body.number
    }
    if (req.body.ls !== "选择银行") {
        query.ls = req.body.ls
    }
    if (req.body.state !== "选择状态") {
        query.state = req.body.state
    }
    if (req.body.class !== "") {
        query.class = req.body.class
    }
    console.log(query);
    Mes.find(query, function (err, doc) {
        if (err) {
            console.log(err)
        } else {
            // console.log(doc)
            res.json(doc)
        }
    })




})

app.post('/findcap', (req, res) => {
    User.find({ name: req.body.name, level: 2 }, (err, doc) => {
        console.log(doc);
        if (doc.length == 0) {
            res.send('no')
        } else {
            res.json(doc)
        }
    })
})

app.post('/findstudent1', (req, res) => {
    User.find({ name: req.body.name, level: 3 }, (err, doc) => {
        console.log(doc);
        if (doc.length == 0) {
            res.send('no')
        } else {
            res.json(doc)
        }
    })
})

app.post('/logadmin', function (req, res) {
    Adm.findOne({ name: req.body.name, password: req.body.password }, function (err, doc) {
        if (!err) {
            if (doc !== null && doc.flag == 'admin') {
                res.json(doc)
            } else {
                res.send('no')
            }
        }
    })
})

app.post('/sall', function (req, res) {
    Mes.find({}, function (err, doc) {
        if (!err) {
            console.log(doc)
            res.json(doc)
        }
        else {
            console.log(err)
        }

    })
})
app.post('/sallpass', function (req, res) {
    Mes.find({ $or: [{ state: '已通过' }, { state: '已结算' }] }, function (err, doc) {
        if (!err) {
            console.log(doc)
            res.json(doc)
        }
        else {
            console.log(err)
        }

    })
})

app.post('/pass', function (req, res) {
    Mes.findOne({ _id: req.body._id }, function (err, doc) {
        if (err) {
            console.log(err);
        } else {
            if (doc.state == '审核中') {
                doc.state = '已通过'
                doc.save()
                User.findOne({ teacher: doc.class }, function (err, doc) {
                    if (err) {
                        console.log(err)
                    } else {
                        doc.state0--
                        doc.state1++
                        doc.save()
                        res.send('ok')
                    }
                })
            } else {
                res.send('no')
            }
        }
    })
})

app.post('/passall', function (req, res) {
    if (req.body.chooseid.length === 0) {
        res.send('no')
        return
    }
    let i = 0
    req.body.chooseid.forEach(element => {


        Mes.findOne({ _id: element }, function (err, doc) {
            if (err) {
                console.log(err);
            } else {
                if (doc.state == '审核中' || doc.state == '未通过') {
                    doc.state = '已通过'
                    doc.save()
                    User.findOne({ teacher: doc.class }, function (err, doc) {
                        if (err) {
                            console.log(err)
                        } else {
                            doc.state0--
                            doc.state1++
                            doc.save()
                            i++
                            if (i == req.body.chooseid.length) {
                                res.send('ok')
                            }
                        }
                    })
                } else {
                    res.send('no')
                }
            }
        })
    });

})

app.post('/res', function (req, res) {
    console.log(req.body)
    Mes.findOne({ _id: req.body._id }, function (err, doc) {
        if (err) {
            console.log(err)
        } else {
            console.log(doc);
            if (doc.state == '审核中') {
                doc.res = req.body.res
                doc.state = '未通过'
                doc.save()
                User.findOne({ teacher: doc.class }, function (err, doc) {
                    if (err) {
                        console.log(err)
                    } else {
                        console.log(doc);
                        doc.state0--;
                        doc.state2++;
                        doc.save()
                        res.send("ok")
                    }
                })
            } else {
                res.send('no')
            }

        }

    })
})

app.post('/Settlement', function (req, res) {
    console.log(req.body);
    Mes.findOne({ _id: req.body._id }, (err, doc) => {
        console.log(doc);
        if (doc !== null) {
            doc.state = '已结算'
            doc.money = req.body.money
            doc.save()
            let a = doc.money

            User.findOne({ teacher: doc.class }, (err, doc) => {
                console.log(doc);
                doc.state1--;
                doc.state3++;
                doc.total = doc.total + a;
                doc.save();
                res.send('ok')
            })
        }
    })
})

app.post('/Settlement2', function (req, res) {
    console.log(req.body);
    Mes.findOne({ _id: req.body._id }, (err, doc) => {
        console.log(doc);
        if (doc !== null) {
            let a = doc.money
            doc.money = req.body.money
            doc.save()
            User.findOne({ teacher: doc.class }, (err, doc) => {
                let b = parseInt(req.body.money)
                doc.total = doc.total - a + b;
                doc.save();
                res.send('ok')
            })
        }
    })
})

app.post('/Settlement1', function (req, res) {
    if (req.body.id.length === 0) {
        res.send('no')
        return
    }
    let i = 0
    req.body.id.forEach(element => {
        console.log(element._id);
        Mes.findOne({ _id: element._id }, (err, doc) => {
            console.log(doc);
            if (doc !== null) {
                doc.state = '已结算'
                doc.money = req.body.money
                let a = doc.money
                doc.save()
                User.findOne({ teacher: doc.class }, (err, doc) => {
                    console.log(doc);
                    doc.state1--;
                    doc.state3++;
                    doc.total = doc.total + (a * req.body.id.length);
                    doc.save();
                    i++
                    if (i == req.body.id.length) {
                        res.send('ok')
                    }
                })

            }
        })
    });

})
app.post('/searchSettlement', function (req, res) {
    console.log(req.body);
    User.findOne({ name: req.body.class }, (err, doc) => {
        Mes.find({ class: doc.teacher, ls: req.body.ls }, (err, doc) => {
            console.log(doc);
            res.json(doc)
        })
    })

})
app.post('/toteam', function (req, res) {
    console.log(req.body.teacher);
    User.findOne({ teacher: req.body.teacher }, (err, doc) => {
        res.json(doc)
    })
})

app.post('/ban', (req, res) => {
    Ls.findOne({ _id: req.body._id }, (err, doc) => {
        console.log(doc);
        doc.ban = !doc.ban
        doc.save()
        res.send('ok')
    })
})
app.post('/banstudent', (req, res) => {
    User.findOne({ _id: req.body._id }, (err, doc) => {
        console.log(doc);
        doc.ban = !doc.ban
        doc.save()
        res.send('ok')
    })
})

//改
app.post('/changecap', (req, res) => {
    User.findOne({ name: req.body.class, level: "2" }, (err, doc) => {
        if (doc == null) {
            res.send('no')
        }
        if (doc !== null) {
            User.findOne({ _id: req.body._id }, (err, doc) => {
                doc.class = req.body.class
                doc.save()
                res.send('ok')
            })
        }
    })
})
app.post('/changepwd', (req, res) => {
    User.findOne({ _id: req.body._id }, (err, doc) => {
        doc.password = req.body.password
        doc.save()
        res.send('ok')
    })
})
app.listen(3000, function () { console.log('服务器正在监听 3000 端口') });


// let client = new OSS({
//     region: 'oss-cn-beijing',
//     //云账号AccessKey有所有API访问权限，建议遵循阿里云安全最佳实践，部署在服务端使用RAM子账号或STS，部署在客户端使用STS。
//     accessKeyId: 'LTAI4FcU4fTNyuyrmUX6D3Z5',
//     accessKeySecret: 'P1VS0Zfp03wrNU6gi5OsgiipobMlku',
//     bucket: 'dxm0'
// });