require("dotenv").config();
const express=require("express");
const ejs = require("ejs");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");
const session = require("express-session");
const _ = require('lodash');
const unirest = require("unirest");

const app=express();
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

//////////////////// configuring mongodb models, session, passport

app.use(session({
  secret: process.env.SECRET_STRING,
  resave: false,
  saveUninitialized: true
}));

app.use(passport.initialize());
app.use(passport.session());

mongoose.connect("mongodb+srv://admin-darjan:"+process.env.MONGO_PASSWORD+"@cluster0.zo4lz.mongodb.net/vinylCollectionDb?retryWrites=true&w=majority",{ useNewUrlParser: true, useUnifiedTopology: true });
mongoose.set('useFindAndModify', false);

const recordsSchema = new mongoose.Schema({
  img: {type: String, default: "-"},
  artist: {type: String, default: "-"},
  name: {type: String, default: "-"},
  year: Number,
  rating: {type: String, default: "-"},
  condition: {type: String, default: "-"},
  userId: String
});

const Record = new mongoose.model("Record", recordsSchema);

const usersSchema = new mongoose.Schema({
  username: String,
  password: String,
  sorting: {type: String, default: "artist"},
});
usersSchema.plugin(passportLocalMongoose);
const User = new mongoose.model("User", usersSchema);


passport.use(User.createStrategy());

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.findById(id, function(err, user) {
    done(err, user);
  });
});

var sortingOrder=1;

//////////////// gets and posts

app.post("/register", function(req,res){
  User.register({username: req.body.username}, req.body.password, function(err, user){
    if(err){
      console.log(err);
      res.redirect("/register");
    }else{
      passport.authenticate("local")(req,res,function(){
        res.redirect("/collection");
      });
    }
  });
});

app.post("/login", function(req,res){
  const user = new User({
    username: req.body.username,
    password: req.body.password
  });

  req.login(user, function(err){
    if(err){
      console.log(err);
      res.redirect("/login");
    }else{
      passport.authenticate("local",{failureRedirect: '/login'})(req,res,function(){
        res.redirect("/collection");
      });
    }
  });
});

app.get("/login",function(req,res){
  if(req.isAuthenticated()){
    res.redirect("/collection")
  }else{
    res.render("login");
  }
});

app.get("/register",function(req,res){
  if(req.isAuthenticated()){
    res.redirect("/collection")
  }else{
    res.render("register");
  }
});

app.get("/logout", function(req,res){
  req.logout();
  res.redirect('/');
});

app.get("/", function(req, res){
  res.render("home");
});

/////////////////////// collections section

app.get("/collection", function(req,res){

  if(req.isAuthenticated()){
    var sort = {};
    sort[req.user.sorting] = sortingOrder;
    Record.find({userId: req.user._id}).sort(sort).exec(function(err, foundRecords) {
      if(!err){
        res.render("collection", {records: foundRecords})
      }else{
        console.log(err);
      }
    });
  }else{
    res.render("login");
  }
});

/////////////// sortingCode

app.get("/collection/:sortingType", function(req,res){
  if(req.isAuthenticated()){
    let sortingStatus= req.params.sortingType;
    if(req.params.sortingType.substring(0,1)!="r"){
      sortingOrder=1;
    }
    else{
      sortingOrder=-1;
      sortingStatus = req.params.sortingType.substring(1);
    }
    User.findByIdAndUpdate({_id: req.user._id},{sorting: sortingStatus}, function(err, foundUser){
      if(!err){
        res.redirect("/collection");
      }else{
        console.log(err);
      }
    });
  }else{
    res.render("login");
  }
});

