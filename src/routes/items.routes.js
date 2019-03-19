var express = require("express");
var router = express.Router();
var VerifyToken = require("../auth/verifytoken");
var ItemModel = require("../database/models/item.model");

/**
 * Fetches all available items in database
 * @see https://app.swaggerhub.com/apis/CloudyPadmal/Sysco-POS/1.0.3#/item/itemList
 */
router.get("/list", VerifyToken, (req, res, next) => {
    ItemModel.find({}).then((docs) => {
        return res.status(200).json(docs);
    }).catch((err) => {
        /* istanbul ignore next */
        return res.status(404).json({ "status": "No items found" });
    });
});

/**
 * Adds a new item to the item collection
 * @see https://app.swaggerhub.com/apis/CloudyPadmal/Sysco-POS/1.0.3#/item/addNewItem
 */
router.post("/new", VerifyToken, (req, res, next) => {
    let o = new ItemModel(req.body);
    o.save().then((doc) => {
        res.status(200).json({ id: doc._id });
    }).catch((err) => {
        res.status(400).send(err);
    });
});

/**
 * Fetches an item
 * @see https://app.swaggerhub.com/apis/CloudyPadmal/Sysco-POS/1.0.3#/item/fetchItem
 */
router.get("/item/:id", VerifyToken, (req, res, next) => {
    ItemModel
        .findOne({ _id: req.params.id })
        .then((doc) => {
            res.status(200).json(doc);
        })
        .catch((err) => {
            res.status(404).json({ "error": "Cannot find such item" });
        });
});

/**
 * Updates an item
 * @see https://app.swaggerhub.com/apis/CloudyPadmal/Sysco-POS/1.0.3#/item/updateItem
 */
router.put("/item/:id", VerifyToken, (req, res, next) => {
    ItemModel.findOneAndUpdate(
        { _id: req.params.id }, req.body, { new: true }).then(doc => {
            return res.status(200).json(doc);
        }).catch((err) => {
            return res.status(404).json({ "status": "Item not found" });
        });
});

module.exports = router;