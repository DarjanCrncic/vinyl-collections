const Record = require('../models/Record');
const unirest = require("unirest");
const searchApi = require('../middleware/searchRecordImage');
const _ = require('lodash');

exports.getCollectionSorted = (req, res, next) => {
    let page = Number(req.params.page);
    let more = false;
    if(page < 1) page = 1;

    var sort = {};
    sort[req.params.orderBy] = Number.parseInt(req.params.order);
    Record.find({ userId: req.user._id }).sort(sort).skip((page-1)*10).limit(10+1).exec(function (err, foundRecords) {
        if (!err) {
            if (foundRecords.length == 11) more = true;
            res.render("collection", { 
                records: foundRecords.slice(0, 10),
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
            res.render("edit", { 
                record: foundRecord,
                orderBy: req.params.orderBy,
                order: req.params.order,
                page: req.params.page
            });
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
            res.redirect("/collection/"+req.params.orderBy+"/"+req.params.order+"/"+req.params.page);
        };
    });
}

exports.deleteRecord = (req, res, next) => {
    Record.findOneAndDelete({ _id: req.params.recordId }, function (err, record) {
        if (err) {
            console.log(err);
        } else {
            res.redirect("/collection/"+req.params.orderBy+"/"+req.params.order+"/"+req.params.page);
        };
    });
}

exports.getViewRecord = (req, res, next) => {
    const recordId = req.params.recordId;
    Record.findById(recordId, function (err, foundRecord) {
        if (err) {
            console.log(err);
        } else {
            res.render("view", { record: foundRecord });
        }
    });
}