//////////////////////////////
//// post for entering a record deteals to the page
app.post("/submit",function(req,res){
  var imgUrl;
  var albumName = req.body.name;
  albumName = albumName.replace(" ","+");

  const unirestSearch = unirest("GET", "https://google-search3.p.rapidapi.com/api/v1/images/q="+albumName+"+album+cover&num=1");
  unirestSearch.headers({
      "x-rapidapi-key": process.env.RAPIDAPI_KEY,
      "x-rapidapi-host": "google-search3.p.rapidapi.com",
      "useQueryString": true
  })

  if(req.body.img.localeCompare("")==0){

    unirestSearch.end(function (response) {
    	if (response.error) throw new Error(response.error);
      imgUrl=response.body.image_results[0].image.src;
      const record = new Record({
        name: _.startCase(req.body.name),
        artist: _.startCase(req.body.artist),
        year: req.body.year,
        condition: req.body.condition,
        img: imgUrl,
        rating: req.body.rating,
        userId: req.user._id
      });
      record.save();
      res.redirect("/collection");
    });

}else{
    imgUrl=req.body.img;
    const record = new Record({
      name: _.startCase(req.body.name),
      artist: _.startCase(req.body.artist),
      year: req.body.year,
      condition: req.body.condition,
      img: imgUrl,
      rating: req.body.rating,
      userId: req.user._id
    });
    record.save();
    res.redirect("/collection");
  }
});

//// post for edit page
app.post("/edit", function(req,res){
  Record.findById(req.body.recordId, function(err, foundRecord){
    if(err){
      console.log(err);
    }else{
      res.render("edit", {record: foundRecord});
    }
  });
});

//// post for submit page
app.post("/submitChange", function(req,res){
  Record.findByIdAndUpdate({_id: req.body.recordId}, {
    name: _.startCase(req.body.name),
    artist: _.startCase(req.body.artist),
    year: req.body.year,
    condition: req.body.condition,
    img: req.body.img,
    rating: req.body.rating
  }, function(err,record){
    if(err){
      console.log(err);
    }else{
      res.redirect("/collection");
    };
  });
});

//// post for delete button
app.post("/delete", function(req,res){
  Record.findOneAndDelete({_id: req.body.recordId}, function(err, record){
    if(err){
      console.log(err);
    }else{
      res.redirect("/collection");
    };
  });
});

//// post for add button
app.get("/add", function(req,res){
  if(req.isAuthenticated()){
    res.render("add", {user: req.body.user});
  }else{
    res.redirect("/");
  }
});

/////////////////////// other users section

app.get("/other", function(req,res){
  if(req.isAuthenticated()){
    User.find({_id: { $ne: req.user._id }}, function(err, foundUsers){
      if(!err){
        res.render("other", {users: foundUsers})
      }else{
        console.log(err);
      }
    });
  }else{
    res.render("login");
  }
})

app.post("/showUser", function(req,res){
  if(req.isAuthenticated()){
    Record.find({userId: req.body.userId}, function(err, foundRecords){
      if(!err){
        res.render("othersCollection", {records: foundRecords, username: req.body.username})
      }else{
        console.log(err);
      }
    });
  }else{
    res.render("login");
  }
});

app.post("/searchUser", function(req,res){
  if(req.isAuthenticated()){
    User.findOne({username: req.body.searchedUser}, function(err, foundUser){
      if(!err && foundUser){
        Record.find({userId: foundUser._id}, function(err, foundRecords){
          if(!err){
            res.render("othersCollection", {records: foundRecords, username: req.body.searchedUser});
          }else{
            console.log(err);
          }
        });
      }else{
        User.find({_id: { $ne: req.user._id }}, function(err, foundUsers){
          if(!err){
            res.render("other", {users: foundUsers})
          }else{
            console.log(err);
          }
        });
      }
    });
  }else{
    res.render("login");
  }
});

// app.get("/othersCollection/:sortingType", function(req,res){
//   console.log(req.body);
//   if(req.isAuthenticated()){
//     User.findByIdAndUpdate({_id: req.body},{sorting: req.params.sortingType}, function(err, foundUser){
//       if(!err){
//         res.redirect("/collection");
//       }else{
//         console.log(err);
//       }
//     });
//   }else{
//     res.render("login");
//   }
// });

let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}

app.listen(port, function(){
  console.log("Server running");
});
