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

exports.getUserCollection = (req, res, next) => {
    let page = Number(req.params.page);
    let more = false;
    if(page < 1) page = 1;

    var sort = {};
    sort[req.params.orderBy] = Number.parseInt(req.params.order);

    Record.find({ userId: req.params.userId }).sort(sort).skip((page-1)*10).limit(10+1).exec(function (err, foundRecords) {
        if (!err) {
            if (foundRecords.length == 11) more = true;
            res.render("othersCollection", { 
                records: foundRecords.slice(0, 10),
                username: req.params.username,
                userId: req.params.userId,
                page: page,
                more: more,
                order: req.params.order,
                orderBy: req.params.orderBy
             })
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
