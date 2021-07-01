const Record = require('../models/Record');
const _ = require('lodash');

module.exports = async function callSearchUni(search, req, res) {
    search.end(function (response) {
        if (!response.error) {
            let imgUrl = "";
            if (response.body.value !== undefined && response.body.value[0] !== undefined && response.body.value[0].thumbnailUrl !== undefined && req.body.img === "") {
                imgUrl = response.body.value[0].thumbnailUrl;
            }

            const record = new Record({
                name: _.startCase(req.body.name),
                artist: _.startCase(req.body.artist),
                year: req.body.year,
                condition: req.body.condition,
                rating: req.body.rating,
                userId: req.user._id,
                img: imgUrl
            });
            record.save();
            res.render("add", { status: "success" });
        } else {
            res.redirect("/add");
        }
    });
}