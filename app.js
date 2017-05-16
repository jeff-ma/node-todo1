var express = require("express");
var app = express();
var bodyParser = require("body-parser");
var controller = require("./controllers/controller.js");
var session = require("express-session");
var sessionOptions = {
	secret: "secret",
	resave: true,
	saveUninitialized: false
};
var handlebars = require("express-handlebars");
// Set view engine to handlebars
app.set("view engine", "handlebars");
app.engine("handlebars", handlebars({defaultLayout: "main"}));
// Set static folder to public
app.use(express.static("./public"));
app.use(bodyParser.urlencoded({extended: false}));
app.use(session(sessionOptions));
// Enable controller
controller(app);
app.listen(3000, function(){
	console.log("Listening on 3000");
});