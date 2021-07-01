const User = require('../models/User');
const Record = require('../models/Record');

module.exports.getOtherUsers = (req, res, next) => {
    User.find({ _id: { $ne: req.user._id } }, function (err, foundUsers) {
        if (!err) {
            res.render("other", { users: foundUsers })
        } else {
            console.log(err);
        }
    });
}

module.exports.getUserCollection = (req, res, next) => {
    Record.find({ userId: req.params.userId }, function (err, foundRecords) {
        if (!err) {
            res.render("othersCollection", { records: foundRecords, username: req.params.username })
        } else {
            console.log(err);
        }
    });
}

module.exports.searchUsers = (req, res, next) => {
    User.findOne({ username: req.body.searchedUser }, function (err, foundUser) {
        if (!err && foundUser) {
            Record.find({ userId: foundUser._id }, function (err, foundRecords) {
                if (!err) {
                    res.render("othersCollection", { records: foundRecords, username: req.body.searchedUser });
                } else {
                    console.log(err);
                }
            });
        } else {
            res.redirect('/users');
        }
    });
}
