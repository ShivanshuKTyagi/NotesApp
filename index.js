//Modules
const MongoClient = require('mongodb').MongoClient;
var express = require('express');
var session = require('express-session');
var cookieParser = require('cookie-parser');
var ejs = require('ejs');
var bodyparser = require('body-parser');
var cookiePerser = require('cookie')
var path = require('path');
var bcrypt = require('bcryptjs')
const dotenv = require('dotenv');
dotenv.config();

function makeid(length) {
	var result           = '';
	var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*)';
	var charactersLength = characters.length;
	for ( var i = 0; i < length; i++ ) {
	   result += characters.charAt(Math.floor(Math.random() * charactersLength));
	}
	return result;
 }


 var mongoKey = process.env.KEY;

//initalising Mongodb
var users
var notes
const uri =mongoKey;
const client = new MongoClient(uri, {useNewUrlParser: true, useUnifiedTopology: true});
client.connect(err => {
	 users = client.db("NotesApp").collection("Users");
	 notes = client.db("NotesApp").collection("Notes");
	console.log("DB Initialised")

});



//Recieving ip to run on
var ip = "localhost";
var port = '3000';
var myArgs = (process.argv.slice(2));
if(myArgs[0]){
	var contents = myArgs[0].split(':');
	ip = contents[0];
	port = contents[1];
}

//initialising express and body-parser and cookie-perser
var app = express();
app.set('view engine', 'ejs');
app.set('views', './views');
app.use(bodyparser.json());
app.use(cookieParser())
app.use(bodyparser.urlencoded({extended: true}));
app.use(express.static(__dirname + '/public'));

//-------------------------------------------------------------------------------------------------
//handeling get requests
app.get('/',(req,res)=>{
	notes.findOne({id: 'count'}, async function(err,item){
		notes.updateOne({"id": "count"}, {$set: {"count": item["count"]+1}});})
	
	if(req.cookies["id"]){	
		res.redirect('/dash');
	}else{
			res.render('index');
	}
})





//    notes.findOne({id: 'count'}, async function(err,item){
// 	notes.updateOne({"id": "count"}, {$set: {"count": item["count"]+1}});})


app.get('/signup',(req,res) =>{
	notes.findOne({id: 'count'}, async function(err,item){
		notes.updateOne({"id": "count"}, {$set: {"count": item["count"]+1}});})
	
	res.render('signup');
});


app.get('/login',(req,res) =>{
	notes.findOne({id: 'count'}, async function(err,item){
		notes.updateOne({"id": "count"}, {$set: {"count": item["count"]+1}});})
	
	res.render('login');
});

app.get('/error',(req,res) =>{
	notes.findOne({id: 'count'}, async function(err,item){
		notes.updateOne({"id": "count"}, {$set: {"count": item["count"]+1}});})
	
	res.render('error');
});

app.get('/logout', (req,res)=> {
	notes.findOne({id: 'count'}, async function(err,item){
		notes.updateOne({"id": "count"}, {$set: {"count": item["count"]+1}});})
	
	res.clearCookie('id');
	res.redirect('/');
});



//---------------------------------------------------------------------------------------------



//handeling post requests

app.post('/delete', (req,res)=> {
	notes.findOne({id: 'count'}, async function(err,item){
		notes.updateOne({"id": "count"}, {$set: {"count": item["count"]+1}});})
	
	var id_del = req.body["id"];
	console.log(id_del);
	notes.deleteOne({id: id_del});
	console.log(req.body);
	res.redirect('/');
});

app.post('/add',(req,res) =>{
	notes.findOne({id: 'count'}, async function(err,item){
		notes.updateOne({"id": "count"}, {$set: {"count": item["count"]+1}});})
	
	users.findOne({id: req.cookies["id"]}, async function(err,item){
		if(err){
			res.redirect('/error');
		}	
		notes.insertOne({
			id: item["id"],
			note: req.body["data"]
		});
	});
	res.redirect('dash');
	
});

app.get('/dash',(req,res) =>{
	var counter;
	notes.findOne({id: 'count'}, async function(err,count){
		counter = count["count"];
		notes.updateOne({"id": "count"}, {$set: {"count": counter+1}});})
	
	var dat = [];
	if(req.cookies["id"]){
		users.findOne({id: req.cookies["id"]}, async function(err,item){	
			console.log("active user: "+item["name"]);
			var cursor = notes.find({id: req.cookies["id"]});
			while(await cursor.hasNext()) {
  				const db_item = await cursor.next();
				if(db_item==null)return;
				dat.push((db_item));
			}

			res.render('dashboard', { user: item["name"], data: dat, count:counter});
			});
		}
	else{
		res.redirect('/');
}
		
		
});

app.post('/signup', (req,res)=> {
	notes.findOne({id: 'count'}, async function(err,item){
		notes.updateOne({"id": "count"}, {$set: {"count": item["count"]+1}});})
	
	var info = req.body;
	bcrypt.genSalt(10, function(err, salt) {
		if(err){
			res.redirect('/error');
		}
		bcrypt.hash(info["password"], salt, function(err, hash) {
			if(err){
				res.redirect('/error');
			}
			users.update({email:info["email"]},{$set:{name: info["name"],id: makeid(20), password: hash}},{upsert:true});
		});
	});
	res.clearCookie('id');
	console.log("Recieved data and User added");
	console.log("found the user");
	res.redirect('/');
	});

app.post('/login', (req,res)=> {
	notes.findOne({id: 'count'}, async function(err,item){
		notes.updateOne({"id": "count"}, {$set: {"count": item["count"]+1}});})
	
	var info = req.body;
	users.findOne({email: info["email"]}, (err,item)=>{	
		if(err){
			res.redirect('/error');
		}
		if(!item){
			res.render('login', {message : "INVALID DETAILS"});
			return;
		}
		bcrypt.compare(info["password"], item["password"], function(err, result) {
			if(err){
				res.redirect('/error');
			}
			if(info["email"]==item["email"] && result){
				res.clearCookie('id');
				res.cookie('id', item["id"], {maxAge:600000});
				res.redirect('/dash')
				console.log("found the user");
			}
			else{
				res.render('login', {message : "INVALID DETAILS"});
			}
		});
	});
});

// app.post('/edit', (req,res)=> {
// 	notes.findOne({id: 'count'}, async function(err,item){
// 		notes.updateOne({"id": "count"}, {$set: {"count": item["count"]+1}});})
	
// 	res.redirect('/');
// });

//-------------------------------------------------------------------------------------

//running server
app.listen(process.env.PORT || 5000);
console.log("Server running on "+ (process.env.PORT || 5000));
