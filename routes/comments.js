const express    = require("express"), 
	  Campground = require("../models/campground"), 
	  Comment 	 = require("../models/comment"),
	  middleware = require("../middleware");

var router = express.Router({mergeParams: true});

// Form to add a comment
router.get("/new", middleware.isLoggedIn, (req, res) => {
	Campground.findById(req.params.id, (err, campground) => {
		if (err) {
			console.log(err);
		} else {
			res.render("comments/new", {campground: campground}); 
		}
	});	
});

// Edit a comment 
router.get("/:comment_id/edit", middleware.checkCommentOwnership, (req, res) => {
	
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
router.put("/:comment_id", middleware.checkCommentOwnership, (req, res) => {
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
router.delete("/:comment_id", middleware.checkCommentOwnership, (req, res) => {
	Comment.findByIdAndRemove(req.params.comment_id, (err) => {
		if(err) {
			res.redirect("back");
		} else {
			req.flash("success", "Comment deleted.");
			res.redirect("/campgrounds/"+req.params.id);
		}					  
	});
});

// Add a new comment to the DB
router.post("/", middleware.isLoggedIn, (req, res) => {
	// Lookup campground using ID
	Campground.findById(req.params.id, (err, campground) => {
		if (err) {
			console.log(err);
			res.redirect("/campgrounds");
		} else {
			// Create a new comment 
			Comment.create(req.body.comment, (err, comment) => {
				if(err) {
					req.flash("error", "Something went wrong.");
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
					req.flash("success", "Successfully added comment.");
					// Redirect to the campground's show page
					res.redirect("/campgrounds/"+campground._id); 
				}	   
			});
		}
	});	
 	
});

module.exports = router;