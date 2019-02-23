var express = require("express");
var router = express.Router();
var User = require("../models/user");
var mid = require("../middleware/mid");

// GET /logout
router.get("/logout", (req, res, next) => {
   if (req.session) {
      //delete session object
      req.session.destroy(function(err) {
         if (err) {
            return next(err);
         } else {
            return res.redirect("/");
         }
      });
   }
});

// GET /profile
router.get("/profile", mid.requiresLogin, (req, res, next) => {
   User.findById(req.session.userId).exec(function(error, user) {
      if (error) {
         return next(error);
      } else {
         return res.render("profile", {
            title: "Profile",
            name: user.name,
            favorite: user.favoriteBook
         });
      }
   });
});

// GET /login
router.get("/login", mid.loggedOut, (req, res, next) => {
   return res.render("login", { title: "Login" });
});

// POST /login
router.post("/login", (req, res, next) => {
   if (req.body.email && req.body.password) {
      User.authenticate(req.body.email, req.body.password, (error, user) => {
         if (error || !user) {
            var err = new Error("Wrond username or passord.");
            err.status = 401;
            return next(err);
         } else {
            req.session.userId = user._id;
            return res.redirect("/profile");
         }
      });
   } else {
      var err = new Error("Email and password are required.");
      err.status = 401;
      return next(err);
   }
});

//GEt /register
router.get("/register", mid.loggedOut, (req, res, next) => {
   return res.render("register", { title: "Sign Up" });
});

// POST /register
router.post("/register", (req, res, next) => {
   if (
      req.body.email &&
      req.body.name &&
      req.body.favoriteBook &&
      req.body.password &&
      req.body.confirmPassword
   ) {
      //confirm that passwords match
      if (req.body.password !== req.body.confirmPassword) {
         var err = new Error("Password fields do not match, please try again.");
         err.status = 400;
         return next(err);
      }

      //create object with form input
      var userData = {
         email: req.body.email,
         name: req.body.name,
         favoriteBook: req.body.favoriteBook,
         password: req.body.password
      };
      //use schemas create method to insert document into Mongo
      User.create(userData, function(error, user) {
         if (error) {
            return next(error);
         } else {
            req.session.userId = user._id;
            return res.redirect("/profile");
         }
      });
   } else {
      var err = new Error("All fields required.");
      err.status = 400;
      return next(err);
   }
});

// GET /
router.get("/", function(req, res, next) {
   return res.render("index", { title: "Home" });
});

// GET /about
router.get("/about", function(req, res, next) {
   return res.render("about", { title: "About" });
});

// GET /contact
router.get("/contact", function(req, res, next) {
   return res.render("contact", { title: "Contact" });
});

module.exports = router;
