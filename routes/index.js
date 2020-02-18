const express  = require("express"), 
	  passport = require("passport"),
	  User = require("../models/user");

var router = express.Router();

// Root route
router.get("/register", (req, res) => {
	res.render("register");
});

// Handle sign up logic
router.post("/register", (req, res) => {
	var newUser = new User({username: req.body.username});
	User.register(newUser, req.body.password, (err, user) => {
		if(err) {
			console.log(err);
			return res.render("register");
		}
		// Else authenticate the new user
		passport.authenticate("local")(req, res, () => {
			res.redirect("/campgrounds");
		});
	});
});

// Show login form 
router.get("/login", (req, res) => {
	res.render("login");
});

// Handling login logic
router.post("/login", passport.authenticate("local", {
		successRedirect: "/campgrounds",
		failureRedirect: "/login"
	}), (req, res) => {
});

// Logout logic
router.get("/logout", (req, res) => {
	req.logout();
	res.redirect("/campgrounds");
});

module.exports = router;