const express  = require("express"), 
	  passport = require("passport"),
	  User = require("../models/user"), 
	  Campground = require("../models/campground");

var router = express.Router();

// Root route
router.get("/register", (req, res) => {
	res.render("register", {page: 'register'});
});

// Handle sign up logic
router.post("/register", (req, res) => {
	var newUser = new User({username: req.body.username, 
							firstName: req.body.firstName, 
							lastName: req.body.lastName, 
							avatar: req.body.avatar, 
						   email: req.body.email 
						   });
	
	if (req.body.adminCode === "secretcode123") {
		newUser.isAdmin = true;
	}
	User.register(newUser, req.body.password, (err, user) => {
		if(err) {
			// console.log(err.message)
			// req.flash("error", err.message);
			// return res.redirect("/register");
			return res.render("register", {error: err.message});
		}
		// Else authenticate the new user
		passport.authenticate("local")(req, res, () => {
			req.flash("success", "Welcome to YelpCamp "+user.username+"!!");
			res.redirect("/campgrounds");
		});
	});
});

// Show login form 
router.get("/login", (req, res) => {
	res.render("login", {page: 'login'});
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
	req.flash("success", "Logged you out!");
	res.redirect("/campgrounds");
});

// USER PROFILE
router.get("/users/:id", (req, res) => {
	User.findById(req.params.id, (err, foundUser) => {
		if (err) {
			req.flash("error", "Something went wrong ...");
			res.redirect("/");
		} 
		Campground.find().where("author.id").equals(foundUser.id).exec((err, campgrounds) => {
			if (err) {
				req.flash("error", "Something went wrong ...");
				res.redirect("/");
			} 
			res.render("users/show", {user: foundUser, campgrounds: campgrounds});
		});		
	});
});

module.exports = router;