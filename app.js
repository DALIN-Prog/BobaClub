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
  useFindAndModify: false,
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
  url: String,
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
  editDate: Number,
  edited: Boolean,
  likers: [{ type: String }],
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
  favouriters: [{ type: String }],
});

const Drink = new mongoose.model("Drink", drinkSchema);

/**************  Schema(drinkSchema) setup **************/

/**************  Schema(promoSchema) setup **************/

const promoSchema = new mongoose.Schema({
  promoImage: { type: String },
  userID: String,
  promoName: String,
  promoDescription: String,
  date: Number,
});

const Promo = new mongoose.model("Promo", promoSchema);

/**************  Schema(promoSchema) setup **************/

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
    Promo.find({}, (err, promos) => {
      res.render("menu", {
        currUser: username,
        promos: promos,
        message: req.flash("message"),
      });
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
        status: "all",
      });
    });
  } else {
    req.flash("error", "Please login to view");
    res.redirect("/login");
  }
});

/**************  browse (all shops) routings **************/

/**************  search function in browse routings **************/

app.get("/search", (req, res) => {
  if (req.isAuthenticated()) {
    if (req.query.status == "all") {
      User.find({ username: { $regex: req.query.search } }, (err, result) => {
        // console.log(result);
        res.render("browse", {
          shops: result,
          status: "all",
        });
      });
    } else if (req.query.status == "shops") {
      User.find(
        { username: { $regex: req.query.search }, shopName: { $ne: null } },
        (err, result) => {
          // console.log(result);
          res.render("browse", {
            shops: result,
            status: "shops",
          });
        }
      );
    } else if (req.query.status == "users") {
      User.find(
        { username: { $regex: req.query.search }, shopName: null },
        (err, result) => {
          // console.log(result);
          res.render("browse", {
            shops: result,
            status: "users",
          });
        }
      );
    }
  } else {
    req.flash("error", "Please login to search.");
    res.redirect("/login");
  }
});

/**************  search function in browse routings **************/

/**************  filter function in browse routings **************/

