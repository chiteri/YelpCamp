const express    = require("express"), 
	  Campground = require("../models/campground"), 
	  Comment 	 = require("../models/comment");

var router = express.Router({mergeParams: true});

// Form to add a comment
router.get("/new", isLoggedIn, (req, res) => {
	Campground.findById(req.params.id, (err, campground) => {
		if (err) {
			console.log(err);
		} else {
			res.render("comments/new", {campground: campground}); 
		}
	});	
});

// Add a new comment to the DB
router.post("/", isLoggedIn, (req, res) => {
	// Lookup campground using ID
	Campground.findById(req.params.id, (err, campground) => {
		if (err) {
			console.log(err);
			res.redirect("/campgrounds");
		} else {
			// Create a new comment 
			Comment.create(req.body.comment, (err, comment) => {
				if(err) {
					console.log(err);
				} else {
					// Connect comment to the campground
					campground.comments.push(comment);
					campground.save();
					// Redirect to the campground's show page
					res.redirect("/campgrounds/"+campground._id); 
				}	   
			});
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