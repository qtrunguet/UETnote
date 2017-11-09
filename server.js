var express = require("express")

var app = express();
var bodyParser = require('body-parser')

var mysql = require('mysql')

var urlencodedParser = bodyParser.urlencoded({ extended: false})

var con = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "qt",
    database: "thuctap"
})

con.connect(function(err){
    if (err) throw err
    console.log("Connected!")
})

app.use(bodyParser.json())

app.listen(9999)

// cau hinh EJS

app.set("view engine", "ejs")
app.set("views", "./views")

//su dung
app.get("/login", function(req, res){
    res.render("login")
})

//url
const url = require('url')

app.post("/login", urlencodedParser, function(req, res){
    var u = req.body.u
    var p = req.body.p
    console.log(u)
    console.log(p)
    var queryString = 'SELECT * FROM login WHERE username='+ con.escape(u) +' AND password=' + con.escape(p)
    con.query(queryString, function(err, rows, fields){
        if (err) throw err;
        //console.log(rows);
        if (rows[0] != null){
            res.redirect(url.format({
                pathname:"list",
                query:{
                    "u": u,
                    "id": rows[0].id
                }
            }))
        }
        else{
            res.render("login")
        }
    })
})

app.get("/list",function(req,res){
    var id = 14
    var username = "Quang Trung"
    var queryString = 'SELECT * FROM data WHERE id='+con.escape(id)
    var text = []
    con.query(queryString,function(err,rows,fields){
        if (err) throw err
        var length = rows.length
        //console.log("leng:"+length)
        //console.log(rows)
        for(i=0;i<length;i++){
             text[i] = rows[i].textdata.substring(0,10)
        }
        res.render("list",{
            username: username,
            list: rows,
            text: text,
            length: length,
            id: id
        })
    })
})

app.post("/list",urlencodedParser, function(req,res){
    var stt= req.body.stt;
    stt =1;
    res.redirect(url.format({
        pathname:"dashboard/stt",
        query:{
            "stt": stt
        }
    }))
})

app.get("/dashboard/:stt", function(req, res){
    var stt = req.query.stt
    var queryString = 'SELECT * FROM data WHERE stt='+con.escape(stt)
    var textdata="";
    con.query(queryString, function(err, rows, fields){
        if (err) throw err
        textdata = rows[0].textdata
        res.render("dashboard",{username:req.query.u,
            id:id,
            textdata:textdata    
           })
    })
})

app.post("/dashboard", urlencodedParser,function(req,res){
    var textdata = req.body.textdata
    console.log("here is: "+ textdata)
    var id = req.body.id
    console.log("day la id: " +id)
    var queryString = 'UPDATE data SET textdata='+con.escape(textdata)+' WHERE id='+con.escape(id)
    con.query(queryString, function(err, rows, fields){
        if (err) throw err
    })
    var queryString = 'SELECT * FROM login WHERE id='+ con.escape(id)
    con.query(queryString, function(err, rows, fields){
        if (err) throw err;
        //console.log(rows);
        if (rows[0] != null){
            res.redirect(url.format({
                pathname:"/dashboard",
                query:{
                    "u": rows[0].username,
                    "id": rows[0].id
                }
            }))
        }
    })
})
app.get("/register", function(req, res){
    res.render("register")
})
app.post("/register", urlencodedParser,function(req, res){
    var u = req.body.u
    var p = req.body.p
    var queryString = 'INSERT INTO login (username,password) VALUES ('+ con.escape(u) +',' + con.escape(p)+')'
    con.query(queryString, function(err){
        if(err) throw err
       // res.redirect("/login")
    })
    var id =0
    queryString = 'SELECT * FROM login WHERE username='+ con.escape(u) +' AND password=' + con.escape(p)
    con.query(queryString, function(err, rows, fields){
        if (err) throw err;
        //console.log(rows);
        if (rows[0] != null){
            id = rows[0].id
            console.log(' id register la: '+id)
            var cach = ''
            queryString2 = 'INSERT INTO data (id) VALUES ('+con.escape(id)+')'
            con.query(queryString2, function(err){
                if(err) throw err
                res.redirect("/login")
            })
        }
        else{
            console.log("loi phan register doc du lieu")
        }
    })
})
