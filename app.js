var express = require('express');
var path = require('path');
var app = express();
var alert = require('alert');
const session = require('express-session');


app.use(express.urlencoded({entended: true}));
app.use(express.static('public'));
app.use(session({
  name : 'admin',
  secret: 'crzy',
  httpOnly: true,
  resave: false,
  saveUninitialized: false,
}));

var MongoClient = require('mongodb').MongoClient

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', function(req, res){
  res.render('login')
});


app.get('/registration', function(req, res){
  res.render('registration')
});

app.get('/home', function(req, res){
   if(req.session.username) 
  res.render('home');
   else res.redirect('/');   
});

app.get('/annapurna', function(req, res){
  if(req.session.username) 
  res.render('annapurna');
   else res.redirect('/');   
});

app.get('/bali', function(req, res){
  if(req.session.username) 
  res.render('bali');
   else res.redirect('/'); 
});

app.get('/cities', function(req, res){
  if(req.session.username) 
  res.render('cities');
   else res.redirect('/');  
});

app.get('/hiking', function(req, res){
  if(req.session.username) 
  res.render('hiking');
   else res.redirect('/');  
});

app.get('/inca', function(req, res){
  if(req.session.username) 
  res.render('inca');
   else res.redirect('/'); 
});

app.get('/islands', function(req, res){
  if(req.session.username) 
  res.render('islands');
   else res.redirect('/'); 
});

app.get('/paris', function(req, res){
  if(req.session.username) 
  res.render('paris');
   else res.redirect('/');  
});

app.get('/rome', function(req, res){
  if(req.session.username) 
  res.render('rome');
   else res.redirect('/'); 
});

app.get('/santorini', function(req, res){
  if(req.session.username) 
  res.render('santorini');
   else res.redirect('/'); 
});

app.get('/searchresults', function(req, res){
  if(req.session.username) 
  res.render('searchresults');
   else res.redirect('/'); 
});

app.get('/wanttogo', function(req, res){
  if(req.session.username) {
    MongoClient.connect("mongodb://127.0.0.1:27017", function(err, client){
  
    if(err) throw err;
    var db = client.db('myDB');
  
    db.collection('myCollection').find({user: req.session.username}).toArray((err, results) => {
      if(err) throw err;
      let dests = results[0].list;
      console.log(dests);
      res.render('wanttogo', {listOfDests: dests});
      });
  
    }); 
    
  }
   else res.redirect('/'); 
});


app.post('/', function(req, res){
  let username = req.body.username;
  let password = req.body.password;
  
  if(process.env.PORT && username == 'admin' && password == 'admin'){
    req.session.username = 'admin';
    res.render('home');
  }
  else { 
  MongoClient.connect("mongodb://127.0.0.1:27017", function(err, client){
  
  if(err) throw err;

  var db = client.db('myDB');
   
  db.collection('myCollection').find({user : username}).toArray((err, results) => {
    if(err) throw err;
    var len = results.length;
    
    //console.log(passwd);
    if(username == '') alert ("Username is empty");
    else if (len <= 0) {
      alert ("Username does not exist");
    }
    else {
      var passwd = results[0].pass;
      if(password == passwd) {
        req.session.username = username;
        res.render('home'); 
      } 
      else
      alert ("Wrong password");
    }
  
    });

  });
}
});


app.post('/register', function(req, res){
  let username = req.body.username;
  let password = req.body.password;

  MongoClient.connect("mongodb://127.0.0.1:27017", function(err, client){
  
  if(err) throw err;

  var db = client.db('myDB');

  db.collection('myCollection').find({user : username}).toArray((err, results) => {
    if(err) throw err;
    //console.log(results.length)
    var len = results.length;
    if(username == '') alert("Username is empty");
    else if(password == '') alert("Password is empty"); 
    else if (len > 0) alert("Username already exists");
    else {
      alert("Registration is successful");
    db.collection('myCollection').insertOne({user: username, pass: password , list: []});
    res.redirect('/') 
  }
  });

  }); 
});

app.post('/addtolist', function(req, res){

  let dest = req.body.place;
  
  MongoClient.connect("mongodb://127.0.0.1:27017", function(err, client){
  
  if(err) throw err;
  var db = client.db('myDB');

  db.collection('myCollection').find({user: req.session.username}).toArray((err, results) => {
    if(err) throw err;
    let flag = false;
    var arr = results[0].list;
    // console.log(dest);
    // console.log(arr);
    for(let i = 0;i< arr.length; i++ ){
      if(arr[i]==dest && arr[i]!='')  flag = true;
    }
  
    if(flag == true) alert("Destination already added");
    else {
      db.collection('myCollection').updateOne({user: req.session.username}, {$addToSet : {"list": dest}});
     console.log(dest);
     alert("Destination added");
    
    }
    res.redirect('/'+ dest);
    });

  }); 
  
});


function getAllSubstrings(s) {
  const result = [];
  for (let len = 1; len <= s.length; len++) {
      for (let i = 0; i + len <= s.length; i++) {
          result.push(s.slice(i, i + len));
      }
  }
  return result;
}

let substrings = [{dest: "rome", subs: getAllSubstrings("rome")},
                   {dest: "santorini",subs: getAllSubstrings("santorini")},
                    {dest: "inca",subs: getAllSubstrings("inca")},
                     {dest: "bali",subs: getAllSubstrings("bali")},
                      {dest: "annapurna",subs: getAllSubstrings("annapurna")},
                       {dest: "paris",subs: getAllSubstrings("paris")}];

app.post('/search', function(req, res){
  
  let srch = req.body.Search;
  let list = [];

  substrings.forEach(item => {
    if(item.subs.includes(srch.toLowerCase()))
    list.push(item.dest);
  })
  if(list.length== 0) alert("Result not found")
  else
  res.render('searchresults', {listOfResults: list});

});


if(process.env.PORT)
  app.listen(process.env.PORT);
else
app.listen(3000);