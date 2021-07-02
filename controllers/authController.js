const User = require('../models/User');
const passport = require("passport");
const { validationResult } = require('express-validator');

exports.getRegister = (req, res, next) => {
    if (req.isAuthenticated()) {
        res.redirect("/collection")
    } else {
        res.render("register", {
            oldInput: {
                username: "",
                password: ""
            },
            validationErrors: []
        });
    }
};

exports.postRegister = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).render('register', {
            oldInput: {
                username: req.body.username,
                password: req.body.password
            },
            validationErrors: errors.array()
        });
    }

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
        res.render("login", {
            oldInput: {
                username: "",
                password: ""
            },
            validationErrors: []
        });
    }
};

exports.postLogin = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).render('login', {
            oldInput: {
                username: req.body.username,
                password: req.body.password
            },
            validationErrors: errors.array()
        });
    }

    const userPost = new User({
        username: req.body.username,
        password: req.body.password
    });

    req.login(userPost, function (err) {
        if (err) {
            console.log(err);
            res.redirect("/login");
        } else {
            passport.authenticate("local", function (err, user, info) {
                if (err) {
                    return next(err);
                }
                if (!user) {
                    return res.status(422).render("login", {
                        oldInput: {
                            username: userPost.username,
                            password: userPost.password
                        },
                        validationErrors: [{msg: "Ivalid username or password."}]
                    });
                }
                req.logIn(user, function (err) {
                    if (err) { return next(err); }
                    req.session.isLoggedIn = true;
                    return res.redirect('/collection');
                });
            })(req, res, next);
        }
    });
};

exports.getLogout = (req, res, next) => {
    req.session.isLoggedIn = false;
    req.logout();
    res.redirect('/');
};