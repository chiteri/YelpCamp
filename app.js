require("dotenv").config();

const bodyParser = require("body-parser"), 
	  express 	 = require("express"), 
	  mongoose   = require("mongoose"),
	  flash      = require("connect-flash"),
	  passport 	 = require("passport"),
	  LocalStrategy = require("passport-local"),
	  methodOverride = require("method-override"),
	  Campground = require("./models/campground"),
      Comment    = require("./models/comment"),
	  User 		 = require("./models/user"); //, 
	  // seedDB = require("./seeds");

// Require routes separately
const commentsRoutes   = require("./routes/comments"),
	  campgroundRoutes = require("./routes/campgrounds"),
	  authRoutes 	   = require("./routes/index");

// const reques
var app = express();
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static(__dirname+"/public"));
app.use(methodOverride("_method"));
app.use(flash());

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

// Add some middleware to include a new user to each page
app.use((req, res, next) => {
	res.locals.currentUser = req.user;
	res.locals.error = req.flash("error");
	res.locals.success = req.flash("success");
	next();
});

// Make moment.js available in all of the view files
app.locals.moment = require('moment');

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// The landing page
app.get("/", (req, res) => {
	res.render("landing");
});

// Perform routing for app
app.use("/", authRoutes);
app.use("/campgrounds", campgroundRoutes);
app.use("/campgrounds/:id/comments", commentsRoutes);

// Tell Express to listen for requests (start server)
app.listen(3000, () => {
	console.log("Yelp camp server listening on port 3000");
});