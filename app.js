const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const session = require("express-session");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");

const app = express();

app.use(express.static("public"));
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));

/* KIV */
app.use(
  session({
    secret: "Our little secret.",
    resave: false,
    saveUninitialized: false,
  })
);

app.use(passport.initialize());
app.use(passport.session());

mongoose.connect("mongodb://localhost:27017/userDB", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
mongoose.set("useCreateIndex", true);

const userSchema = new mongoose.Schema({
  username: String,
  password: String,
});

userSchema.plugin(passportLocalMongoose);

const User = new mongoose.model("User", userSchema);

passport.use(User.createStrategy());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// home route
app.get("/", (req, res) => {
  res.render("home");
});

// login route
app.get("/login", (req, res) => {
  res.render("login");
});

// login "POST" route
app.post("/login", (req, res) => {
  const user = new User({
    username: req.body.username,
    password: req.body.password,
  });

  req.login(user, function (err) {
    if (err) {
      console.log(err);
      res.redirect("/login");
    } else {
      passport.authenticate("local")(req, res, () => {
        res.redirect("/menu");
      });
    }
  });
});

// register route
app.get("/register", (req, res) => {
  res.render("register");
});

// register "POST" route
app.post("/register", (req, res) => {
  User.register(
    { username: req.body.username },
    req.body.password,
    (err, user) => {
      if (err) {
        console.log(err);
        res.redirect("/register");
      } else {
        passport.authenticate("local")(req, res, () => {
          res.redirect("/login");
        });
      }
    }
  );
});

// MENU route
app.get("/menu", function (req, res) {
  if (req.isAuthenticated()) {
    const username = req.user.username;

    res.render("menu", { currUser: username });
  } else {
    res.redirect("/login");
  }
});

// Forum route
app.get("/forum", function (req, res) {
  if (req.isAuthenticated()) {
    const username = req.user.username;

    res.render("forum", { currUser: username });
  } else {
    res.redirect("/login");
  }
});

// Logout route
app.get("/logout", (req, res) => {
  req.logout();
  res.redirect("/");
});

app.listen(3000, () => {
  console.log("Server started on port 3000");
});