app.get("/browse/establishments", (req, res) => {
  if (req.isAuthenticated()) {
    User.find({ shopName: { $ne: null } }, (err, shops) => {
      // find all establishments
      res.render("browse", {
        shops: shops,
        status: "shops",
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
    User.find({ shopName: null }, (err, shops) => {
      res.render("browse", {
        shops: shops,
        status: "users",
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
app.get("/forum/:page", (req, res) => {
  var perPage = 12;
  var page = req.params.page || 1;
  if (req.isAuthenticated()) {
    //console.log(req.user._id);
    Post.find({ parentID: null })
      .skip(perPage * page - perPage)
      .limit(perPage)
      .sort({ date: -1 })
      .exec((err, posts) => {
        Post.countDocuments({ parentID: null }).exec((err, count) => {
          res.render("forum", {
            posts: posts,
            duration: duration,
            message: req.flash("message"),
            current: page,
            pages: Math.ceil(count / perPage),
          });
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
      user.url = req.body.url;
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

/**************  apply routings **************/

app.get("/apply", (req, res) => {
  if (req.isAuthenticated()) {
    res.render("apply");
  } else {
    req.flash("error", "Please login to view.");
    res.redirect("/login");
  }
});

/**************  apply routings **************/

/**************  favourites routings **************/

app.get("/favourites", (req, res) => {
  if (req.isAuthenticated()) {
    Drink.find({}, (err, all) => {
      drinks = [];
      all.forEach((drink) => {
        if (drink.favouriters.includes(req.user._id)) {
          drinks.push(drink);
        }
      });
      res.render("shop", {
        shop: req.user,
        drinks: drinks,
        user: req.user._id,
        message: req.flash("message"),
        status: "favs",
      });
    });
  } else {
    req.flash("error", "Please login to view.");
    res.redirect("/login");
  }
});

/**************  favourites routings **************/

/**************  MyShop routings **************/

app.get("/myshop", (req, res) => {
  if (req.isAuthenticated()) {
    Drink.find({ userID: req.user._id }, (err, drinks) => {
      User.findOne({ _id: req.user._id }, (err, shop) => {
        res.render("shop", {
          shop: shop,
          drinks: drinks,
          user: req.user._id,
          message: req.flash("message"),
          status: "drinks",
        });
      });
    });
  } else {
    req.flash("error", "Please login to view.");
    res.redirect("/login");
  }
});

/**************  MyShop routings **************/

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
      res.redirect("/forum/1");
    }
  });
});

/**************  compose page routings **************/

/**************  upload routings **************/

// upload(drink) "GET" route
app.get("/upload", (req, res) => {
  if (req.isAuthenticated()) {
    res.render("upload", {
      userID: req.user._id,
      status: "drinks",
    });
  } else {
    req.flash("error", "Please login to post.");
    res.redirect("/login");
  }
});

// upload(promo) "GET" route
app.get("/uploadPromo", (req, res) => {
  if (req.isAuthenticated()) {
    res.render("upload", {
      userID: req.user._id,
      status: "promos",
    });
  } else {
    req.flash("error", "Please login to post.");
    res.redirect("/login");
  }
});

// upload(drink) "POST" route
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

// upload(promo) "POST" route
app.post("/uploadPromo", upload.single("drinkIMG"), (req, res) => {
  const drinkImage = req.file.path;
  const shopID = req.user._id;
  const drinkName = req.body.drinkName;
  const drinkDescription = req.body.drinkDescription;

  const promo = new Promo({
    promoImage: drinkImage,
    userID: shopID,
    promoName: drinkName,
    promoDescription: drinkDescription,
    date: Date.now(),
  });

  promo.save((err) => {
    if (!err) {
      req.flash("message", "You have uploaded a Promotion");
      res.redirect("/promo/" + shopID);
    }
  });
});

/**************  upload routings **************/

/**************  individual shop routings **************/

// individual shop "GET" route
app.get("/shops/:shopId", (req, res) => {
  if (req.isAuthenticated()) {
    Drink.find({ userID: req.params.shopId }, (err, drinks) => {
      User.findOne({ _id: req.params.shopId }, (err, shop) => {
        res.render("shop", {
          shop: shop,
          drinks: drinks,
          user: req.user._id,
          message: req.flash("message"),
          status: "drinks",
        });
      });
    });
  } else {
    req.flash("error", "Please login to view.");
    res.redirect("/login");
  }
});

/**************  individual shop routings **************/

/**************  individual shop's promo routings **************/

app.get("/promo/:shopId", (req, res) => {
  if (req.isAuthenticated()) {
    User.findOne({ _id: req.params.shopId }, (err, shop) => {
      Promo.find({ userID: req.params.shopId }, (err, promos) => {
        res.render("shop", {
          shop: shop,
          promos: promos,
          user: req.user._id,
          status: "promos",
          message: req.flash("message"),
        });
      });
    });
  } else {
    req.flash("error", "Please login to view.");
    res.redirect("/login");
  }
});

/**************  individual shop's promo routings **************/

/**************  individual promo routings **************/

app.get("/shop/promo/:promoId", (req, res) => {
  const reqPromoId = req.params.promoId;
  Post.find({ parentID: reqPromoId }, (err, comments) => {
    User.find({}, (err, users) => {
      Promo.findOne({ _id: reqPromoId }, (err, promo1) => {
        res.render("drink", {
          drink: promo1,
          comments: comments,
          duration: duration,
          user: req.user,
          status: "promo",
          users: users,
          message: req.flash("message"),
        });
      });
    });
  });
});

app.post("/shop/promo/:promoId", (req, res) => {
  var reply = new Post({
    username: req.user.username,
    content: req.body.comment,
    date: Date.now(),
    parentID: req.params.promoId,
    userID: req.user._id,
    message: req.flash("message"),
  });
  reply.save();

  res.redirect("/shop/promo/" + req.params.promoId);
});

/**************  individual promo routings **************/

/**************  individual drink routings **************/

// individual drink "GET" route
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
            status: "drinks",
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
    const postId = req.params.postId;
    const userId = req.user._id;

    Post.find({ parentID: postId }, (err, comments) => {
      Post.findOne({ _id: postId }, (err, post) => {
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

/**************  post like/unlike routings **************/

app.post("/doLike/:postID", (req, res) => {
  const userID = req.user._id;
  const postID = req.params.postID;

  Post.findOneAndUpdate(
    { _id: postID },
    { $push: { likers: userID } },
    (err, post) => {
      if (!err) {
        // console.log(post);
        res.send("Success");
      }
    }
  );
});

app.post("/doUnlike/:postID", (req, res) => {
  const userID = req.user._id;
  const postID = req.params.postID;

  Post.findOneAndUpdate(
    { _id: postID },
    { $pull: { likers: userID } },
    (err, post) => {
      if (!err) {
        // console.log(post);
        res.send("Success");
      }
    }
  );
});

/**************  post like/unlike routings **************/

/**************  drink favourite/unfavourite routings **************/

app.post("/drink/favourite/:drinkID", (req, res) => {
  const userID = req.user._id;
  const drinkID = req.params.drinkID;

  Drink.findOneAndUpdate(
    { _id: drinkID },
    { $push: { favouriters: userID } },
    (err, drink) => {
      if (!err) {
        //console.log(drink);
        res.send("Success");
      }
    }
  );
});

app.post("/drink/unfavourite/:drinkID", (req, res) => {
  const userID = req.user._id;
  const drinkID = req.params.drinkID;

  Drink.findOneAndUpdate(
    { _id: drinkID },
    { $pull: { favouriters: userID } },
    (err, drink) => {
      if (!err) {
        //console.log(drink);
        res.send("Success");
      }
    }
  );
});

/**************  drink favourite/unfavourite routings **************/

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
        status: "drink",
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
  drink.date = Date.now();
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
  comment.edited = true;
  comment.date = Date.now();

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
  post.edited = true;
  post.editDate = Date.now();

  Post.updateOne({ _id: req.params.postID }, post, (err) => {
    if (err) {
      console.log(err);
    } else {
      req.flash("message", "Post edited successfully.");
      res.redirect("/forum/1");
    }
  });
});

/**************  edit post routings **************/

/**************  edit post's comment routings **************/

app.post("/post/comment/edit/:commentID", (req, res) => {
  let comment = {};

  comment.content = req.body.editedContent;
  comment.date = Date.now();
  comment.edited = true;

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

/**************  edit promo routings **************/

// edit "GET" route
app.get("/promo/edit/:drinkID", (req, res) => {
  Promo.findOne({ _id: req.params.drinkID }, (err, drink) => {
    res.render("edit", {
      drinkID: drink._id,
      drinkName: drink.promoName,
      drinkDescription: drink.promoDescription,
      status: "promo",
      shopID: req.user._id,
    });
  });
});

// edit "POST" route

app.post("/promo/edit/:drinkID", upload.single("drinkIMG"), (req, res) => {
  let drink = {};
  //console.log(req.user);
  drink.promoImage = req.file.path;
  drink.userID = req.user._id;
  drink.promoName = req.body.drinkName;
  drink.promoDescription = req.body.drinkDescription;
  drink.date = Date.now();
  //drink.postedby = req.user.username;

  let query = { _id: req.params.drinkID };

  Promo.updateOne(query, drink, (err) => {
    if (err) {
      console.log(err);
    } else {
      req.flash("message", "Edited successfully.");
      res.redirect("/promo/" + drink.userID);
    }
  });
});

/**************  edit promo routings **************/

/**************  edit promo's comment routings **************/

app.post("/promo/comment/edit/:commentID", (req, res) => {
  let comment = {};

  comment.content = req.body.editedContent;
  comment.edited = true;
  comment.date = Date.now();

  Post.updateOne({ _id: req.params.commentID }, comment, (err) => {
    if (err) {
      console.log(err);
    } else {
      Post.findOne({ _id: req.params.commentID }, (err, post) => {
        if (err) {
          console.log(err);
        } else {
          req.flash("message", "Comment edited");
          res.redirect("/shop/promo/" + post.parentID);
        }
      });
    }
  });
});

/**************  edit promo's comment routings **************/

/**************  delete routings **************/

// Drinks delete
app.delete("/shop/drinks/:id", (req, res) => {
  let query1 = {
    _id: req.params.id,
  };

  let query2 = {
    parentID: req.params.id,
  };

  Drink.deleteOne(query1, (err) => {
    Post.deleteMany(query2, (err) => {
      if (err) {
        console.log(err);
      } else {
        res.send("Success");
      }
    });
  });
});

// Post delete
app.delete("/forum/posts/:id", (req, res) => {
  let query1 = {
    _id: req.params.id,
  };

  let query2 = {
    parentID: req.params.id,
  };

  Post.deleteOne(query1, (err) => {
    Post.deleteMany(query2, (err) => {
      if (err) {
        console.log(err);
      } else {
        res.send("Success");
      }
    });
  });
});

// Promo delete
app.delete("/shop/promos/:id", (req, res) => {
  let query1 = {
    _id: req.params.id,
  };

  let query2 = {
    parentID: req.params.id,
  };
  Promo.deleteOne(query1, (err) => {
    Post.deleteMany(query2, (err) => {
      if (err) {
        console.log(err);
      } else {
        res.send("Success");
      }
    });
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

// Promo comment delete
app.delete("/promo/comments/:id", (req, res) => {
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

// Function to get time elapsed
function duration(a, type) {
  type = type || "normal";

  var timeElapsedMilli = Date.now() - a.date;
  if (type != "normal" && a.editDate != null) {
    timeElapsedMilli = Date.now() - a.editDate;
  }
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
