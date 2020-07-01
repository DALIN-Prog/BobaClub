/**************  Required npms **************/

const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const session = require("express-session");
const passport = require("passport");
const flash = require("connect-flash");
const multer = require("multer");

/**************  Required npms **************/

/**************  multer setup **************/

const storage = multer.diskStorage({
  destination: (req, file, callback) => {
    // file storage destination
    callback(null, "./uploads/");
  },
  filename: (req, file, callback) => {
    // file storage name formating
    callback(null, new Date().toISOString() + file.originalname);
  },
});

const fileFilter = (req, file, callback) => {
  // only allowing files of .jpeg/.png to be stored
  if (file.mimetype === "image/jpeg" || file.mimetype === "image/png") {
    callback(null, true);
  } else {
    callback(null, false);
  }
};

const upload = multer({
  // allowing upload
  storage: storage,
  limits: {
    fileSize: 1024 * 1024 * 5,
  },
  fileFilter: fileFilter,
});

/**************  multer setup **************/

/**************  passport and app setup **************/

const passportLocalMongoose = require("passport-local-mongoose");

const app = express();

app.use(express.static("public"));
app.use("/uploads", express.static("uploads"));
// view engine
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));

// express middleware
app.use(
  session({
    secret: "Our little secret.",
    resave: false,
    saveUninitialized: false,
  })
);

// connect-flash middleware
app.use(flash());

// passport middleware
app.use(passport.initialize());
app.use(passport.session());

/**************  passport and app setup **************/

/**************  Mongoose setup **************/

