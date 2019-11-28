const MongoClient = require('mongodb').MongoClient;


var users
const uri ="mongodb+srv://dbuser:lgledishu@cluster0-ucofm.azure.mongodb.net/test?retryWrites=true&w=majority";
const client = new MongoClient(uri, {useNewUrlParser: true, useUnifiedTopology: true});
client.connect(err => {
	module.exports = client.db("NotesApp").collection("Users");
	console.log("DB Initialised")
});
