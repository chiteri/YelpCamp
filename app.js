const bodyParser = require("body-parser"), 
	  express 	 = require("express"), 
	  mongoose   = require("mongoose"),
	  passport 	 = require("passport"),
	  LocalStrategy = require("passport-local"),
	  Campground = require("./models/campground"),
      Comment    = require("./models/comment"),
	  User 		 = require("./models/user"); 
	  // seedDB = require("./seeds");

// const reques
var app = express();
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static(__dirname+"/public"));

mongoose.connect("mongodb://localhost:27017/yelp_camp", {useNewUrlParser: true, useUnifiedTopology: true});

// Seed the database 
// seedDB();

// PASSPORT CONFIGURATION
// Set up Express sessions
app.use(require("express-session")({
	secret: "The greatest trick the devil ever pulled was convincing the world that he did not exist.",
	resave: false,
	saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

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
			res.render("campgrounds/index", {campgrounds : allCampgrounds});
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
app.get("/campgrounds/new", (req, res) => {
	res.render("campgrounds/new");
});

// SHOW - Shows more info about one campground
app.get("/campgrounds/:id", (req, res) => {
	Campground.findById(req.params.id).populate("comments").exec(function(err, foundCampground) {		
		if (err) {
			console.log(err);
		} else {
			// Render the show template with that campground
			res.render("campgrounds/show", {campground: foundCampground});
		}		
	}); 	
});

// =================
//  COMMENTS ROUTES
// =================
// Form to add a comment
app.get("/campgrounds/:id/comments/new", (req, res) => {
	Campground.findById(req.params.id, (err, campground) => {
		if (err) {
			console.log(err);
		} else {
			res.render("comments/new", {campground: campground}); 
		}
	});	
});

// Add a new comment to the DB
// Form to add a comment
app.post("/campgrounds/:id/comments", (req, res) => {
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

// =============
//  AUTH ROUTES
// =============
app.get("/register", (req, res) => {
	res.render("register");
});

// Handle sign up logic
app.post("/register", (req, res) => {
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
app.get("/login", (req, res) => {
	res.render("login");
});

// Handling login logic
app.post("/login", passport.authenticate("local", {
		successRedirect: "/campgrounds",
		failureRedirect: "/login"
	}), (req, res) => {
});

// Tell Express to listen for requests (start server)
app.listen(3000, () => {
	console.log("Yelp camp server listening on port 3000");
});