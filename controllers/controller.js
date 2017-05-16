var mysql = require("mysql");
var connection = mysql.createConnection({
	host: "54.87.129.163",
	user: "TODO1",
	password: "1234567890",
	port: 3306,
	database: "TODO1"
});

module.exports = function(app){
	connection.connect(function(err){
		if(err){
			console.error(err);
		} else {
			console.log("Connected to database");
		}
	});

	app.get("/", function(req, res){
		console.log("getting query");
		connection.query("SELECT * FROM USER", function(error, results, fields){
			if(error){
				console.error(error);
			}
			if(req.session.userID){
				console.log("Session UserID set " + req.session.userID);
			} else {
				console.log("Session UserID not set");
			}
			res.render("index");
		});
	});

	app.get("/todo", function(req, res){
		if(req.session.userID){
			var id = req.session.userID;
			// query database and find users to do list
			connection.query("SELECT * FROM TASK WHERE UserID= ?", [id], function(error, results, fields){
				if(error){
					console.error(error);
				}
				console.log("todo query for " + id);
				res.render("todo",{userName: req.session.userName, data: results});	
			});
		} else {
			res.redirect("/");
		}
	});

	app.get("/login", function(req, res){
		console.log("rendering login page");
		res.render("login");
	});

	app.post("/login", function(req, res){
		var email = req.body.email;
		var password = req.body.password;
		console.log(email + " " + password);
		connection.query("SELECT * FROM USER WHERE Email= ? AND Password= ?", [email, password], function(error, results, fields){
			if(error){
				console.error("There was an error");
				res.end("There was an error");
			}
			if(results.length>0){
				req.session.userID = results[0].UserID;
				req.session.userName = results[0].Name;
				console.log("Done looking up user");
				console.log(results);
				res.redirect("/todo");
			} else {
				console.log("No matches found");
				res.render("login", {error: "error", email: email, password: password})
			}
		});
	});

	app.get("/register", function(req, res){
		console.log("rendering register page");
		res.render("register");
	});

	app.post("/register", function(req, res){
		var name = req.body.name.trim();
		var email = req.body.email.trim();
		var password = req.body.password.trim();
		var confirmPassword = req.body.confirmPassword.trim();
		var error = 0;
		if(!name){
			console.log("name is not valid");
			error++;
		}
		if(!email){
			console.log("email is not valid");
			error++;
		}
		if (password !== confirmPassword){
			console.log("password does not match");
			error++;
		}
		if(!password){
			console.log("password is not valid");
			error++;
		}
		if(!confirmPassword){
			console.log("confirm password is not valid");
			error++;
		}
		if(error>0){
			console.log("fix errors");
			res.render("/register", {error: error});
		}else{
			connection.query('INSERT INTO USER(Name, Email, Password) VALUES(?, ?, ?)', [name, email, password], function(error, results, fields){
				if(error){
					console.error("There was an error");
					res.end("There was an error");
				} else {
					console.log("data inserted");
					console.log(results.insertId);
					res.redirect("/");
					// res.render("register", {error: "error", email: email, password: password})
				}
			});
		}
	});

	app.get("/logout", function(req, res){
		req.session.destroy(function(err) {
			if(err) {
				console.log(err);
			} 
			if(!req.session) {
				console.log("session destroyed");
			} else {
				console.log("session still here");
			}
		});
		res.redirect("/");
	});
};