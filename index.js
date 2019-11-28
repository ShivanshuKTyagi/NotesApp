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


function makeid(length) {
	var result           = '';
	var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
	var charactersLength = characters.length;
	for ( var i = 0; i < length; i++ ) {
	   result += characters.charAt(Math.floor(Math.random() * charactersLength));
	}
	return result;
 }


//initalising Mongodb
var users
const uri ="mongodb+srv://dbuser:lgledishu@cluster0-ucofm.azure.mongodb.net/test?retryWrites=true&w=majority";
const client = new MongoClient(uri, {useNewUrlParser: true, useUnifiedTopology: true});
client.connect(err => {
	 users = client.db("NotesApp").collection("Users");
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


//handeling get requests
app.get('/',(req,res)=>{
	res.render('index');
})

app.get('/signup',(req,res) =>{
	res.render('signup');
});
app.get('/login',(req,res) =>{
	res.render('login');
});

app.get('/dash',(req,res) =>{
	users.findOne({id: req.cookies["id"]}, async function(err,item){	
		console.log("active user: "+item["name"]);
		res.render('dashboard',{user:item["name"]});
		});
});


//handeling post requests
app.post('/signup', (req,res)=> {
	var info = req.body;
	bcrypt.genSalt(10, function(err, salt) {
		bcrypt.hash(info["password"], salt, function(err, hash) {
			console.log(hash);
		users.insertOne({
			id: makeid(20),
			name: info["name"],
			email: info["email"],
			password: hash
		});
		});
	});
	console.log("Recieved data and User added");
	res.render('login',{message: "Successfully SignedIn..."});
	});

app.post('/login', (req,res)=> {
	var info = req.body;
	users.findOne({email: info["email"]}, (err,item)=>{	
		bcrypt.compare(info["password"], item["password"], function(err, result) {
			if(info["email"]==item["email"] && result){
				res.clearCookie('id');
				res.cookie('id', item["id"] );
				res.redirect('/dash')
				console.log("found the user");
			}
			else{
				res.render('login', {message : "INVALID DETAILS"});
			}
		});
	});
});


//running server
app.listen(process.env.PORT || 5000);
console.log("Server running on "+ (process.env.PORT || 5000));
