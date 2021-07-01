const User = require('../models/User');
const passport = require("passport");

exports.getRegister = (req, res, next) => {
    if (req.isAuthenticated()) {
        res.redirect("/collection")
    } else {
        res.render("register");
    }
};

exports.postRegister = (req, res, next) => {
    User.register({ username: req.body.username }, req.body.password, function (err, user) {
        if (err) {
            console.log(err);
            res.redirect("/register");
        } else {
            passport.authenticate("local")(req, res, function () {
                res.redirect("/collection");
            });
        }
    });
};

exports.getLogin = (req, res, next) => {
    if (req.isAuthenticated()) {
        res.redirect("/collection")
    } else {
        res.render("login");
    }
};

exports.postLogin = (req, res, next) => {
    const user = new User({
        username: req.body.username,
        password: req.body.password
    });

    req.login(user, function (err) {
        if (err) {
            console.log(err);
            res.redirect("/login");
        } else {
            passport.authenticate("local", { failureRedirect: '/login' })(req, res, function () {
                res.redirect("/collection");
            });
        }
    });
};

exports.getLogout = (req, res, next) => {
    req.logout();
    res.redirect('/');
};