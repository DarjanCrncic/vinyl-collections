require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const passport = require("passport");
const session = require("express-session");

const User = require('./models/User');

const authRoutes = require('./routes/auth');
const collectionRoutes = require('./routes/collection');
const userRoutes = require('./routes/user');

const app=express();
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

// configuring mongodb models, session, passport
app.use(session({
  secret: process.env.SECRET_STRING,
  resave: false,
  saveUninitialized: true
}));

app.use(passport.initialize());
app.use(passport.session());

mongoose.connect("mongodb+srv://admin-darjan:"+process.env.MONGO_PASSWORD+"@cluster0.zo4lz.mongodb.net/vinylCollectionDb?retryWrites=true&w=majority",{ useNewUrlParser: true, useUnifiedTopology: true });
mongoose.set('useFindAndModify', false);

passport.use(User.createStrategy());

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.findById(id, function(err, user) {
    done(err, user);
  });
});

app.use((req, res, next) => { 
  res.locals.isAuthenticated = req.session.isLoggedIn;
  next();
});

// routes
app.get("/", function(req, res){
  res.render("home");
});

app.use(authRoutes);
app.use(collectionRoutes);
app.use(userRoutes);

// server startup
let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}

app.listen(port, function(){
  console.log("Server running");
});
