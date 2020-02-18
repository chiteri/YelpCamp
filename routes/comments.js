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

// Edit a comment 
router.get("/:comment_id/edit", checkCommentOwnership, (req, res) => {
	
	Comment.findById(req.params.comment_id, (err, foundComment) => {
		if (err) {
			res.redirect("back");
			// console.log(err);
		} else {
			res.render("comments/edit", {campground_id: req.params.id, comment: foundComment}); 
		}
	});	
	
	// res.render("comments/edit");
});

// Comments update
router.put("/:comment_id", checkCommentOwnership, (req, res) => {
	Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment, (err, updatedComment) => {
		if(err) {
			res.redirect("back");
		} else {
			// Redirect somewhere
			res.redirect("/campgrounds/"+req.params.id);
		}
	} );
	// res.send("YOU HIT THE UPDATE FORM FOR COMMENT!!");
});

// Comments delete 
router.delete("/:comment_id", checkCommentOwnership, (req, res) => {
	Comment.findByIdAndRemove(req.params.comment_id, (err) => {
		if(err) {
			res.redirect("back");
		} else {
			res.redirect("/campgrounds/"+req.params.id);
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
					// Add username and id to comment 
					comment.author.id = req.user._id;
					comment.author.username = req.user.username;
					// Save the comment 
					comment.save();
					
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


function checkCommentOwnership(req, res, next) {
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

module.exports = router;