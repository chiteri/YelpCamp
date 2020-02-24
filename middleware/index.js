const Campground = require("../models/campground"), 
	  Comment 	 = require("../models/comment");

//  All the middleware goes here
var middlewareObj = {};

middlewareObj.checkCampgroundOwnership = (req, res, next) => {
	// User is logged in? 
	if (req.isAuthenticated()) {
		Campground.findById(req.params.id, (err, foundCampground) => {		
			if (err) {
				req.flash("error", "Campground not found.");
				res.redirect("back");
			} else {
				// Does the user own the campground? 
				// Find if the ID of the author on that campground matches the ID of the user
				if (foundCampground.author.id.equals(req.user._id) || req.user.isAdmin) {					
					// Render the edit template with that campground
					next();
				} else {
					req.flash("error", "You don't have permission to do that.");
					res.redirect("back");
				}
				
			}
		});
	} else {
		req.flash("error", "You need to be logged in to do that.");
		res.redirect("back");
	}
}

middlewareObj.checkCommentOwnership = (req, res, next) => {
	// User is logged in? 
	if (req.isAuthenticated()) {
		Comment.findById(req.params.comment_id, (err, foundComment) => {		
			if (err) {
				res.redirect("back");
			} else {
				// Does the user own the comment? 
				// Find if the ID of the author on that comment matches the ID of the user
				if (foundComment.author.id.equals(req.user._id) || req.user.isAdmin) {					
					// Render the edit template with that comment in a campground
					next();
				} else {
					req.flash("error", "You don't have permission to do that.");
					res.redirect("back");
				}
				
			}
		});
	} else {
		req.flash("error", "You need to be logged in to do that.");
		res.redirect("back");
	}
}

// Middleware function 
middlewareObj.isLoggedIn = (req, res, next) => {
	if (req.isAuthenticated()) {
		return next();
	}
	req.flash("error", "You need to be logged in to do that.");
	res.redirect("/login");
}

module.exports = middlewareObj;