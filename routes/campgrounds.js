const express = require("express"), 
	  Campground = require("../models/campground"),
	  middleware = require("../middleware"),
	  NodeGeocoder = require("node-geocoder"); 
	  // Comment 	 = require("../models/comment");

const options = {
	provider: "google",
	httpAdapter: "https",
	apiKey: process.env.GEOCODER_API_KEY,
	formatter: null
}

const geocoder = NodeGeocoder(options);

var router = express.Router();

// INDEX: "/campgrounds" - Show all campgrounds
router.get("/", (req, res) => {	
	// Get all campgrounds from the DB
	Campground.find({}, function(err, allCampgrounds){
		if (err) {
			console.log(err);
		} else {
			res.render("campgrounds/index", {campgrounds : allCampgrounds, page: 'campgrounds'});
		}
	});
});

// CREATE: "/campgrounds" - Add new campground to DB
router.post("/", middleware.isLoggedIn, (req, res) => { 
	// Get data from form and add to campgrounds array
	const name = req.body.name;
	const price = req.body.price;
	const image = req.body.image;
	const description = req.body.description; 
	
	const author = {
		id: req.user._id,
		username: req.user.username
	};
	
	geocoder.geocode(req.body.location, (err, data) => {
		if (err || !data.length) {
			req.flash("error", "Invalid address");
			return res.redirect("back");
		}
		const lat = data[0].latitude;
		const lng = data[0].longitude;
		const location = data[0].formattedAddress;
		
		const newCampground = {name: name, price: price, image: image, lat: lat, lng: lng, description: description, author: author};
	
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
		
	});
	
	// Redirect to campgrounds page
	// res.redirect("/campgrounds");	
});

// NEW - Show form to create new campground
router.get("/new", middleware.isLoggedIn, (req, res) => {
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
router.get("/:id/edit", middleware.checkCampgroundOwnership, (req, res) => {
		Campground.findById(req.params.id, (err, foundCampground) => {		
			res.render("campgrounds/edit", {campground: foundCampground});
		});
}); 

// UPDATE CAMPGROUND ROUTE
router.put("/:id", middleware.checkCampgroundOwnership, (req, res) => {
	geocoder.geocode(req.body.campground.location, (err, data) => {
		if (err || !data.length) {
			req.flash("error", "Invalid address");
			return res.redirect("back");
		}
		req.body.campground.lat = data[0].latitude;
		req.body.campground.lng = data[0].longitude;
		req.body.campground.location = data[0].formattedAddress;

		// Find and update the correct campground
		Campground.findByIdAndUpdate(req.params.id, req.body.campground, (err, updatedCampground) => {
			if(err) {
				req.flash("error", err.message);
				res.redirect("back");
			} else {
				// Redirect somewhere
				req.flash("success", "Successfully updated!");
				res.redirect("/campgrounds/"+req.params.id);
			}
		}); 
	}); 
});

// DESTROY CAMPGROUND ROUTE
router.delete("/:id", middleware.checkCampgroundOwnership, (req, res) => {
	Campground.findByIdAndRemove(req.params.id, (err) => {
		if(err) {
			res.redirect("/campgrounds");
		} else {
			res.redirect("/campgrounds");
		}
	});
});

module.exports = router;