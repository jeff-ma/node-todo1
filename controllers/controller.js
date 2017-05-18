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
		if(req.session.userID){
			console.log("Session UserID set " + req.session.userID);
		} else {
			console.log("Session UserID not set");
		}
		res.render("index");
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

	app.post("/todo", function(req, res){
		if(req.session.userID){
			var id = req.session.userID;
			var title = req.body.title;
			var description = req.body.description;
			var error = [];
			if(!title){
				error.push("Please enter a title");
			}
			if(!description){
				error.push("Please enter a description");
			}
			if(error.length>0){
				connection.query("SELECT * FROM TASK WHERE UserID= ?", [id], function(error, results, fields){
					if(error){
						console.error(error);
					}
					res.render("todo",{userName: req.session.userName, error: error, data: results});	
				});
			} else {
				connection.query("INSERT INTO TASK(UserID, Title, Description, Created) VALUES(?, ?, ?, now())", [id, title, description], function(err, results, fields){
					if(err){
						console.error(err);
					}
					console.log("Added to database");
					res.redirect("/todo");
				});
			}
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
				res.render("login", {error: "Sorry incorrect email or password", email: email, password: password})
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
		var error = [];
		if(!name){
			error.push("Name is not valid");
		}
		if(!email){
			error.push("Email is not valid");
		}
		if (password !== confirmPassword){
			error.push("Password does not match");
		}
		if(!password){
			error.push("Password is not valid");
		}
		if(!confirmPassword){
			error.push("Confirm password is not valid");
		}
		if(error.length>0){
			console.log(error);
			res.render("register", {error: error, name: name, email: email, password: password, confirmPassword: confirmPassword});
		}else{
			connection.query('INSERT INTO USER(Name, Email, Password) VALUES(?, ?, ?)', [name, email, password], function(err, results, fields){
				if(err){
					console.error("There was an error");
					res.end("There was an error");
				} else {
					console.log("data inserted");
					req.session.userID = results.insertId;
					req.session.userName = name;
					console.log(results.insertId);
					res.redirect("/todo");
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