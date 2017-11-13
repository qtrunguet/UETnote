var express = require("express")
var session = require("express-session")


var app = express();
var bodyParser = require('body-parser')

var mysql = require('mysql')

var urlencodedParser = bodyParser.urlencoded({ extended: false })

var con = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "qt",
  database: "thuctap"
})

con.connect(function (err) {
  if (err) throw err
  console.log("Connected!")
})

app.use(bodyParser.json())
app.use(session({
  secret: 'dangquangtrung',
  resave: true,
  saveUninitialized: true,
  cookie: {}
}))
app.listen(9999)

// cau hinh EJS

app.set("view engine", "ejs")
app.set("views", "./views")

//su dung
app.get("/login", function (req, res) {
  res.render("login")
})

//url
const url = require('url')

app.post("/login", urlencodedParser, function (req, res) {
  var u = req.body.u
  var p = req.body.p
  console.log(u)
  console.log(p)
  var queryString = 'SELECT * FROM login WHERE username=' + con.escape(u) + ' AND password=' + con.escape(p)
  con.query(queryString, function (err, rows, fields) {
    if (err) throw err;
    //console.log(rows);
    if (rows[0] != null) {
      req.session.user = rows[0]
      res.redirect(url.format({
        pathname: "list",
        query: {
          "u": u,
          "id": rows[0].id
        }
      }))
    }
    else {
      res.render("login")
    }
  })
})

app.get("/list", function (req, res) {
  var id = req.query.id
  var username = req.query.u
  var queryString = 'SELECT * FROM data WHERE id=' + con.escape(id)
  var text = []
  if (!req.session.user) {
    return res.redirect('/login')
  }
  con.query(queryString, function (err, rows, fields) {
    if (err) throw err
    var length = rows.length
    //console.log("leng:"+length)
    //console.log(rows)
    
    for (i = 0; i < length; i++) {
      var dodai=rows[i].textdata.length%38
      if(rows[i].textdata.length/38>0) dodai=38
      text[i] = rows[i].textdata.substring(0, dodai)
    }
    res.render("list", {
      username: username,
      list: rows,
      text: text,
      length: length,
      id: id
    })
  })
})

app.get("/dashboard/:stt", function (req, res) {
  stt = req.params.stt
  console.log(stt)
  // if(!Number.isNaN(stt)){
  //     res.end()
  // }
  var textdata = "";
  if (!req.session.user) {
    return res.redirect('/login')
    
  }
  
  if(stt == 9999){
    var cach = 'Chào mừng các bạn đã đến với UET Note! '
    var queryInsert = 'INSERT into data (id,textdata) VALUES (' +con.escape(req.session.user.id)+','+con.escape(cach)+ ')'
    con.query(queryInsert, function(err){
      if (err) throw err
      console.log("den duoc day ko 8888")
      
    }) 
    var querySelect = 'SELECT * FROM data WHERE id=' + con.escape(req.session.user.id)
    con.query(querySelect, function(err, rows, fields){
      if (err) throw err
      stt = new Number(rows[rows.length-1].stt)
      console.log("CO DEN KO"+stt)
      //return res.redirect('/list')
    })
  }
  console.log("stt ngoai if "+stt)
  var queryString = 'SELECT * FROM data WHERE stt=' + con.escape(stt)
  con.query(queryString, function (err, rows, fields) {
    if (err) throw err
    console.log(rows)
    console.log("??????")
    if (!rows[0]) {
      return res.redirect('/list')
    }
    textdata = rows[0].textdata
    console.log("co chay duoc toi day khong")
    res.render("dashboard", {
      username: req.session.user.username,
      id: stt,
      textdata: textdata
    })
    console.log("sau khi render xong")
  })
})

app.post("/dashboard/:stt", urlencodedParser, function (req, res) {
  console.log(" day la anh Phi " + req.params.stt)
  var textdata = req.body.textdata
  console.log("here is: " + textdata)
  var id = req.params.stt
  console.log("day la id: " + id)
  var queryString = 'UPDATE data SET textdata=' + con.escape(textdata) + ' WHERE stt=' + con.escape(id)
  con.query(queryString, function (err, rows, fields) {
    if (err) throw err
    res.redirect(`/dashboard/${id}`)
  })
  // var queryString = 'SELECT * FROM login WHERE id='+ con.escape(id)
  // con.query(queryString, function(err, rows, fields){
  //     if (err) throw err;
  //     //console.log(rows);
  //     if (rows[0] != null){
  //         res.redirect(`/dashboard/${id}`)
  //     }
  // })
})
app.get("/register", function (req, res) {
  res.render("register")
})
app.post("/register", urlencodedParser, function (req, res) {
  var u = req.body.u
  var p = req.body.p
  var queryString = 'INSERT INTO login (username,password) VALUES (' + con.escape(u) + ',' + con.escape(p) + ')'
  con.query(queryString, function (err) {
    if (err) throw err
    // res.redirect("/login")
  })
  var id = 0
  queryString = 'SELECT * FROM login WHERE username=' + con.escape(u) + ' AND password=' + con.escape(p)
  con.query(queryString, function (err, rows, fields) {
    if (err) throw err;
    //console.log(rows);
    if (rows[0] != null) {
      id = rows[0].id
      console.log(' id register la: ' + id)
      var cach = 'Chào mừng các bạn đã đến với UET Note! '
      queryString2 = 'INSERT INTO data (id,textdata) VALUES (' + con.escape(id) +','+con.escape(cach)+ ')'
      con.query(queryString2, function (err) {
        if (err) throw err
        res.redirect("/login")
      })
    }
    else {
      console.log("loi phan register doc du lieu")
    }
  })
})

app.get('/logout',function(req,res){
	
	req.session.destroy(function(err){
		if(err){
			console.log(err);
		}
		else
		{
			res.redirect('/login');
		}
  })
})