mongoose.connect("mongodb://localhost:27017/userDB", {
  // creating a database called 'userDB' at localhost:27017
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

mongoose.set("useCreateIndex", true);

/**************  Mongoose setup **************/

/**************  Schema(userSchema) setup **************/

const userSchema = new mongoose.Schema({
  username: String,
  password: String,
  firstName: String,
  lastName: String,
  email: String,
  aboutMe: String,
  shopName: String, // Only for official shops else NULL
  userImage: { type: String },
});

userSchema.plugin(passportLocalMongoose);

// User model
const User = new mongoose.model("User", userSchema);

/**************  Schema(userSchema) setup **************/

/**************  passport requirement **************/

passport.use(User.createStrategy());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

/**************  passport requirement **************/

/**************  Schema(postSchema) setup **************/

const postSchema = {
  username: String, // req.user.username
  title: String,
  content: String,
  date: Number,
  parentID: String,
  userID: String,
};

// Post model
const Post = mongoose.model("Post", postSchema);

/**************  Schema(postSchema) setup **************/

/**************  Schema(drinkSchema) setup **************/

const drinkSchema = new mongoose.Schema({
  drinkImage: { type: String },
  userID: String, // => equivalent to shopID
  drinkName: String,
  drinkDescription: String,
  date: Number,
});

const Drink = new mongoose.model("Drink", drinkSchema);

/**************  Schema(drinkSchema) setup **************/

/****************************************  Routings START ****************************************/

/**************  home page routing **************/

app.get("/", (req, res) => {
  res.render("home", { message: req.flash("message") });
});

/**************  home page routing **************/

/**************  login page routings **************/

// login "GET" route
app.get("/login", (req, res) => {
  res.render("login", {
    message: req.flash("message"),
    error: req.flash("error"),
  });
});

// login "POST" route
// app.post("/login", (req, res) => {
//   const user = new User({
//     username: req.body.username,
//     password: req.body.password,
//   });

//   // if no such username -> redirect user to registration page and register
//   User.findOne({ username: req.body.username }, (err, user) => {
//     if (user === null) {
//       req.flash("error", "No such user, please register.");
//       res.redirect("/register");
//     }
//   });

//   req.login(user, (err) => {
//     if (err) {
//       console.log(err);
//       res.redirect("/login");
//     } else {
//       passport.authenticate("local")(req, res, () => {
//         req.flash("message", "Signed in successfully.");
//         res.redirect("/menu");
//       });
//     }
//   });
// });

app.post(
  "/login",
  passport.authenticate("local", {
    successRedirect: "/menu",
    failureRedirect: "/login", // see text
    failureFlash: true, // optional, see text as well
  })
);

/**************  login page routings **************/

/**************  registration page routings **************/

// registration "GET"  route
app.get("/register", (req, res) => {
  res.render("register", {
    message: req.flash("message"),
    error: req.flash("error"),
  });
});

// registration "POST" route
app.post("/register", (req, res) => {
  User.register(
    { username: req.body.username },
    req.body.password,
    (err, user) => {
      if (err) {
        console.log(err);
        req.flash("message", "User exists, please try again.");
        res.redirect("/register");
      } else {
        passport.authenticate("local")(req, res, () => {
          req.flash("message", "Registered Successfully.");
          res.redirect("/login");
        });
      }
    }
  );
});

/**************  registration page routings **************/

/**************  menu page routings **************/

// menu "GET" route
app.get("/menu", (req, res) => {
  if (req.isAuthenticated()) {
    const username = req.user.username;
    res.render("menu", {
      currUser: username,
      message: req.flash("message"),
    });
  } else {
    req.flash("error", "Please login to view.");
    res.redirect("/login");
  }
});

/**************  menu page routings **************/

/**************  browse (all shops) routings **************/

app.get("/browse", (req, res) => {
  //browse all shops
  if (req.isAuthenticated()) {
    User.find({}, (err, shops) => {
      res.render("browse", {
        shops: shops,
      });
    });
  } else {
    req.flash("error", "Please login to view");
    res.redirect("/login");
  }
});

/**************  browse (all shops) routings **************/

/**************  filter function in browse routings **************/

app.get("/search", (req, res) => {
  if (req.isAuthenticated()) {
    User.find({ username: { $regex: req.query.search } }, (err, result) => {
      // console.log(result);
      res.render("browse", {
        shops: result,
      });
    });
  } else {
    req.flash("error", "Please login to search.");
    res.redirect("/login");
  }
});

/**************  filter function in browse routings **************/

/**************  filter function in browse routings **************/

app.get("/browse/establishments", (req, res) => {
  if (req.isAuthenticated()) {
    User.find({}, (err, shops) => {
      // find all establishments
      res.render("browse", {
        shops: shops,
      });
    });
  } else {
    req.flash("error", "Please login to view.");
    res.redirect("/login");
  }
});

app.get("/browse/users", (req, res) => {
  if (req.isAuthenticated()) {
    // find all users
    User.find({}, (err, shops) => {
      res.render("browse", {
        shops: shops,
      });
    });
  } else {
    req.flash("error", "Please login to view.");
    res.redirect("/login");
  }
});

/**************  filter function in browse routings **************/

/**************  forum page routings **************/

// forum "GET" route
app.get("/forum", (req, res) => {
  if (req.isAuthenticated()) {
    //console.log(req.user._id);
    Post.find({ parentID: null }, (err, posts) => {
      posts.sort((a, b) => {
        return b.date - a.date;
      });
      res.render("forum", {
        posts: posts,
        duration: duration,
        message: req.flash("message"),
      });
    });
  } else {
    req.flash("error", "Please login to view");
    res.redirect("/login");
  }
});

/**************  forum page routings **************/

/**************  profile routings **************/

// profile "GET" route
app.get("/profile", (req, res) => {
  if (req.isAuthenticated()) {
    res.render("profile", {
      user: req.user,
      message: req.flash("message"),
    });
  } else {
    req.flash("error", "Please login to view.");
    res.redirect("/login");
  }
});

// profile "POST" route
app.post("/profile/:userId", upload.single("userImage"), (req, res) => {
  User.findOne({ _id: req.params.userId }, (err, user) => {
    if (!err) {
      user.email = req.body.email;
      user.firstName = req.body.firstName;
      user.lastName = req.body.lastName;
      user.aboutMe = req.body.aboutMe;
      if (!(req.file == null)) {
        user.userImage = req.file.path;
      }
      user.save();
      req.flash("message", "User information updated.");
      res.redirect("/profile");
    }
  });
});

/**************  profile routings **************/

/**************  compose page routings **************/

// compose "GET" route
app.get("/compose", (req, res) => {
  if (req.isAuthenticated()) {
    res.render("compose");
  } else {
    req.flash("error", "Please login to post.");
    res.redirect("/login");
  }
});

// compose "POST" route
app.post("/compose", (req, res) => {
  const currDate = Date.now();

  const post = new Post({
    username: req.user.username,
    title: req.body.postTitle,
    content: req.body.postBody,
    date: currDate,
    userID: req.user._id,
  });

  post.save((err) => {
    if (!err) {
      req.flash("message", "You have created a post");
      res.redirect("/forum");
    }
  });
});

/**************  compose page routings **************/

/**************  upload routings **************/

// upload "GET" route
app.get("/upload", (req, res) => {
  if (req.isAuthenticated()) {
    res.render("upload", { userID: req.user._id });
  } else {
    req.flash("error", "Please login to post.");
    res.redirect("/login");
  }
});

// upload "POST" route
app.post("/upload", upload.single("drinkIMG"), (req, res) => {
  const drinkImage = req.file.path;
  const shopID = req.user._id;
  const drinkName = req.body.drinkName;
  const drinkDescription = req.body.drinkDescription;

  const drink = new Drink({
    drinkImage: drinkImage,
    userID: shopID,
    drinkName: drinkName,
    drinkDescription: drinkDescription,
    date: Date.now(),
  });

  drink.save((err) => {
    if (!err) {
      req.flash("message", "You have uploaded a drink");
      res.redirect("/shops/" + shopID);
    }
  });
});

/**************  upload routings **************/

/**************  individual shop routings **************/

// individual shop "GET" route
app.get("/shops/:shopId", (req, res) => {
  if (req.isAuthenticated()) {
    const currUser = req.user._id;
    Drink.find({ userID: req.params.shopId }, (err, drinks) => {
      User.findOne({ _id: req.params.shopId }, (err, shop) => {
        res.render("shop", {
          shop: shop,
          drinks: drinks,
          user: currUser,
          message: req.flash("message"),
        });
      });
    });
  } else {
    req.flash("error", "Please login to view.");
    res.redirect("/login");
  }
});

/**************  individual shop routings **************/

/**************  individual drink routings **************/

// indiviudal drink "GET" route
app.get("/drinks/:drinkId", (req, res) => {
  if (req.isAuthenticated()) {
    const reqDrinkId = req.params.drinkId;

    Post.find({ parentID: reqDrinkId }, (err, comments) => {
      Drink.findOne({ _id: reqDrinkId }, (err, drink) => {
        User.find({}, (err, users) => {
          res.render("drink", {
            drink: drink,
            comments: comments,
            duration: duration,
            user: req.user,
            users: users,
            message: req.flash("message"),
          });
        });
      });
    });
  } else {
    req.flash("error", "Please login to view.");
    res.redirect("/login");
  }
});

// individual drink "POST" route
app.post("/drinks/:drinkId", (req, res) => {
  var reply = new Post({
    username: req.user.username,
    content: req.body.comment,
    date: Date.now(),
    parentID: req.params.drinkId,
    userID: req.user._id,
  });
  reply.save();

  res.redirect("/drinks/" + req.params.drinkId);
});

/**************  individual drink routings **************/

/**************  individual post routings **************/

// individual post "GET" route
app.get("/posts/:postId", (req, res) => {
  if (req.isAuthenticated()) {
    const requestedPostId = req.params.postId;

    Post.find({ parentID: req.params.postId }, (err, comments) => {
      Post.findOne({ _id: requestedPostId }, (err, post) => {
        User.find({}, (err, users) => {
          res.render("post", {
            post: post,
            comments: comments,
            duration: duration,
            user: req.user,
            users: users,
            message: req.flash("message"),
          });
        });
      });
    });
  } else {
    req.flash("error", "Please login to view.");
    res.redirect("/login");
  }
});

// individual post "POST" route
app.post("/posts/:postId", (req, res) => {
  var reply = new Post({
    username: req.user.username,
    content: req.body.comment,
    date: Date.now(),
    parentID: req.params.postId,
    userID: req.user._id,
  });

  reply.save();
  res.redirect("/posts/" + req.params.postId);
});

/**************  individual post routings **************/

/**************  edit drink routings **************/

// edit drink "GET" route
app.get("/drink/edit/:drinkID", (req, res) => {
  if (req.isAuthenticated()) {
    Drink.findOne({ _id: req.params.drinkID }, (err, drink) => {
      res.render("edit", {
        drinkID: drink._id,
        drinkName: drink.drinkName,
        drinkDescription: drink.drinkDescription,
        shopID: req.user._id,
      });
    });
  } else {
    req.flash("error", "Please login to edit.");
    res.redirect("/login");
  }
});

// edit drink "POST" route
app.post("/drink/edit/:drinkID", upload.single("drinkIMG"), (req, res) => {
  let drink = {};
  //console.log(req.user);
  drink.drinkImage = req.file.path;
  drink.userID = req.user._id;
  drink.drinkName = req.body.drinkName;
  drink.drinkDescription = req.body.drinkDescription;
  //drink.postedby = req.user.username;

  let query = { _id: req.params.drinkID };

  Drink.updateOne(query, drink, (err) => {
    if (err) {
      console.log(err);
    } else {
      req.flash("message", "Edited successfully.");
      res.redirect("/shops/" + drink.userID);
    }
  });
});
/**************  edit drink routings **************/

/**************  edit drink's comment routings **************/

app.post("/drink/comment/edit/:commentID", (req, res) => {
  let comment = {};

  comment.content = req.body.editedContent;

  Post.updateOne({ _id: req.params.commentID }, comment, (err) => {
    if (err) {
      console.log(err);
    } else {
      Post.findOne({ _id: req.params.commentID }, (err, post) => {
        if (err) {
          console.log(err);
        } else {
          req.flash("message", "Comment edited");
          res.redirect("/drinks/" + post.parentID);
        }
      });
    }
  });
});

/**************  edit drink's comment routings **************/

/**************  edit post routings **************/

app.get("/post-title-content/edit/:postID", (req, res) => {
  if (req.isAuthenticated()) {
    Post.findOne({ _id: req.params.postID }, (err, post) => {
      res.render("editPost", {
        postID: post._id,
        postTitle: post.title,
        postBody: post.content,
      });
    });
  } else {
    req.flash("error", "Please login to edit.");
    res.redirect("/login");
  }
});

app.post("/post-title-content/edit/:postID", (req, res) => {
  let post = {};

  post.title = req.body.postTitle;
  post.content = req.body.postBody;
  //post.date = Date.now();

  Post.updateOne({ _id: req.params.postID }, post, (err) => {
    if (err) {
      console.log(err);
    } else {
      req.flash("message", "Post edited successfully.");
      res.redirect("/forum");
    }
  });
});

/**************  edit post routings **************/

/**************  edit post's comment routings **************/

app.post("/post/comment/edit/:commentID", (req, res) => {
  let comment = {};

  comment.content = req.body.editedContent;

  Post.updateOne({ _id: req.params.commentID }, comment, (err) => {
    if (err) {
      console.log(err);
    } else {
      Post.findOne({ _id: req.params.commentID }, (err, post) => {
        if (err) {
          console.log(err);
        } else {
          req.flash("message", "Comment edited");
          res.redirect("/posts/" + post.parentID);
        }
      });
    }
  });
});

/**************  edit post's comment routings **************/

/**************  delete routings **************/

// Drinks delete
app.delete("/shop/drinks/:id", (req, res) => {
  let query = {
    _id: req.params.id,
  };

  Drink.deleteOne(query, (err) => {
    if (err) {
      console.log(err);
    } else {
      res.send("Success");
    }
  });
});

// Post delete
app.delete("/forum/posts/:id", (req, res) => {
  let query = {
    _id: req.params.id,
  };
  Post.deleteOne(query, (err) => {
    if (err) {
      console.log(err);
    } else {
      res.send("Success");
    }
  });
});

// Post comment delete
app.delete("/post/comments/:id", (req, res) => {
  let query = {
    _id: req.params.id,
  };

  Post.deleteOne(query, (err) => {
    if (err) {
      console.log(err);
    } else {
      res.send("Success");
    }
  });
});

// Drink comment delete
app.delete("/drink/comments/:id", (req, res) => {
  let query = {
    _id: req.params.id,
  };

  Post.deleteOne(query, (err) => {
    if (err) {
      console.log(err);
    } else {
      res.send("Success");
    }
  });
});

/**************  delete routings **************/

/**************  Misc **************/

function ensureAuthentication(req, res, next) {
  if (req.isAuthenticated()) {
    return next;
  } else {
    //req.flash()
    res.redirect("/login");
  }
}

// Function to get time elapsed
function duration(a) {
  var timeElapsedMilli = Date.now() - a.date;
  var minutesElapsed = Math.floor(timeElapsedMilli / (1000 * 60));
  var hoursElapsed = Math.floor(minutesElapsed / 60);
  var daysElapsed = Math.floor(hoursElapsed / 24);
  var timeElapsed = "";

  if (minutesElapsed < 60) {
    timeElapsed = minutesElapsed + " minutes ago";
    if (minutesElapsed === 1) {
      timeElapsed = "1 minute ago";
    }
  } else if (hoursElapsed < 24) {
    timeElapsed = hoursElapsed + " hours ago";
    if (hoursElapsed === 1) {
      timeElapsed = "1 hour ago";
    }
  } else {
    timeElapsed = daysElapsed + " days ago";
    if (daysElapsed === 1) {
      timeElapsed = "1 day ago";
    }
  }

  return timeElapsed;
}

/**************  Misc **************/

/**************  logout routings **************/

// Logout route
app.get("/logout", (req, res) => {
  req.logout();
  req.flash("message", "Signed out successfully.");
  res.redirect("/");
});

/**************  logout routings **************/

/****************************************  Routings END ****************************************/

/**************  Start Server **************/

app.listen(3000, () => {
  console.log("Server started on port 3000");
});
