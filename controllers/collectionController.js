const Record = require('../models/Record');
const unirest = require("unirest");
const searchApi = require('../middleware/searchRecordImage');
const _ = require('lodash');

exports.getCollection = (req, res, next) => {
    var sort = {
        'artist': 1
    };
    Record.find({ userId: req.user._id }).sort(sort).exec(function (err, foundRecords) {
        if (!err) {
            res.render("collection", { records: foundRecords })
        } else {
            console.log(err);
        }
    });
}


exports.getCollectionSorted = (req, res, next) => {
    var sort = {};
    sort[req.params.orderBy] = Number.parseInt(req.params.order);
    
    Record.find({ userId: req.user._id }).sort(sort).exec(function (err, foundRecords) {
        if (!err) {
            res.render("collection", { records: foundRecords })
        } else {
            console.log(err);
        }
    });
}

exports.getAdd = (req, res, next) => {
    res.render("add", { user: req.body.user, status: "adding" });
}

exports.postRecord = (req, res, next) => {

    let searchString = req.body.artist + " " + req.body.name + " cover image";

    let search = unirest("GET", "https://bing-image-search1.p.rapidapi.com/images/search");
    search.headers({
        "x-rapidapi-key": process.env.RAPIDAPI_KEY,
        "x-rapidapi-host": "bing-image-search1.p.rapidapi.com",
        "useQueryString": true
    });
    search.query({
        "q": searchString,
        "count": "5"
    });
    searchApi(search, req, res);
}

exports.getEditRecord = (req, res, next) => {
    const recordId = req.params.recordId;
    Record.findById(recordId, function (err, foundRecord) {
        if (err) {
            console.log(err);
        } else {
            res.render("edit", { record: foundRecord });
        }
    });
}

exports.postEditRecord = (req, res, next) => {
    Record.findByIdAndUpdate({ _id: req.params.recordId }, {
        name: _.startCase(req.body.name),
        artist: _.startCase(req.body.artist),
        year: req.body.year,
        condition: req.body.condition,
        img: req.body.img,
        rating: req.body.rating
    }, function (err, record) {
        if (err) {
            console.log(err);
        } else {
            res.redirect("/collection");
        };
    });
}

exports.deleteRecord = (req, res, next) => {
    Record.findOneAndDelete({ _id: req.params.recordId }, function (err, record) {
        if (err) {
            console.log(err);
        } else {
            res.redirect("/collection");
        };
    });
}