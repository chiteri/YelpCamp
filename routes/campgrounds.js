const express = require("express"), 
	  Campground = require("../models/campground"); 
	  // Comment 	 = require("../models/comment");

var router = express.Router();

// INDEX: "/campgrounds" - Show all campgrounds
router.get("/", (req, res) => {	
	// Get all campgrounds from the DB
	Campground.find({}, function(err, allCampgrounds){
		if (err) {
			console.log(err);
		} else {
			res.render("campgrounds/index", {campgrounds : allCampgrounds});
		}
	});
});

// CREATE: "/campgrounds" - Add new campground to DB
router.post("/", isLoggedIn, (req, res) => { 
	// Get data from form and add to campgrounds array
	const name = req.body.name;
	const image = req.body.image;
	const description = req.body.description; 
	
	const author = {
		id: req.user._id,
		username: req.user.username
	};
	
	const newCampground = {name: name, image: image, description: description, author: author};
	
	// campgrounds.push(newCampground);
	Campground.create(newCampground, (err, newCamp) => {
		if (err) {
			console.log(err);
		} else {
			// console.log("NEWLY CREATED CAMPGROUND");
			// console.log(newCamp);
			res.redirect("/campgrounds");
		}
	});
	
	// Redirect to campgrounds page
	// res.redirect("/campgrounds");	
});

// NEW - Show form to create new campground
router.get("/new", isLoggedIn, (req, res) => {
	res.render("campgrounds/new");
});

// SHOW - Shows more info about one campground
router.get("/:id", (req, res) => {
	Campground.findById(req.params.id).populate("comments").exec( (err, foundCampground) => {		
		if (err) {
			console.log(err);
		} else {
			// Render the show template with that campground
			res.render("campgrounds/show", {campground: foundCampground});
		}		
	}); 	
});

// EDIT CAMPGROUND ROUTE
router.get("/:id/edit", (req, res) => {
	Campground.findById(req.params.id, (err, foundCampground) => {		
		if (err) {
			res.redirect("/campgrounds");
		} else {
			// Render the edit template with that campground
			res.render("campgrounds/edit", {campground: foundCampground});
		}
	});
}); 

// UPDATE CAMPGROUND ROUTE
router.put("/:id", (req, res) => {
	// Find and update the correct campground
	Campground.findByIdAndUpdate(req.params.id, req.body.campground, (err, updatedCampground) => {
		if(err) {
			res.redirect("/campgrounds");
		} else {
			// Redirect somewhere
			res.redirect("/campgrounds/"+req.params.id);
		}
	}); 
});

// Middleware function 
function isLoggedIn(req, res, next) {
	if (req.isAuthenticated()) {
		return next();
	}
	res.redirect("/login");
}

module.exports = router;