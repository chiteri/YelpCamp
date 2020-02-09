const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
// const reques
var app = express();
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended:true}));
mongoose.connect("mongodb://localhost:27017/yelp_camp", {useNewUrlParser: true, useUnifiedTopology: true});

// Schema setup
const campgroundSchema = new mongoose.Schema ({
	name: String,
	image: String, 
	description: String
})

var Campground = mongoose.model("Campground", campgroundSchema );

/* Campground.create({ name: "Granite Hill", image: "https://pixabay.com/get/55e8dc404f5aab14f6da8c7dda793f7f1636dfe2564c704c7d2f7add9148c551_340.jpg" }, 
				 function(err, camp) {
	if (err) {
		console.log(err);
	} else {
		console.log("NEWLY CREATED CAMPGROUND");
		console.log(camp);
	}
}); */

// Array holding all the campground info 
/* var campgrounds = [
		{ name: "Salmon Creek", image: "https://pixabay.com/get/57e8d0424a5bae14f6da8c7dda793f7f1636dfe2564c704c7d2f7add9148c551_340.jpg" }, 
		{ name: "Granite Hill", image: "https://pixabay.com/get/55e8dc404f5aab14f6da8c7dda793f7f1636dfe2564c704c7d2f7add9148c551_340.jpg" }, 
		{ name: "Mountain goat's rest", image: "https://photosforclass.com/download/pixabay-1845719?webUrl=https%3A%2F%2Fpixabay.com%2Fget%2F57e8d1464d53a514f6da8c7dda793f7f1636dfe2564c704c7d2f7add9148c551_960.jpg&user=Pexels" }
	]; */

// The landing page
app.get("/", (req, res) => {
	res.render("landing");
});

// INDEX: "/campgrounds" - Show all campgrounds
app.get("/campgrounds", (req, res) => {	
	// Get all campgrounds from the DB
	Campground.find({}, function(err, allCampgrounds){
		if (err) {
			console.log(err);
		} else {
			res.render("index", {campgrounds : allCampgrounds});
		}
	});
});

// CREATE: "/campgrounds" - Add new campground to DB
app.post("/campgrounds", (req, res) => { 
	// Get data from form and add to campgrounds array
	const name = req.body.name;
	const image = req.body.image;
	const description = req.body.description 
	
	const newCampground = {name: name, image: image, description: description};
	
	// campgrounds.push(newCampground);
	Campground.create(newCampground, function(err, newCamp) {
		if (err) {
			console.log(err);
		} else {
			console.log("NEWLY CREATED CAMPGROUND");
			console.log(newCamp);
		}
	});
	
	// Redirect to campgrounds page
	res.redirect("/campgrounds");	
});

// NEW - Show form to create new campground
app.get("/campgrounds/new", (req, res) => {
	res.render("new");
});

// SHOW - Shows more info about one campground
app.get("/campgrounds/:id", function(req, res) {
	Campground.findById(req.params.id, function(err, foundCampground) {		
		if (err) {
			console.log(err);
		} else {
			// Render the show template with that campground
			res.render("show", {campground: foundCampground});
		}		
	}); 	
});

// Tell Express to listen for requests (start server)
app.listen(3000, () => {
	console.log("Yelp camp server listening on port 3000");
});