const Campground = require("../models/campground"), 
	  Comment 	 = require("../models/comment");

//  All the middleware goes here
var middlewareObj = {};

middlewareObj.checkCampgroundOwnership = (req, res, next) => {
	// User is logged in? 
	if (req.isAuthenticated()) {
		Campground.findById(req.params.id, (err, foundCampground) => {		
			if (err) {
				res.redirect("back");
			} else {
				// Does the user own the campground? 
				// Find if the ID of the author on that campground matches the ID of the user
				if (foundCampground.author.id.equals(req.user._id)) {					
					// Render the edit template with that campground
					next();
				} else {
					res.redirect("back");
				}
				
			}
		});
	} else {
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
				if (foundComment.author.id.equals(req.user._id)) {					
					// Render the edit template with that comment in a campground
					next();
				} else {
					res.redirect("back");
				}
				
			}
		});
	} else {
		res.redirect("back");
	}
}

// Middleware function 
middlewareObj.isLoggedIn = (req, res, next) => {
	if (req.isAuthenticated()) {
		return next();
	}
	res.redirect("/login");
}

module.exports = middlewareObj;